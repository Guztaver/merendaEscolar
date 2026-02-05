import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan, Between, Like } from 'typeorm';
import { InventoryBatch } from './entities/inventory-batch.entity';
import { StockItem, StockItemType } from './entities/stock-item.entity';
import { StockMovement, MovementType, MovementReason } from './entities/stock-movement.entity';
import { StockAlert, AlertType, AlertSeverity, AlertStatus } from './entities/stock-alert.entity';
import { CreateStockItemDto, UpdateStockItemDto } from './dto/create-stock-item.dto';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { UpdateStockAlertDto } from './dto/update-stock-alert.dto';

@Injectable()
export class LogisticsService {
    constructor(
        @InjectRepository(InventoryBatch)
        private batchRepository: Repository<InventoryBatch>,
        @InjectRepository(StockItem)
        private stockItemRepository: Repository<StockItem>,
        @InjectRepository(StockMovement)
        private stockMovementRepository: Repository<StockMovement>,
        @InjectRepository(StockAlert)
        private stockAlertRepository: Repository<StockAlert>,
    ) { }

    // ==================== STOCK ITEMS ====================

    async findAllStockItems(filters: {
        schoolId?: string;
        type?: string;
        isActive?: boolean;
    }) {
        const where: any = {};

        if (filters.type) {
            where.type = filters.type;
        }
        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        return this.stockItemRepository.find({
            where,
            order: { name: 'ASC' },
        });
    }

    async findStockItem(id: string): Promise<StockItem> {
        const item = await this.stockItemRepository.findOne({ where: { id } });
        if (!item) {
            throw new NotFoundException('Item do estoque não encontrado');
        }
        return item;
    }

    async createStockItem(createStockItemDto: CreateStockItemDto): Promise<StockItem> {
        const item = this.stockItemRepository.create(createStockItemDto);
        const savedItem = await this.stockItemRepository.save(item);

        // Verifica se precisa criar alerta de estoque baixo inicial
        if (savedItem.currentQuantity <= savedItem.minQuantity) {
            await this.createLowStockAlert(savedItem);
        }

        return savedItem;
    }

    async updateStockItem(id: string, updateStockItemDto: UpdateStockItemDto): Promise<StockItem> {
        const item = await this.findStockItem(id);

        // Atualiza o item
        Object.assign(item, updateStockItemDto);
        const updatedItem = await this.stockItemRepository.save(item);

        // Verifica alertas de estoque baixo
        if (updatedItem.currentQuantity <= updatedItem.minQuantity) {
            await this.createLowStockAlert(updatedItem);
        }

        // Verifica alertas de estoque excessivo
        if (updatedItem.maxCapacity > 0 && updatedItem.currentQuantity >= updatedItem.maxCapacity) {
            await this.createOverstockAlert(updatedItem);
        }

        return updatedItem;
    }

    async deleteStockItem(id: string): Promise<void> {
        const item = await this.findStockItem(id);

        // Verifica se há movimentos vinculados
        const movementsCount = await this.stockMovementRepository.count({
            where: { stockItemId: id }
        });

        if (movementsCount > 0) {
            throw new BadRequestException(
                'Não é possível excluir item com movimentações vinculadas. Existem ' +
                movementsCount + ' movimentação(ões) registrada(s) para este item.'
            );
        }

        // Verifica se há alertas vinculados
        const alertsCount = await this.stockAlertRepository.count({
            where: { stockItemId: id }
        });

        if (alertsCount > 0) {
            throw new BadRequestException(
                'Não é possível excluir item com alertas vinculados. Remova os alertas primeiro.'
            );
        }

        await this.stockItemRepository.remove(item);
    }

    async findStockItemMovements(stockItemId: string) {
        return this.stockMovementRepository.find({
            where: { stockItemId },
            order: { createdAt: 'DESC' },
            take: 50,
        });
    }

    // ==================== STOCK MOVEMENTS ====================

    async findAllMovements(filters: {
        stockItemId?: string;
        schoolId?: string;
        type?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    }) {
        const where: any = {};

        if (filters.stockItemId) {
            where.stockItemId = filters.stockItemId;
        }
        if (filters.schoolId) {
            where.schoolId = filters.schoolId;
        }
        if (filters.type) {
            where.movementType = filters.type;
        }
        if (filters.startDate || filters.endDate) {
            where.createdAt = Between(
                filters.startDate || new Date(0),
                filters.endDate || new Date()
            );
        }

        return this.stockMovementRepository.find({
            where,
            relations: ['stockItem'],
            order: { createdAt: 'DESC' },
            take: filters.limit || 100,
        });
    }

    async findMovement(id: string): Promise<StockMovement> {
        const movement = await this.stockMovementRepository.findOne({
            where: { id },
            relations: ['stockItem'],
        });
        if (!movement) {
            throw new NotFoundException('Movimentação não encontrada');
        }
        return movement;
    }

    async createMovement(
        createMovementDto: CreateStockMovementDto,
        userId: string
    ): Promise<StockMovement> {
        const stockItem = await this.findStockItem(createMovementDto.stockItemId);

        // Calcula o saldo anterior e novo
        const previousBalance = stockItem.currentQuantity;
        let newBalance = previousBalance;

        if (createMovementDto.movementType === MovementType.IN) {
            newBalance = previousBalance + createMovementDto.quantity;
        } else if (createMovementDto.movementType === MovementType.OUT) {
            if (previousBalance < createMovementDto.quantity) {
                throw new BadRequestException(
                    `Saldo insuficiente. Atual: ${previousBalance}, Solicitado: ${createMovementDto.quantity}`
                );
            }
            newBalance = previousBalance - createMovementDto.quantity;
        } else if (createMovementDto.movementType === MovementType.ADJUSTMENT) {
            newBalance = createMovementDto.quantity;
        }

        // Cria a movimentação
        const movement = this.stockMovementRepository.create({
            ...createMovementDto,
            previousBalance,
            newBalance,
            createdBy: userId,
        });

        const savedMovement = await this.stockMovementRepository.save(movement);

        // Atualiza o saldo do item
        stockItem.currentQuantity = newBalance;
        await this.stockItemRepository.save(stockItem);

        // Verifica e cria alertas
        await this.checkAndCreateAlerts(stockItem, createMovementDto);

        return savedMovement;
    }

    // ==================== STOCK ALERTS ====================

    async findAllAlerts(filters: {
        schoolId?: string;
        type?: string;
        severity?: string;
        status?: string;
    }) {
        const where: any = {};

        if (filters.schoolId) {
            where.schoolId = filters.schoolId;
        }
        if (filters.type) {
            where.type = filters.type;
        }
        if (filters.severity) {
            where.severity = filters.severity;
        }
        if (filters.status) {
            where.status = filters.status;
        }

        return this.stockAlertRepository.find({
            where,
            relations: ['stockItem'],
            order: { createdAt: 'DESC' },
        });
    }

    async findAlert(id: string): Promise<StockAlert> {
        const alert = await this.stockAlertRepository.findOne({
            where: { id },
            relations: ['stockItem'],
        });
        if (!alert) {
            throw new NotFoundException('Alerta não encontrado');
        }
        return alert;
    }

    async updateAlert(
        id: string,
        updateAlertDto: UpdateStockAlertDto,
        userId: string
    ): Promise<StockAlert> {
        const alert = await this.findAlert(id);

        if (updateAlertDto.status === AlertStatus.RESOLVED) {
            alert.resolvedAt = new Date();
            alert.resolvedBy = userId;
        }

        Object.assign(alert, updateAlertDto);
        return this.stockAlertRepository.save(alert);
    }

    async dismissAlert(id: string, userId: string): Promise<void> {
        const alert = await this.findAlert(id);
        alert.status = AlertStatus.DISMISSED;
        alert.resolvedBy = userId;
        await this.stockAlertRepository.save(alert);
    }

    // ==================== INVENTORY BATCHES (LEGACY) ====================

    async findNearExpiry(daysThreshold: number): Promise<InventoryBatch[]> {
        const today = new Date();
        const thresholdDate = new Date();
        thresholdDate.setDate(today.getDate() + daysThreshold);

        return this.batchRepository.find({
            where: {
                expiryDate: LessThanOrEqual(thresholdDate.toISOString().split('T')[0]),
            },
        });
    }

    // ==================== ALERT CREATION HELPERS ====================

    private async createLowStockAlert(stockItem: StockItem): Promise<void> {
        // Verifica se já existe alerta aberto para este item
        const existingAlert = await this.stockAlertRepository.findOne({
            where: {
                stockItemId: stockItem.id,
                type: AlertType.LOW_STOCK,
                status: AlertStatus.OPEN,
            },
        });

        if (existingAlert) {
            return; // Já existe alerta aberto
        }

        // Determina a severidade baseada em quão abaixo do mínimo está
        let severity = AlertSeverity.LOW;
        const percentage = stockItem.minQuantity > 0
            ? (stockItem.currentQuantity / stockItem.minQuantity) * 100
            : 0;

        if (percentage === 0) {
            severity = AlertSeverity.CRITICAL;
        } else if (percentage < 25) {
            severity = AlertSeverity.HIGH;
        } else if (percentage < 50) {
            severity = AlertSeverity.MEDIUM;
        }

        const alert = this.stockAlertRepository.create({
            stockItemId: stockItem.id,
            type: AlertType.LOW_STOCK,
            severity,
            message: `Estoque baixo: ${stockItem.name} (${stockItem.currentQuantity} ${stockItem.unit} - mínimo: ${stockItem.minQuantity} ${stockItem.unit})`,
            currentQuantity: stockItem.currentQuantity,
            threshold: stockItem.minQuantity,
        });

        await this.stockAlertRepository.save(alert);
    }

    private async createOverstockAlert(stockItem: StockItem): Promise<void> {
        const existingAlert = await this.stockAlertRepository.findOne({
            where: {
                stockItemId: stockItem.id,
                type: AlertType.OVERSTOCK,
                status: AlertStatus.OPEN,
            },
        });

        if (existingAlert) {
            return;
        }

        const alert = this.stockAlertRepository.create({
            stockItemId: stockItem.id,
            type: AlertType.OVERSTOCK,
            severity: AlertSeverity.MEDIUM,
            message: `Estoque excessivo: ${stockItem.name} (${stockItem.currentQuantity} ${stockItem.unit} - capacidade: ${stockItem.maxCapacity} ${stockItem.unit})`,
            currentQuantity: stockItem.currentQuantity,
            threshold: stockItem.maxCapacity,
        });

        await this.stockAlertRepository.save(alert);
    }

    private async createExpiryAlert(
        stockItem: StockItem,
        expiryDate: Date,
        batchNumber?: string
    ): Promise<void> {
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        let type = AlertType.EXPIRY_SOON;
        let severity = AlertSeverity.LOW;

        if (daysUntilExpiry < 0) {
            type = AlertType.EXPIRED;
            severity = AlertSeverity.CRITICAL;
        } else if (daysUntilExpiry <= 3) {
            severity = AlertSeverity.CRITICAL;
        } else if (daysUntilExpiry <= 7) {
            severity = AlertSeverity.HIGH;
        } else if (daysUntilExpiry <= 14) {
            severity = AlertSeverity.MEDIUM;
        }

        const alert = this.stockAlertRepository.create({
            stockItemId: stockItem.id,
            type,
            severity,
            message: `Validade ${type === AlertType.EXPIRED ? 'vencida' : 'próxima'}: ${stockItem.name} - ${expiryDate.toLocaleDateString('pt-BR')}${batchNumber ? ` (Lote: ${batchNumber})` : ''}`,
            expiryDate,
            batchNumber,
        });

        await this.stockAlertRepository.save(alert);
    }

    private async checkAndCreateAlerts(
        stockItem: StockItem,
        movementDto: CreateStockMovementDto
    ): Promise<void> {
        // Verifica estoque baixo
        if (stockItem.currentQuantity <= stockItem.minQuantity) {
            await this.createLowStockAlert(stockItem);
        }

        // Verifica estoque excessivo
        if (stockItem.maxCapacity > 0 && stockItem.currentQuantity >= stockItem.maxCapacity) {
            await this.createOverstockAlert(stockItem);
        }

        // Verifica estoque esgotado
        if (stockItem.currentQuantity === 0) {
            const existingAlert = await this.stockAlertRepository.findOne({
                where: {
                    stockItemId: stockItem.id,
                    type: AlertType.OUT_OF_STOCK,
                    status: AlertStatus.OPEN,
                },
            });

            if (!existingAlert) {
                const alert = this.stockAlertRepository.create({
                    stockItemId: stockItem.id,
                    type: AlertType.OUT_OF_STOCK,
                    severity: AlertSeverity.CRITICAL,
                    message: `Estoque esgotado: ${stockItem.name}`,
                    currentQuantity: 0,
                });
                await this.stockAlertRepository.save(alert);
            }
        }

        // Verifica validade se fornecida
        if (movementDto.expiryDate) {
            await this.createExpiryAlert(
                stockItem,
                new Date(movementDto.expiryDate),
                movementDto.batchNumber
            );
        }
    }

    // ==================== DASHBOARD & ANALYTICS ====================

    async getDashboardData(schoolId: string) {
        const stockItems = await this.findAllStockItems({ schoolId });
        const openAlerts = await this.findAllAlerts({ schoolId, status: AlertStatus.OPEN });
        const recentMovements = await this.findAllMovements({ schoolId, limit: 10 });

        const totalItems = stockItems.length;
        const lowStockItems = stockItems.filter(item => item.currentQuantity <= item.minQuantity);
        const totalValue = stockItems.reduce((sum, item) => sum + (item.currentQuantity * item.unitCost), 0);

        // Movimentações dos últimos 7 dias
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentMovementsCount = await this.stockMovementRepository.count({
            where: {
                schoolId,
                createdAt: MoreThan(sevenDaysAgo),
            },
        });

        return {
            totalItems,
            lowStockCount: lowStockItems.length,
            openAlertsCount: openAlerts.length,
            totalStockValue: totalValue,
            recentMovementsCount,
            criticalAlerts: openAlerts.filter(a => a.severity === AlertSeverity.CRITICAL).length,
            recentMovements,
        };
    }

    async getLowStockReport(schoolId?: string) {
        const items = await this.findAllStockItems({ schoolId });
        return items.filter(item => item.currentQuantity <= item.minQuantity);
    }

    async getExpiringSoonReport(days: number, schoolId?: string) {
        const today = new Date();
        const thresholdDate = new Date();
        thresholdDate.setDate(today.getDate() + days);

        const movements = await this.stockMovementRepository
            .createQueryBuilder('movement')
            .leftJoinAndSelect('movement.stockItem', 'stockItem')
            .where('movement.expiryDate IS NOT NULL')
            .andWhere('movement.expiryDate <= :thresholdDate', { thresholdDate })
            .andWhere('movement.newBalance > 0') // Ainda tem saldo
            .orderBy('movement.expiryDate', 'ASC')
            .getMany();

        return movements;
    }

    async getStockValue(schoolId?: string) {
        const items = await this.findAllStockItems({ schoolId });

        const totalValue = items.reduce((sum, item) => sum + (item.currentQuantity * item.unitCost), 0);
        const byCategory = items.reduce((acc, item) => {
            const key = item.type;
            if (!acc[key]) {
                acc[key] = { count: 0, value: 0 };
            }
            acc[key].count++;
            acc[key].value += item.currentQuantity * item.unitCost;
            return acc;
        }, {} as Record<string, { count: number; value: number }>);

        return {
            totalValue,
            byCategory,
        };
    }

    async getMovementHistory(days: number, schoolId?: string) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const movements = await this.stockMovementRepository.find({
            where: {
                schoolId,
                createdAt: MoreThan(startDate),
            },
            relations: ['stockItem'],
            order: { createdAt: 'DESC' },
        });

        // Agrupa por data
        const byDate = movements.reduce((acc, movement) => {
            const dateKey = movement.createdAt.toISOString().split('T')[0];
            if (!acc[dateKey]) {
                acc[dateKey] = {
                    in: 0,
                    out: 0,
                    adjustments: 0,
                    count: 0,
                };
            }

            if (movement.movementType === MovementType.IN) {
                acc[dateKey].in += movement.quantity;
            } else if (movement.movementType === MovementType.OUT) {
                acc[dateKey].out += movement.quantity;
            } else if (movement.movementType === MovementType.ADJUSTMENT) {
                acc[dateKey].adjustments++;
            }

            acc[dateKey].count++;
            return acc;
        }, {} as Record<string, { in: number; out: number; adjustments: number; count: number }>);

        return {
            period: { days, startDate, endDate: new Date() },
            summary: {
                totalMovements: movements.length,
                totalIn: movements.filter(m => m.movementType === MovementType.IN).reduce((sum, m) => sum + m.quantity, 0),
                totalOut: movements.filter(m => m.movementType === MovementType.OUT).reduce((sum, m) => sum + m.quantity, 0),
            },
            byDate,
        };
    }

    // ==================== INTEGRATION ====================

    async syncIngredientToStock(ingredientId: string, schoolId: string): Promise<StockItem> {
        // Verifica se já existe
        let stockItem = await this.stockItemRepository.findOne({
            where: { ingredientId, type: StockItemType.INGREDIENT }
        });

        if (stockItem) {
            return stockItem;
        }

        // Cria novo item a partir do ingrediente
        stockItem = this.stockItemRepository.create({
            name: `Ingrediente ${ingredientId}`,
            type: StockItemType.INGREDIENT,
            ingredientId,
            code: `ING-${ingredientId.slice(0, 8).toUpperCase()}`,
            currentQuantity: 0,
            minQuantity: 10,
            maxCapacity: 100,
            unit: 'kg',
            unitCost: 0,
            location: 'Padrão',
            isActive: true,
        });

        return this.stockItemRepository.save(stockItem);
    }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Purchase } from './entities/purchase.entity';
import { Supplier, SupplierType } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Injectable()
export class AcquisitionService {
    constructor(
        @InjectRepository(Purchase)
        private purchaseRepository: Repository<Purchase>,
        @InjectRepository(Supplier)
        private supplierRepository: Repository<Supplier>,
    ) { }

    // Supplier CRUD operations
    async createSupplier(dto: CreateSupplierDto): Promise<Supplier> {
        const supplier = this.supplierRepository.create(dto);
        return this.supplierRepository.save(supplier);
    }

    async findAllSuppliers(): Promise<Supplier[]> {
        return this.supplierRepository.find({
            relations: ['purchases'],
        });
    }

    async findOneSupplier(id: string): Promise<Supplier> {
        const supplier = await this.supplierRepository.findOne({
            where: { id },
            relations: ['purchases'],
        });
        if (!supplier) {
            throw new NotFoundException(`Fornecedor com ID ${id} não encontrado`);
        }
        return supplier;
    }

    async updateSupplier(id: string, dto: Partial<CreateSupplierDto>): Promise<Supplier> {
        await this.findOneSupplier(id); // Ensure exists
        await this.supplierRepository.update(id, dto);
        return this.findOneSupplier(id);
    }

    async removeSupplier(id: string): Promise<void> {
        const supplier = await this.findOneSupplier(id);
        await this.supplierRepository.remove(supplier);
    }

    // Purchase CRUD operations
    async createPurchase(dto: CreatePurchaseDto): Promise<Purchase> {
        const supplier = await this.findOneSupplier(dto.supplierId);
        const purchase = this.purchaseRepository.create({
            amount: dto.amount,
            date: dto.date,
            supplier,
        });
        return this.purchaseRepository.save(purchase);
    }

    async findAllPurchases(): Promise<Purchase[]> {
        return this.purchaseRepository.find({
            relations: ['supplier'],
        });
    }

    async findOnePurchase(id: string): Promise<Purchase> {
        const purchase = await this.purchaseRepository.findOne({
            where: { id },
            relations: ['supplier'],
        });
        if (!purchase) {
            throw new NotFoundException(`Compra com ID ${id} não encontrada`);
        }
        return purchase;
    }

    async updatePurchase(id: string, dto: Partial<CreatePurchaseDto>): Promise<Purchase> {
        const purchase = await this.findOnePurchase(id);

        if (dto.supplierId) {
            const supplier = await this.findOneSupplier(dto.supplierId);
            purchase.supplier = supplier;
        }

        if (dto.amount !== undefined) {
            purchase.amount = dto.amount;
        }

        if (dto.date) {
            purchase.date = dto.date;
        }

        return this.purchaseRepository.save(purchase);
    }

    async removePurchase(id: string): Promise<void> {
        const purchase = await this.findOnePurchase(id);
        await this.purchaseRepository.remove(purchase);
    }

    async calculateFamilyFarmingPercentage(year: number): Promise<{
        total: number;
        familyFarming: number;
        percentage: number;
        isCompliant: boolean;
    }> {
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year}-12-31`);

        const purchases = await this.purchaseRepository.find({
            where: {
                date: Between(startDate.toISOString(), endDate.toISOString()),
            },
            relations: ['supplier'],
        });

        let totalAmount = 0;
        let familyFarmingAmount = 0;

        for (const purchase of purchases) {
            const amount = Number(purchase.amount); // Ensure number
            totalAmount += amount;
            if (purchase.supplier && purchase.supplier.type === SupplierType.FAMILY_FARMING) {
                familyFarmingAmount += amount;
            }
        }

        const percentage = totalAmount > 0 ? (familyFarmingAmount / totalAmount) * 100 : 0;

        return {
            total: totalAmount,
            familyFarming: familyFarmingAmount,
            percentage: Number(percentage.toFixed(2)),
            isCompliant: percentage >= 45,
        };
    }
}


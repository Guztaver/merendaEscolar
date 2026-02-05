import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LogisticsService } from './logistics.service';
import { CreateStockItemDto, UpdateStockItemDto } from './dto/create-stock-item.dto';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { UpdateStockAlertDto } from './dto/update-stock-alert.dto';

@Controller('logistics')
@UseGuards(JwtAuthGuard)
export class LogisticsController {
    constructor(private readonly logisticsService: LogisticsService) {}

    // ==================== STOCK ITEMS ====================

    @Get('stock-items')
    async findAllStockItems(
        @Query('schoolId') schoolId?: string,
        @Query('type') type?: string,
        @Query('isActive') isActive?: string,
    ) {
        return this.logisticsService.findAllStockItems({
            schoolId,
            type,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        });
    }

    @Get('stock-items/:id')
    async findStockItem(@Param('id') id: string) {
        return this.logisticsService.findStockItem(id);
    }

    @Post('stock-items')
    async createStockItem(@Body() createStockItemDto: CreateStockItemDto, @Request() req) {
        return this.logisticsService.createStockItem(createStockItemDto);
    }

    @Patch('stock-items/:id')
    async updateStockItem(
        @Param('id') id: string,
        @Body() updateStockItemDto: UpdateStockItemDto
    ) {
        return this.logisticsService.updateStockItem(id, updateStockItemDto);
    }

    @Delete('stock-items/:id')
    async deleteStockItem(@Param('id') id: string) {
        return this.logisticsService.deleteStockItem(id);
    }

    @Get('stock-items/:id/movements')
    async findStockItemMovements(@Param('id') id: string) {
        return this.logisticsService.findStockItemMovements(id);
    }

    // ==================== STOCK MOVEMENTS ====================

    @Get('movements')
    async findAllMovements(
        @Query('stockItemId') stockItemId?: string,
        @Query('schoolId') schoolId?: string,
        @Query('type') type?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('limit') limit?: string,
    ) {
        return this.logisticsService.findAllMovements({
            stockItemId,
            schoolId,
            type,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });
    }

    @Post('movements')
    async createMovement(
        @Body() createMovementDto: CreateStockMovementDto,
        @Request() req
    ) {
        return this.logisticsService.createMovement(createMovementDto, req.user.userId);
    }

    @Get('movements/:id')
    async findMovement(@Param('id') id: string) {
        return this.logisticsService.findMovement(id);
    }

    // ==================== STOCK ALERTS ====================

    @Get('alerts')
    async findAllAlerts(
        @Query('schoolId') schoolId?: string,
        @Query('type') type?: string,
        @Query('severity') severity?: string,
        @Query('status') status?: string,
    ) {
        return this.logisticsService.findAllAlerts({
            schoolId,
            type,
            severity,
            status,
        });
    }

    @Get('alerts/:id')
    async findAlert(@Param('id') id: string) {
        return this.logisticsService.findAlert(id);
    }

    @Patch('alerts/:id')
    async updateAlert(
        @Param('id') id: string,
        @Body() updateAlertDto: UpdateStockAlertDto,
        @Request() req
    ) {
        return this.logisticsService.updateAlert(id, updateAlertDto, req.user.userId);
    }

    @Delete('alerts/:id')
    async dismissAlert(@Param('id') id: string, @Request() req) {
        return this.logisticsService.dismissAlert(id, req.user.userId);
    }

    // ==================== INVENTORY BATCHES (LEGACY) ====================

    @Get('inventory-batches/near-expiry')
    async findNearExpiry(@Query('days') days: string = '7') {
        const daysThreshold = parseInt(days) || 7;
        return this.logisticsService.findNearExpiry(daysThreshold);
    }

    // ==================== DASHBOARD & ANALYTICS ====================

    @Get('dashboard/:schoolId')
    async getDashboardData(@Param('schoolId') schoolId: string) {
        return this.logisticsService.getDashboardData(schoolId);
    }

    @Get('analytics/low-stock')
    async getLowStockReport(@Query('schoolId') schoolId?: string) {
        return this.logisticsService.getLowStockReport(schoolId);
    }

    @Get('analytics/expiring-soon')
    async getExpiringSoonReport(
        @Query('days') days?: string,
        @Query('schoolId') schoolId?: string
    ) {
        const daysThreshold = days ? parseInt(days) : 7;
        return this.logisticsService.getExpiringSoonReport(daysThreshold, schoolId);
    }

    @Get('analytics/stock-value')
    async getStockValue(@Query('schoolId') schoolId?: string) {
        return this.logisticsService.getStockValue(schoolId);
    }

    @Get('analytics/movement-history')
    async getMovementHistory(
        @Query('schoolId') schoolId?: string,
        @Query('days') days?: string
    ) {
        const daysPeriod = days ? parseInt(days) : 30;
        return this.logisticsService.getMovementHistory(daysPeriod, schoolId);
    }

    @Post('stock-items/sync-ingredient')
    async syncIngredientToStock(
        @Body('ingredientId') ingredientId: string,
        @Body('schoolId') schoolId: string
    ) {
        return this.logisticsService.syncIngredientToStock(ingredientId, schoolId);
    }
}

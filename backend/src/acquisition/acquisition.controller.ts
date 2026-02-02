import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AcquisitionService } from './acquisition.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Controller('acquisition')
export class AcquisitionController {
    constructor(private readonly acquisitionService: AcquisitionService) { }

    // Supplier endpoints
    @Post('suppliers')
    createSupplier(@Body() dto: CreateSupplierDto) {
        return this.acquisitionService.createSupplier(dto);
    }

    @Get('suppliers')
    findAllSuppliers() {
        return this.acquisitionService.findAllSuppliers();
    }

    @Get('suppliers/:id')
    findOneSupplier(@Param('id') id: string) {
        return this.acquisitionService.findOneSupplier(id);
    }

    @Patch('suppliers/:id')
    updateSupplier(@Param('id') id: string, @Body() dto: Partial<CreateSupplierDto>) {
        return this.acquisitionService.updateSupplier(id, dto);
    }

    @Delete('suppliers/:id')
    removeSupplier(@Param('id') id: string) {
        return this.acquisitionService.removeSupplier(id);
    }

    // Purchase endpoints
    @Post('purchases')
    createPurchase(@Body() dto: CreatePurchaseDto) {
        return this.acquisitionService.createPurchase(dto);
    }

    @Get('purchases')
    findAllPurchases() {
        return this.acquisitionService.findAllPurchases();
    }

    @Get('purchases/:id')
    findOnePurchase(@Param('id') id: string) {
        return this.acquisitionService.findOnePurchase(id);
    }

    @Patch('purchases/:id')
    updatePurchase(@Param('id') id: string, @Body() dto: Partial<CreatePurchaseDto>) {
        return this.acquisitionService.updatePurchase(id, dto);
    }

    @Delete('purchases/:id')
    removePurchase(@Param('id') id: string) {
        return this.acquisitionService.removePurchase(id);
    }

    // Dashboard endpoint
    @Get('dashboard')
    getDashboard(@Query('year') year: string) {
        const currentYear = year ? parseInt(year, 10) : new Date().getFullYear();
        return this.acquisitionService.calculateFamilyFarmingPercentage(currentYear);
    }
}

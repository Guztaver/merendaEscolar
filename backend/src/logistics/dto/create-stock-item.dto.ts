import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { StockItemType } from '../entities/stock-item.entity';

export class CreateStockItemDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(StockItemType)
    @IsOptional()
    type?: StockItemType;

    @IsString()
    @IsOptional()
    ingredientId?: string;

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    currentQuantity?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    minQuantity?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    maxCapacity?: number;

    @IsString()
    @IsNotEmpty()
    unit: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    unitCost?: number;

    @IsString()
    @IsNotEmpty()
    location: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class UpdateStockItemDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsEnum(StockItemType)
    @IsOptional()
    type?: StockItemType;

    @IsString()
    @IsOptional()
    ingredientId?: string;

    @IsString()
    @IsOptional()
    code?: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    currentQuantity?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    minQuantity?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    maxCapacity?: number;

    @IsString()
    @IsOptional()
    unit?: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    unitCost?: number;

    @IsString()
    @IsOptional()
    location?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

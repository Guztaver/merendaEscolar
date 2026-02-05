import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, Min, IsDateString } from 'class-validator';
import { MovementType, MovementReason } from '../entities/stock-movement.entity';

export class CreateStockMovementDto {
    @IsString()
    @IsNotEmpty()
    stockItemId: string;

    @IsEnum(MovementType)
    @IsNotEmpty()
    movementType: MovementType;

    @IsEnum(MovementReason)
    @IsNotEmpty()
    reason: MovementReason;

    @IsNumber()
    @Min(0.01)
    @IsNotEmpty()
    quantity: number;

    @IsString()
    @IsOptional()
    batchNumber?: string;

    @IsDateString()
    @IsOptional()
    expiryDate?: string;

    @IsString()
    @IsOptional()
    supplierId?: string;

    @IsString()
    @IsOptional()
    schoolId?: string;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsString()
    @IsOptional()
    documentNumber?: string;
}

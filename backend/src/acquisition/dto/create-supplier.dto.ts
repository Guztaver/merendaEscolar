import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { SupplierType } from '../entities/supplier.entity';

export class CreateSupplierDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    document: string;

    @IsEnum(SupplierType)
    type: SupplierType;
}

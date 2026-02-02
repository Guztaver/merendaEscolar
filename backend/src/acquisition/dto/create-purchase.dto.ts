import { IsDateString, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreatePurchaseDto {
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsDateString()
    date: string;

    @IsNotEmpty()
    @IsUUID()
    supplierId: string;
}

import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { AlertStatus } from '../entities/stock-alert.entity';

export class UpdateStockAlertDto {
    @IsEnum(AlertStatus)
    @IsOptional()
    status?: AlertStatus;

    @IsString()
    @IsOptional()
    resolutionNotes?: string;
}

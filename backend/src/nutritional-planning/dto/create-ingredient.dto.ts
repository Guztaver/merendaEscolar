import { IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { NovaClassification } from '../entities/ingredient.entity';

export class CreateIngredientDto {
    @IsNotEmpty()
    name: string;

    @IsEnum(NovaClassification)
    novaClassification: NovaClassification;

    @IsNumber()
    @Min(0)
    calories: number;

    @IsNumber()
    @Min(0)
    carbohydrates: number;

    @IsNumber()
    @Min(0)
    protein: number;

    @IsNumber()
    @Min(0)
    fat: number;

    @IsNumber()
    @Min(0)
    sodium: number;
}

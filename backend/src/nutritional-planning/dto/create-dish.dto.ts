import { IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DishIngredientDto {
    @IsNotEmpty()
    ingredientId: string;

    @IsNotEmpty()
    quantityGrams: number;
}

export class CreateDishDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    preparationMethod: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DishIngredientDto)
    ingredients: DishIngredientDto[];
}

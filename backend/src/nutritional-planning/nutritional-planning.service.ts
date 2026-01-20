import { Injectable, BadRequestException } from '@nestjs/common';
import { Menu } from './entities/menu.entity';
import { NovaClassification } from './entities/ingredient.entity';

@Injectable()
export class NutritionalPlanningService {
    validateMenu(menu: Menu): void {
        let totalCalories = 0;
        let ultraProcessedCalories = 0;

        if (!menu.dishes || menu.dishes.length === 0) {
            return; // Or throw error for empty menu
        }

        for (const dish of menu.dishes) {
            if (!dish.ingredients) continue;

            for (const dishIngredient of dish.ingredients) {
                const ingredient = dishIngredient.ingredient;
                if (!ingredient) continue;

                // Calories per 100g * quantity in grams / 100
                const calories = (ingredient.calories * dishIngredient.quantityGrams) / 100;

                totalCalories += calories;

                if (ingredient.novaClassification === NovaClassification.ULTRAPROCESSED) {
                    ultraProcessedCalories += calories;
                }
            }
        }

        if (totalCalories === 0) return;

        const ultraProcessedPercentage = (ultraProcessedCalories / totalCalories) * 100;

        if (ultraProcessedPercentage > 10) {
            throw new BadRequestException(
                `Menu contains ${ultraProcessedPercentage.toFixed(2)}% ultra-processed calories. The limit is 10%.`,
            );
        }
    }
}

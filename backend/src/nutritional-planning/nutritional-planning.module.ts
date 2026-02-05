import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { Dish } from './entities/dish.entity';
import { DishIngredient } from './entities/dish-ingredient.entity';
import { Menu } from './entities/menu.entity';
import { NutritionalPlanningService } from './nutritional-planning.service';

import { NutritionalPlanningController } from './nutritional-planning.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Ingredient, Dish, DishIngredient, Menu]),
    ],
    controllers: [NutritionalPlanningController],
    providers: [NutritionalPlanningService],
})
export class NutritionalPlanningModule { }

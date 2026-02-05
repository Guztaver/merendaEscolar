import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { NovaClassification, Ingredient } from './entities/ingredient.entity';
import { Dish } from './entities/dish.entity';
import { DishIngredient } from './entities/dish-ingredient.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class NutritionalPlanningService {
    constructor(
        @InjectRepository(Ingredient)
        private ingredientRepository: Repository<Ingredient>,
        @InjectRepository(Dish)
        private dishRepository: Repository<Dish>,
        @InjectRepository(DishIngredient)
        private dishIngredientRepository: Repository<DishIngredient>,
        @InjectRepository(Menu)
        private menuRepository: Repository<Menu>,
    ) { }

    // --- Ingredients ---

    createIngredient(createIngredientDto: CreateIngredientDto): Promise<Ingredient> {
        const ingredient = this.ingredientRepository.create(createIngredientDto);
        return this.ingredientRepository.save(ingredient);
    }

    findAllIngredients(): Promise<Ingredient[]> {
        return this.ingredientRepository.find();
    }

    async findOneIngredient(id: string): Promise<Ingredient> {
        const ingredient = await this.ingredientRepository.findOneBy({ id });
        if (!ingredient) {
            throw new NotFoundException(`Ingredient with ID ${id} not found`);
        }
        return ingredient;
    }

    async updateIngredient(id: string, updateIngredientDto: UpdateIngredientDto): Promise<Ingredient> {
        const ingredient = await this.findOneIngredient(id);
        Object.assign(ingredient, updateIngredientDto);
        return this.ingredientRepository.save(ingredient);
    }

    async removeIngredient(id: string): Promise<void> {
        const ingredient = await this.findOneIngredient(id);
        await this.ingredientRepository.remove(ingredient);
    }

    // --- Dishes ---

    async createDish(createDishDto: CreateDishDto): Promise<Dish> {
        const { ingredients, ...dishData } = createDishDto;
        const dish = this.dishRepository.create(dishData);
        const savedDish = await this.dishRepository.save(dish);

        if (ingredients && ingredients.length > 0) {
            const dishIngredients = ingredients.map(i => {
                return this.dishIngredientRepository.create({
                    dish: savedDish,
                    ingredient: { id: i.ingredientId },
                    quantityGrams: i.quantityGrams
                });
            });
            await this.dishIngredientRepository.save(dishIngredients);
        }

        return this.findOneDish(savedDish.id);
    }

    findAllDishes(): Promise<Dish[]> {
        return this.dishRepository.find({
            relations: ['ingredients', 'ingredients.ingredient']
        });
    }

    async findOneDish(id: string): Promise<Dish> {
        const dish = await this.dishRepository.findOne({
            where: { id },
            relations: ['ingredients', 'ingredients.ingredient']
        });
        if (!dish) {
            throw new NotFoundException(`Dish with ID ${id} not found`);
        }
        return dish;
    }

    async updateDish(id: string, updateDishDto: UpdateDishDto): Promise<Dish> {
        // Simple update for main fields
        const { ingredients, ...dishData } = updateDishDto;
        const dish = await this.findOneDish(id);

        Object.assign(dish, dishData);
        await this.dishRepository.save(dish);

        if (ingredients) {
            // Remove existing
            await this.dishIngredientRepository.delete({ dish: { id } });

            // Add new
            const dishIngredients = ingredients.map(i => {
                return this.dishIngredientRepository.create({
                    dish: dish,
                    ingredient: { id: i.ingredientId },
                    quantityGrams: i.quantityGrams
                });
            });
            await this.dishIngredientRepository.save(dishIngredients);
        }

        return this.findOneDish(id);
    }

    async removeDish(id: string): Promise<void> {
        const dish = await this.findOneDish(id);
        await this.dishRepository.remove(dish);
    }

    // --- Menus ---

    async createMenu(createMenuDto: CreateMenuDto): Promise<Menu> {
        const { dishIds, ...menuData } = createMenuDto;

        const dishes = await this.dishRepository.find({
            where: { id: In(dishIds) },
            relations: ['ingredients', 'ingredients.ingredient']
        });

        if (dishes.length !== dishIds.length) {
            throw new BadRequestException('Some dishes were not found');
        }

        const menu = this.menuRepository.create({
            ...menuData,
            dishes: dishes
        });

        this.validateMenu(menu);

        return this.menuRepository.save(menu);
    }

    findAllMenus(): Promise<Menu[]> {
        return this.menuRepository.find({
            relations: ['dishes', 'dishes.ingredients', 'dishes.ingredients.ingredient']
        });
    }

    async findOneMenu(id: string): Promise<Menu> {
        const menu = await this.menuRepository.findOne({
            where: { id },
            relations: ['dishes', 'dishes.ingredients', 'dishes.ingredients.ingredient']
        });
        if (!menu) {
            throw new NotFoundException(`Menu with ID ${id} not found`);
        }
        return menu;
    }

    async updateMenu(id: string, updateMenuDto: UpdateMenuDto): Promise<Menu> {
        const menu = await this.findOneMenu(id);
        const { dishIds, ...menuData } = updateMenuDto;

        Object.assign(menu, menuData);

        if (dishIds) {
            const dishes = await this.dishRepository.find({
                where: { id: In(dishIds) },
                relations: ['ingredients', 'ingredients.ingredient']
            });
            if (dishes.length !== dishIds.length) {
                throw new BadRequestException('Some dishes were not found');
            }
            menu.dishes = dishes;
        }

        this.validateMenu(menu);

        return this.menuRepository.save(menu);
    }

    async removeMenu(id: string): Promise<void> {
        const menu = await this.findOneMenu(id);
        await this.menuRepository.remove(menu);
    }

    validateMenu(menu: Menu): void {
        let totalCalories = 0;
        let ultraProcessedCalories = 0;

        if (!menu.dishes || menu.dishes.length === 0) {
            return;
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

import { Test, TestingModule } from '@nestjs/testing';
import { NutritionalPlanningService } from './nutritional-planning.service';
import { Menu } from './entities/menu.entity';
import { Dish } from './entities/dish.entity';
import { DishIngredient } from './entities/dish-ingredient.entity';
import { Ingredient, NovaClassification } from './entities/ingredient.entity';
import { BadRequestException } from '@nestjs/common';

describe('NutritionalPlanningService', () => {
  let service: NutritionalPlanningService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NutritionalPlanningService],
    }).compile();

    service = module.get<NutritionalPlanningService>(NutritionalPlanningService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateMenu', () => {
    it('should throw BadRequestException if ultra-processed calories > 10%', () => {
      // Mock Data
      const ingredientUltra = new Ingredient();
      ingredientUltra.novaClassification = NovaClassification.ULTRAPROCESSED;
      ingredientUltra.calories = 500; // 500 kcal per 100g

      const ingredientRegular = new Ingredient();
      ingredientRegular.novaClassification = NovaClassification.UNPROCESSED;
      ingredientRegular.calories = 100; // 100 kcal per 100g

      const dishIngredientUltra = new DishIngredient();
      dishIngredientUltra.ingredient = ingredientUltra;
      dishIngredientUltra.quantityGrams = 100; // 500 kcal total

      const dishIngredientRegular = new DishIngredient();
      dishIngredientRegular.ingredient = ingredientRegular;
      dishIngredientRegular.quantityGrams = 100; // 100 kcal total

      // Total Calories = 600. Ultra = 500. % = 83.3% > 10%

      const dish = new Dish();
      dish.ingredients = [dishIngredientUltra, dishIngredientRegular];

      const menu = new Menu();
      menu.dishes = [dish];

      expect(() => service.validateMenu(menu)).toThrow(BadRequestException);
    });

    it('should pass if ultra-processed calories <= 10%', () => {
      // Mock Data: 1000 kcal total, 10 kcal ultra
      const ingredientUltra = new Ingredient();
      ingredientUltra.novaClassification = NovaClassification.ULTRAPROCESSED;
      ingredientUltra.calories = 100;

      const ingredientRegular = new Ingredient();
      ingredientRegular.novaClassification = NovaClassification.UNPROCESSED;
      ingredientRegular.calories = 100;

      const dishIngredientUltra = new DishIngredient();
      dishIngredientUltra.ingredient = ingredientUltra;
      dishIngredientUltra.quantityGrams = 10; // 10 kcal

      const dishIngredientRegular = new DishIngredient();
      dishIngredientRegular.ingredient = ingredientRegular;
      dishIngredientRegular.quantityGrams = 1000; // 1000 kcal

      // Total = 1010. Ultra = 10. % < 1%

      const dish = new Dish();
      dish.ingredients = [dishIngredientUltra, dishIngredientRegular];

      const menu = new Menu();
      menu.dishes = [dish];

      expect(() => service.validateMenu(menu)).not.toThrow();
    });
  });
});

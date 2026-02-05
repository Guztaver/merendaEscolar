import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NutritionalPlanningService } from './nutritional-planning.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Controller('nutritional-planning')
export class NutritionalPlanningController {
    constructor(private readonly nutritionalPlanningService: NutritionalPlanningService) { }

    // --- Ingredients ---

    @Post('ingredients')
    createIngredient(@Body() createIngredientDto: CreateIngredientDto) {
        return this.nutritionalPlanningService.createIngredient(createIngredientDto);
    }

    @Get('ingredients')
    findAllIngredients() {
        return this.nutritionalPlanningService.findAllIngredients();
    }

    @Get('ingredients/:id')
    findOneIngredient(@Param('id') id: string) {
        return this.nutritionalPlanningService.findOneIngredient(id);
    }

    @Patch('ingredients/:id')
    updateIngredient(@Param('id') id: string, @Body() updateIngredientDto: UpdateIngredientDto) {
        return this.nutritionalPlanningService.updateIngredient(id, updateIngredientDto);
    }

    @Delete('ingredients/:id')
    removeIngredient(@Param('id') id: string) {
        return this.nutritionalPlanningService.removeIngredient(id);
    }

    // --- Dishes ---

    @Post('dishes')
    createDish(@Body() createDishDto: CreateDishDto) {
        return this.nutritionalPlanningService.createDish(createDishDto);
    }

    @Get('dishes')
    findAllDishes() {
        return this.nutritionalPlanningService.findAllDishes();
    }

    @Get('dishes/:id')
    findOneDish(@Param('id') id: string) {
        return this.nutritionalPlanningService.findOneDish(id);
    }

    @Patch('dishes/:id')
    updateDish(@Param('id') id: string, @Body() updateDishDto: UpdateDishDto) {
        return this.nutritionalPlanningService.updateDish(id, updateDishDto);
    }

    @Delete('dishes/:id')
    removeDish(@Param('id') id: string) {
        return this.nutritionalPlanningService.removeDish(id);
    }

    // --- Menus ---

    @Post('menus')
    createMenu(@Body() createMenuDto: CreateMenuDto) {
        return this.nutritionalPlanningService.createMenu(createMenuDto);
    }

    @Get('menus')
    findAllMenus() {
        return this.nutritionalPlanningService.findAllMenus();
    }

    @Get('menus/:id')
    findOneMenu(@Param('id') id: string) {
        return this.nutritionalPlanningService.findOneMenu(id);
    }

    @Patch('menus/:id')
    updateMenu(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
        return this.nutritionalPlanningService.updateMenu(id, updateMenuDto);
    }

    @Delete('menus/:id')
    removeMenu(@Param('id') id: string) {
        return this.nutritionalPlanningService.removeMenu(id);
    }
}

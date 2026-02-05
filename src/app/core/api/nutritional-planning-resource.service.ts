import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum NovaClassification {
    UNPROCESSED = 'unprocessed',
    PROCESSED_CULINARY_INGREDIENT = 'processed_culinary_ingredient',
    PROCESSED = 'processed',
    ULTRAPROCESSED = 'ultraprocessed',
}

export interface Ingredient {
    id: string;
    name: string;
    novaClassification: NovaClassification;
    calories: number;
    carbohydrates: number;
    protein: number;
    fat: number;
    sodium: number;
}

export interface DishIngredient {
    id: string;
    ingredient: Ingredient;
    quantityGrams: number;
}

export interface Dish {
    id: string;
    name: string;
    preparationMethod: string;
    ingredients?: DishIngredient[];
}

export interface Menu {
    id: string;
    date: string;
    dishes?: Dish[];
}

// DTOs for creation/update
export interface CreateIngredientDto extends Omit<Ingredient, 'id'> { }
export interface UpdateIngredientDto extends Partial<CreateIngredientDto> { }

export interface CreateDishIngredientDto {
    ingredientId: string;
    quantityGrams: number;
}

export interface CreateDishDto {
    name: string;
    preparationMethod: string;
    ingredients: CreateDishIngredientDto[];
}
export interface UpdateDishDto extends Partial<CreateDishDto> { }

export interface CreateMenuDto {
    date: string;
    dishIds: string[];
}
export interface UpdateMenuDto extends Partial<CreateMenuDto> { }

@Injectable({
    providedIn: 'root'
})
export class NutritionalPlanningResourceService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:3000/api/nutritional-planning';

    // --- Ingredients ---
    findAllIngredients(): Observable<Ingredient[]> {
        return this.http.get<Ingredient[]>(`${this.apiUrl}/ingredients`);
    }

    findOneIngredient(id: string): Observable<Ingredient> {
        return this.http.get<Ingredient>(`${this.apiUrl}/ingredients/${id}`);
    }

    createIngredient(dto: CreateIngredientDto): Observable<Ingredient> {
        return this.http.post<Ingredient>(`${this.apiUrl}/ingredients`, dto);
    }

    updateIngredient(id: string, dto: UpdateIngredientDto): Observable<Ingredient> {
        return this.http.patch<Ingredient>(`${this.apiUrl}/ingredients/${id}`, dto);
    }

    deleteIngredient(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/ingredients/${id}`);
    }

    // --- Dishes ---
    findAllDishes(): Observable<Dish[]> {
        return this.http.get<Dish[]>(`${this.apiUrl}/dishes`);
    }

    findOneDish(id: string): Observable<Dish> {
        return this.http.get<Dish>(`${this.apiUrl}/dishes/${id}`);
    }

    createDish(dto: CreateDishDto): Observable<Dish> {
        return this.http.post<Dish>(`${this.apiUrl}/dishes`, dto);
    }

    updateDish(id: string, dto: UpdateDishDto): Observable<Dish> {
        return this.http.patch<Dish>(`${this.apiUrl}/dishes/${id}`, dto);
    }

    deleteDish(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/dishes/${id}`);
    }

    // --- Menus ---
    findAllMenus(): Observable<Menu[]> {
        return this.http.get<Menu[]>(`${this.apiUrl}/menus`);
    }

    findOneMenu(id: string): Observable<Menu> {
        return this.http.get<Menu>(`${this.apiUrl}/menus/${id}`);
    }

    createMenu(dto: CreateMenuDto): Observable<Menu> {
        return this.http.post<Menu>(`${this.apiUrl}/menus`, dto);
    }

    updateMenu(id: string, dto: UpdateMenuDto): Observable<Menu> {
        return this.http.patch<Menu>(`${this.apiUrl}/menus/${id}`, dto);
    }

    deleteMenu(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/menus/${id}`);
    }
}

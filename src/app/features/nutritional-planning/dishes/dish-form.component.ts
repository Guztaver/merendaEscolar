import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { NutritionalPlanningResourceService, Ingredient, Dish } from '../../../core/api/nutritional-planning-resource.service';

@Component({
    selector: 'app-dish-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="p-6 max-w-4xl mx-auto">
      <div class="flex items-center gap-4 mb-6">
        <a routerLink="/nutritional-planning/dishes" class="text-gray-500 hover:text-gray-700">
          ← Back
        </a>
        <h1 class="text-2xl font-bold text-gray-800">{{ isEditing() ? 'Edit' : 'New' }} Dish</h1>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form [formGroup]="form" (ngSubmit)="save()" class="space-y-6">
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input formControlName="name" type="text" 
                   class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Preparation Method</label>
            <textarea formControlName="preparationMethod" rows="4"
                      class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"></textarea>
          </div>

          <div>
             <div class="flex justify-between items-center mb-2">
                <label class="block text-sm font-medium text-gray-700">Ingredients</label>
                <button type="button" (click)="addIngredient()" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    + Add Ingredient
                </button>
             </div>
             
             <div formArrayName="ingredients" class="space-y-3">
                @for (control of ingredientsArray.controls; track $index) {
                    <div [formGroupName]="$index" class="flex gap-4 items-start">
                         <div class="flex-1">
                             <select formControlName="ingredientId" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all">
                                 <option value="" disabled>Select Ingredient</option>
                                 @for (ing of availableIngredients(); track ing.id) {
                                     <option [value]="ing.id">{{ ing.name }}</option>
                                 }
                             </select>
                         </div>
                         <div class="w-32">
                             <input type="number" formControlName="quantityGrams" placeholder="Grams"
                                    class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all">
                         </div>
                         <button type="button" (click)="removeIngredient($index)" class="text-red-500 hover:text-red-700 p-2">
                             ✕
                         </button>
                    </div>
                }
             </div>
          </div>

          <div class="flex justify-end pt-4">
            <button type="submit" 
                    [disabled]="form.invalid || isSubmitting()"
                    class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {{ isSubmitting() ? 'Saving...' : 'Save Dish' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class DishFormComponent {
    private fb = inject(FormBuilder);
    private service = inject(NutritionalPlanningResourceService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    form = this.fb.group({
        name: ['', Validators.required],
        preparationMethod: ['', Validators.required],
        ingredients: this.fb.array([])
    });

    isEditing = signal(false);
    isSubmitting = signal(false);
    dishId: string | null = null;
    availableIngredients = signal<Ingredient[]>([]);

    get ingredientsArray() {
        return this.form.get('ingredients') as FormArray;
    }

    constructor() {
        this.service.findAllIngredients().subscribe(data => this.availableIngredients.set(data));

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditing.set(true);
            this.dishId = id;
            this.service.findOneDish(id).subscribe(dish => {
                this.form.patchValue({
                    name: dish.name,
                    preparationMethod: dish.preparationMethod
                });

                // Clear and reload ingredients
                this.ingredientsArray.clear();
                if (dish.ingredients) {
                    dish.ingredients.forEach(di => {
                        this.ingredientsArray.push(this.createIngredientGroup(di.ingredient.id, di.quantityGrams));
                    });
                }
            });
        } else {
            this.addIngredient();
        }
    }

    createIngredientGroup(ingredientId: string = '', quantityGrams: number = 0) {
        return this.fb.group({
            ingredientId: [ingredientId, Validators.required],
            quantityGrams: [quantityGrams, [Validators.required, Validators.min(1)]]
        });
    }

    addIngredient() {
        this.ingredientsArray.push(this.createIngredientGroup());
    }

    removeIngredient(index: number) {
        this.ingredientsArray.removeAt(index);
    }

    save() {
        if (this.form.invalid) return;

        this.isSubmitting.set(true);
        const formValue = this.form.value;

        // Transform to DTO format
        const dto = {
            name: formValue.name!,
            preparationMethod: formValue.preparationMethod!,
            ingredients: (formValue.ingredients as any[]).map(i => ({
                ingredientId: i.ingredientId,
                quantityGrams: i.quantityGrams
            }))
        };

        const request = this.isEditing() && this.dishId
            ? this.service.updateDish(this.dishId, dto)
            : this.service.createDish(dto);

        request.subscribe({
            next: () => {
                this.router.navigate(['/nutritional-planning/dishes']);
            },
            error: (err: unknown) => {
                console.error('Error saving dish', err);
                this.isSubmitting.set(false);
            }
        });
    }
}

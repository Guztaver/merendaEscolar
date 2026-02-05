import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { NutritionalPlanningResourceService, Dish } from '../../../core/api/nutritional-planning-resource.service';

@Component({
    selector: 'app-menu-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="p-6 max-w-2xl mx-auto">
      <div class="flex items-center gap-4 mb-6">
        <a routerLink="/nutritional-planning/menus" class="text-gray-500 hover:text-gray-700">
          ← Back
        </a>
        <h1 class="text-2xl font-bold text-gray-800">{{ isEditing() ? 'Edit' : 'New' }} Menu</h1>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        @if (errorMessage()) {
            <div class="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
                {{ errorMessage() }}
            </div>
        }

        <form [formGroup]="form" (ngSubmit)="save()" class="space-y-6">
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input formControlName="date" type="date" 
                   class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all">
          </div>

          <div>
             <label class="block text-sm font-medium text-gray-700 mb-2">Dishes</label>
             <div class="space-y-2 border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                @for (dish of availableDishes(); track dish.id) {
                    <div class="flex items-center gap-3">
                        <input type="checkbox" [id]="dish.id" [checked]="isDishSelected(dish.id)" (change)="toggleDish(dish.id, $event)"
                               class="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500">
                        <label [for]="dish.id" class="text-gray-700">{{ dish.name }}</label>
                    </div>
                }
             </div>
             @if (selectedDishIds().length === 0 && form.touched) {
                 <p class="text-red-500 text-sm mt-1">Select at least one dish.</p>
             }
          </div>

          <div class="flex justify-end pt-4">
            <button type="submit" 
                    [disabled]="form.invalid || selectedDishIds().length === 0 || isSubmitting()"
                    class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {{ isSubmitting() ? 'Saving...' : 'Save Menu' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class MenuFormComponent {
    private fb = inject(FormBuilder);
    private service = inject(NutritionalPlanningResourceService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    form = this.fb.group({
        date: ['', Validators.required],
    });

    isEditing = signal(false);
    isSubmitting = signal(false);
    menuId: string | null = null;
    availableDishes = signal<Dish[]>([]);
    selectedDishIds = signal<string[]>([]);
    errorMessage = signal<string | null>(null);

    constructor() {
        this.service.findAllDishes().subscribe(data => this.availableDishes.set(data));

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditing.set(true);
            this.menuId = id;
            this.service.findOneMenu(id).subscribe(menu => {
                this.form.patchValue({ date: menu.date });
                if (menu.dishes) {
                    this.selectedDishIds.set(menu.dishes.map(d => d.id));
                }
            });
        }
    }

    isDishSelected(dishId: string): boolean {
        return this.selectedDishIds().includes(dishId);
    }

    toggleDish(dishId: string, event: Event) {
        const checked = (event.target as HTMLInputElement).checked;
        this.selectedDishIds.update(current => {
            if (checked) {
                return [...current, dishId];
            } else {
                return current.filter(id => id !== dishId);
            }
        });
    }

    save() {
        if (this.form.invalid || this.selectedDishIds().length === 0) return;

        this.isSubmitting.set(true);
        this.errorMessage.set(null);

        const dto = {
            date: this.form.value.date!,
            dishIds: this.selectedDishIds()
        };

        const request = this.isEditing() && this.menuId
            ? this.service.updateMenu(this.menuId, dto)
            : this.service.createMenu(dto);

        request.subscribe({
            next: () => {
                this.router.navigate(['/nutritional-planning/menus']);
            },
            error: (err: any) => {
                console.error('Error saving menu', err);
                this.isSubmitting.set(false);
                if (err.error && err.error.message) {
                    this.errorMessage.set(err.error.message);
                } else {
                    this.errorMessage.set('An error occurred while saving the menu.');
                }
            }
        });
    }
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { NutritionalPlanningResourceService, NovaClassification } from '../../../core/api/nutritional-planning-resource.service';

@Component({
    selector: 'app-ingredient-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="p-6 max-w-2xl mx-auto">
      <div class="flex items-center gap-4 mb-6">
        <a routerLink="/nutritional-planning/ingredients" class="text-gray-500 hover:text-gray-700">
          ← Voltar
        </a>
        <h1 class="text-2xl font-bold text-gray-800">{{ isEditing() ? 'Editar' : 'Novo' }} Ingrediente</h1>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form [formGroup]="form" (ngSubmit)="save()" class="space-y-6">

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input formControlName="name" type="text"
                   class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
          </div>

          <div>
             <label class="block text-sm font-medium text-gray-700 mb-1">Classificação NOVA</label>
             <select formControlName="novaClassification" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                @for (type of novaTypes; track type) {
                    <option [value]="type">{{ getNovaLabel(type) }}</option>
                }
             </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Calorias (kcal)</label>
                <input formControlName="calories" type="number" step="0.1"
                       class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
             </div>
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Carboidratos (g)</label>
                <input formControlName="carbohydrates" type="number" step="0.1"
                       class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
             </div>
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Proteínas (g)</label>
                <input formControlName="protein" type="number" step="0.1"
                       class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
             </div>
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Gorduras (g)</label>
                <input formControlName="fat" type="number" step="0.1"
                       class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
             </div>
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Sódio (mg)</label>
                <input formControlName="sodium" type="number" step="0.1"
                       class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
             </div>
          </div>

          <div class="flex justify-end pt-4">
            <button type="submit"
                    [disabled]="form.invalid || isSubmitting()"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
              {{ isSubmitting() ? 'Salvando...' : 'Salvar Ingrediente' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class IngredientFormComponent {
    private fb = inject(FormBuilder);
    private service = inject(NutritionalPlanningResourceService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    form = this.fb.nonNullable.group({
        name: ['', Validators.required],
        novaClassification: [NovaClassification.UNPROCESSED, Validators.required],
        calories: [0, [Validators.required, Validators.min(0)]],
        carbohydrates: [0, [Validators.required, Validators.min(0)]],
        protein: [0, [Validators.required, Validators.min(0)]],
        fat: [0, [Validators.required, Validators.min(0)]],
        sodium: [0, [Validators.required, Validators.min(0)]],
    });

    isEditing = signal(false);
    isSubmitting = signal(false);
    ingredientId: string | null = null;

    novaTypes = Object.values(NovaClassification);

    getNovaLabel(classification: NovaClassification): string {
        const labels = {
            [NovaClassification.UNPROCESSED]: 'In natura / Minimamente processado',
            [NovaClassification.PROCESSED_CULINARY_INGREDIENT]: 'Ingrediente culinário processado',
            [NovaClassification.PROCESSED]: 'Processado',
            [NovaClassification.ULTRAPROCESSED]: 'Ultraprocessado',
        };
        return labels[classification] || classification;
    }

    constructor() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditing.set(true);
            this.ingredientId = id;
            this.service.findOneIngredient(id).subscribe(ingredient => {
                this.form.patchValue(ingredient);
            });
        }
    }

    save() {
        if (this.form.invalid) return;

        this.isSubmitting.set(true);
        const value = this.form.getRawValue();

        const request = this.isEditing() && this.ingredientId
            ? this.service.updateIngredient(this.ingredientId, value)
            : this.service.createIngredient(value);

        request.subscribe({
            next: () => {
                this.router.navigate(['/nutritional-planning/ingredients']);
            },
            error: (err: unknown) => {
                console.error('Error saving ingredient', err);
                this.isSubmitting.set(false);
            }
        });
    }
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NutritionalPlanningResourceService, Ingredient, NovaClassification } from '../../../core/api/nutritional-planning-resource.service';

@Component({
  selector: 'app-ingredient-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-screen-xl mx-auto p-6 w-full">
      <div class="mb-6">
          <a routerLink="/nutritional-planning/dashboard" class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Voltar
          </a>
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold text-gray-800">Ingredientes</h1>
            <a routerLink="new" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
              <span>+ Novo Ingrediente</span>
            </a>
          </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="p-4 font-semibold text-gray-600">Nome</th>
                <th class="p-4 font-semibold text-gray-600">Classificação</th>
                <th class="p-4 font-semibold text-gray-600">Calorias (kcal)</th>
                <th class="p-4 font-semibold text-gray-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              @for (ingredient of ingredients(); track ingredient.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="p-4 font-medium text-gray-900">{{ ingredient.name }}</td>
                  <td class="p-4">
                    <span [class]="getClassificationClass(ingredient.novaClassification)" 
                          class="px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                      {{ ingredient.novaClassification }}
                    </span>
                  </td>
                  <td class="p-4 text-gray-600">{{ ingredient.calories }}</td>
                  <td class="p-4 flex justify-end gap-2">
                    <a [routerLink]="[ingredient.id, 'edit']" class="text-blue-600 hover:text-blue-800 font-medium">Editar</a>
                    <button (click)="deleteIngredient(ingredient.id)" class="text-red-600 hover:text-red-800 font-medium ml-4">Excluir</button>
                  </td>
                </tr>
              } @empty {
                <tr>
                   <td colspan="4" class="p-8 text-center text-gray-500">Nenhum ingrediente encontrado.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class IngredientListComponent {
  private service = inject(NutritionalPlanningResourceService);
  ingredients = signal<Ingredient[]>([]);

  constructor() {
    this.service.findAllIngredients().subscribe(data => this.ingredients.set(data));
  }

  deleteIngredient(id: string) {
    if (confirm('Tem certeza?')) {
      this.service.deleteIngredient(id).subscribe(() => {
        this.ingredients.update(list => list.filter(i => i.id !== id));
      });
    }
  }

  getClassificationClass(classification: NovaClassification): string {
    switch (classification) {
      case NovaClassification.UNPROCESSED: return 'bg-green-100 text-green-800';
      case NovaClassification.PROCESSED_CULINARY_INGREDIENT: return 'bg-yellow-100 text-yellow-800';
      case NovaClassification.PROCESSED: return 'bg-orange-100 text-orange-800';
      case NovaClassification.ULTRAPROCESSED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}

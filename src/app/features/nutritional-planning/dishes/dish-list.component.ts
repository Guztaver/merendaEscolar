import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NutritionalPlanningResourceService, Dish } from '../../../core/api/nutritional-planning-resource.service';

@Component({
  selector: 'app-dish-list',
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
            <h1 class="text-2xl font-bold text-gray-800">Pratos</h1>
            <a routerLink="new" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <span>+ Novo Prato</span>
            </a>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="p-4 font-semibold text-gray-600">Nome</th>
                <th class="p-4 font-semibold text-gray-600">Método de Preparo</th>
                <th class="p-4 font-semibold text-gray-600">Qtd. Ingredientes</th>
                <th class="p-4 font-semibold text-gray-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              @for (dish of dishes(); track dish.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="p-4 font-medium text-gray-900">{{ dish.name }}</td>
                  <td class="p-4 text-gray-600 truncate max-w-xs">{{ dish.preparationMethod }}</td>
                  <td class="p-4 text-gray-600">{{ dish.ingredients?.length || 0 }}</td>
                  <td class="p-4 flex justify-end gap-2">
                    <a [routerLink]="[dish.id, 'edit']" class="text-blue-600 hover:text-blue-800 font-medium">Editar</a>
                    <button (click)="deleteDish(dish.id)" class="text-red-600 hover:text-red-800 font-medium ml-4">Excluir</button>
                  </td>
                </tr>
              } @empty {
                <tr>
                   <td colspan="4" class="p-8 text-center text-gray-500">Nenhum prato encontrado.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class DishListComponent {
  private service = inject(NutritionalPlanningResourceService);
  dishes = signal<Dish[]>([]);

  constructor() {
    this.service.findAllDishes().subscribe(data => this.dishes.set(data));
  }

  deleteDish(id: string) {
    if (confirm('Tem certeza?')) {
      this.service.deleteDish(id).subscribe(() => {
        this.dishes.update(list => list.filter(d => d.id !== id));
      });
    }
  }
}

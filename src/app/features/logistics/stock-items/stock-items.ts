import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { LogisticsResourceService, StockItem, StockItemType } from '../../../core/api/logistics-resource.service';
import { StockItemModalComponent } from '../stock-item-modal/stock-item-modal';

@Component({
    selector: 'app-stock-items',
    imports: [CommonModule, RouterLink, StockItemModalComponent],
    templateUrl: './stock-items.html',
    styleUrl: './stock-items.css'
})
export class StockItemsComponent implements OnInit {
    private logisticsService = inject(LogisticsResourceService);
    private router = inject(Router);

    stockItems = signal<StockItem[]>([]);
    filteredItems = signal<StockItem[]>([]);
    loading = signal(true);
    searchTerm = signal('');
    filterType = signal<string>('all');
    filterStatus = signal<string>('all');

    // Modal state
    selectedItemId = signal<string | null>(null);
    isModalOpen = signal(false);

    // Filtros de tipo
    typeOptions = [
        { value: 'all', label: 'Todos os Tipos' },
        { value: StockItemType.INGREDIENT, label: 'Ingredientes' },
        { value: StockItemType.DISH, label: 'Pratos/Preparações' },
        { value: StockItemType.SUPPLY, label: 'Suprimentos' },
    ];

    // Filtros de status
    statusOptions = [
        { value: 'all', label: 'Todos' },
        { value: 'active', label: 'Ativos' },
        { value: 'inactive', label: 'Inativos' },
    ];

    ngOnInit() {
        this.loadStockItems();
    }

    loadStockItems() {
        this.loading.set(true);
        this.logisticsService.findAllStockItems().subscribe({
            next: (items) => {
                this.stockItems.set(items);
                this.applyFilters();
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Erro ao carregar itens:', error);
                this.loading.set(false);
            }
        });
    }

    applyFilters() {
        let items = [...this.stockItems()];

        // Filtro de busca
        const search = this.searchTerm().toLowerCase();
        if (search) {
            items = items.filter(item =>
                item.name.toLowerCase().includes(search) ||
                item.code?.toLowerCase().includes(search) ||
                item.location.toLowerCase().includes(search)
            );
        }

        // Filtro de tipo
        if (this.filterType() !== 'all') {
            items = items.filter(item => item.type === this.filterType());
        }

        // Filtro de status
        if (this.filterStatus() === 'active') {
            items = items.filter(item => item.isActive);
        } else if (this.filterStatus() === 'inactive') {
            items = items.filter(item => !item.isActive);
        }

        this.filteredItems.set(items);
    }

    onSearchChange(event: Event) {
        const input = event.target as HTMLInputElement;
        this.searchTerm.set(input.value);
        this.applyFilters();
    }

    onTypeChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        this.filterType.set(select.value);
        this.applyFilters();
    }

    onStatusChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        this.filterStatus.set(select.value);
        this.applyFilters();
    }

    getTypeLabel(type: StockItemType): string {
        const labels: Record<StockItemType, string> = {
            [StockItemType.INGREDIENT]: 'Ingrediente',
            [StockItemType.DISH]: 'Prato/Preparação',
            [StockItemType.SUPPLY]: 'Suprimento',
        };
        return labels[type] || type;
    }

    getStatusClass(item: StockItem): string {
        if (!item.isActive) return 'status-inactive';

        // Se quantidade atual for 0, sempre crítico
        if (item.currentQuantity === 0) return 'status-critical';

        // Se minQuantity for 0, usa maxCapacity como referência
        if (item.minQuantity === 0) {
            if (item.maxCapacity > 0) {
                const percentage = (item.currentQuantity / item.maxCapacity) * 100;
                if (percentage >= 100) return 'status-overstock';
                if (percentage >= 50) return 'status-ok';
                return 'status-warning';
            }
            // Se não tem min nem max definido, assume OK se tem quantidade
            return 'status-ok';
        }

        // Caso normal: usa minQuantity como referência
        const percentage = (item.currentQuantity / item.minQuantity) * 100;
        if (percentage < 25) return 'status-critical';
        if (percentage < 50) return 'status-warning';
        if (item.maxCapacity > 0 && item.currentQuantity >= item.maxCapacity) return 'status-overstock';
        return 'status-ok';
    }

    getStatusLabel(item: StockItem): string {
        if (!item.isActive) return 'Inativo';
        if (item.currentQuantity === 0) return 'Esgotado';

        // Se minQuantity for 0, não pode estar "abaixo do mínimo"
        if (item.minQuantity === 0) {
            if (item.maxCapacity > 0 && item.currentQuantity >= item.maxCapacity) {
                return 'Estoque Excessivo';
            }
            return 'Normal';
        }

        if (item.currentQuantity <= item.minQuantity) return 'Estoque Baixo';
        if (item.maxCapacity > 0 && item.currentQuantity >= item.maxCapacity) return 'Estoque Excessivo';
        return 'Normal';
    }

    getStockPercentage(item: StockItem): number {
        if (item.maxCapacity > 0) {
            return Math.min((item.currentQuantity / item.maxCapacity) * 100, 100);
        }
        return 0;
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    editItem(item: StockItem) {
        this.router.navigate(['/logistics/stock-items', item.id]);
    }

    viewItem(item: StockItem) {
        this.selectedItemId.set(item.id);
        this.isModalOpen.set(true);
    }

    closeModal() {
        this.isModalOpen.set(false);
        this.selectedItemId.set(null);
    }

    getSelectedItem(): StockItem | undefined {
        const id = this.selectedItemId();
        if (!id) return undefined;
        return this.stockItems().find(item => item.id === id);
    }

    deleteItem(item: StockItem) {
        if (confirm(`Tem certeza que deseja excluir "${item.name}"?`)) {
            this.logisticsService.deleteStockItem(item.id).subscribe({
                next: () => {
                    this.loadStockItems();
                },
                error: (error) => {
                    console.error('Erro ao excluir item:', error);

                    let errorMessage = 'Erro ao excluir item. ';

                    if (error.status === 400) {
                        errorMessage += error.error?.message || 'Operação não permitida.';
                    } else if (error.status === 404) {
                        errorMessage += 'Item não encontrado.';
                    } else if (error.status === 401) {
                        errorMessage += 'Sessão expirada. Faça login novamente.';
                    } else if (error.status === 403) {
                        errorMessage += 'Você não tem permissão para excluir este item.';
                    } else if (error.status === 0) {
                        errorMessage += 'Erro de conexão. Verifique se o servidor está rodando.';
                    } else if (error.status === 500) {
                        errorMessage += 'Erro interno do servidor.';
                    } else {
                        errorMessage += error.error?.message || 'Tente novamente.';
                    }

                    alert(errorMessage);
                }
            });
        }
    }

    toggleActive(item: StockItem) {
        const newItem = { ...item, isActive: !item.isActive };
        this.logisticsService.updateStockItem(item.id, { isActive: !item.isActive }).subscribe({
            next: () => {
                this.loadStockItems();
            },
            error: (error) => {
                console.error('Erro ao atualizar status:', error);
            }
        });
    }
}

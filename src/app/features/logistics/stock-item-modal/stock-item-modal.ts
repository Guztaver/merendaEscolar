import { Component, inject, signal, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LogisticsResourceService, StockItem, StockItemType, StockMovement } from '../../../core/api/logistics-resource.service';

@Component({
    selector: 'app-stock-item-modal',
    imports: [CommonModule, RouterLink],
    templateUrl: './stock-item-modal.html',
    styleUrl: './stock-item-modal.css'
})
export class StockItemModalComponent implements OnInit {
    private logisticsService = inject(LogisticsResourceService);

    // Inputs
    item = input.required<StockItem>();
    isOpen = input.required<boolean>();

    // Outputs
    close = output<void>();

    // Signals
    loading = signal(true);
    movements = signal<StockMovement[]>([]);
    showMovements = signal(false);

    ngOnInit() {
        this.loadMovements();
    }

    loadMovements() {
        this.loading.set(true);
        this.logisticsService.findStockItemMovements(this.item().id).subscribe({
            next: (movements) => {
                this.movements.set(movements);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Erro ao carregar movimentações:', error);
                this.loading.set(false);
            }
        });
    }

    toggleMovements() {
        this.showMovements.update(v => !v);
    }

    closeModal() {
        this.close.emit();
    }

    // Click outside to close
    onBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            this.closeModal();
        }
    }

    // Close on Escape key
    onKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            this.closeModal();
        }
    }

    getTypeLabel(type: StockItemType): string {
        const labels: Record<StockItemType, string> = {
            [StockItemType.INGREDIENT]: 'Ingrediente',
            [StockItemType.DISH]: 'Prato/Preparação',
            [StockItemType.SUPPLY]: 'Suprimento',
        };
        return labels[type] || type;
    }

    getStatusClass(): string {
        const item = this.item();
        if (!item.isActive) return 'status-inactive';
        if (item.currentQuantity === 0) return 'status-critical';
        if (item.minQuantity > 0 && item.currentQuantity <= item.minQuantity) return 'status-warning';
        if (item.maxCapacity > 0 && item.currentQuantity >= item.maxCapacity) return 'status-overstock';
        return 'status-ok';
    }

    getStatusLabel(): string {
        const item = this.item();
        if (!item.isActive) return 'Inativo';
        if (item.currentQuantity === 0) return 'Esgotado';
        if (item.minQuantity === 0) {
            if (item.maxCapacity > 0 && item.currentQuantity >= item.maxCapacity) return 'Estoque Excessivo';
            return 'Normal';
        }
        if (item.currentQuantity <= item.minQuantity) return 'Estoque Baixo';
        if (item.maxCapacity > 0 && item.currentQuantity >= item.maxCapacity) return 'Estoque Excessivo';
        return 'Normal';
    }

    getStockPercentage(): number {
        const item = this.item();
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

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getMovementTypeLabel(movementType: string): string {
        const labels: Record<string, string> = {
            'IN': 'Entrada',
            'OUT': 'Saída',
            'TRANSFER': 'Transferência',
            'ADJUSTMENT': 'Ajuste'
        };
        return labels[movementType] || movementType;
    }

    getMovementReasonLabel(reason: string): string {
        const labels: Record<string, string> = {
            'PURCHASE': 'Compra',
            'DONATION': 'Doação',
            'PRODUCTION': 'Produção',
            'USAGE': 'Uso',
            'LOSS': 'Perda',
            'EXPIRED': 'Vencido',
            'TRANSFER_IN': 'Transferência (Entrada)',
            'TRANSFER_OUT': 'Transferência (Saída)',
            'COUNT_ADJUSTMENT': 'Ajuste de Inventário',
            'OTHER': 'Outro'
        };
        return labels[reason] || reason;
    }

    getMovementTypeClass(movementType: string): string {
        if (movementType === 'IN') return 'movement-in';
        if (movementType === 'OUT') return 'movement-out';
        if (movementType === 'TRANSFER') return 'movement-transfer';
        return 'movement-adjustment';
    }
}

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LogisticsResourceService, StockMovement, MovementType, MovementReason } from '../../../core/api/logistics-resource.service';

@Component({
    selector: 'app-movements',
    imports: [CommonModule, RouterLink],
    templateUrl: './movements.html',
    styleUrl: './movements.css'
})
export class MovementsComponent implements OnInit {
    private logisticsService = inject(LogisticsResourceService);

    movements = signal<StockMovement[]>([]);
    filteredMovements = signal<StockMovement[]>([]);
    loading = signal(true);

    filterType = signal<string>('all');
    filterReason = signal<string>('all');
    startDate = signal<string>('');
    endDate = signal<string>('');

    // Opções de filtro de tipo
    typeOptions = [
        { value: 'all', label: 'Todos os Tipos' },
        { value: 'IN', label: 'Entradas' },
        { value: 'OUT', label: 'Saídas' },
        { value: 'ADJUSTMENT', label: 'Ajustes' },
    ];

    // Opções de filtro de motivo
    reasonOptions = [
        { value: 'all', label: 'Todos os Motivos' },
        { value: 'PURCHASE', label: 'Compra' },
        { value: 'DONATION', label: 'Doação' },
        { value: 'USAGE', label: 'Uso/Consumo' },
        { value: 'WASTE', label: 'Desperdício' },
        { value: 'TRANSFER_IN', label: 'Transferência de Entrada' },
        { value: 'TRANSFER_OUT', label: 'Transferência de Saída' },
        { value: 'LOSS', label: 'Perda/Extravio' },
        { value: 'EXPIRED', label: 'Vencido' },
        { value: 'COUNT_ADJUSTMENT', label: 'Ajuste de Contagem' },
        { value: 'OTHER', label: 'Outro' },
    ];

    ngOnInit() {
        this.loadMovements();
    }

    loadMovements() {
        this.loading.set(true);
        this.logisticsService.findAllMovements({ limit: 100 }).subscribe({
            next: (movements) => {
                this.movements.set(movements);
                this.applyFilters();
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Erro ao carregar movimentações:', error);
                this.loading.set(false);
            }
        });
    }

    applyFilters() {
        let filtered = [...this.movements()];

        // Filtro de tipo
        if (this.filterType() !== 'all') {
            filtered = filtered.filter(m => m.movementType === this.filterType());
        }

        // Filtro de motivo
        if (this.filterReason() !== 'all') {
            filtered = filtered.filter(m => m.reason === this.filterReason());
        }

        // Filtro de data
        if (this.startDate()) {
            const start = new Date(this.startDate());
            filtered = filtered.filter(m => new Date(m.createdAt) >= start);
        }

        if (this.endDate()) {
            const end = new Date(this.endDate());
            end.setHours(23, 59, 59);
            filtered = filtered.filter(m => new Date(m.createdAt) <= end);
        }

        this.filteredMovements.set(filtered);
    }

    onTypeChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        this.filterType.set(select.value);
        this.applyFilters();
    }

    onReasonChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        this.filterReason.set(select.value);
        this.applyFilters();
    }

    onStartDateChange(event: Event) {
        const input = event.target as HTMLInputElement;
        this.startDate.set(input.value);
        this.applyFilters();
    }

    onEndDateChange(event: Event) {
        const input = event.target as HTMLInputElement;
        this.endDate.set(input.value);
        this.applyFilters();
    }

    clearFilters() {
        this.filterType.set('all');
        this.filterReason.set('all');
        this.startDate.set('');
        this.endDate.set('');
        this.applyFilters();
    }

    getMovementTypeLabel(type: MovementType): string {
        switch (type) {
            case MovementType.IN:
                return 'Entrada';
            case MovementType.OUT:
                return 'Saída';
            case MovementType.ADJUSTMENT:
                return 'Ajuste';
            case MovementType.TRANSFER:
                return 'Transferência';
            default:
                return type;
        }
    }

    getMovementReasonLabel(reason: MovementReason): string {
        const labels: Record<MovementReason, string> = {
            [MovementReason.PURCHASE]: 'Compra',
            [MovementReason.DONATION]: 'Doação',
            [MovementReason.PRODUCTION]: 'Produção Própria',
            [MovementReason.USAGE]: 'Uso/Consumo',
            [MovementReason.TRANSFER_IN]: 'Transferência Recebida',
            [MovementReason.TRANSFER_OUT]: 'Transferência Enviada',
            [MovementReason.LOSS]: 'Perda/Extravio',
            [MovementReason.EXPIRED]: 'Vencido',
            [MovementReason.COUNT_ADJUSTMENT]: 'Ajuste de Contagem',
            [MovementReason.OTHER]: 'Outro',
        };
        return labels[reason] || reason;
    }

    getMovementTypeClass(type: MovementType): string {
        switch (type) {
            case MovementType.IN:
                return 'type-in';
            case MovementType.OUT:
                return 'type-out';
            case MovementType.ADJUSTMENT:
                return 'type-adjustment';
            case MovementType.TRANSFER:
                return 'type-transfer';
            default:
                return '';
        }
    }

    formatDate(date: string): string {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    formatDateOnly(date: string): string {
        return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
}

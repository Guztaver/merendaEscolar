import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LogisticsResourceService, StockItem, MovementType, MovementReason } from '../../../core/api/logistics-resource.service';

@Component({
    selector: 'app-movement-form',
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './movement-form.html',
    styleUrl: './movement-form.css'
})
export class MovementFormComponent {
    private logisticsService = inject(LogisticsResourceService);
    private router = inject(Router);

    stockItems = signal<StockItem[]>([]);
    isLoading = signal(false);
    errorMessage = signal<string | null>(null);

    form = new FormGroup({
        stockItemId: new FormControl('', [Validators.required]),
        movementType: new FormControl(MovementType.IN, [Validators.required]),
        reason: new FormControl(MovementReason.PURCHASE, [Validators.required]),
        quantity: new FormControl(1, [Validators.required, Validators.min(0.01)]),
        batchNumber: new FormControl(''),
        expiryDate: new FormControl(''),
        supplierId: new FormControl(''),
        schoolId: new FormControl('default-school'),
        notes: new FormControl(''),
        documentNumber: new FormControl(''),
    });

    readonly MovementType = MovementType;
    readonly MovementReason = MovementReason;

    constructor() {
        this.loadStockItems();
    }

    loadStockItems() {
        this.logisticsService.findAllStockItems().subscribe(items => {
            this.stockItems.set(items.filter(item => item.isActive));
        });
    }

    onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set(null);

        const data = { ...this.form.value };
        // Remove campos vazios
        (Object.keys(data) as Array<keyof typeof data>).forEach(key => {
            if (data[key] === '' || data[key] === null) {
                delete data[key];
            }
        });

        // Remove null values e converte para o formato esperado
        const cleanData: any = {};
        Object.entries(data).forEach(([k, v]) => {
            if (v !== null && v !== '' && v !== undefined) {
                cleanData[k] = v;
            }
        });

        this.logisticsService.createMovement(cleanData).subscribe({
            next: () => {
                this.router.navigate(['/logistics/movements']);
            },
            error: (err) => {
                this.errorMessage.set(err.error?.message || 'Erro ao registrar movimentação.');
                this.isLoading.set(false);
            }
        });
    }

    cancel() {
        this.router.navigate(['/logistics/movements']);
    }

    getMovementTypeLabel(type: MovementType): string {
        switch (type) {
            case MovementType.IN:
                return 'Entrada';
            case MovementType.OUT:
                return 'Saída';
            case MovementType.TRANSFER:
                return 'Transferência';
            case MovementType.ADJUSTMENT:
                return 'Ajuste';
            default:
                return type;
        }
    }

    getReasonLabel(reason: MovementReason): string {
        const labels = {
            [MovementReason.PURCHASE]: 'Compra',
            [MovementReason.DONATION]: 'Doação',
            [MovementReason.PRODUCTION]: 'Produção Própria',
            [MovementReason.USAGE]: 'Uso em Preparações',
            [MovementReason.LOSS]: 'Perda/Dano',
            [MovementReason.EXPIRED]: 'Vencido',
            [MovementReason.TRANSFER_IN]: 'Transferência Recebida',
            [MovementReason.TRANSFER_OUT]: 'Transferência Enviada',
            [MovementReason.COUNT_ADJUSTMENT]: 'Ajuste de Contagem',
            [MovementReason.OTHER]: 'Outro',
        };
        return labels[reason] || reason;
    }

    // Retorna os motivos disponíveis baseados no tipo de movimento
    getAvailableReasons(): MovementReason[] {
        const type = this.form.value.movementType;
        if (type === MovementType.IN) {
            return [
                MovementReason.PURCHASE,
                MovementReason.DONATION,
                MovementReason.PRODUCTION,
                MovementReason.TRANSFER_IN,
                MovementReason.COUNT_ADJUSTMENT,
                MovementReason.OTHER,
            ];
        } else if (type === MovementType.OUT) {
            return [
                MovementReason.USAGE,
                MovementReason.LOSS,
                MovementReason.EXPIRED,
                MovementReason.TRANSFER_OUT,
                MovementReason.COUNT_ADJUSTMENT,
                MovementReason.OTHER,
            ];
        }
        return [MovementReason.COUNT_ADJUSTMENT, MovementReason.OTHER];
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.form.get(fieldName);
        return !!(field?.invalid && (field?.dirty || field?.touched));
    }

    getErrorMessage(fieldName: string): string {
        const field = this.form.get(fieldName);
        if (!field?.errors) return '';

        if (field.errors['required']) {
            return 'Este campo é obrigatório.';
        }
        if (field.errors['min']) {
            return `Valor mínimo: ${field.errors['min'].min}.`;
        }
        return '';
    }
}

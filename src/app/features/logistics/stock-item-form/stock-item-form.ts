import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { LogisticsResourceService, StockItem, StockItemType } from '../../../core/api/logistics-resource.service';

@Component({
    selector: 'app-stock-item-form',
    imports: [CommonModule, RouterLink],
    templateUrl: './stock-item-form.html',
    styleUrl: './stock-item-form.css'
})
export class StockItemFormComponent implements OnInit {
    private logisticsService = inject(LogisticsResourceService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    isEdit = signal(false);
    loading = signal(false);
    submitting = signal(false);
    itemId = signal<string | null>(null);

    // Signals para mensagens de feedback
    successMessage = signal('');
    errorMessage = signal('');

    item = signal<Partial<StockItem>>({
        code: '',
        name: '',
        type: StockItemType.INGREDIENT,
        currentQuantity: 0,
        minQuantity: 1,
        maxCapacity: 100,
        unit: 'kg',
        unitCost: 0,
        location: '',
        isActive: true,
    });

    // Opções para tipo de item
    typeOptions = [
        { value: StockItemType.INGREDIENT, label: 'Ingrediente' },
        { value: StockItemType.DISH, label: 'Prato/Preparação' },
        { value: StockItemType.SUPPLY, label: 'Suprimento' },
    ];

    // Opções para unidade
    unitOptions = [
        { value: 'kg', label: 'Quilograma (kg)' },
        { value: 'g', label: 'Grama (g)' },
        { value: 'L', label: 'Litro (L)' },
        { value: 'mL', label: 'Mililitro (mL)' },
        { value: 'un', label: 'Unidade (un)' },
        { value: 'dz', label: 'Dúzia (dz)' },
        { value: 'cx', label: 'Caixa (cx)' },
        { value: 'saco', label: 'Saco' },
        { value: 'pacote', label: 'Pacote' },
    ];

    errors = signal<Record<string, string>>({});

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id && id !== 'new') {
            this.isEdit.set(true);
            this.itemId.set(id);
            this.loadItem(id);
        }
    }

    loadItem(id: string) {
        this.loading.set(true);
        this.errorMessage.set('');

        this.logisticsService.findStockItem(id).subscribe({
            next: (item) => {
                this.item.set(item);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Erro ao carregar item:', error);
                this.errorMessage.set(this.getErrorMessage(error));
                this.loading.set(false);
            }
        });
    }

    onSubmit() {
        try {
            // Limpar mensagens anteriores
            this.errorMessage.set('');
            this.successMessage.set('');

            console.log('onSubmit chamado');
            console.log('Item atual:', this.item());

            if (!this.validateForm()) {
                console.log('Validação falhou. Erros:', this.errors());
                this.errorMessage.set('Por favor, corrija os erros no formulário.');
                return;
            }

            this.submitting.set(true);
            const itemData = this.item();

            console.log('Enviando dados:', itemData);

            const operation = this.isEdit()
                ? this.logisticsService.updateStockItem(this.itemId()!, itemData)
                : this.logisticsService.createStockItem(itemData as any);

            operation.subscribe({
                next: (response) => {
                    console.log('Sucesso!', response);
                    this.submitting.set(false);
                    this.successMessage.set(
                        this.isEdit()
                            ? 'Item atualizado com sucesso! Redirecionando...'
                            : 'Item criado com sucesso! Redirecionando...'
                    );

                    // Redirecionar após 1.5 segundos
                    setTimeout(() => {
                        this.router.navigate(['/logistics/stock-items']);
                    }, 1500);
                },
                error: (error) => {
                    console.error('Erro ao salvar:', error);
                    this.submitting.set(false);
                    this.errorMessage.set(this.getErrorMessage(error));
                }
            });
        } catch (error) {
            console.error('Erro inesperado no onSubmit:', error);
            this.submitting.set(false);
            this.errorMessage.set('Ocorreu um erro inesperado. Tente novamente.');
        }
    }

    validateForm(): boolean {
        const item = this.item();
        const errors: Record<string, string> = {};

        console.log('Validando formulário:', item);

        if (!item.name?.trim()) {
            errors['name'] = 'Nome é obrigatório';
        }

        if (!item.code?.trim()) {
            errors['code'] = 'Código é obrigatório';
        }

        if (item.currentQuantity === undefined || item.currentQuantity < 0) {
            errors['currentQuantity'] = 'Quantidade deve ser maior ou igual a zero';
        }

        if (item.minQuantity === undefined || item.minQuantity < 0) {
            errors['minQuantity'] = 'Quantidade mínima deve ser maior ou igual a zero';
        }

        if (item.maxCapacity === undefined || item.maxCapacity < 0) {
            errors['maxCapacity'] = 'Capacidade máxima deve ser maior ou igual a zero';
        }

        if (item.minQuantity! >= item.maxCapacity!) {
            errors['maxCapacity'] = 'Capacidade máxima deve ser maior que a mínima';
        }

        if (item.unitCost === undefined || item.unitCost < 0) {
            errors['unitCost'] = 'Custo unitário deve ser maior ou igual a zero';
        }

        if (!item.location?.trim()) {
            errors['location'] = 'Localização é obrigatória';
        }

        this.errors.set(errors);
        console.log('Erros de validação:', errors);
        return Object.keys(errors).length === 0;
    }

    updateField(field: keyof StockItem, value: any) {
        console.log(`Atualizando campo ${field}:`, value);
        this.item.update(item => ({ ...item, [field]: value }));

        // Limpar erro do campo quando for alterado
        if (this.errors()[field]) {
            this.errors.update(errors => {
                const newErrors = { ...errors };
                delete newErrors[field];
                return newErrors;
            });
        }

        // Limpar mensagens de erro/sucesso ao editar
        if (this.errorMessage() || this.successMessage()) {
            this.errorMessage.set('');
            this.successMessage.set('');
        }
    }

    getError(field: string): string | undefined {
        return this.errors()[field];
    }

    hasError(field: string): boolean {
        return !!this.errors()[field];
    }

    toNumber(value: string): number {
        const parsed = parseFloat(value);
        console.log(`Convertendo "${value}" para número:`, parsed);
        return isNaN(parsed) ? 0 : parsed;
    }

    // Helper para formatar mensagens de erro
    private getErrorMessage(error: any): string {
        if (error.status === 401) {
            return 'Sessão expirada. Por favor, faça login novamente.';
        } else if (error.status === 403) {
            return 'Você não tem permissão para realizar esta ação.';
        } else if (error.status === 404) {
            return 'Item não encontrado.';
        } else if (error.status === 0) {
            return 'Erro de conexão. Verifique se o servidor está rodando.';
        } else if (error.status === 500) {
            return 'Erro interno do servidor. Tente novamente mais tarde.';
        } else {
            return error.error?.message || 'Ocorreu um erro ao salvar. Tente novamente.';
        }
    }

    // Cancelar e voltar para a lista
    cancel() {
        this.router.navigate(['/logistics/stock-items']);
    }
}

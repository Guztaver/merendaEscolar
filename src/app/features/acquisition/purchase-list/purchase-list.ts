import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AcquisitionResourceService, Purchase } from '../../../core/api/acquisition-resource.service';

@Component({
    selector: 'app-purchase-list',
    imports: [CommonModule, RouterLink],
    templateUrl: './purchase-list.html',
    styleUrl: './purchase-list.css'
})
export class PurchaseListComponent {
    private acquisitionService = inject(AcquisitionResourceService);
    purchases = signal<Purchase[]>([]);

    constructor() {
        this.loadPurchases();
    }

    loadPurchases() {
        this.acquisitionService.findAllPurchases().subscribe(purchases => {
            this.purchases.set(purchases);
        });
    }

    deletePurchase(id: string) {
        if (confirm('Are you sure you want to delete this purchase?')) {
            this.acquisitionService.deletePurchase(id).subscribe(() => {
                this.loadPurchases();
            });
        }
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount);
    }

    formatDate(date: string): string {
        return new Date(date).toLocaleDateString('pt-BR');
    }
}

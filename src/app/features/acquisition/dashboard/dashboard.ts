import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AcquisitionResourceService, FamilyFarmingStats, Purchase } from '../../../core/api/acquisition-resource.service';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css'
})
export class DashboardComponent {
    private acquisitionService = inject(AcquisitionResourceService);
    stats = signal<FamilyFarmingStats | null>(null);
    allPurchases = signal<Purchase[]>([]);
    yearControl = new FormControl(new Date().getFullYear());
    availableYears = this.generateYearOptions();

    // Computed signal to filter purchases by selected year
    purchases = computed(() => {
        const year = this.yearControl.value ?? new Date().getFullYear();
        return this.allPurchases().filter(purchase => {
            const purchaseYear = new Date(purchase.date).getFullYear();
            return purchaseYear === year;
        });
    });

    private generateYearOptions(): number[] {
        const currentYear = new Date().getFullYear();
        const years: number[] = [];
        for (let year = currentYear - 5; year <= currentYear + 1; year++) {
            years.push(year);
        }
        return years;
    }

    constructor() {
        this.loadData();
        this.yearControl.valueChanges.subscribe(() => {
            this.loadStats();
        });
    }

    loadData() {
        this.loadStats();
        this.loadPurchases();
    }

    loadStats() {
        const year = this.yearControl.value ?? new Date().getFullYear();
        this.acquisitionService.getDashboard(year).subscribe(stats => {
            this.stats.set(stats);
        });
    }

    loadPurchases() {
        this.acquisitionService.findAllPurchases().subscribe(purchases => {
            this.allPurchases.set(purchases);
        });
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount);
    }

    getComplianceClass(): string {
        const stats = this.stats();
        if (!stats) return '';
        return stats.isCompliant ? 'compliant' : 'non-compliant';
    }

    getComplianceMessage(): string {
        const stats = this.stats();
        if (!stats) return '';
        return stats.isCompliant
            ? '✓ Em conformidade com o requisito mínimo de 45%'
            : '✗ Abaixo do requisito mínimo de 45%';
    }

    formatDate(date: string): string {
        return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
    }
}

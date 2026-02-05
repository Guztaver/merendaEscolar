import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AcquisitionResourceService, FamilyFarmingStats } from '../../core/api/acquisition-resource.service';

@Component({
    selector: 'app-general-dashboard',
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './general-dashboard.html',
    styleUrl: './general-dashboard.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralDashboardComponent {
    private acquisitionService = inject(AcquisitionResourceService);

    stats = signal<FamilyFarmingStats | null>(null);
    yearControl = new FormControl(new Date().getFullYear());
    availableYears = this.generateYearOptions();

    private generateYearOptions(): number[] {
        const currentYear = new Date().getFullYear();
        const years: number[] = [];
        for (let year = currentYear - 5; year <= currentYear + 1; year++) {
            years.push(year);
        }
        return years;
    }

    constructor() {
        this.loadStats();
        this.yearControl.valueChanges.subscribe(() => {
            this.loadStats();
        });
    }

    loadStats() {
        const year = this.yearControl.value ?? new Date().getFullYear();
        this.acquisitionService.getDashboard(year).subscribe(stats => {
            this.stats.set(stats);
        });
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount);
    }
}

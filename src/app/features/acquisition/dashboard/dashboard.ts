import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AcquisitionResourceService, FamilyFarmingStats } from '../../../core/api/acquisition-resource.service';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css'
})
export class DashboardComponent {
    private acquisitionService = inject(AcquisitionResourceService);
    stats = signal<FamilyFarmingStats | null>(null);
    yearControl = new FormControl(new Date().getFullYear());

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

    getComplianceClass(): string {
        const stats = this.stats();
        if (!stats) return '';
        return stats.isCompliant ? 'compliant' : 'non-compliant';
    }

    getComplianceMessage(): string {
        const stats = this.stats();
        if (!stats) return '';
        return stats.isCompliant
            ? '✓ Compliant with 45% minimum requirement'
            : '✗ Below 45% minimum requirement';
    }
}

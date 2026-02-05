import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LogisticsResourceService, DashboardData, StockAlert, AlertSeverity } from '../../../core/api/logistics-resource.service';

@Component({
    selector: 'app-stock-dashboard',
    imports: [CommonModule, RouterLink],
    templateUrl: './stock-dashboard.html',
    styleUrl: './stock-dashboard.css'
})
export class StockDashboardComponent {
    private logisticsService = inject(LogisticsResourceService);
    dashboardData = signal<DashboardData | null>(null);
    alerts = signal<StockAlert[]>([]);
    schoolId = 'default-school'; // Em produção, viria do contexto do usuário

    // Computed signals para filtros
    criticalAlerts = computed(() =>
        this.alerts().filter(a => a.severity === AlertSeverity.CRITICAL && a.status === 'OPEN')
    );

    highAlerts = computed(() =>
        this.alerts().filter(a => a.severity === AlertSeverity.HIGH && a.status === 'OPEN')
    );

    constructor() {
        this.loadData();
    }

    loadData() {
        this.logisticsService.getDashboardData(this.schoolId).subscribe(data => {
            this.dashboardData.set(data);
        });

        this.logisticsService.findAllAlerts({ schoolId: this.schoolId, status: 'OPEN' }).subscribe(alerts => {
            this.alerts.set(alerts);
        });
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatDate(date: string): string {
        return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
    }

    getSeverityClass(severity: AlertSeverity): string {
        switch (severity) {
            case AlertSeverity.CRITICAL:
                return 'severity-critical';
            case AlertSeverity.HIGH:
                return 'severity-high';
            case AlertSeverity.MEDIUM:
                return 'severity-medium';
            case AlertSeverity.LOW:
                return 'severity-low';
            default:
                return '';
        }
    }

    getSeverityLabel(severity: AlertSeverity): string {
        switch (severity) {
            case AlertSeverity.CRITICAL:
                return 'Crítico';
            case AlertSeverity.HIGH:
                return 'Alto';
            case AlertSeverity.MEDIUM:
                return 'Médio';
            case AlertSeverity.LOW:
                return 'Baixo';
            default:
                return '';
        }
    }

    dismissAlert(alertId: string) {
        this.logisticsService.dismissAlert(alertId).subscribe(() => {
            this.loadData();
        });
    }
}

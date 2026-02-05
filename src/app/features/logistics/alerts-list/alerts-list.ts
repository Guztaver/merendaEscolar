import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LogisticsResourceService, StockAlert, AlertSeverity, AlertStatus, AlertType } from '../../../core/api/logistics-resource.service';

@Component({
    selector: 'app-alerts-list',
    imports: [CommonModule, RouterLink],
    templateUrl: './alerts-list.html',
    styleUrl: './alerts-list.css'
})
export class AlertsListComponent {
    private logisticsService = inject(LogisticsResourceService);
    alerts = signal<StockAlert[]>([]);
    filteredAlerts = signal<StockAlert[]>([]);
    filterSeverity = signal<string>('all');
    filterStatus = signal<string>('OPEN');
    filterType = signal<string>('all');

    constructor() {
        this.loadData();
    }

    loadData() {
        this.logisticsService.findAllAlerts().subscribe(alerts => {
            this.alerts.set(alerts);
            this.applyFilters();
        });
    }

    applyFilters() {
        let filtered = [...this.alerts()];

        if (this.filterSeverity() !== 'all') {
            filtered = filtered.filter(a => a.severity === this.filterSeverity());
        }

        if (this.filterStatus() !== 'all') {
            filtered = filtered.filter(a => a.status === this.filterStatus());
        }

        if (this.filterType() !== 'all') {
            filtered = filtered.filter(a => a.type === this.filterType());
        }

        this.filteredAlerts.set(filtered);
    }

    onSeverityChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        this.filterSeverity.set(select.value);
        this.applyFilters();
    }

    onStatusChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        this.filterStatus.set(select.value);
        this.applyFilters();
    }

    onTypeChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        this.filterType.set(select.value);
        this.applyFilters();
    }

    dismissAlert(alertId: string) {
        if (confirm('Deseja dispensar este alerta?')) {
            this.logisticsService.dismissAlert(alertId).subscribe(() => {
                this.loadData();
            });
        }
    }

    acknowledgeAlert(alertId: string) {
        this.logisticsService.updateAlert(alertId, { status: AlertStatus.ACKNOWLEDGED }).subscribe(() => {
            this.loadData();
        });
    }

    resolveAlert(alertId: string) {
        this.logisticsService.updateAlert(alertId, { status: AlertStatus.RESOLVED }).subscribe(() => {
            this.loadData();
        });
    }

    getSeverityClass(severity: AlertSeverity): string {
        return `severity-${severity.toLowerCase()}`;
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
                return severity;
        }
    }

    getStatusLabel(status: AlertStatus): string {
        switch (status) {
            case AlertStatus.OPEN:
                return 'Aberto';
            case AlertStatus.ACKNOWLEDGED:
                return 'Reconhecido';
            case AlertStatus.RESOLVED:
                return 'Resolvido';
            case AlertStatus.DISMISSED:
                return 'Dispensado';
            default:
                return status;
        }
    }

    getStatusClass(status: AlertStatus): string {
        return `status-${status.toLowerCase()}`;
    }

    getTypeLabel(type: AlertType): string {
        switch (type) {
            case AlertType.LOW_STOCK:
                return 'Estoque Baixo';
            case AlertType.OVERSTOCK:
                return 'Estoque Excessivo';
            case AlertType.EXPIRY_SOON:
                return 'Vencendo em Breve';
            case AlertType.EXPIRED:
                return 'Vencido';
            case AlertType.OUT_OF_STOCK:
                return 'Esgotado';
            default:
                return type;
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

    canActOnAlert(alert: StockAlert): boolean {
        return alert.status === AlertStatus.OPEN || alert.status === AlertStatus.ACKNOWLEDGED;
    }
}

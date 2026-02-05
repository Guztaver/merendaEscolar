import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Enums
export enum StockItemType {
    INGREDIENT = 'INGREDIENT',
    DISH = 'DISH',
    SUPPLY = 'SUPPLY',
}

export enum MovementType {
    IN = 'IN',
    OUT = 'OUT',
    TRANSFER = 'TRANSFER',
    ADJUSTMENT = 'ADJUSTMENT',
}

export enum MovementReason {
    PURCHASE = 'PURCHASE',
    DONATION = 'DONATION',
    PRODUCTION = 'PRODUCTION',
    USAGE = 'USAGE',
    LOSS = 'LOSS',
    EXPIRED = 'EXPIRED',
    TRANSFER_IN = 'TRANSFER_IN',
    TRANSFER_OUT = 'TRANSFER_OUT',
    COUNT_ADJUSTMENT = 'COUNT_ADJUSTMENT',
    OTHER = 'OTHER',
}

export enum AlertType {
    LOW_STOCK = 'LOW_STOCK',
    OVERSTOCK = 'OVERSTOCK',
    EXPIRY_SOON = 'EXPIRY_SOON',
    EXPIRED = 'EXPIRED',
    OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export enum AlertSeverity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL',
}

export enum AlertStatus {
    OPEN = 'OPEN',
    ACKNOWLEDGED = 'ACKNOWLEDGED',
    RESOLVED = 'RESOLVED',
    DISMISSED = 'DISMISSED',
}

// Interfaces
export interface StockItem {
    id: string;
    name: string;
    type: StockItemType;
    ingredientId?: string;
    code?: string;
    currentQuantity: number;
    minQuantity: number;
    maxCapacity: number;
    unit: string;
    unitCost: number;
    location: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface StockMovement {
    id: string;
    stockItemId: string;
    stockItem?: StockItem;
    movementType: MovementType;
    reason: MovementReason;
    quantity: number;
    previousBalance: number;
    newBalance: number;
    batchNumber?: string;
    expiryDate?: string;
    supplierId?: string;
    schoolId?: string;
    notes?: string;
    documentNumber?: string;
    createdAt: string;
    createdBy: string;
}

export interface StockAlert {
    id: string;
    stockItemId: string;
    stockItem?: StockItem;
    type: AlertType;
    severity: AlertSeverity;
    status: AlertStatus;
    message: string;
    currentQuantity?: number;
    threshold?: number;
    expiryDate?: string;
    batchNumber?: string;
    schoolId?: string;
    createdAt: string;
    resolvedAt?: string;
    resolvedBy?: string;
    resolutionNotes?: string;
}

export interface DashboardData {
    totalItems: number;
    lowStockCount: number;
    openAlertsCount: number;
    totalStockValue: number;
    recentMovementsCount: number;
    criticalAlerts: number;
    recentMovements: StockMovement[];
}

export interface StockValue {
    totalValue: number;
    byCategory: Record<string, { count: number; value: number }>;
}

export interface MovementHistory {
    period: {
        days: number;
        startDate: string;
        endDate: string;
    };
    summary: {
        totalMovements: number;
        totalIn: number;
        totalOut: number;
    };
    byDate: Record<string, { in: number; out: number; adjustments: number; count: number }>;
}

@Injectable({
    providedIn: 'root'
})
export class LogisticsResourceService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:3000/api/logistics';

    // ==================== STOCK ITEMS ====================

    findAllStockItems(filters?: {
        schoolId?: string;
        type?: string;
        isActive?: boolean;
    }): Observable<StockItem[]> {
        return this.http.get<StockItem[]>(`${this.apiUrl}/stock-items`, { params: filters as any });
    }

    findStockItem(id: string): Observable<StockItem> {
        return this.http.get<StockItem>(`${this.apiUrl}/stock-items/${id}`);
    }

    createStockItem(item: Partial<StockItem>): Observable<StockItem> {
        return this.http.post<StockItem>(`${this.apiUrl}/stock-items`, item);
    }

    updateStockItem(id: string, item: Partial<StockItem>): Observable<StockItem> {
        return this.http.patch<StockItem>(`${this.apiUrl}/stock-items/${id}`, item);
    }

    deleteStockItem(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/stock-items/${id}`);
    }

    findStockItemMovements(id: string): Observable<StockMovement[]> {
        return this.http.get<StockMovement[]>(`${this.apiUrl}/stock-items/${id}/movements`);
    }

    // ==================== STOCK MOVEMENTS ====================

    findAllMovements(filters?: {
        stockItemId?: string;
        schoolId?: string;
        type?: string;
        startDate?: string;
        endDate?: string;
        limit?: number;
    }): Observable<StockMovement[]> {
        return this.http.get<StockMovement[]>(`${this.apiUrl}/movements`, { params: filters as any });
    }

    findMovement(id: string): Observable<StockMovement> {
        return this.http.get<StockMovement>(`${this.apiUrl}/movements/${id}`);
    }

    createMovement(movement: Partial<StockMovement>): Observable<StockMovement> {
        return this.http.post<StockMovement>(`${this.apiUrl}/movements`, movement);
    }

    // ==================== STOCK ALERTS ====================

    findAllAlerts(filters?: {
        schoolId?: string;
        type?: string;
        severity?: string;
        status?: string;
    }): Observable<StockAlert[]> {
        return this.http.get<StockAlert[]>(`${this.apiUrl}/alerts`, { params: filters as any });
    }

    findAlert(id: string): Observable<StockAlert> {
        return this.http.get<StockAlert>(`${this.apiUrl}/alerts/${id}`);
    }

    updateAlert(id: string, alert: Partial<StockAlert>): Observable<StockAlert> {
        return this.http.patch<StockAlert>(`${this.apiUrl}/alerts/${id}`, alert);
    }

    dismissAlert(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/alerts/${id}`);
    }

    // ==================== ANALYTICS & REPORTS ====================

    getDashboardData(schoolId: string): Observable<DashboardData> {
        return this.http.get<DashboardData>(`${this.apiUrl}/dashboard/${schoolId}`);
    }

    getLowStockReport(schoolId?: string): Observable<StockItem[]> {
        return this.http.get<StockItem[]>(`${this.apiUrl}/analytics/low-stock`, {
            params: schoolId ? { schoolId } : {}
        });
    }

    getExpiringSoonReport(days: number = 7, schoolId?: string): Observable<StockMovement[]> {
        return this.http.get<StockMovement[]>(`${this.apiUrl}/analytics/expiring-soon`, {
            params: { days, ...(schoolId && { schoolId }) }
        });
    }

    getStockValue(schoolId?: string): Observable<StockValue> {
        return this.http.get<StockValue>(`${this.apiUrl}/analytics/stock-value`, {
            params: schoolId ? { schoolId } : {}
        });
    }

    getMovementHistory(days: number = 30, schoolId?: string): Observable<MovementHistory> {
        return this.http.get<MovementHistory>(`${this.apiUrl}/analytics/movement-history`, {
            params: { days, ...(schoolId && { schoolId }) }
        });
    }

    // ==================== INTEGRATION ====================

    syncIngredientToStock(ingredientId: string, schoolId: string): Observable<StockItem> {
        return this.http.post<StockItem>(`${this.apiUrl}/stock-items/sync-ingredient`, {
            ingredientId,
            schoolId
        });
    }
}

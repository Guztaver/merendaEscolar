import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum SupplierType {
    REGULAR = 'regular',
    FAMILY_FARMING = 'family_farming',
}

export interface Supplier {
    id: string;
    name: string;
    document: string;
    type: SupplierType;
}

export interface Purchase {
    id: string;
    amount: number;
    date: string;
    supplier: Supplier;
}

export interface FamilyFarmingStats {
    total: number;
    familyFarming: number;
    percentage: number;
    isCompliant: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class AcquisitionResourceService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:3000/api/acquisition';

    // Supplier operations
    findAllSuppliers(): Observable<Supplier[]> {
        return this.http.get<Supplier[]>(`${this.apiUrl}/suppliers`);
    }

    findOneSupplier(id: string): Observable<Supplier> {
        return this.http.get<Supplier>(`${this.apiUrl}/suppliers/${id}`);
    }

    createSupplier(supplier: Partial<Supplier>): Observable<Supplier> {
        return this.http.post<Supplier>(`${this.apiUrl}/suppliers`, supplier);
    }

    updateSupplier(id: string, supplier: Partial<Supplier>): Observable<Supplier> {
        return this.http.patch<Supplier>(`${this.apiUrl}/suppliers/${id}`, supplier);
    }

    deleteSupplier(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/suppliers/${id}`);
    }

    // Purchase operations
    findAllPurchases(): Observable<Purchase[]> {
        return this.http.get<Purchase[]>(`${this.apiUrl}/purchases`);
    }

    findOnePurchase(id: string): Observable<Purchase> {
        return this.http.get<Purchase>(`${this.apiUrl}/purchases/${id}`);
    }

    createPurchase(purchase: Partial<Purchase> & { supplierId: string }): Observable<Purchase> {
        return this.http.post<Purchase>(`${this.apiUrl}/purchases`, purchase);
    }

    updatePurchase(id: string, purchase: Partial<Purchase> & { supplierId?: string }): Observable<Purchase> {
        return this.http.patch<Purchase>(`${this.apiUrl}/purchases/${id}`, purchase);
    }

    deletePurchase(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/purchases/${id}`);
    }

    // Dashboard
    getDashboard(year?: number): Observable<FamilyFarmingStats> {
        const url = year
            ? `${this.apiUrl}/dashboard?year=${year}`
            : `${this.apiUrl}/dashboard`;
        return this.http.get<FamilyFarmingStats>(url);
    }
}

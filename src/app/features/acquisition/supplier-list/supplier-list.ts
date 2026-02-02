import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AcquisitionResourceService, Supplier } from '../../../core/api/acquisition-resource.service';

@Component({
    selector: 'app-supplier-list',
    imports: [CommonModule, RouterLink],
    templateUrl: './supplier-list.html',
    styleUrl: './supplier-list.css'
})
export class SupplierListComponent {
    private acquisitionService = inject(AcquisitionResourceService);
    suppliers = signal<Supplier[]>([]);

    constructor() {
        this.loadSuppliers();
    }

    loadSuppliers() {
        this.acquisitionService.findAllSuppliers().subscribe(suppliers => {
            this.suppliers.set(suppliers);
        });
    }

    deleteSupplier(id: string) {
        if (confirm('Are you sure you want to delete this supplier?')) {
            this.acquisitionService.deleteSupplier(id).subscribe(() => {
                this.loadSuppliers();
            });
        }
    }

    getSupplierTypeLabel(type: string): string {
        return type === 'family_farming' ? 'Family Farming' : 'Regular';
    }
}

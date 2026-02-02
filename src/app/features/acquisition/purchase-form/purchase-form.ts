import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AcquisitionResourceService, Purchase, Supplier } from '../../../core/api/acquisition-resource.service';

@Component({
    selector: 'app-purchase-form',
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './purchase-form.html',
    styleUrl: './purchase-form.css'
})
export class PurchaseFormComponent {
    private fb = inject(FormBuilder);
    private acquisitionService = inject(AcquisitionResourceService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    form = this.fb.group({
        amount: [0, [Validators.required, Validators.min(0.01)]],
        date: ['', Validators.required],
        supplierId: ['', Validators.required]
    });

    purchaseId = signal<string | null>(null);
    isEditMode = computed(() => !!this.purchaseId());
    suppliers = signal<Supplier[]>([]);

    constructor() {
        this.loadSuppliers();
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id && id !== 'new') {
                this.purchaseId.set(id);
                this.loadPurchase(id);
            }
        });
    }

    loadSuppliers() {
        this.acquisitionService.findAllSuppliers().subscribe(suppliers => {
            this.suppliers.set(suppliers);
        });
    }

    loadPurchase(id: string) {
        this.acquisitionService.findOnePurchase(id).subscribe(purchase => {
            this.form.patchValue({
                amount: purchase.amount,
                date: purchase.date,
                supplierId: purchase.supplier.id
            });
        });
    }

    onSubmit() {
        if (this.form.valid) {
            const formValue = this.form.value as { amount: number; date: string; supplierId: string };

            if (this.isEditMode()) {
                this.acquisitionService.updatePurchase(this.purchaseId()!, formValue).subscribe(() => {
                    this.router.navigate(['/acquisition/purchases']);
                });
            } else {
                this.acquisitionService.createPurchase(formValue).subscribe(() => {
                    this.router.navigate(['/acquisition/purchases']);
                });
            }
        }
    }
}

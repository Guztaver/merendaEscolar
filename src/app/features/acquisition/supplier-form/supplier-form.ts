import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AcquisitionResourceService, Supplier, SupplierType } from '../../../core/api/acquisition-resource.service';

@Component({
    selector: 'app-supplier-form',
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './supplier-form.html',
    styleUrl: './supplier-form.css'
})
export class SupplierFormComponent {
    private fb = inject(FormBuilder);
    private acquisitionService = inject(AcquisitionResourceService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    form = this.fb.group({
        name: ['', Validators.required],
        document: ['', Validators.required],
        type: [SupplierType.REGULAR, Validators.required]
    });

    supplierId = signal<string | null>(null);
    isEditMode = computed(() => !!this.supplierId());

    supplierTypes = [
        { value: SupplierType.REGULAR, label: 'Regular' },
        { value: SupplierType.FAMILY_FARMING, label: 'Agricultura Familiar' }
    ];

    constructor() {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id && id !== 'new') {
                this.supplierId.set(id);
                this.loadSupplier(id);
            }
        });
    }

    loadSupplier(id: string) {
        this.acquisitionService.findOneSupplier(id).subscribe(supplier => {
            this.form.patchValue(supplier);
        });
    }

    onSubmit() {
        if (this.form.valid) {
            const supplier = this.form.value as unknown as Partial<Supplier>;
            if (this.isEditMode()) {
                this.acquisitionService.updateSupplier(this.supplierId()!, supplier).subscribe(() => {
                    this.router.navigate(['/acquisition/suppliers']);
                });
            } else {
                this.acquisitionService.createSupplier(supplier).subscribe(() => {
                    this.router.navigate(['/acquisition/suppliers']);
                });
            }
        }
    }
}

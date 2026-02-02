import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsersResourceService, User } from '../../../core/api/users-resource.service';

@Component({
    selector: 'app-user-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './user-form.html',
    styleUrl: './user-form.css'
})
export class UserFormComponent {
    private fb = inject(FormBuilder);
    private usersService = inject(UsersResourceService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    form = this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        role: ['user', Validators.required]
    });

    userId = signal<string | null>(null);
    isEditMode = computed(() => !!this.userId());

    constructor() {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id && id !== 'new') {
                this.userId.set(id);
                this.loadUser(id);
            }
        });
    }

    loadUser(id: string) {
        this.usersService.findOne(id).subscribe(user => {
            this.form.patchValue(user);
            // Don't require password on edit unless changed (logic simplified for now)
            this.form.controls.password.clearValidators();
            this.form.controls.password.updateValueAndValidity();
        });
    }

    onSubmit() {
        if (this.form.valid) {
            const user = this.form.value as unknown as Partial<User>;
            if (this.isEditMode()) {
                this.usersService.update(this.userId()!, user).subscribe(() => {
                    this.router.navigate(['/users']);
                });
            } else {
                this.usersService.create(user).subscribe(() => {
                    this.router.navigate(['/users']);
                });
            }
        }
    }
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UsersResourceService, User } from '../../../core/api/users-resource.service';

@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './user-list.html',
    styleUrl: './user-list.css'
})
export class UserListComponent {
    private usersService = inject(UsersResourceService);
    users = signal<User[]>([]);

    constructor() {
        this.loadUsers();
    }

    loadUsers() {
        this.usersService.findAll().subscribe(users => {
            this.users.set(users);
        });
    }

    deleteUser(id: string) {
        if (confirm('Tem certeza?')) {
            this.usersService.delete(id).subscribe(() => {
                this.loadUsers();
            });
        }
    }
}

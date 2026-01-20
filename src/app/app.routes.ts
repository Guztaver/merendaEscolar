import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { HomeComponent } from './features/home/home';
import { NotFoundComponent } from './features/not-found/not-found';
import { authGuard } from './core/auth/auth-guard';

export const routes: Routes = [
    // Public routes
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: '', component: HomeComponent },

    // Protected routes (Layout with AuthGuard)
    {
        path: '',
        canActivate: [authGuard],
        children: [
            // Future protected feature routes will go here
            // Example: { path: 'dashboard', loadComponent: () => ... }
        ]
    },

    // Wildcard (keep last)
    { path: '**', component: NotFoundComponent },
];

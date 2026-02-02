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
            { path: 'users', loadComponent: () => import('./features/users/user-list/user-list').then(m => m.UserListComponent) },
            { path: 'users/new', loadComponent: () => import('./features/users/user-form/user-form').then(m => m.UserFormComponent) },
            { path: 'users/:id', loadComponent: () => import('./features/users/user-form/user-form').then(m => m.UserFormComponent) },

            // Nutritional Planning routes
            { path: 'nutritional-planning', loadComponent: () => import('./features/nutritional-planning/nutritional-dashboard/nutritional-dashboard').then(m => m.NutritionalDashboardComponent) },

            // Acquisition routes
            { path: 'acquisition', loadComponent: () => import('./features/acquisition/dashboard/dashboard').then(m => m.DashboardComponent) },
            { path: 'acquisition/suppliers', loadComponent: () => import('./features/acquisition/supplier-list/supplier-list').then(m => m.SupplierListComponent) },
            { path: 'acquisition/suppliers/new', loadComponent: () => import('./features/acquisition/supplier-form/supplier-form').then(m => m.SupplierFormComponent) },
            { path: 'acquisition/suppliers/:id', loadComponent: () => import('./features/acquisition/supplier-form/supplier-form').then(m => m.SupplierFormComponent) },
            { path: 'acquisition/purchases', loadComponent: () => import('./features/acquisition/purchase-list/purchase-list').then(m => m.PurchaseListComponent) },
            { path: 'acquisition/purchases/new', loadComponent: () => import('./features/acquisition/purchase-form/purchase-form').then(m => m.PurchaseFormComponent) },
            { path: 'acquisition/purchases/:id', loadComponent: () => import('./features/acquisition/purchase-form/purchase-form').then(m => m.PurchaseFormComponent) },

            // Logistics routes
            { path: 'logistics', loadComponent: () => import('./features/logistics/logistics-dashboard/logistics-dashboard').then(m => m.LogisticsDashboardComponent) },
        ]
    },

    // Wildcard (keep last)
    { path: '**', component: NotFoundComponent },
];

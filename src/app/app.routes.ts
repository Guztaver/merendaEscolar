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
    { path: '', component: HomeComponent, pathMatch: 'full' },

    // Protected routes (Layout with AuthGuard)
    {
        path: '',
        canActivate: [authGuard],
        children: [
            { path: 'users', loadComponent: () => import('./features/users/user-list/user-list').then(m => m.UserListComponent) },
            { path: 'users/new', loadComponent: () => import('./features/users/user-form/user-form').then(m => m.UserFormComponent) },
            { path: 'users/:id', loadComponent: () => import('./features/users/user-form/user-form').then(m => m.UserFormComponent) },

            // Nutritional Planning routes
            {
                path: 'nutritional-planning',
                children: [
                    {
                        path: '',
                        redirectTo: 'dashboard',
                        pathMatch: 'full'
                    },
                    {
                        path: 'dashboard',
                        loadComponent: () => import('./features/nutritional-planning/nutritional-dashboard/nutritional-dashboard')
                            .then(m => m.NutritionalDashboardComponent)
                    },
                    // Ingredients
                    {
                        path: 'ingredients',
                        loadComponent: () => import('./features/nutritional-planning/ingredients/ingredient-list.component').then(m => m.IngredientListComponent)
                    },
                    {
                        path: 'ingredients/new',
                        loadComponent: () => import('./features/nutritional-planning/ingredients/ingredient-form.component').then(m => m.IngredientFormComponent)
                    },
                    {
                        path: 'ingredients/:id/edit',
                        loadComponent: () => import('./features/nutritional-planning/ingredients/ingredient-form.component').then(m => m.IngredientFormComponent)
                    },
                    // Dishes
                    {
                        path: 'dishes',
                        loadComponent: () => import('./features/nutritional-planning/dishes/dish-list.component').then(m => m.DishListComponent)
                    },
                    {
                        path: 'dishes/new',
                        loadComponent: () => import('./features/nutritional-planning/dishes/dish-form.component').then(m => m.DishFormComponent)
                    },
                    {
                        path: 'dishes/:id/edit',
                        loadComponent: () => import('./features/nutritional-planning/dishes/dish-form.component').then(m => m.DishFormComponent)
                    },
                    // Menus
                    {
                        path: 'menus',
                        loadComponent: () => import('./features/nutritional-planning/menus/menu-list.component').then(m => m.MenuListComponent)
                    },
                    {
                        path: 'menus/new',
                        loadComponent: () => import('./features/nutritional-planning/menus/menu-form.component').then(m => m.MenuFormComponent)
                    },
                    {
                        path: 'menus/:id/edit',
                        loadComponent: () => import('./features/nutritional-planning/menus/menu-form.component').then(m => m.MenuFormComponent)
                    }
                ]
            },

            // General Dashboard
            { path: 'dashboard', loadComponent: () => import('./features/dashboard/general-dashboard').then(m => m.GeneralDashboardComponent) },

            // Acquisition routes
            {
                path: 'acquisition',
                children: [
                    { path: '', loadComponent: () => import('./features/acquisition/dashboard/dashboard').then(m => m.DashboardComponent) },
                    { path: 'suppliers', loadComponent: () => import('./features/acquisition/supplier-list/supplier-list').then(m => m.SupplierListComponent) },
                    { path: 'suppliers/new', loadComponent: () => import('./features/acquisition/supplier-form/supplier-form').then(m => m.SupplierFormComponent) },
                    { path: 'suppliers/:id', loadComponent: () => import('./features/acquisition/supplier-form/supplier-form').then(m => m.SupplierFormComponent) },
                    { path: 'purchases', loadComponent: () => import('./features/acquisition/purchase-list/purchase-list').then(m => m.PurchaseListComponent) },
                    { path: 'purchases/new', loadComponent: () => import('./features/acquisition/purchase-form/purchase-form').then(m => m.PurchaseFormComponent) },
                    { path: 'purchases/:id', loadComponent: () => import('./features/acquisition/purchase-form/purchase-form').then(m => m.PurchaseFormComponent) },
                ]
            },

            // Logistics routes - Estoque Inteligente
            {
                path: 'logistics',
                children: [
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
                    { path: 'dashboard', loadComponent: () => import('./features/logistics/stock-dashboard/stock-dashboard').then(m => m.StockDashboardComponent) },
                    { path: 'stock-items', loadComponent: () => import('./features/logistics/stock-items/stock-items').then(m => m.StockItemsComponent) },
                    { path: 'stock-items/new', loadComponent: () => import('./features/logistics/stock-item-form/stock-item-form').then(m => m.StockItemFormComponent) },
                    { path: 'stock-items/:id', loadComponent: () => import('./features/logistics/stock-item-form/stock-item-form').then(m => m.StockItemFormComponent) },
                    { path: 'movements', loadComponent: () => import('./features/logistics/movements/movements').then(m => m.MovementsComponent) },
                    { path: 'movements/new', loadComponent: () => import('./features/logistics/movement-form/movement-form').then(m => m.MovementFormComponent) },
                    { path: 'alerts', loadComponent: () => import('./features/logistics/alerts-list/alerts-list').then(m => m.AlertsListComponent) },
                ]
            },
        ]
    },

    // Wildcard (keep last)
    { path: '**', component: NotFoundComponent },
];

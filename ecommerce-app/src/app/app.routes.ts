import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './core/guards/auth/auth.guard';
import { formGuard } from './core/guards/form/form.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Home' },

  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products/products.component').then((c) => c.ProductsComponent),
    title: 'products',
  },

  {
    path: 'product-view/:id',
    loadComponent: () =>
      import('./pages/product-detail/product-detail.component').then(
        (c) => c.ProductDetailComponent
      ),
    title: 'product details',
  },

  {
    path: 'categories',
    loadComponent: () =>
      import('./pages/categories/categories.component').then(
        (m) => m.CategoriesPageComponent
      ),
    title: 'Categories',
  },

  {
    path: 'product-edit/:id',
    loadComponent: () =>
      import('./pages/admin/product-edit/product-edit.component').then(
        (m) => m.ProductEditComponent
      ),
    canActivate: [authGuard],
    title: 'Edit Product',
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then((c) => c.RegisterComponent),
    title: 'registro',
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((c) => c.LoginComponent),
    title: 'login',
    canDeactivate: [formGuard],
  },

  {
    path: 'user',
    loadComponent: () =>
      import('./pages/user/user.component').then((c) => c.UserComponent),
    loadChildren: () =>
      import('./pages/user/user.routes').then((r) => r.USER_ROUTES),
    canActivate: [authGuard],
  },

  {
    path: 'thank-you-page',
    loadComponent: () =>
      import('./pages/thank-you/thank-you.component').then(
        (c) => c.ThankYouComponent
      ),
  },

  {
    path: 'admin/users',
    loadComponent: () =>
      import('./pages/admin/users/users.component').then((c) => c.AdminUsersComponent),
    canActivate: [authGuard],
    title: 'Admin Users',
  },

  {
    path: 'admin/categories',
    loadComponent: () =>
      import('./pages/admin/admin-categories/categories.component').then(
        (c) => c.AdminCategoriesComponent
      ),
    canActivate: [authGuard],
    title: 'Admin Categories',
  },

  {
    path: 'admin/products',
    loadComponent: () =>
      import('./pages/admin/admin-products/products.component').then(
        (c) => c.AdminProductsComponent
      ),
    canActivate: [authGuard],
    title: 'Admin Products',
  },

  { path: '**', redirectTo: '' },
];

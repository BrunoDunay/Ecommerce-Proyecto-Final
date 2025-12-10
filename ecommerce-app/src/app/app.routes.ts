import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/user/profile/profile.component';
import { USER_ROUTES } from './pages/user/user.routes';
import { authGuard } from './core/guards/auth/auth.guard';
import { formGuard } from './core/guards/form/form.guard';


export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Home' },
  {
    path: 'products',
    loadComponent: () =>
      import('../app/pages/products/products.component').then(
        (c) => c.ProductsComponent
      ),
    title: 'products',
  },
  {
    path:'product-view/:id', 
    loadComponent: () => import('../app/pages/product-detail/product-detail.component').then(
      (c)=> c.ProductDetailComponent
    ),
    title:'product details',
  },
  {
  path: 'product-edit/:id',
  loadComponent: () => import('./pages/admin/product-edit/product-edit.component').then(m => m.ProductEditComponent),
  canActivate: [authGuard],
  title: 'Edit Product' 
  },
  {
    path: 'register', loadComponent:()=> import('../app/pages/register/register.component').then(c=>c.RegisterComponent),
    title: 'registro',
  },
  {
    path: 'login', loadComponent: ()=> import('../app/pages/login/login.component').then(c=>c.LoginComponent),
    title: 'login',
    canDeactivate: [formGuard]
  },
  {
    path: 'user', loadComponent: () => import('../app/pages/user/user.component').then(c=>c.UserComponent),
    loadChildren: () => import('../app/pages/user/user.routes').then(r=>r.USER_ROUTES),
    canActivate:[authGuard]
  },
  {
    path:'thank-you-page',
    loadComponent:() => import('../app/pages/thank-you/thank-you.component').then(c=> c.ThankYouComponent)
  },
  {
  path: 'admin/users',
  loadComponent: () => import('./pages/admin/users/users.component')
    .then(c => c.AdminUsersComponent),
  canActivate: [authGuard],
  title: 'Admin Users'
},
{
  path: 'admin/categories',
  loadComponent: () => import('./pages/admin/admin-categories/categories.component')
    .then(c => c.AdminCategoriesComponent),
  canActivate: [authGuard],
  title: 'Admin Categories'
},
{
  path : 'admin/products',
  loadComponent: () => import('./pages/admin/admin-products/products.component')
    .then(c => c.AdminProductsComponent),
  canActivate: [authGuard],
  title: 'Admin Products'
}
  

];

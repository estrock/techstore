import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AdminDashboardPage } from './pages/admin-dashboard/admin-dashboard.page';
import { AdminProductsPage } from './pages/admin-products/admin-products.page';

const routes: Routes = [
  // ✅ Ruta inicial: redirige a HOME (no al login)
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },

  // ✅ Página principal (home)
  {
    path: 'home',
    loadChildren: () =>
      import('./pages/home/home.module').then((m) => m.HomePageModule)
  },

  // 🔐 Login (opcional, accesible desde botón manual)
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginPageModule)
  },

  // 🧾 Registro (opcional)
  {
    path: 'register',
    loadChildren: () =>
      import('./pages/register/register.module').then(
        (m) => m.RegisterPageModule
      )
  },

  // 🛍 Categorías
  {
    path: 'categories',
    loadChildren: () =>
      import('./pages/categories/categories.module').then(
        (m) => m.CategoriesPageModule
      )
  },

  // 🛒 Productos por categoría
  {
    path: 'category-products/:category',
    loadComponent: () =>
      import('./pages/category-products/category-products.page').then(
        (m) => m.CategoryProductsPage
      )
  },

  // ⚙️ Panel admin
  {
    path: 'admin-dashboard',
    loadChildren: () =>
      import('./pages/admin-dashboard/admin-dashboard.module').then(
        (m) => m.AdminDashboardPageModule
      )
  },

  // 🧩 Gestión de productos del admin
  {
    path: 'admin-products',
    loadChildren: () =>
      import('./pages/admin-products/admin-products.module').then(
        (m) => m.AdminProductsPageModule
      )
  },

  // 🛒 Carrito
  {
    path: 'cart',
    loadComponent: () =>
      import('./cart/cart.page').then((m) => m.CartPage)
  },

  // 🔍 Búsqueda
  {
    path: 'search',
    loadComponent: () =>
      import('./pages/search/search.page').then((m) => m.SearchPage)
  },

  // 🚫 Ruta comodín: redirige a home si no existe
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

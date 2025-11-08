import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AdminDashboardPage } from './pages/admin-dashboard/admin-dashboard.page';
import { AdminProductsPage } from './pages/admin-products/admin-products.page';

const routes: Routes = [
  // {
  //   path: '',
  //   loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  // },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },
  

  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'categories',
    loadChildren: () => import('./pages/categories/categories.module').then( m => m.CategoriesPageModule)

  },
  {
    path: 'category-products/:category',
    loadComponent: () => import('./pages/category-products/category-products.page').then(m => m.CategoryProductsPage)
  },
  { path: 'admin-dashboard',
   loadChildren: () => import('./pages/admin-dashboard/admin-dashboard.module').then(m => m.AdminDashboardPageModule) 
  },
    { 
  path: 'admin-products',
  loadChildren: () => import('./pages/admin-products/admin-products.module').then(m => m.AdminProductsPageModule) // ✅ CORRECTO
},
  {
    path: 'cart',
    loadComponent: () => import('./cart/cart.page').then( m => m.CartPage)
  },
  {
    path: 'search',
    loadComponent: () => import('./pages/search/search.page').then(m => m.SearchPage)
  },

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

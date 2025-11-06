import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AdminDashboardPage } from './pages/admin-dashboard/admin-dashboard.page';

const routes: Routes = [
  // {
  //   path: '',
  //   loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  // },
  {
    path: '',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
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
  { path: 'admin-dashboard',
   loadChildren: () => import('./pages/admin-dashboard/admin-dashboard.module').then(m => m.AdminDashboardPageModule) },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

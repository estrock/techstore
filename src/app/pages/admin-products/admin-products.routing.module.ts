import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//import { AdminDashboardPage } from './admin-dashboard.page';
import { AdminProductsPage } from './admin-products.page';

const routes: Routes = [
  {
    path: '',
    component:  AdminProductsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminProductsRoutinModule {}

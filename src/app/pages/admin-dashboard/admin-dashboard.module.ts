import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';


import { AdminDashboardRoutingModule } from './admin-dashboard.routing.module';
import { AdminDashboardPage } from './admin-dashboard.page';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminDashboardRoutingModule
    

  ],
  declarations: [AdminDashboardPage]
})
export class AdminDashboardPageModule {}




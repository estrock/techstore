import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'; // ← Agrega esto
import { FormsModule } from '@angular/forms'; // ← Agrega esto

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
//import { HomePage } from './pages/home/home.page';
//import { CategoriesPage } from './pages/categories/categories.page'; // ← Agrega esta importación

@NgModule({
  declarations: [
    AppComponent,
    //HomePage,
    //CategoriesPage // ← Agrega el componente aquí
  ],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    HttpClientModule, // ← Agrega esto
    FormsModule // ← Agrega esto para ngModel
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
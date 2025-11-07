import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { SocialIconsComponent } from '../../social-icons.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Product {
  id: string;
  product_name: string;
  product_category: string;
  product_price: number;
  product_description: string;
  stock_quantity: number;
  manufacturer: string;
  subcategory: string;
  img: string;
}

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, HttpClientModule, SocialIconsComponent, FormsModule, RouterModule],
})
export class CategoriesPage implements OnInit {

  products: Product[] = [];
  categories: string[] = [];
  searchTerm: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.http.get<Product[]>('assets/bd.json').subscribe({
      next: (data) => {
        this.products = data;
        // Extraer categorías únicas
        this.categories = [...new Set(data.map(product => product.product_category))];
      },
      error: (err) => console.error('Error loading products:', err),
    });
  }

  getProductsByCategory(category: string): Product[] {
    return this.products.filter(product => 
      product.product_category === category
    );
  }
}
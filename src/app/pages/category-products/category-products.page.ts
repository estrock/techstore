import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductsService, Product } from '../../services/products.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-category-products',
  templateUrl: './category-products.page.html',
  styleUrls: ['./category-products.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class CategoryProductsPage implements OnInit, OnDestroy {
  category = '';
  allProducts: Product[] = [];
  products: Product[] = [];
  isLoading = true;
  sub: Subscription | null = null;

  constructor(private route: ActivatedRoute, private productsService: ProductsService) {}

  ngOnInit() {
    this.category = this.route.snapshot.paramMap.get('category') || '';
    this.sub = this.productsService.getProductsRealTime().subscribe({
      next: (items) => {
        this.allProducts = items;
        this.products = items.filter(p => (p.category || '').toLowerCase() === this.category.toLowerCase());
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
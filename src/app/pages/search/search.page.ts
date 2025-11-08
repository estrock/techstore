import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService, Product } from '../../services/products.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule]
})
export class SearchPage implements OnInit, OnDestroy {
  q = '';
  category = '';
  allProducts: Product[] = [];
  results: Product[] = [];
  isLoading = true;
  sub: Subscription | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private productsService: ProductsService) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.q = params.get('q') || '';
      this.category = params.get('category') || '';
      this.applyFilters();
    });

    this.sub = this.productsService.getProductsRealTime().subscribe(items => {
      this.allProducts = items;
      this.applyFilters();
      this.isLoading = false;
    });
  }

  onQueryChange() {
    this.router.navigate([], {
      queryParams: { q: this.q || null, category: this.category || null },
      queryParamsHandling: 'merge'
    });
  }

  clearQuery() {
    this.q = '';
    this.onQueryChange();
  }

  applyFilters() {
    const qLower = this.q.toLowerCase();
    this.results = this.allProducts.filter(p => {
      const matchText = !this.q ||
        (p.name?.toLowerCase().includes(qLower) || p.description?.toLowerCase().includes(qLower));
      const matchCat = !this.category || (p.category?.toLowerCase() === this.category.toLowerCase());
      return matchText && matchCat;
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
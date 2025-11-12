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
        // Reconstruir embeds de Pinterest tras actualizar la lista filtrada
        setTimeout(() => {
          try { (window as any).PinUtils?.build?.(); } catch {}
          // Forzar reproducción silenciosa de videos en la vista de categoría
          try {
            const videos: HTMLVideoElement[] = Array.from(document.querySelectorAll('video.card-img-top')) as HTMLVideoElement[];
            videos.forEach(v => {
              try {
                v.muted = true;
                (v as any).playsInline = true;
                (v as any).webkitPlaysInline = true;
                v.autoplay = true;
                v.loop = true;
                const p = v.play();
                if (p && typeof (p as any).catch === 'function') {
                  (p as any).catch(() => {});
                }
              } catch {}
            });
          } catch {}
        }, 0);
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
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService, Product } from '../../services/products.service';
import { Subscription } from 'rxjs';
import { Carrito } from 'src/app/services/carrito/carrito';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule]
})
export class SearchPage implements OnInit, OnDestroy {
  cartItemCount: number = 0;
  q = '';
  category = '';
  allProducts: Product[] = [];
  results: Product[] = [];
  isLoading = true;
  sub: Subscription | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private productsService: ProductsService,private carritoService: Carrito) {
    this.carritoService.cartCount$.subscribe(count => this.cartItemCount = count);
  }

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

    // Forzar reconstrucción de embeds de Pinterest tras actualizar resultados
    // Esperamos al siguiente tick para que el DOM esté actualizado
    setTimeout(() => {
      try {
        (window as any).PinUtils?.build?.();
      } catch {}
      // Forzar reproducción silenciosa de videos de resultados
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
  }

  // (Opcional) método dedicado si se requiere invocar desde otros puntos
  private initProductVideos() {
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
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  // Navegación desde el header
  goHome() { this.router.navigate(['/home']); }
  goToLogin() { this.router.navigate(['/login']); }
  goToCart() { this.router.navigate(['/cart']); }
}
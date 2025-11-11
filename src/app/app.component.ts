import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { ProductsService, Product } from './services/products.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  categories: string[] = [];

  constructor(
    private menuCtrl: MenuController,
    private productsService: ProductsService,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    // Intentar usar Firestore en tiempo real siempre que haya permisos;
    // si no hay permisos, usar el catálogo local como respaldo.
    const canRead = await this.productsService.canReadProducts().catch(() => false);
    if (canRead) {
      this.productsService.getProductsRealTime().subscribe({
        next: (items: Product[]) => {
          const set = new Set<string>();
          items.forEach(p => { if (p.category) set.add(p.category); });
          this.categories = Array.from(set).sort((a, b) => a.localeCompare(b));
        },
        error: () => {
          // Si el canal falla por permisos, cargar categorías desde assets
          this.loadCategoriesFallback();
        }
      });
    } else {
      this.loadCategoriesFallback();
    }
  }

  closeMenu() {
    this.menuCtrl.close();
  }

  private loadCategoriesFallback() {
    this.http.get<any[]>('assets/bd.json').subscribe({
      next: (items) => {
        const set = new Set<string>();
        (items || []).forEach(p => { if (p.product_category) set.add(p.product_category); });
        this.categories = Array.from(set).sort((a, b) => a.localeCompare(b));
        console.log('📂 Categorías cargadas desde catálogo local:', this.categories.length);
      },
      error: (err) => {
        console.error('❌ Error cargando categorías locales:', err);
      }
    });
  }
}

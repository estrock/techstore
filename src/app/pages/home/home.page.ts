import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicSlides, IonicModule } from '@ionic/angular';
import { register } from 'swiper/element/bundle';
import { Router } from '@angular/router';
import { ProductsService, Product } from '../../services/products.service';
import { Subscription } from 'rxjs';
import { SocialIconsComponent } from '../../social-icons.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

register();

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, SocialIconsComponent]
})
export class HomePage implements OnInit, OnDestroy {

  // ✅ SOLO productos de Firebase
  products: Product[] = [];
  
  // Interfaz para banners
  banners: Array<{
    img: string;
    title?: string;
    description?: string;
  }> = [
    {
      img: 'assets/products/Lanzamiento.png',
      title: 'Nuevos Lanzamientos',
      description: 'Descubre las últimas novedades en tecnología'
    },
    {
      img: 'assets/products/home_venta.jpg',
      title: 'Ofertas Especiales',
      description: 'Descuentos increíbles esta semana en laptops y accesorios'
    },
    {
      img: 'assets/products/home_venta.jpg',
      title: 'Bienvenido a TechStore',
      description: 'Los mejores productos tecnológicos al alcance de tu mano'
    },
  ];
  
  searchTerm: string = '';
  selectedFilter: string = 'recientes';
  isLoading: boolean = true;
  cartItemCount: number = 0; // Contador de items en carrito

  private productsSubscription: Subscription | null = null;

  slideOpts = {
    initialSlide: 0,
    speed: 500,
    autoplay: { delay: 2500 },
  };

  constructor(
    private router: Router,
    private productsService: ProductsService,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadFirebaseProducts();
  }

  ngOnDestroy() {
    if (this.productsSubscription) {
      this.productsSubscription.unsubscribe();
    }
  }

  // 🔥 Cargar productos desde Firebase con manejo de permisos y fallback
  async loadFirebaseProducts() {
    this.isLoading = true;

    // Si no está logueado o estamos en modo dev sin sesión, usar fallback
    const devMode = localStorage.getItem('dev_session') === 'active';
    if (!this.authService.isLoggedIn() && !devMode) {
      console.warn('👤 Usuario no logueado: usando catálogo local');
      this.loadFallbackProducts();
      return;
    }

    // Verificar permisos antes de abrir el canal en tiempo real
    const canRead = await this.productsService.canReadProducts();
    if (!canRead) {
      console.warn('🔒 Sin permisos de lectura: usando catálogo local');
      this.loadFallbackProducts();
      return;
    }

    this.productsSubscription = this.productsService.getProductsRealTime().subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
        console.log('✅ Productos en tiempo real cargados:', products.length);

        products.forEach((product, index) => {
          console.log(`📦 Producto ${index + 1}:`, {
            nombre: product.name,
            precio: product.price,
            categoria: product.category,
            stock: product.stock,
            destacado: product.featured
          });
        });
      },
      error: (error) => {
        // En teoría no deberíamos llegar aquí si canRead fue true,
        // pero si ocurre, caemos a catálogo local sin spamear errores.
        console.warn('⚠️ Canal en tiempo real falló, usando catálogo local');
        this.loadFallbackProducts();
      }
    });
  }

  // 📦 Fallback: cargar productos desde assets/bd.json
  private loadFallbackProducts() {
    this.http.get<any[]>('assets/bd.json').subscribe({
      next: (items) => {
        const mapped: Product[] = (items || []).map((i) => ({
          id: i.id,
          name: i.product_name,
          description: i.product_description,
          price: i.product_price,
          category: i.product_category,
          image: i.img,
          stock: i.stock_quantity,
          featured: false,
        }));
        this.products = mapped;
        this.isLoading = false;
        console.log('📦 Catálogo local cargado:', mapped.length);
      },
      error: (err) => {
        console.error('❌ Error cargando catálogo local:', err);
        this.isLoading = false;
      }
    });
  }

  // 🏷️ Formatear precio
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  }

  // 🔍 Manejar cambios en la búsqueda
  onSearchChange(event: any) {
    if (event && event.key && event.key.toLowerCase() === 'enter') {
      const term = (this.searchTerm || '').trim();
      if (term.length > 0) {
        this.router.navigate(['/search'], { queryParams: { q: term } });
      }
    }
  }

  // 🗑️ Limpiar búsqueda
  clearSearch() {
    this.searchTerm = '';
    this.onSearchChange(null);
  }

  // 🛒 Agregar producto al carrito
  addToCart(product: Product) {
    console.log('Agregando al carrito:', product.name);
    this.cartItemCount++;
    // Aquí implementarías la lógica real del carrito
  }

  // 🔄 Manejar cambio de filtro
  onFilterChange(filter: string) {
    this.selectedFilter = filter;
    
    if (filter === 'categorias') {
      this.router.navigate(['/categories']);
    }
    else if (filter === 'populares') {
      console.log('📊 Filtro populares seleccionado');
      // Aquí puedes implementar lógica para productos populares
    }
    else if (filter === 'recientes') {
      console.log('🆕 Filtro recientes seleccionado');
      // Los productos ya vienen ordenados por fecha de creación
    }
  }

  // 🛒 Ir al carrito
  goToCart() {
    this.router.navigate(['/cart']);
  }

  // 📱 Ver detalles del producto
  viewProductDetails(product: Product) {
    console.log('Ver detalles:', product);
    // this.router.navigate(['/product-details', product.id]);
  }

  // 🔄 Recargar productos
  refreshProducts(event: any) {
    this.loadFirebaseProducts();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}
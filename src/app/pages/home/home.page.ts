import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
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

  // ✅ Productos cargados desde Firebase o fallback
  products: Product[] = [];

  // ✅ Banners del carrusel principal
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
  cartItemCount: number = 0;

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

  // 🔥 Cargar productos desde Firebase o usar fallback local
  async loadFirebaseProducts() {
    this.isLoading = true;

    const devMode = localStorage.getItem('dev_session') === 'active';
    if (!this.authService.isLoggedIn() && !devMode) {
      console.warn('👤 Usuario no logueado: usando catálogo local');
      this.loadFallbackProducts();
      return;
    }

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
        console.log('✅ Productos cargados en tiempo real:', products.length);
      },
      error: (error) => {
        console.warn('⚠️ Error en canal en tiempo real. Usando catálogo local.');
        this.loadFallbackProducts();
      }
    });
  }

  // 📦 Cargar productos locales desde assets/bd.json
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

  // 🏷️ Formatear precios
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  }

  // 🔍 Buscar productos
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
    console.log('🛍️ Agregando al carrito:', product.name);
    this.cartItemCount++;
    // Aquí implementa la lógica real del carrito
  }

  // 🔄 Cambiar filtro de productos
  onFilterChange(filter: string) {
    this.selectedFilter = filter;

    if (filter === 'categorias') {
      this.router.navigate(['/categories']);
    } else if (filter === 'populares') {
      console.log('📊 Filtro "populares" seleccionado');
    } else if (filter === 'recientes') {
      console.log('🆕 Filtro "recientes" seleccionado');
    }
  }

  // 🛒 Ir al carrito
  goToCart() {
    this.router.navigate(['/cart']);
  }

  // 👁️ Ver detalles del producto
  viewProductDetails(product: Product) {
    console.log('🔍 Ver detalles:', product);
    // this.router.navigate(['/product-details', product.id]);
  }

  // 🔄 Recargar productos
  refreshProducts(event: any) {
    this.loadFirebaseProducts();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  // 🚀 Ir a la página de inicio de sesión
  goToLogin() {
    this.router.navigate(['/login']);
  }
}

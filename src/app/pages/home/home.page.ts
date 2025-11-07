import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicSlides } from '@ionic/angular';
import { register } from 'swiper/element/bundle';
import { Router } from '@angular/router';
import { ProductsService, Product } from '../../services/products.service';
import { Subscription } from 'rxjs';

register();

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {

  // ✅ SOLO productos de Firebase
  products: Product[] = [];
  
  searchTerm: string = '';
  selectedFilter: string = 'recientes';
  isLoading: boolean = true;

  private productsSubscription: Subscription | null = null;

  banners = [
    { img: 'assets/logo.PNG' },
    { img: 'assets/logo.PNG' },
  ];

  slideOpts = {
    initialSlide: 0,
    speed: 500,
    autoplay: { delay: 2500 },
  };

  constructor(
    private router: Router,
    private productsService: ProductsService
  ) {}

  ngOnInit() {
    this.loadFirebaseProducts();
  }

  ngOnDestroy() {
    if (this.productsSubscription) {
      this.productsSubscription.unsubscribe();
    }
  }

  // 🔥 Cargar SOLO productos desde Firebase
  loadFirebaseProducts() {
    this.isLoading = true;
    
    this.productsSubscription = this.productsService.getProductsRealTime().subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
        console.log('✅ Productos de ADMIN cargados:', products.length);
        
        // Debug: ver cada producto
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
        console.error('❌ Error cargando productos:', error);
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

  // 🔄 Manejar cambio de filtro
  onFilterChange(event: any) {
    const value = event.detail.value;
    
    if (value === 'categorias') {
      this.router.navigate(['/categories']);
    }
    else if (value === 'populares') {
      console.log('📊 Filtro populares seleccionado');
      // Aquí puedes implementar lógica para productos populares
    }
    else if (value === 'recientes') {
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
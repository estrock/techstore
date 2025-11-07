import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicSlides, IonicModule } from '@ionic/angular';
import { register } from 'swiper/element/bundle';
import { Router } from '@angular/router';
import { ProductsService, Product } from '../../services/products.service';
import { Subscription } from 'rxjs';
import { SocialIconsComponent } from '../../social-icons.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
      img: 'assets/products/home_venta.jpg', 
      title: 'Bienvenido a TechStore', 
      description: 'Los mejores productos tecnológicos al alcance de tu mano' 
    },
    { 
      img: 'assets/products/banner2.jpg', 
      title: 'Ofertas Especiales', 
      description: 'Descuentos increíbles esta semana en laptops y accesorios' 
    },
    { 
      img: 'assets/products/LANZAMIENTO.jpg', 
      title: 'Nuevos Lanzamientos', 
      description: 'Descubre las últimas novedades en tecnología' 
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

  // 🔍 Manejar cambios en la búsqueda
  onSearchChange(event: any) {
    // Implementar lógica de búsqueda en tiempo real
    console.log('Buscando:', this.searchTerm);
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
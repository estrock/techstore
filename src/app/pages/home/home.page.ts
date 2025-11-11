import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
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
export class HomePage implements OnInit, OnDestroy, AfterViewInit {

  // ✅ Productos cargados desde Firebase o fallback
  products: Product[] = [];

  // ✅ Banners del carrusel principal
  banners: Array<{
    img?: string;
    video?: string; // compatibilidad legado (MP4)
    videoMp4?: string; // fuente específica MP4
    videoWebm?: string; // fuente específica WebM
    poster?: string;
    srcset?: string; // versiones @1x/@2x opcionales para mayor nitidez en desktop
    title?: string;
    description?: string;
  }> = [
    {
      videoMp4: 'assets/products/celulares_iphones_i.mp4',
      poster: 'assets/products/Lanzamiento.png',
      // srcset: 'assets/banners/lanzamiento-1920x400.webp 1x, assets/banners/lanzamiento-3840x800.webp 2x',
      title: 'Nuevos Lanzamientos',
      description: 'Descubre las últimas novedades en tecnología'
    },
    {
      videoMp4: 'assets/products/Smartwatch360.mp4',
      // srcset: 'assets/banners/ofertas-1920x400.webp 1x, assets/banners/ofertas-3840x800.webp 2x',
      title: 'Ofertas Especiales',
      description: 'Descubre y actualizate'
    },
    {
      // Fallback actual (se mantiene hasta que subas las versiones convertidas)
      video: 'assets/products/Bienvenida_techstore.mp4',
      // Fuente MP4 que EXISTE actualmente
      videoMp4: 'assets/products/Bienvenida_techstore.mp4',
     // poster: 'assets/products/celulares_vitrina.jpg',
      // srcset: 'assets/banners/bienvenida-1920x400.webp 1x, assets/banners/bienvenida-3840x800.webp 2x',
    },
    // Ejemplo (descomentar cuando agregues tu video en assets/banners):
    // {
    //   video: 'assets/banners/tu-video.mp4',
    //   poster: 'assets/banners/tu-video-poster.jpg',
    //   title: 'Video Promocional',
    //   description: 'Conoce nuestras ofertas en video'
    // },
  ];

  searchTerm: string = '';
  selectedFilter: string = 'recientes';
  isLoading: boolean = true;
  cartItemCount: number = 0;

  private productsSubscription: Subscription | null = null;
  private carouselEl: HTMLElement | null = null;
  private onSlidHandler: ((e: Event) => void) | null = null;

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

  ngAfterViewInit() {
    // Referencia al carrusel de Bootstrap y reproducción del video del slide activo
    this.carouselEl = document.getElementById('bannerCarousel');
    // Llamada inicial para intentar reproducir si el slide activo es video
    setTimeout(() => this.playActiveSlideVideo(), 0);
    // Al terminar la transición de slide, reproducir video si corresponde
    if (this.carouselEl) {
      this.onSlidHandler = () => this.playActiveSlideVideo();
      this.carouselEl.addEventListener('slid.bs.carousel', this.onSlidHandler as EventListener);
    }
  }

  ngOnDestroy() {
    if (this.productsSubscription) {
      this.productsSubscription.unsubscribe();
    }
    if (this.carouselEl && this.onSlidHandler) {
      this.carouselEl.removeEventListener('slid.bs.carousel', this.onSlidHandler as EventListener);
    }
  }

  // 🔥 Cargar productos desde Firebase o usar fallback local
  async loadFirebaseProducts() {
    this.isLoading = true;
    const devMode = localStorage.getItem('dev_session') === 'active';
    // Nota: la verificación de login se omite; se usa permisos de lectura
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

  // 🏠 Ir a Inicio desde el header
  goHome() {
    this.router.navigate(['/home']);
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

  // ▶️ Reproducir el video del slide activo y pausar el resto
  private playActiveSlideVideo() {
    try {
      const allVideos: HTMLVideoElement[] = Array.from(document.querySelectorAll('video.banner-video')) as HTMLVideoElement[];
      // Pausar todos los videos primero
      allVideos.forEach((v) => {
        try { v.pause(); } catch {}
      });

      // Buscar el video en el slide activo
      const activeVideo = document.querySelector('.carousel-item.active video.banner-video') as HTMLVideoElement | null;
      if (activeVideo) {
        // Reproducir automáticamente el video del slide activo (silencioso por políticas de navegador)
        activeVideo.muted = true; // necesario para autoplay en la mayoría de navegadores
        (activeVideo as any).playsInline = true; // iOS
        activeVideo.autoplay = true;
        activeVideo.loop = true;
        const playPromise = activeVideo.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch((err: any) => {
            console.warn('No se pudo iniciar reproducción automática del video:', err);
          });
        }
      }
    } catch (err) {
      console.warn('playActiveSlideVideo error:', err);
    }
  }
}
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { ProductsService, Product } from '../../services/products.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.page.html',
  styleUrls: ['./admin-products.page.scss'],
  standalone: false
})
export class AdminProductsPage implements OnInit, OnDestroy {
  products: Product[] = [];
  loading: HTMLIonLoadingElement | null = null;
  currentUser: any = null;
  userRole: string = 'user';
  userSubscription: Subscription | null = null;

  constructor(
    private productsService: ProductsService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadProducts();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  loadCurrentUser() {
    // Obtener usuario actual directamente del servicio
    this.currentUser = this.authService.currentUser;
    this.userRole = this.authService.userRole;
    
    console.log('👤 Usuario en admin-products:', this.currentUser);
    console.log('🎯 Rol en admin-products:', this.userRole);
    
    // Si no hay usuario, suscribirse a cambios
    // 
    
    if (!this.currentUser) {
      this.userSubscription = this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        this.userRole = this.authService.userRole;
        console.log('🔄 Usuario actualizado via subscription:', this.currentUser);
        this.verifyAccess();
      });
    }
    
    this.verifyAccess();
  }

  verifyAccess() {/*
    if (!this.authService.isLoggedIn()) {
      this.showAlert('Acceso Denegado', 'Debes iniciar sesión');
      this.router.navigate(['/login']);
      return;
    }
    
    if (!this.authService.isAdmin()) {
      this.showAlert('Acceso Denegado', 'No tienes permisos de administrador');
      this.router.navigate(['/home']);
      return;
    }
      */
  }

  getDisplayName(): string {
    if (!this.currentUser) return 'Usuario';
    
    // Para Firebase Auth, usar displayName o email
    const displayName = this.currentUser.displayName || 
                       this.currentUser.name ||
                       (this.currentUser.email ? this.currentUser.email.split('@')[0] : 'Usuario');
    
    return displayName || 'Administrador';
  }

  getDisplayEmail(): string {
    return this.currentUser?.email || 'No disponible';
  }

  goBack() {
    this.router.navigate(['/admin-dashboard']);
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          handler: () => {
            this.authService.logout();
          }
        }
      ]
    });
    await alert.present();
  }

  refreshPage() {
    this.loadCurrentUser();
    this.loadProducts();
  }

  async loadProducts() {
    await this.showLoading('Cargando productos...');
    
    try {
      this.products = await this.productsService.getProducts();
      console.log('✅ Productos cargados:', this.products.length);
    } catch (error) {
      console.error('❌ Error cargando productos:', error);
      this.showAlert('Error', 'No se pudieron cargar los productos');
    } finally {
      this.hideLoading();
    }
  }

  async showAddProduct() {
    const alert = await this.alertCtrl.create({
      header: 'Agregar Producto',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre del producto',
        },
        {
          name: 'description',
          type: 'text',
          placeholder: 'Descripción',
        },
        {
          name: 'price',
          type: 'number',
          placeholder: 'Precio',
          min: 0,
        },
        {
          name: 'category',
          type: 'text',
          placeholder: 'Categoría (ej: Laptop, Smartphone)',
        },
        {
          name: 'image',
          type: 'url',
          placeholder: 'URL de la imagen',
        },
        {
          name: 'stock',
          type: 'number',
          placeholder: 'Stock disponible',
          min: 0,
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Agregar',
          handler: (data) => {
            this.addProduct(data);
          },
        },
      ],
    });

    await alert.present();
  }

  async addProduct(productData: any) {
    if (!this.validateProductData(productData)) return;

    await this.showLoading('Agregando producto...');

    try {
      const newProduct = {
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        category: productData.category,
        image: productData.image || 'assets/placeholder-product.jpg',
        stock: parseInt(productData.stock),
        featured: false
      };

      await this.productsService.createProduct(newProduct);
      console.log('✅ Producto agregado exitosamente');
      this.loadProducts();
      
      this.showAlert('Éxito', 'Producto agregado correctamente');
    } catch (error) {
      console.error('❌ Error agregando producto:', error);
      this.showAlert('Error', 'No se pudo agregar el producto');
    } finally {
      this.hideLoading();
    }
  }

  async editProduct(product: Product) {
    const alert = await this.alertCtrl.create({
      header: 'Editar Producto',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre del producto',
          value: product.name,
        },
        {
          name: 'description',
          type: 'text',
          placeholder: 'Descripción',
          value: product.description,
        },
        {
          name: 'price',
          type: 'number',
          placeholder: 'Precio',
          value: product.price,
          min: 0,
        },
        {
          name: 'category',
          type: 'text',
          placeholder: 'Categoría',
          value: product.category,
        },
        {
          name: 'image',
          type: 'url',
          placeholder: 'URL de la imagen',
          value: product.image,
        },
        {
          name: 'stock',
          type: 'number',
          placeholder: 'Stock disponible',
          value: product.stock,
          min: 0,
        },
        {
          name: 'featured',
          type: 'checkbox',
          label: 'Producto destacado',
          value: product.featured,
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: (data) => {
            this.updateProduct(product.id!, data);
          },
        },
      ],
    });

    await alert.present();
  }

  async updateProduct(productId: string, productData: any) {
    if (!this.validateProductData(productData)) return;

    await this.showLoading('Actualizando producto...');

    try {
      const updatedProduct = {
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        category: productData.category,
        image: productData.image,
        stock: parseInt(productData.stock),
        featured: productData.featured || false
      };

      await this.productsService.updateProduct(productId, updatedProduct);
      console.log('✅ Producto actualizado:', productId);
      this.loadProducts();
      
      this.showAlert('Éxito', 'Producto actualizado correctamente');
    } catch (error) {
      console.error('❌ Error actualizando producto:', error);
      this.showAlert('Error', 'No se pudo actualizar el producto');
    } finally {
      this.hideLoading();
    }
  }

  async deleteProduct(productId: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que quieres eliminar este producto?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.confirmDelete(productId);
          },
        },
      ],
    });

    await alert.present();
  }

  async confirmDelete(productId: string) {
    await this.showLoading('Eliminando producto...');

    try {
      await this.productsService.deleteProduct(productId);
      console.log('✅ Producto eliminado:', productId);
      this.loadProducts();
      
      this.showAlert('Éxito', 'Producto eliminado correctamente');
    } catch (error) {
      console.error('❌ Error eliminando producto:', error);
      this.showAlert('Error', 'No se pudo eliminar el producto');
    } finally {
      this.hideLoading();
    }
  }

  private validateProductData(data: any): boolean {
    if (!data.name || !data.description || !data.price || !data.category || !data.stock) {
      this.showAlert('Error', 'Todos los campos son obligatorios');
      return false;
    }
    if (data.price <= 0) {
      this.showAlert('Error', 'El precio debe ser mayor a 0');
      return false;
    }
    if (data.stock < 0) {
      this.showAlert('Error', 'El stock no puede ser negativo');
      return false;
    }
    return true;
  }

  private async showLoading(message: string) {
    this.loading = await this.loadingCtrl.create({
      message: message,
      spinner: 'crescent'
    });
    await this.loading.present();
  }

  private async hideLoading() {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
    }
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
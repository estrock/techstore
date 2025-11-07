import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: false
})
export class AdminDashboardPage implements OnInit, OnDestroy {
  userEmail: string = '';
  userName: string = '';
  userRole: string = '';
  searchTerm: string = '';
  
  private userSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.verifyAuthentication();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  loadUserData() {
    // Cargar datos iniciales del usuario
    this.updateUserInfo();
    
    // Suscribirse a cambios del usuario
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.updateUserInfo();
      this.verifyAuthentication();
    });
  }

  updateUserInfo() {
    if (this.authService.currentUser) {
      this.userEmail = this.authService.currentUser.email || 'Usuario';
      this.userName = this.getDisplayName();
      this.userRole = this.authService.userRole;
      
      console.log('👤 Dashboard - Usuario:', this.userEmail);
      console.log('🎯 Dashboard - Rol:', this.userRole);
    } else {
      this.userEmail = 'No autenticado';
      this.userName = 'Invitado';
      this.userRole = 'user';
    }
  }

  getDisplayName(): string {
    if (!this.authService.currentUser) return 'Usuario';
    
    const user = this.authService.currentUser;
    return user.displayName || 
           user.name || 
           (user.email ? user.email.split('@')[0] : 'Administrador');
  }
/*
  verifyAuthentication() {
    // Verificar si está logueado
    if (!this.authService.isLoggedIn()) {
      console.log('❌ Dashboard - Usuario no autenticado, redirigiendo...');
      this.showAlert('Acceso Denegado', 'Debes iniciar sesión para acceder al dashboard');
      this.router.navigate(['/login']);
      return;
    }
    
    // Verificar si es administrador
    if (!this.authService.isAdmin()) {
      console.log('❌ Dashboard - Usuario no es admin, redirigiendo...');
      this.showAlert('Acceso Denegado', 'No tienes permisos de administrador');
      this.router.navigate(['/home']);
      return;
    }
    
    console.log('✅ Dashboard - Acceso autorizado para:', this.userEmail);
  }



*/

// En admin-dashboard.page.ts, admin-products.page.ts, etc.
verifyAuthentication() {
  // 🔥 AGREGAR ESTA LÍNEA - Saltar verificación en desarrollo
  if (localStorage.getItem('dev_session') === 'active') {
    console.log('🔧 Modo desarrollo - Saltando verificación');
    return;
  }
  
  // El resto de tu código normal...
  if (!this.authService.isLoggedIn()) {
    this.router.navigate(['/login']);
    return;
  }
}
  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  goToProducts() {
    console.log('➡️ Navegando a Gestión de Productos');
    this.router.navigate(['/admin-products']);
  }

  goToOrders() {
    console.log('➡️ Navegando a Órdenes');
    this.router.navigate(['/admin-orders']);
  }

  goToStats() {
    console.log('➡️ Navegando a Estadísticas');
    this.router.navigate(['/admin-stats']);
  }

  goToUsers() {
    console.log('➡️ Navegando a Usuarios');
    this.router.navigate(['/admin-users']);
  }

  logout() {
    console.log('🚪 Cerrando sesión desde dashboard...');
    this.authService.logout();
  }

  // Método para recargar datos (útil para testing)
  refreshUserData() {
    console.log('🔄 Recargando datos del usuario...');
    this.updateUserInfo();
    this.verifyAuthentication();
  }
}
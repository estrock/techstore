import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertController, ModalController, LoadingController } from '@ionic/angular';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.page.html',
  styleUrls: ['./admin-users.page.scss'],
  standalone: false
})
export class AdminUsersPage implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  loading: boolean = true;

  currentUser: any = null;
  currentUserRole: string = '';

  // Estadísticas
  totalUsers: number = 0;
  adminUsers: number = 0;
  activeUsers: number = 0;
  inactiveUsers: number = 0;

  constructor(
    private userService: UserService,
    private alertController: AlertController,
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  async ngOnInit() {
    this.currentUser = this.authService.currentUser;
    this.currentUserRole = this.authService.userRole;
    await this.loadUsers();
  }

  async loadUsers() {
    this.loading = true;
    
    try {
      const loading = await this.loadingCtrl.create({
        message: 'Cargando usuarios...'
      });
      await loading.present();

      this.userService.getUsers().subscribe({
        next: (users) => {
          this.users = users;
          this.filteredUsers = users;
          this.calculateStats();
          console.log('✅ Usuarios cargados:', users);
          loading.dismiss();
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Error loading users:', error);
          this.showAlert('Error', 'No se pudieron cargar los usuarios');
          loading.dismiss();
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('❌ Error en loadUsers:', error);
      this.loading = false;
    }
  }

  // CORREGIDO: Un solo método handleImageError
  handleImageError(event: any, context: any) {
    if (context === 'logo') {
      // Error en el logo
      event.target.src = 'https://via.placeholder.com/150x40/4d8dff/ffffff?text=TechStore';
    } else if (typeof context === 'object' && context.name) {
      // Es un objeto usuario
      const user = context;
      event.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4d8dff&color=fff`;
    } else {
      // Fallback genérico
      event.target.src = 'https://ui-avatars.com/api/?name=Usuario&background=4d8dff&color=fff';
    }
  }

  // Calcular estadísticas
  calculateStats() {
    this.totalUsers = this.users.length;
    this.adminUsers = this.users.filter(u => u.role === 'admin').length;
    this.activeUsers = this.users.filter(u => u.status === 'active').length;
    this.inactiveUsers = this.users.filter(u => u.status === 'inactive').length;
  }

  searchUsers(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    
    if (!this.searchTerm) {
      this.filteredUsers = this.users;
      return;
    }

    this.userService.searchUsers(this.searchTerm).subscribe({
      next: (filteredUsers) => {
        this.filteredUsers = filteredUsers;
      },
      error: (error) => {
        console.error('Error buscando usuarios:', error);
      }
    });
  }

  async toggleUserStatus(user: User) {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Estás seguro de ${newStatus === 'active' ? 'activar' : 'desactivar'} a ${user.name}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.userService.updateUserStatus(user.uid, newStatus).then(success => {
              if (success) {
                this.loadUsers();
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  async changeUserRole(user: User) {
    const alert = await this.alertController.create({
      header: 'Cambiar Rol',
      message: `Selecciona el nuevo rol para ${user.name}:`,
      inputs: [
        {
          name: 'role',
          type: 'radio',
          label: 'Usuario',
          value: 'user',
          checked: user.role === 'user'
        },
        {
          name: 'role',
          type: 'radio',
          label: 'Moderador',
          value: 'moderator',
          checked: user.role === 'moderator'
        },
        {
          name: 'role',
          type: 'radio',
          label: 'Administrador',
          value: 'admin',
          checked: user.role === 'admin'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Actualizar',
          handler: (result) => {
            if (result) {
              this.userService.updateUserRole(user.uid, result).then(success => {
                if (success) {
                  this.loadUsers();
                }
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteUser(user: User) {
    // Prevenir que el usuario se elimine a sí mismo
    if (this.authService.currentUser?.uid === user.uid) {
      this.showAlert('Error', 'No puedes eliminar tu propia cuenta');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Eliminar Usuario',
      message: `¿Estás seguro de eliminar a ${user.name}? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.userService.deleteUser(user.uid).then(success => {
              if (success) {
                this.loadUsers();
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'danger';
      default: return 'medium';
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'admin': return 'danger';
      case 'moderator': return 'warning';
      case 'user': return 'primary';
      default: return 'medium';
    }
  }

  getRoleText(role: string): string {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'moderator': return 'Moderador';
      case 'user': return 'Usuario';
      default: return role;
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'suspended': return 'Suspendido';
      default: return status;
    }
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  goBack() {
    this.router.navigate(['/admin-dashboard']);
  }
}
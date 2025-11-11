import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertController, ModalController } from '@ionic/angular';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.page.html',
  styleUrls: ['./admin-users.page.scss'],
  standalone: false
})
export class AdminUsersPage implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  searchTerm: string = '';

  // Estadísticas para el template
  totalUsers: number = 0;
  adminUsers: number = 0;
  activeUsers: number = 0;
  inactiveUsers: number = 0;

  constructor(
    private userService: UserService,
    private alertController: AlertController,
    private modalController: ModalController,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.calculateStats();
        console.log('Usuarios cargados:', users);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.showAlert('Error', 'No se pudieron cargar los usuarios');
      }
    });
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
    this.filteredUsers = this.users.filter(user => 
      user.name.toLowerCase().includes(this.searchTerm) ||
      user.email.toLowerCase().includes(this.searchTerm) ||
      user.role.toLowerCase().includes(this.searchTerm)
    );
  }

  async addUser() {
    // Por ahora, vamos a crear un usuario básico sin modal
    const alert = await this.alertController.create({
      header: 'Crear Usuario',
      message: 'Esta funcionalidad estará disponible pronto',
      buttons: ['OK']
    });
    await alert.present();
  }

  async editUser(user: any) {
    const alert = await this.alertController.create({
      header: 'Editar Usuario',
      message: `Editando: ${user.name}`,
      buttons: ['OK']
    });
    await alert.present();
  }

  async toggleUserStatus(user: any) {
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

  async changeUserRole(user: any) {
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

  async deleteUser(user: any) {
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
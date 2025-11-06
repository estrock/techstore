import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(
    private router: Router, 
    private alertCtrl: AlertController,
    private authService: AuthService
  ) { }

  // Validar formulario
  isFormValid(): boolean {
    return this.name.length > 0 &&
           this.email.length > 0 &&
           this.password.length >= 6 &&
           this.password === this.confirmPassword;
  }

  async onRegister() {
    // Validaciones
    if (!this.name) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Por favor ingresa tu nombre.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    if (!this.email) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Por favor ingresa tu email.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    if (!this.password) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Por favor ingresa tu contraseña.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    if (this.password.length < 6) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'La contraseña debe tener al menos 6 caracteres.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    if (this.password !== this.confirmPassword) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Las contraseñas no coinciden.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    // ✅ REGISTRO DE NUEVO USUARIO
    console.log('Intentando registro con:', this.email);
    const success = await this.authService.register(this.email, this.password, this.name);
    
    if (success) {
      console.log('Registro exitoso');
    } else {
      console.log('Registro fallido');
    }
  }
}
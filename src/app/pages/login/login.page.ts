import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(
    private router: Router, 
    private alertCtrl: AlertController,
    private authService: AuthService
  ) { }

  async onContinue() {
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

    // ✅ INICIAR SESIÓN
    console.log('Intentando login con:', this.email);
    const success = await this.authService.login(this.email, this.password);
    
    if (success) {
      console.log('Login exitoso');
    } else {
      console.log('Login fallido');
    }
  }

  loginWithGoogle() {
    console.log('Iniciando login con Google...');
    this.authService.loginWithGoogle();
  }

  loginWithApple() {
    console.log('Login with Apple clicked');
  }
}
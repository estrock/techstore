import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone:false,
})
export class LoginPage implements OnInit {

  // constructor() { }

  ngOnInit() {
  }
 email: string = '';

  constructor(private alertCtrl: AlertController) {}

  async onContinue() {
    if (!this.email) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Please enter your email.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Welcome',
      message: `Email: ${this.email}`,
      buttons: ['OK'],
    });
    await alert.present();
  }

  loginWithGoogle() {
    console.log('Login with Google clicked');
    // Aquí puedes integrar Firebase o Capacitor Google Auth
  }

  loginWithApple() {
    console.log('Login with Apple clicked');
    // Aquí puedes integrar Sign In with Apple
  }
}

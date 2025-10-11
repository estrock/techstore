import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {

  // constructor() { }
  // constructor(private router:Router){}

  ngOnInit() {
  }
  email: string = '';
  password: string = '';

  constructor(private router:Router, private alertCtrl: AlertController) { }

  async onContinue() {
    if (!this.email) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Please enter your email.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }else if (!this.password) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Please enter your password.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    this.router.navigate(['home']);

    // const alert = await this.alertCtrl.create({
    //   header: 'Welcome',
    //   message: `Email: ${this.email}`,
    //   buttons: ['OK'],
    // });
    // await alert.present();
    
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

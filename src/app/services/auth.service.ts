import { Injectable } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  user,
  User
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser: any = null;
  userRole: string = 'user';
  
  // BehaviorSubject para observar cambios en el usuario
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    private alertCtrl: AlertController
  ) {
    this.initializeAuthListener();
  }

 private initializeAuthListener() {
  user(this.auth).subscribe(async (user: User | null) => {
    if (user) {
      this.currentUser = user;
      this.currentUserSubject.next(user);
      await this.loadUserRole(user.uid);
      console.log('✅ Sesión restaurada:', user.email);
    } else {
      // ❌ No limpies el usuario si estamos en desarrollo
      const devSession = localStorage.getItem('dev_session');
      if (devSession === 'active') {
        console.log('🧩 Modo desarrollo activo: se mantiene sesión temporal');
        return; // evita cerrar sesión
      }
      this.currentUser = null;
      this.currentUserSubject.next(null);
      this.userRole = 'user';
      console.log('👤 Usuario no logueado');
    }
  });
}


  async login(email: string, password: string): Promise<boolean> {
    try {
      console.log('🔑 Intentando login con:', email);
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('✅ Login exitoso:', userCredential.user.email);
      
      await this.loadUserRole(userCredential.user.uid);
      
      console.log('🎯 Rol detectado:', this.userRole);
      
      if (this.userRole === 'admin') {
        console.log('🚀 Redirigiendo ADMIN a admin-dashboard');
        this.router.navigate(['/admin-dashboard']);
      } else {
        console.log('🏠 Redirigiendo USER a home');
        this.router.navigate(['/home']);
      }
      
      return true;
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      this.showAlert('Error', this.getAuthErrorMessage(error.code));
      return false;
    }
  }

  async register(email: string, password: string, name: string): Promise<boolean> {
    try {
      console.log('📝 Intentando registro con:', email);
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      await this.createUserProfile(userCredential.user.uid, email, name);
      
      console.log('✅ Registro exitoso:', userCredential.user.email);
      this.router.navigate(['/home']);
      return true;
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      this.showAlert('Error', this.getAuthErrorMessage(error.code));
      return false;
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
      console.log('✅ Logout exitoso');
    } catch (error) {
      console.error('❌ Error en logout:', error);
    }
  }

  async loginWithGoogle() {
    try {
      console.log('🔗 Iniciando login con Google...');
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(this.auth, provider);
      
      const userDoc = await getDoc(doc(this.firestore, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        await this.createUserProfile(
          userCredential.user.uid, 
          userCredential.user.email || '', 
          userCredential.user.displayName || 'Usuario Google'
        );
      }
      
      console.log('✅ Login con Google exitoso');
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('❌ Error en login con Google:', error);
      this.showAlert('Error', 'Error al iniciar sesión con Google');
    }
  }

  private async createUserProfile(uid: string, email: string, name: string) {
    try {
      const userData = {
        email: email,
        name: name,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(doc(this.firestore, 'users', uid), userData);
      console.log('✅ Perfil de usuario creado:', email, 'UID:', uid);
    } catch (error) {
      console.error('❌ Error creando perfil:', error);
    }
  }

  private async loadUserRole(uid: string) {
    try {
      console.log('🔍 Cargando rol para UID:', uid);
      
      const userDoc = await getDoc(doc(this.firestore, 'users', uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        this.userRole = userData['role'] || 'user';
        console.log('✅ Rol cargado:', this.userRole, 'Datos:', userData);
      } else {
        console.log('❌ Documento de usuario no encontrado para UID:', uid);
        this.userRole = 'user';
      }
    } catch (error: any) {
      console.error('❌ Error cargando rol:', error);
      this.userRole = 'user';
    }
  }

  isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  private getAuthErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/invalid-email': 'El formato del email es inválido',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/user-not-found': 'No existe una cuenta con este email',
      'auth/wrong-password': 'La contraseña es incorrecta',
      'auth/email-already-in-use': 'Este email ya está registrado',
      'auth/weak-password': 'La contraseña es muy débil',
      'auth/operation-not-allowed': 'Esta operación no está permitida',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde'
    };
    
    return errorMessages[errorCode] || 'Error desconocido. Intenta nuevamente.';
  }
}
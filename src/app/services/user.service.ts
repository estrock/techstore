import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy
} from '@angular/fire/firestore';
import { AlertController } from '@ionic/angular';
import { BehaviorSubject, from, map, Observable } from 'rxjs';

export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  phone?: string;
  address?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersCollection = collection(this.firestore, 'users');
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  constructor(
    private firestore: Firestore,
    private alertCtrl: AlertController
  ) {}

  /**
   * Obtener todos los usuarios
   */
  getUsers(): Observable<User[]> {
    return from(
      getDocs(this.usersCollection)
    ).pipe(
      map(snapshot => {
        const users: User[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          users.push({
            uid: doc.id,
            email: data['email'] || '',
            name: data['name'] || '',
            role: data['role'] || 'user',
            status: data['status'] || 'active',
            createdAt: data['createdAt']?.toDate() || new Date(),
            updatedAt: data['updatedAt']?.toDate() || new Date(),
            lastLogin: data['lastLogin']?.toDate(),
            phone: data['phone'] || '',
            address: data['address'] || ''
          });
        });
        this.usersSubject.next(users);
        return users;
      })
    );
  }

  /**
   * Obtener usuario por ID
   */
  getUserById(uid: string): Observable<User | null> {
    return from(
      getDoc(doc(this.firestore, 'users', uid))
    ).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          return {
            uid: docSnap.id,
            email: data['email'] || '',
            name: data['name'] || '',
            role: data['role'] || 'user',
            status: data['status'] || 'active',
            createdAt: data['createdAt']?.toDate() || new Date(),
            updatedAt: data['updatedAt']?.toDate() || new Date(),
            lastLogin: data['lastLogin']?.toDate(),
            phone: data['phone'] || '',
            address: data['address'] || ''
          };
        }
        return null;
      })
    );
  }

  /**
   * Crear nuevo usuario
   */
  async createUser(userData: Partial<User>): Promise<boolean> {
    try {
      const uid = userData.uid || this.generateId();
      const userDoc = doc(this.firestore, 'users', uid);
      
      const user: User = {
        uid: uid,
        email: userData.email || '',
        name: userData.name || '',
        role: userData.role || 'user',
        status: userData.status || 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: userData.phone || '',
        address: userData.address || ''
      };

      await setDoc(userDoc, user);
      console.log('✅ Usuario creado:', user.email);
      await this.showAlert('Éxito', 'Usuario creado correctamente');
      return true;
    } catch (error: any) {
      console.error('❌ Error creando usuario:', error);
      await this.showAlert('Error', 'No se pudo crear el usuario');
      return false;
    }
  }

  /**
   * Actualizar usuario existente
   */
  async updateUser(uid: string, userData: Partial<User>): Promise<boolean> {
    try {
      const userDoc = doc(this.firestore, 'users', uid);
      
      const updateData = {
        ...userData,
        updatedAt: new Date()
      };

      await updateDoc(userDoc, updateData);
      console.log('✅ Usuario actualizado:', uid);
      await this.showAlert('Éxito', 'Usuario actualizado correctamente');
      return true;
    } catch (error: any) {
      console.error('❌ Error actualizando usuario:', error);
      await this.showAlert('Error', 'No se pudo actualizar el usuario');
      return false;
    }
  }

  /**
   * Actualizar estado del usuario
   */
  async updateUserStatus(uid: string, status: 'active' | 'inactive' | 'suspended'): Promise<boolean> {
    try {
      const userDoc = doc(this.firestore, 'users', uid);
      
      await updateDoc(userDoc, {
        status: status,
        updatedAt: new Date()
      });
      
      console.log('✅ Estado actualizado:', uid, status);
      return true;
    } catch (error: any) {
      console.error('❌ Error actualizando estado:', error);
      return false;
    }
  }

  /**
   * Actualizar rol del usuario
   */
  async updateUserRole(uid: string, role: 'admin' | 'user' | 'moderator'): Promise<boolean> {
    try {
      const userDoc = doc(this.firestore, 'users', uid);
      
      await updateDoc(userDoc, {
        role: role,
        updatedAt: new Date()
      });
      
      console.log('✅ Rol actualizado:', uid, role);
      await this.showAlert('Éxito', 'Rol actualizado correctamente');
      return true;
    } catch (error: any) {
      console.error('❌ Error actualizando rol:', error);
      await this.showAlert('Error', 'No se pudo actualizar el rol');
      return false;
    }
  }

  /**
   * Eliminar usuario
   */
  async deleteUser(uid: string): Promise<boolean> {
    try {
      // Primero verificamos que el usuario existe
      const userDoc = await getDoc(doc(this.firestore, 'users', uid));
      
      if (!userDoc.exists()) {
        await this.showAlert('Error', 'Usuario no encontrado');
        return false;
      }

      const userData = userDoc.data();
      
      // Prevenir que un admin se elimine a sí mismo
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (currentUser.uid === uid) {
        await this.showAlert('Error', 'No puedes eliminar tu propia cuenta');
        return false;
      }

      await deleteDoc(doc(this.firestore, 'users', uid));
      console.log('✅ Usuario eliminado:', uid);
      await this.showAlert('Éxito', 'Usuario eliminado correctamente');
      return true;
    } catch (error: any) {
      console.error('❌ Error eliminando usuario:', error);
      await this.showAlert('Error', 'No se pudo eliminar el usuario');
      return false;
    }
  }

  /**
   * Buscar usuarios por nombre o email
   */
  searchUsers(searchTerm: string): Observable<User[]> {
    return this.getUsers().pipe(
      map(users => {
        return users.filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    );
  }

  /**
   * Filtrar usuarios por rol
   */
  getUsersByRole(role: string): Observable<User[]> {
    return this.getUsers().pipe(
      map(users => users.filter(user => user.role === role))
    );
  }

  /**
   * Filtrar usuarios por estado
   */
  getUsersByStatus(status: string): Observable<User[]> {
    return this.getUsers().pipe(
      map(users => users.filter(user => user.status === status))
    );
  }

  /**
   * Obtener estadísticas de usuarios
   */
  getUserStats(): Observable<any> {
    return this.getUsers().pipe(
      map(users => {
        const total = users.length;
        const admins = users.filter(u => u.role === 'admin').length;
        const active = users.filter(u => u.status === 'active').length;
        const inactive = users.filter(u => u.status === 'inactive').length;
        const suspended = users.filter(u => u.status === 'suspended').length;

        return {
          total,
          admins,
          active,
          inactive,
          suspended,
          activePercentage: total > 0 ? (active / total * 100).toFixed(1) : 0
        };
      })
    );
  }

  /**
   * Generar ID único para nuevos usuarios
   */
  private generateId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Mostrar alertas
   */
  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  onSnapshot,
  query,
  orderBy
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private firestore: Firestore) {}

  // 🆕 Crear producto
  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const productData = {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(this.firestore, 'products'), productData);
      console.log('✅ Producto creado con ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creando producto:', error);
      throw error;
    }
  }

  // 📖 Obtener todos los productos (para admin)
  async getProducts(): Promise<Product[]> {
    try {
      const q = query(collection(this.firestore, 'products'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        } as Product);
      });
      
      return products;
    } catch (error) {
      console.error('❌ Error obteniendo productos:', error);
      throw error;
    }
  }

  // 🔄 Obtener productos en tiempo real (para home usuarios)
  getProductsRealTime(): Observable<Product[]> {
    return new Observable((observer) => {
      const q = query(collection(this.firestore, 'products'), orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const products: Product[] = [];
        querySnapshot.forEach((doc) => {
          products.push({
            id: doc.id,
            ...doc.data()
          } as Product);
        });
        observer.next(products);
      }, (error) => {
        observer.error(error);
      });

      return unsubscribe;
    });
  }

  // ✏️ Actualizar producto
  async updateProduct(id: string, product: Partial<Product>): Promise<void> {
    try {
      const productRef = doc(this.firestore, 'products', id);
      await updateDoc(productRef, {
        ...product,
        updatedAt: new Date()
      });
      console.log('✅ Producto actualizado:', id);
    } catch (error) {
      console.error('❌ Error actualizando producto:', error);
      throw error;
    }
  }

  // 🗑️ Eliminar producto
  async deleteProduct(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.firestore, 'products', id));
      console.log('✅ Producto eliminado:', id);
    } catch (error) {
      console.error('❌ Error eliminando producto:', error);
      throw error;
    }
  }

  // 🔍 Obtener producto por ID
  async getProductById(id: string): Promise<Product | null> {
    try {
      const docRef = doc(this.firestore, 'products', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Product;
      } else {
        return null;
      }
    } catch (error) {
      console.error('❌ Error obteniendo producto:', error);
      throw error;
    }
  }
}
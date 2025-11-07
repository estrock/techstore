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
  orderBy,
  where,
  limit
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
  createdAt?: Date;  // Hacer opcionales
  updatedAt?: Date;  // Hacer opcionales
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
        const data = doc.data();
        products.push({
          id: doc.id,
          name: data['name'],
          description: data['description'],
          price: data['price'],
          category: data['category'],
          image: data['image'],
          stock: data['stock'],
          featured: data['featured'] || false,
          createdAt: data['createdAt']?.toDate(),
          updatedAt: data['updatedAt']?.toDate()
        } as Product);
      });
      
      console.log('✅ Productos obtenidos (admin):', products.length);
      return products;
    } catch (error) {
      console.error('❌ Error obteniendo productos:', error);
      throw error;
    }
  }

  // 🔄 Obtener productos en tiempo real (para home usuarios)
  getProductsRealTime(): Observable<Product[]> {
    return new Observable((observer) => {
      const q = query(
        collection(this.firestore, 'products'), 
        where('stock', '>', 0), // Solo productos con stock
        orderBy('featured', 'desc'),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const products: Product[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          products.push({
            id: doc.id,
            name: data['name'],
            description: data['description'],
            price: data['price'],
            category: data['category'],
            image: data['image'],
            stock: data['stock'],
            featured: data['featured'] || false,
            createdAt: data['createdAt']?.toDate(),
            updatedAt: data['updatedAt']?.toDate()
          } as Product);
        });
        console.log('🔄 Productos en tiempo real:', products.length);
        observer.next(products);
      }, (error) => {
        console.error('❌ Error en tiempo real:', error);
        observer.error(error);
      });

      return unsubscribe;
    });
  }

  // 🏠 Obtener productos para home (método simple)
  async getProductsForHome(): Promise<Product[]> {
    try {
      const q = query(
        collection(this.firestore, 'products'),
        where('stock', '>', 0),
        orderBy('featured', 'desc'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      const querySnapshot = await getDocs(q);
      const products: Product[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: doc.id,
          name: data['name'],
          description: data['description'],
          price: data['price'],
          category: data['category'],
          image: data['image'],
          stock: data['stock'],
          featured: data['featured'] || false,
          createdAt: data['createdAt']?.toDate(),
          updatedAt: data['updatedAt']?.toDate()
        } as Product);
      });
      
      console.log('🏠 Productos para home:', products.length);
      return products;
    } catch (error) {
      console.error('❌ Error obteniendo productos para home:', error);
      throw error;
    }
  }

  // 🔥 Obtener productos destacados
  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const q = query(
        collection(this.firestore, 'products'),
        where('featured', '==', true),
        where('stock', '>', 0),
        orderBy('createdAt', 'desc'),
        limit(8)
      );
      
      const querySnapshot = await getDocs(q);
      const products: Product[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: doc.id,
          name: data['name'],
          description: data['description'],
          price: data['price'],
          category: data['category'],
          image: data['image'],
          stock: data['stock'],
          featured: data['featured'],
          createdAt: data['createdAt']?.toDate(),
          updatedAt: data['updatedAt']?.toDate()
        } as Product);
      });
      
      console.log('🔥 Productos destacados:', products.length);
      return products;
    } catch (error) {
      console.error('❌ Error obteniendo productos destacados:', error);
      throw error;
    }
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
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data['name'],
          description: data['description'],
          price: data['price'],
          category: data['category'],
          image: data['image'],
          stock: data['stock'],
          featured: data['featured'] || false,
          createdAt: data['createdAt']?.toDate(),
          updatedAt: data['updatedAt']?.toDate()
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
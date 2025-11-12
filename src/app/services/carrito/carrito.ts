import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category: string;
}

export interface CarritoResponse {
  items: CartItem[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class Carrito {
  private items: CartItem[] = [];
  private cartCount = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCount.asObservable();

  constructor() {
    this.loadCart();
  }

  /** Agrega un producto al carrito */
  addToCart(product: any, quantity: number = 1): void {
    const existingItem = this.items.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
        category: ''
      });
    }

    this.saveCart();
    this.updateCartCount();
    console.log(this.getCartItems());
  }

  agregar(product: any, quantity: number = 1): void {
    const existingItem = this.items.find(item => item.id === product.id);
  }
  /** Actualiza la cantidad de un producto */
  updateQuantity(productId: string, newQuantity: number): void {
    const item = this.items.find(i => i.id === productId);
    if (item) {
      item.quantity = newQuantity > 0 ? newQuantity : 1;
      this.saveCart();
      this.updateCartCount();
    }
  }


  /** Obtiene los productos del carrito */
  getCartItems(): CartItem[] {
    return this.items;
  }

  /** Elimina un producto */
  removeItem(productId: string): void {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveCart();
    this.updateCartCount();
  }

  /** Limpia el carrito */
  clearCart(): void {
    this.items = [];
    this.saveCart();
    this.updateCartCount();
  }

  /** Total de productos en el carrito */
  getTotalItems(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  /** Guarda el carrito en localStorage */
  private saveCart(): void {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }

  /** Carga el carrito del localStorage */
  private loadCart(): void {
    const stored = localStorage.getItem('cart');
    if (stored) {
      this.items = JSON.parse(stored);
      this.updateCartCount();
    }
  }

  /** Actualiza el contador observable */
  private updateCartCount(): void {
    // const total = this.getTotalItems();
    // this.cartCount.next(total);
    this.cartCount.next(this.items.length);
  }

  //   private cartItems: CartItem[] = [
  //     {
  //       id: '1',
  //       name: 'Laptop Gaming HP',
  //       price: 15999,
  //       quantity: 1,
  //       image: 'https://images.unsplash.com/photo-1498049794561-7780e7231651?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
  //       category: 'Laptops'
  //     },
  //     {
  //       id: '2',
  //       name: 'Mouse Inalámbrico Logitech',
  //       price: 599,
  //       quantity: 2,
  //       image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
  //       category: 'Accesorios'
  //     }
  //   ];

  //   private carritoSubject = new BehaviorSubject<CarritoResponse>(this.buildResponse());

  //   constructor() {}

  //   private buildResponse(): CarritoResponse {
  //     const total = this.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  //     return {
  //       items: [...this.cartItems],
  //       total
  //     };
  //   }

  //   getItems(): Observable<CarritoResponse> {
  //     return this.carritoSubject.asObservable();
  //   }

  //   addItem(item: CartItem) {
  //     this.cartItems.push(item);
  //     this.carritoSubject.next(this.buildResponse());
  //   }

  //   removeItem(id: string) {
  //     this.cartItems = this.cartItems.filter(item => item.id !== id);
  //     this.carritoSubject.next(this.buildResponse());
  //   }
  //   // increaseQuantity(item: CartItem) {
  //   //   item.quantity++;
  //   // }
  //   increaseQuantity(item: CartItem) {
  //   const index = this.cartItems.findIndex(i => i.id === item.id);
  //   if (index !== -1) {
  //     this.cartItems[index].quantity++;
  //     this.carritoSubject.next(this.buildResponse());
  //   }
  // }

}

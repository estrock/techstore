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

  private cartItems: CartItem[] = [
    {
      id: '1',
      name: 'Laptop Gaming HP',
      price: 15999,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231651?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      category: 'Laptops'
    },
    {
      id: '2',
      name: 'Mouse Inalámbrico Logitech',
      price: 599,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      category: 'Accesorios'
    }
  ];

  private carritoSubject = new BehaviorSubject<CarritoResponse>(this.buildResponse());

  constructor() {}

  private buildResponse(): CarritoResponse {
    const total = this.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    return {
      items: [...this.cartItems],
      total
    };
  }

  getItems(): Observable<CarritoResponse> {
    return this.carritoSubject.asObservable();
  }

  addItem(item: CartItem) {
    this.cartItems.push(item);
    this.carritoSubject.next(this.buildResponse());
  }

  removeItem(id: string) {
    this.cartItems = this.cartItems.filter(item => item.id !== id);
    this.carritoSubject.next(this.buildResponse());
  }
  // increaseQuantity(item: CartItem) {
  //   item.quantity++;
  // }
  increaseQuantity(item: CartItem) {
  const index = this.cartItems.findIndex(i => i.id === item.id);
  if (index !== -1) {
    this.cartItems[index].quantity++;
    this.carritoSubject.next(this.buildResponse());
  }
}

}

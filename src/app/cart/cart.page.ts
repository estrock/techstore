import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { SocialIconsComponent } from '../social-icons.component';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category: string;
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, SocialIconsComponent]
})
export class CartPage implements OnInit {

  cartItems: CartItem[] = [];
  isLoading: boolean = false;

  constructor(private router: Router) { }

  ngOnInit() {
    this.loadCartItems();
  }

  loadCartItems() {
    // Simular carga de items del carrito
    this.isLoading = true;
    
    // Por ahora, cargar algunos items de ejemplo
    setTimeout(() => {
      this.cartItems = [
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
      this.isLoading = false;
    }, 1000);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  }

  increaseQuantity(item: CartItem) {
    item.quantity++;
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      item.quantity--;
    }
  }

  removeItem(itemToRemove: CartItem) {
    this.cartItems = this.cartItems.filter(item => item.id !== itemToRemove.id);
  }

  clearCart() {
    this.cartItems = [];
  }

  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getShipping(): number {
    return this.cartItems.length > 0 ? 150 : 0; // $150 MXN de envío
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShipping();
  }

  checkout() {
    console.log('Procediendo al pago...');
    alert('Funcionalidad de pago en desarrollo. Total: ' + this.formatPrice(this.getTotal()));
  }
}

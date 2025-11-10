import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { SocialIconsComponent } from '../social-icons.component';
import { Carrito, CarritoResponse } from '../services/carrito/carrito';

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
  carrito!: CarritoResponse;

  // cartItems: CartItem[] = [];
  cartItems: any[] = [];

  isLoading: boolean = false;

  constructor(private router: Router, private carritoService: Carrito) { }

  ngOnInit() {
    this.loadCartItems();
  }

  loadCartItems() {
    this.isLoading = true;
    this.carritoService.getItems().subscribe(data => {
      this.carrito = data;
      this.cartItems = data.items;
      console.log("items ", this.cartItems)
      this.isLoading = false;
    });

  }

  increaseQuantity(item: CartItem) {
    // item.quantity++;
    this.carritoService.increaseQuantity(item);

  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
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

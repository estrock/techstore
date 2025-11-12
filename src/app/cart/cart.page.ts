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
    this.cartItems = this.carritoService.getCartItems();
    if (this.cartItems) {
      this.isLoading = false;
    }

  }

  increaseQuantity(item: CartItem) {
    item.quantity++;
    this.carritoService.updateQuantity(item.id, item.quantity);
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      item.quantity--;
      this.carritoService.updateQuantity(item.id, item.quantity);
    }
  }

  onQuantityChange(item: CartItem, newQty: number) {
  const qty = isNaN(newQty) || newQty < 1 ? 1 : newQty;
  item.quantity = qty;
  this.carritoService.updateQuantity(item.id, qty);
}


  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  }

  removeItem(item: CartItem) {
    this.carritoService.removeItem(item.id);
    this.loadCartItems();
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
    // Desactivar el alert y reemplazar con la integración de PayPal
    console.log('Procediendo al pago... Total: ' + this.getTotal());

    // Asegúrate de que el SDK de PayPal ya esté cargado
    if ((window as any).paypal) {
      (window as any).paypal.Buttons({
        // createOrder: típicamente llamaría al backend. Aquí lo hacemos directo:
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: this.getTotal().toFixed(2)
              }
            }]
          });
        },
        onApprove: (data: any, actions: any) => {
          return actions.order.capture().then((details: any) => {
            console.log('Pago aprobado: ', details);
            // Mostrar mensaje de éxito al usuario
            alert('Pago realizado con éxito por ' + details.payer.name.given_name);
            // Limpia carrito o redirige
            this.clearCart();
            this.router.navigate(['/home']);
          });
        },
        onError: (err: any) => {
          console.error('Error en el pago PayPal: ', err);
          alert('Hubo un error al procesar el pago, intenta de nuevo.');
        }
      }).render('#paypal-button-container');
    } else {
      alert('El SDK de PayPal no está cargado. Intenta recargar la página.');
    }
  }

}

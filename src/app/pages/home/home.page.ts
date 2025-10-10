import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IonicSlides } from '@ionic/angular';
import { register } from 'swiper/element/bundle';


register();

interface Product {
  id: string;
  product_name: string;
  product_category: string;
  product_price: number;
  product_description: string;
  stock_quantity: number;
  manufacturer: string;
  subcategory: string;
  img: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone:false,
})
export class HomePage implements OnInit {

  // constructor() { }

  // ngOnInit() {
  // }
  products: Product[] = [];
  searchTerm: string = '';
  selectedFilter: string = 'categorias';

  banners = [
    { img: 'assets/logo.PNG' },
    { img: 'assets/logo.PNG' },
  ];

  slideOpts = {
    initialSlide: 0,
    speed: 500,
    autoplay: { delay: 2500 },
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.http.get<Product[]>('assets/bd.json').subscribe({
      next: (data) => (this.products = data),
      error: (err) => console.error('Error loading products:', err),
    });
  }

}

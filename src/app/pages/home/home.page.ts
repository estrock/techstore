import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IonicSlides } from '@ionic/angular';
import { register } from 'swiper/element/bundle';
import { Router } from '@angular/router';


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

  constructor(private http: HttpClient, private router: Router) {}
  

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.http.get<Product[]>('assets/bd.json').subscribe({
      next: (data) => (this.products = data),
      error: (err) => console.error('Error loading products:', err),
    });
  }

  goToCategories() {
    this.router.navigate(['/categories']);
  }
onFilterChange(event: any) {
  const value = event.detail.value;
  console.log('🔍 Filter changed to:', value); // ← Agrega esto
  
  if (value === 'categorias') {
    console.log('🚀 Navigating to categories...'); // ← Agrega esto
    this.router.navigate(['/categories']).then(success => {
      console.log('✅ Navigation success:', success); // ← Agrega esto
    }).catch(error => {
      console.error('❌ Navigation error:', error); // ← Agrega esto
    });
  }
  // Aquí puedes agregar lógica para los otros filtros
  else if (value === 'populares') {
    console.log('📊 Popular filter selected'); // ← Agrega esto
    // Lógica para productos populares
  }
  else if (value === 'recientes') {
    console.log('🆕 Recent filter selected'); // ← Agrega esto
    // Lógica para productos recientes
  }
}

}

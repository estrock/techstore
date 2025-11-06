import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: false
})
export class AdminDashboardPage {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  goToProducts() {
    this.router.navigate(['/admin-products']);
  }

  goToOrders() {
    this.router.navigate(['/admin-orders']);
  }

  goToStats() {
    this.router.navigate(['/admin-stats']);
  }

  goToUsers() {
    this.router.navigate(['/admin-users']);
  }

  logout() {
    this.authService.logout();
  }
}
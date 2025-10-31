import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-pase-header',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './pase-header.component.html',
  styleUrl: './pase-header.component.scss'
})
export class PaseHeaderComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
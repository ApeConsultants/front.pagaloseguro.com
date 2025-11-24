import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DialogService } from '../../../core/services/dialog.service';

@Component({
  selector: 'app-saver-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './saver-header.component.html',
  styleUrls: ['./saver-header.component.scss']
})
export class SaverHeaderComponent {
  logoSrc = 'assets/logo/Logo.svg';
  isDropdownOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialogService: DialogService,
    private cdr: ChangeDetectorRef
  ) {}

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    this.cdr.detectChanges();
  }

  onLogout(): void {
    this.isDropdownOpen = false;
    this.cdr.detectChanges();

    const dialogData = {
      title: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      confirmText: 'Sí, Salir',
      type: 'confirm' as const
    };

    this.dialogService.open(dialogData).subscribe(confirmed => {
      if (confirmed) {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }
}
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DialogService } from '../../../core/services/dialog.service';

@Component({
  selector: 'app-pase-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './pase-sidebar.component.html',
  styleUrls: ['./pase-sidebar.component.scss']
})
export class PaseSidebarComponent implements OnInit {
  logoSrc = 'assets/logo/Logo.svg';
  
  public isSidebarOpen = true;
  public userType: string | null = null;
  public userName: string | null = null;
  public isAjustesOpen = false;

  constructor(
    private authService: AuthService,
    private dialogService: DialogService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userType = this.authService.getUserType();
    this.userName = this.authService.getUserName();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    if (!this.isSidebarOpen) {
      this.isAjustesOpen = false;
    }
    this.cdr.detectChanges();
  }

  
  toggleAjustes(): void {
    this.isAjustesOpen = !this.isAjustesOpen;
    this.cdr.detectChanges();
  }

  onLogout(): void {
    this.isAjustesOpen = false;
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
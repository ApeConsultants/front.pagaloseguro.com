import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-pase-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './pase-sidebar.component.html',
  styleUrl: './pase-sidebar.component.scss'
})
export class PaseSidebarComponent {
  logoSrc = 'assets/logo/Logo.svg';
}

import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaseHeaderComponent } from '../components/pase-header/pase-header.component';
import { PaseSidebarComponent } from '../components/pase-sidebar/pase-sidebar.component';
import { SaverHeaderComponent } from '../components/saver-header/saver-header.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-pase-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    PaseHeaderComponent,
    PaseSidebarComponent,
    SaverHeaderComponent
  ],
  templateUrl: './pase-layout.component.html',
  styleUrls: ['./pase-layout.component.scss']
})
export class PaseLayoutComponent implements OnInit {

  public userType: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userType = this.authService.getUserType();
  }
}
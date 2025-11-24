import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardAdminComponent } from '../admin/dashboard-admin/dashboard-admin.component';
import { DashboardEjecutivoComponent } from '../ejecutivo/dashboard-ejecutivo/dashboard-ejecutivo.component';
import { PaseHomePageComponent } from '../pase-home-page/pase-home-page.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, DashboardAdminComponent, DashboardEjecutivoComponent, PaseHomePageComponent],
  template: `
    <ng-container [ngSwitch]="role">
      <app-dashboard-admin *ngSwitchCase="'admin'"></app-dashboard-admin>
      <app-dashboard-ejecutivo *ngSwitchCase="'ejecutivo'"></app-dashboard-ejecutivo>
      <app-pase-home-page *ngSwitchDefault></app-pase-home-page>
    </ng-container>
  `
})
export class DashboardPageComponent implements OnInit {
  role = 'ahorrador';

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.role = (this.auth.getUserType() || 'ahorrador').toLowerCase();
  }
}
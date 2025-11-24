import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Injectable({ providedIn: 'root' })
export class PaseDashboardGuard implements CanActivate {
  constructor(private auth: AuthService) {}
  canActivate(): boolean {
    return !!this.auth.getUserType();
  }
}
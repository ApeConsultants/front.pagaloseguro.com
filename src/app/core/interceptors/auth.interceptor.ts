import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const userId = authService.getUserId();

  if (req.url.includes('/pase/') && token && userId) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${userId} ${token}`
      }
    });
    return next(clonedReq);
  }

  return next(req);
};
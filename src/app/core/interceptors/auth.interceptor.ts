import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const userId = authService.getUserId();

  const isPublic = req.url.includes('/public/');
  const needsAuth = (req.url.includes('/pase/') || req.url.includes('/file/'));

  if (!isPublic && needsAuth && token && userId) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${userId} ${token}`
      }
    });
    return next(clonedReq);
  }

  return next(req);
};
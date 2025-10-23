import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenSvc = inject(TokenService);
  const token = tokenSvc.get();
  if (!token) return next(req);

  const clone = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
  return next(clone);
};

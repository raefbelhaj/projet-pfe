import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export const TokenInterceptor: HttpInterceptorFn = (req, next) => {

  if (req.url.includes('/auth/login') || req.url.includes('/auth/signup')) {
    return next(req);
  }

  const token = localStorage.getItem('token');

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    tap({
      error: (err) => {
        if (err.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('expiresIn');
          window.location.href = '/login';
        }
      }
    })
  );
};

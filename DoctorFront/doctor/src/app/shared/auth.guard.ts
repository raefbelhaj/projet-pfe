// src/app/shared/guards/auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TokenService } from './services/token.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = inject(TokenService);
  return (!!token.get() && !token.isExpired()) || router.createUrlTree(['/auth/signin']);
};

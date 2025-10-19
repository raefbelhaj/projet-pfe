import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Vérifie si on est dans le navigateur avant d'utiliser localStorage
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('token');
    return token ? true : router.createUrlTree(['/auth/signin']);
  }

  // Si c'est exécuté côté serveur, on laisse passer (pas d'accès localStorage)
  return true;
};

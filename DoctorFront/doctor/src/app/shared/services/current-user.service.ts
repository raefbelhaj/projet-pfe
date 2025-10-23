import { Injectable } from '@angular/core';
import { TokenService } from './token.service';

export interface CurrentUser {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  specialty?: string;
}

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  constructor(private token: TokenService) {}

  get(): CurrentUser | null {
    const p = this.token.decode();
    if (!p) return null;

    // If your backend uses sub=email, treat it as email and also as id
    const id = p.sub;                // or use a dedicated "userId" claim if you add one
    const email = p.email ?? p.sub;  // fallback if sub is email

    return {
      id,
      email,
      name: p.name ?? email ?? 'Utilisateur',
      role: p.role,
      specialty: p.specialty
    };
  }

  isLoggedIn(): boolean {
    return !!this.token.get() && !this.token.isExpired();
  }
}

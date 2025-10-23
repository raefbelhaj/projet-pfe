import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  sub: string;            // user id OR email, depending on backend choice
  email?: string;
  name?: string;
  role?: string;          // "ROLE_DOCTOR"
  specialty?: string;
  iat?: number;
  exp?: number;
}

@Injectable({ providedIn: 'root' })
export class TokenService {
  private KEY = 'token';
  get(): string | null { return localStorage.getItem(this.KEY); }

  decode(): JwtPayload | null {
    const t = this.get();
    if (!t) return null;
    try { return jwtDecode<JwtPayload>(t); } catch { return null; }
  }

  isExpired(): boolean {
    const p = this.decode();
    return !!p?.exp && p.exp < Math.floor(Date.now()/1000);
  }

  clear() { localStorage.removeItem(this.KEY); }
}

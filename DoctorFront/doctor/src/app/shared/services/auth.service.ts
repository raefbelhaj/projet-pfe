import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DoctorDTO {
  specialty: string;
  medicalLicenseNumber: string;
  hospitalOrClinic: string;
  gender: string;
  address: string;
}

export interface UserSignupDTO {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
  doctorDTO?: DoctorDTO;
}

export interface LoginUserDTO {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/auth';

  constructor(private http: HttpClient) {}

  registerDoctor(payload: UserSignupDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, payload);
  }

  login(payload: LoginUserDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, payload);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('expiresIn');
  }

  isLoggedIn(): boolean {
    return typeof window !== 'undefined' && !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  }

  /**
   * Try to return user info from token (if JWT) by decoding payload.
   * If no token or not a JWT, returns null.
   */
  getUserInfo(): any | null {
    const token = this.getToken();
    if (!token) return null;

    // JWTs have three parts separated by '.' ; payload is the 2nd part
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    try {
      const payload = parts[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodeURIComponent(escape(json)));
    } catch (e) {
      return null;
    }
  }
}

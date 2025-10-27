import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ✅ DTOs
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

  // ✅ Auth
  login(payload: LoginUserDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, payload);
  }

  registerDoctor(payload: UserSignupDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, payload);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('expiresIn');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ✅ Decode JWT Payload (ancienne méthode utilisée par le front)
  getUserInfo(): any | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = atob(token.split('.')[1]);
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }

  // ✅ Nouveaux endpoints /me & update
  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  updateMe(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/me`, data);
  }

  uploadProfileImage(formData: FormData): Observable<{ imageUrl: string }> {
  return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/me/avatar`, formData);
}


handleExpiredToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('expiresIn');
}

}

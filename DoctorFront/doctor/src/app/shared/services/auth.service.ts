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
}

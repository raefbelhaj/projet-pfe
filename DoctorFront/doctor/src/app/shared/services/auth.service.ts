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
  doctorDTO: DoctorDTO;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/auth';

  constructor(private http: HttpClient) { }

  registerDoctor(payload: UserSignupDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, payload);
  }
}

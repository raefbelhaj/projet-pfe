import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// 🧠 Interface : adapte selon les champs renvoyés par ton backend Spring Boot
export interface Doctor {
  id: number | string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  specialty?: string;
  medicalLicenseNumber?: string;
  hospitalOrClinic?: string;
  gender?: string;
  address?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private http = inject(HttpClient);

  // ⚙️ Mets ici ton URL backend
  private baseUrl = 'http://localhost:8000'; 

  // 🔹 Récupérer la liste des docteurs depuis ton API Spring
  getDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.baseUrl}/auth/get/Doctors`);
  }
}

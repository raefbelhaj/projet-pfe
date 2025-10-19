import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// ⬇️ adapte ce chemin si besoin (exemples: '../../shared/services/doctor.service')
// Update the path below if your doctor.service file is located elsewhere
import { DoctorService, Doctor } from '../shared/services/doctor.service';

@Component({
  selector: 'app-docteurs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './docteurs.component.html',
  styleUrls: ['./docteurs.component.css']
})
export class DocteursComponent {
  private doctorService = inject(DoctorService);

  doctors: Doctor[] = [];
  loading = true;
  error = '';
  q = '';

  ngOnInit() {
    this.doctorService.getDoctors().subscribe({
      next: (res) => { this.doctors = res; this.loading = false; },
      error: () => { this.error = 'Impossible de charger la liste des docteurs.'; this.loading = false; }
    });
  }

  filteredDoctors() {
    const query = this.q.toLowerCase().trim();
    if (!query) return this.doctors;
    return this.doctors.filter(d =>
      (d.fullName ?? '').toLowerCase().includes(query) ||
      (d.specialty ?? '').toLowerCase().includes(query) ||
      (d.hospitalOrClinic ?? '').toLowerCase().includes(query)
    );
  }
}

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { AuthService, UserSignupDTO } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-doctor-register',
  standalone: true,
  templateUrl: './doctor-register.component.html',
  styleUrls: ['./doctor-register.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ]
})
export class DoctorRegisterComponent {
  doctorRegisterForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.doctorRegisterForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      specialty: ['', Validators.required],
      medicalLicenseNumber: ['', Validators.required],
      hospitalOrClinic: ['', Validators.required],
      gender: ['', Validators.required],
      address: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // Vérification des mots de passe
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  doctorRegister(): void {
    if (this.doctorRegisterForm.invalid) {
      this.errorMessage = "Veuillez remplir correctement le formulaire.";
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const fv = this.doctorRegisterForm.value;

    const doctorPayload: UserSignupDTO = {
      fullName: fv.fullName,
      email: fv.email,
      password: fv.password,
      phoneNumber: fv.phoneNumber,
      role: 'ROLE_DOCTOR',
      doctorDTO: {
        specialty: fv.specialty,
        medicalLicenseNumber: fv.medicalLicenseNumber,
        hospitalOrClinic: fv.hospitalOrClinic,
        gender: fv.gender,
        address: fv.address
      }
    };

    this.authService.registerDoctor(doctorPayload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.snackBar.open(res.message || 'Inscription réussie ✅', 'Fermer', { duration: 3000 });
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.isLoading = false;
        // Afficher le message du backend si disponible
        this.errorMessage = err.error?.message || 'Erreur lors de l’inscription';
      }
    });
  }
}

import { PatientRegisterComponent } from "./patient-register/patient-register.component";
import {  DoctorRegisterComponent } from "./doctor-register/doctor-register.component";
import { OrganizationRegisterComponent } from "./organization-register/organization-register.component";
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs'

@Component({
  selector: 'app-sign-up',
  standalone: true,
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  imports: [
    MatCardModule,
    MatTabsModule, // ✅ MatTabsModule doit être importé ici
    PatientRegisterComponent,
    OrganizationRegisterComponent,
    DoctorRegisterComponent
]
})
export class SignUpComponent {

}

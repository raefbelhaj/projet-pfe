import { Routes } from '@angular/router';
import { SignUpComponent } from './modules/core/sign-up/sign-up.component';
import { LoginComponent } from './modules/core/login/login.component';
import { HomeComponent } from './modules/home/home.component';
import { PatientRegisterComponent } from './modules/core/sign-up/patient-register/patient-register.component';
import { DoctorRegisterComponent,  } from './modules/core/sign-up/doctor-register/doctor-register.component';
import { OrganizationRegisterComponent } from './modules/core/sign-up/organization-register/organization-register.component';


export const routes: Routes = [
        { path: '', redirectTo: 'auth/signup', pathMatch: 'full' },
        { path: 'auth/signup', component: SignUpComponent },
        { path: 'auth/signin', component: LoginComponent },
        { path: 'home', component: HomeComponent },
        { path: 'auth/patient-register', component: PatientRegisterComponent },
        { path: 'auth/doctor-register', component: DoctorRegisterComponent },
        { path: 'auth/organization-register', component: OrganizationRegisterComponent },




      
];

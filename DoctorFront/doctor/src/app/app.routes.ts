import { Routes } from '@angular/router';
import { SignUpComponent } from './modules/core/sign-up/sign-up.component';
import { LoginComponent } from './modules/core/login/login.component';
import { HomeComponent } from './modules/home/home.component';
import { PatientRegisterComponent } from './modules/core/sign-up/patient-register/patient-register.component';
import { DoctorRegisterComponent } from './modules/core/sign-up/doctor-register/doctor-register.component';
import { OrganizationRegisterComponent } from './modules/core/sign-up/organization-register/organization-register.component';

// nouveaux imports
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AccueilComponent } from './pages/accueil.component';
import { ProfilComponent } from './pages/profil.component';
import { DocteursComponent } from './pages/docteurs.component';
import { MessagesComponent } from './pages/messages.component';
import { authGuard } from './shared/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/signup', pathMatch: 'full' },

  // --- Auth routes ---
  { path: 'auth/signup', component: SignUpComponent },
  { path: 'auth/signin', component: LoginComponent },
  { path: 'auth/patient-register', component: PatientRegisterComponent },
  { path: 'auth/doctor-register', component: DoctorRegisterComponent },
  { path: 'auth/organization-register', component: OrganizationRegisterComponent },

  // --- Zone "app" avec navbar après login ---
  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'accueil' },
      { path: 'accueil',  component: AccueilComponent },
      { path: 'profil',   component: ProfilComponent },
      { path: 'docteurs', component: DocteursComponent },
      { path: 'messages', component: MessagesComponent },
    ]
  },

  // --- Page home existante si tu veux la garder séparée ---
  { path: 'home', component: HomeComponent },

  // --- Redirection par défaut ---
  { path: '**', redirectTo: 'auth/signin' }
];

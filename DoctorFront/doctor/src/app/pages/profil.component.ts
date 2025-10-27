import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../shared/services/auth.service';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule, 
    MatButtonModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatDividerModule,
    MatIconModule
  ],
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent implements OnInit {

  user: any = null;
  editMode = false;

  selectedFile: File | null = null;
  previewUrl: string | null = null;

  formData = {
    fullName: '',
    phoneNumber: '',
    address: '',
    specialty: '',
    bio: ''
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  /**
   * ✅ Charge le profil utilisateur
   */
  loadUserProfile(): void {
    this.authService.getMe().subscribe({
      next: (res) => {
        this.user = res;
        
        // Pré-remplir le formulaire
        this.formData = {
          fullName: res.fullName || '',
          phoneNumber: res.phoneNumber || '',
          address: res.address || '',
          specialty: res.specialty || '',
          bio: res.bio || ''
        };
      },
      error: (err) => {
        console.error('Erreur chargement profil:', err);
      }
    });
  }

  /**
   * ✅ Active le mode édition
   */
  enableEdit(): void {
    this.editMode = true;
  }

  /**
   * ✅ Sauvegarde les modifications du profil
   */
  saveProfile(): void {
    this.authService.updateMe(this.formData).subscribe({
      next: (updated) => {
        this.user = updated;
        this.editMode = false;
        
        // Notification succès (vous pouvez utiliser un SnackBar Angular Material)
        this.showNotification('✅ Profil mis à jour avec succès !');
      },
      error: (err) => {
        console.error('Erreur mise à jour profil:', err);
        this.showNotification('❌ Erreur lors de la mise à jour', 'error');
      }
    });
  }

  /**
   * ✅ Gère la sélection d'un fichier image
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // Validation du type de fichier
    if (!file.type.startsWith('image/')) {
      this.showNotification('⚠️ Veuillez sélectionner une image', 'warning');
      return;
    }

    // Validation de la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.showNotification('⚠️ L\'image est trop volumineuse (max 5MB)', 'warning');
      return;
    }

    this.selectedFile = file;

    // Prévisualisation
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  /**
   * ✅ Upload l'image de profil
   */
  uploadImage(): void {
    if (!this.selectedFile) {
      return;
    }

    const formData = new FormData();
    formData.append('image', this.selectedFile);

    this.authService.uploadProfileImage(formData).subscribe({
      next: (res) => {
        // Mise à jour de l'URL de l'image
        if (res.imageUrl) {
          // Nettoyer l'URL si nécessaire
          this.user.profileImage = res.imageUrl.replace('http://localhost:8000/', '');
        }

        // Réinitialiser les états
        this.previewUrl = null;
        this.selectedFile = null;

        this.showNotification('📸 Photo de profil mise à jour !');
      },
      error: (err) => {
        console.error('Erreur upload image:', err);
        this.showNotification('❌ Erreur lors de l\'upload de l\'image', 'error');
      }
    });
  }

  /**
   * ✅ Affiche une notification (peut être remplacé par MatSnackBar)
   */
  private showNotification(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
    // TODO: Implémenter avec MatSnackBar pour une meilleure UX
    alert(message);
  }

  /**
   * ✅ Annule l'édition et réinitialise le formulaire
   */
  cancelEdit(): void {
    this.editMode = false;
    this.loadUserProfile(); // Recharge les données originales
  }
}
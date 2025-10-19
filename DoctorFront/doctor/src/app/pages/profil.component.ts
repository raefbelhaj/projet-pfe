import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../shared/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profil.component.html'
})
export class ProfilComponent implements OnInit {
  user: any | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getUserInfo();
  }
}

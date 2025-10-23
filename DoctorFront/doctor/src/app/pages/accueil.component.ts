// src/app/accueil/accueil.component.ts
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import {
  PostService,
  Post,
  Comment,
  ReactionSummary
} from '../shared/services/post.service';

import { CurrentUserService } from '../shared/services/current-user.service';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent {
  // Services
  private postSvc = inject(PostService);
  private platformId = inject(PLATFORM_ID);
  private currentUser = inject(CurrentUserService);

  // Etat UI
  posts: Post[] = [];
  content = '';

  // Données associées aux posts
  comments: Record<number, Comment[]> = {};
  newComment: Record<number, string> = {};
  reactions: Record<number, ReactionSummary> = {};

  // Evite les doubles abonnements WS pour les réactions
  private reactionsSubscribed = new Set<number>();

  // Utilisateur courant (décodé depuis le JWT)
  me = this.currentUser.get(); // type: CurrentUser | null

  ngOnInit() {
    // Connecter le WS uniquement au navigateur
    if (isPlatformBrowser(this.platformId)) {
      this.postSvc.connect();
    }

    // Charger la liste des posts (HTTP)
    this.postSvc.list().subscribe({
      next: (list) => {
        this.posts = list.sort((a, b) =>
          (b.createdAt || '').localeCompare(a.createdAt || '')
        );
        // Pour chaque post, charger le résumé des réactions et brancher le flux une seule fois
        this.posts.forEach((p) => this.loadReactions(p));
      }
    });

    // Ecouter les nouveaux posts (temps réel)
    this.postSvc.post$.subscribe((p) => {
      if (!this.posts.some((x) => x.id === p.id)) {
        this.posts = [p, ...this.posts];
      }
      this.loadReactions(p);
    });
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.postSvc.disconnect();
    }
  }

  // ---------- Actions ----------
  publish() {
    if (!this.me) return; // pas connecté / token invalide

    const text = this.content.trim();
    if (!text) return;

    const p: Post = {
      authorName: this.me.name ?? this.me.email ?? 'Utilisateur',
      authorSpecialty: this.me.specialty,
      content: text
    };

    this.postSvc.create(p).subscribe({
      next: (saved) => {
        this.content = '';
        if (!this.posts.some((x) => x.id === saved.id)) {
          this.posts = [saved, ...this.posts];
        }
        this.loadReactions(saved);
      }
    });
  }

  toggleComments(p: Post) {
    const id = p.id!;
    if (!this.comments[id]) {
      // 1) charger l’historique
      this.postSvc.listComments(id).subscribe((list) => (this.comments[id] = list));
      // 2) brancher le flux temps réel
      this.postSvc.streamComments(id).subscribe((c) => {
        this.comments[id] = [...(this.comments[id] || []), c];
      });
    }
  }

  addComment(p: Post) {
    if (!this.me) return;

    const id = p.id!;
    const text = (this.newComment[id] || '').trim();
    if (!text) return;

    const c: Partial<Comment> = {
      userId: this.me.id,
      userName: this.me.name ?? this.me.email ?? 'Utilisateur',
      content: text
    };

    this.postSvc.addComment(id, c).subscribe({
      next: () => (this.newComment[id] = '')
    });
  }

  loadReactions(p: Post) {
    if (!this.me) return;

    const id = p.id!;
    // 1) résumé initial via HTTP
    this.postSvc.getReactions(id, this.me.id).subscribe((sum) => {
      this.reactions[id] = sum;
    });

    // 2) abonnement WS (une seule fois par post)
    if (!this.reactionsSubscribed.has(id)) {
      this.reactionsSubscribed.add(id);
      this.postSvc.streamReactions(id).subscribe((s) => (this.reactions[id] = s));
    }
  }

  react(p: Post, type: 'LIKE' | 'CLAP' | 'INSIGHTFUL') {
    if (!this.me) return;

    const id = p.id!;
    this.postSvc
      .toggleReaction(id, type, this.me.id)
      .subscribe((s) => (this.reactions[id] = s));
  }
}

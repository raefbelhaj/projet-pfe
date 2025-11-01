import { Component, inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDivider } from "@angular/material/divider";

import { PostService, Post, Comment, ReactionSummary } from '../shared/services/post.service';
import { AuthService } from '../shared/services/auth.service';

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
    MatInputModule,
    MatDivider
  ],
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent implements OnInit, OnDestroy {

  private postSvc = inject(PostService);
  private platformId = inject(PLATFORM_ID);
  private authSvc = inject(AuthService);

  me: any = null;

  posts: Post[] = [];
  content = '';
  selectedImage: string | null = null;
  expandComposer = false;

  comments: Record<number, Comment[]> = {};
  newComment: Record<number, string> = {};
  reactions: Record<number, ReactionSummary> = {};
  private reactionsSubscribed = new Set<number>();

  ngOnInit() {
    // 🧠 Récupère les infos du user connecté
    this.authSvc.getMe().subscribe(res => {
      this.me = res;

      // Stocke pour les notifs temps réel
      if (this.me?.fullName) {
        localStorage.setItem('userName', this.me.fullName);
      }
      if (this.me?.id) {
        localStorage.setItem('userId', this.me.id);
      }
    });

    // Active les WebSockets (client STOMP)
    if (isPlatformBrowser(this.platformId)) {
      this.postSvc.connect();
    }

    // Charge les posts existants
    this.postSvc.list().subscribe({
      next: (list) => {
        this.posts = list.sort((a, b) =>
          (b.createdAt || '').localeCompare(a.createdAt || '')
        );

        this.posts.forEach((p) => {
          this.loadReactions(p);
          this.initComments(p);
        });
      }
    });

    // Écoute les nouveaux posts temps réel
    this.postSvc.post$.subscribe((p) => {
      if (!this.posts.some((x) => x.id === p.id)) {
        this.posts = [p, ...this.posts];
      }
      this.loadReactions(p);
      this.initComments(p);
    });
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.postSvc.disconnect();
    }
  }

  /** ==============================
   *  📸 Gestion d’image de post
   * =============================== */
  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('L’image est trop volumineuse (max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedImage = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.selectedImage = null;
  }

  /** ==============================
   *  📝 Publication d’un nouveau post
   * =============================== */
  publish() {
    if (!this.me) return;

    const text = this.content.trim();
    if (!text && !this.selectedImage) return;

    const p: Post = {
      userId: this.me.id, // ✅ ajouté
      authorName: this.me.fullName,
      authorSpecialty: this.me.specialty || undefined,
      content: text,
      imageBase64: this.selectedImage || undefined
    };

    this.postSvc.create(p).subscribe({
      next: (saved) => {
        this.content = '';
        this.selectedImage = null;

        if (!this.posts.some((x) => x.id === saved.id)) {
          this.posts = [saved, ...this.posts];
        }

        this.loadReactions(saved);
        this.initComments(saved);
      },
      error: (err) => console.error('Erreur post:', err)
    });
  }

  /** ==============================
   *  💬 Gestion des commentaires
   * =============================== */
  toggleComments(p: Post) {
    const id = p.id!;
    if (!this.comments[id]) {
      this.initComments(p);
    }
  }

  private initComments(p: Post) {
    const id = p.id!;
    this.comments[id] = [];

    // Charge les anciens commentaires
    this.postSvc.listComments(id).subscribe((list) => {
      this.comments[id] = list;
    });

    // Écoute en temps réel
    this.postSvc.streamComments(id).subscribe((c) => {
      this.comments[id] = [...(this.comments[id] || []), c];
    });
  }

  addComment(p: Post) {
    if (!this.me) return;

    const id = p.id!;
    const text = (this.newComment[id] || '').trim();
    if (!text) return;

    const c: Partial<Comment> = {
      userId: this.me.id,
      userName: this.me.fullName,
      content: text
    };

    this.postSvc.addComment(id, c).subscribe({
      next: () => (this.newComment[id] = ''),
      error: (err) => console.error('Erreur ajout commentaire:', err)
    });
  }

  /** ==============================
   *  👍 Réactions (Like / Clap / Insightful)
   * =============================== */
  loadReactions(p: Post) {
    if (!this.me) return;
    const id = p.id!;

    this.postSvc.getReactions(id, this.me.fullName).subscribe((sum) => {
      this.reactions[id] = sum;
    });

    if (!this.reactionsSubscribed.has(id)) {
      this.reactionsSubscribed.add(id);
      this.postSvc.streamReactions(id).subscribe((s) => (this.reactions[id] = s));
    }
  }

  react(p: Post, type: 'LIKE' | 'CLAP' | 'INSIGHTFUL') {
    if (!this.me) return;

    const id = p.id!;
    this.postSvc.toggleReaction(id, type, this.me.fullName).subscribe({
      next: (s) => (this.reactions[id] = s),
      error: (err) => console.error('Erreur réaction:', err)
    });
  }
}

import { Component, inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { PostService, Post, Comment, ReactionSummary } from '../shared/services/post.service';
import { AuthService } from '../shared/services/auth.service';
import { MatDivider } from "@angular/material/divider";

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
  selectedImage: string | null = null; // ✅ Image en base64
  expandComposer = false

  comments: Record<number, Comment[]> = {};
  newComment: Record<number, string> = {};
  reactions: Record<number, ReactionSummary> = {};
  private reactionsSubscribed = new Set<number>();

  ngOnInit() {
    this.authSvc.getMe().subscribe(res => {
      this.me = res;
    });

    if (isPlatformBrowser(this.platformId)) {
      this.postSvc.connect();
    }

    this.postSvc.list().subscribe({
      next: (list) => {
        this.posts = list.sort((a, b) =>
          (b.createdAt || '').localeCompare(a.createdAt || '')
        );
        this.posts.forEach((p) => this.loadReactions(p));
      }
    });

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

  // ✅ Gestion de la sélection d'image
  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    
    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image est trop volumineuse (max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedImage = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  // ✅ Supprimer l'image sélectionnée
  removeImage() {
    this.selectedImage = null;
  }

  // ✅ Publier avec image
  publish() {
    if (!this.me) return;

    const text = this.content.trim();
    if (!text && !this.selectedImage) return;

    const p: Post = {
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
      }
    });
  }

  toggleComments(p: Post) {
    const id = p.id!;
    if (!this.comments[id]) {
      this.postSvc.listComments(id).subscribe((list) => (this.comments[id] = list));
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
      userName: this.me.fullName,
      content: text
    };

    this.postSvc.addComment(id, c).subscribe({
      next: () => (this.newComment[id] = '')
    });
  }

  loadReactions(p: Post) {
    if (!this.me) return;

    const id = p.id!;

    this.postSvc.getReactions(id, this.me.id).subscribe((sum) => {
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
    this.postSvc.toggleReaction(id, type, this.me.id).subscribe((s) => (this.reactions[id] = s));
  }
}
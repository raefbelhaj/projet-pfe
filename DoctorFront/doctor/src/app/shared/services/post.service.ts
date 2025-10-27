import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

import SockJS from 'sockjs-client';
import { RxStomp, IMessage } from '@stomp/rx-stomp';

/* ✅ Interface Post avec support image */
export interface Post {
  id?: number;
  authorName: string;
  authorSpecialty?: string;
  content: string;
  imageBase64?: string;  // ✅ Image en base64
  createdAt?: string;
}

export interface Comment {
  id?: number;
  post?: Post | null;
  userId: string;
  userName: string;
  content: string;
  createdAt?: string;
}

export interface ReactionSummary {
  like: number;
  clap: number;
  insightful: number;
  meLike: boolean;
  meClap: boolean;
  meInsightful: boolean;
}

@Injectable({ providedIn: 'root' })
export class PostService {

  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private api = `${environment.apiUrl}/api/posts`;

  /* WebSocket Subjects */
  private postStream$ = new Subject<Post>();
  post$ = this.postStream$.asObservable();

  private commentStreams = new Map<number, Subject<Comment>>();
  private reactionStreams = new Map<number, Subject<ReactionSummary>>();

  private rxStomp?: RxStomp;
  private isConnected = false;  // ✅ Flag pour éviter les connexions multiples

  // ---------- HTTP ----------
  
  /** Récupère tous les posts */
  list(): Observable<Post[]> {
    return this.http.get<Post[]>(this.api);
  }

  /** 
   * ✅ Crée un nouveau post (avec ou sans image)
   * L'image est envoyée en base64 dans imageBase64
   */
  create(p: Post): Observable<Post> {
    return this.http.post<Post>(this.api, p);
  }

  /** Récupère les commentaires d'un post */
  listComments(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.api}/${postId}/comments`);
  }

  /** Ajoute un commentaire à un post */
  addComment(postId: number, c: Partial<Comment>): Observable<Comment> {
    return this.http.post<Comment>(`${this.api}/${postId}/comments`, c);
  }

  /** Récupère le résumé des réactions d'un post pour un utilisateur */
  getReactions(postId: number, userId: string): Observable<ReactionSummary> {
    return this.http.get<ReactionSummary>(
      `${this.api}/${postId}/reactions`, 
      { params: { userId } }
    );
  }

  /** Toggle une réaction sur un post */
  toggleReaction(
    postId: number, 
    type: 'LIKE' | 'CLAP' | 'INSIGHTFUL', 
    userId: string
  ): Observable<ReactionSummary> {
    return this.http.post<ReactionSummary>(
      `${this.api}/${postId}/reactions/${type}/toggle`, 
      null, 
      { params: { userId } }
    );
  }

  // ---------- WebSocket ----------
  
  /** 
   * ✅ Établit la connexion WebSocket
   * - Se connecte uniquement côté navigateur
   * - Évite les connexions multiples
   * - Écoute les nouveaux posts en temps réel
   */
  connect() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.isConnected || this.rxStomp?.active) return;

    this.rxStomp = new RxStomp();
    this.rxStomp.configure({
      webSocketFactory: () => new SockJS(environment.wsUrl) as any,
      reconnectDelay: 3000,
      debug: (msg: string) => {
        // ✅ Logs pour debug (à retirer en prod si besoin)
        if (msg.includes('ERROR')) console.error('WebSocket:', msg);
      }
    });

    this.rxStomp.activate();
    this.isConnected = true;

    // ✅ Écoute les nouveaux posts diffusés via WebSocket
    this.rxStomp.watch('/topic/posts').subscribe({
      next: (msg: IMessage) => {
        try {
          const post: Post = JSON.parse(msg.body);
          this.postStream$.next(post);
        } catch (error) {
          console.error('Erreur parsing post WebSocket:', error);
        }
      },
      error: (err) => console.error('Erreur WebSocket posts:', err)
    });
  }

  /** 
   * ✅ Stream en temps réel des commentaires d'un post
   * - Crée un Subject unique par postId
   * - Réutilise le Subject existant si déjà créé
   */
  streamComments(postId: number): Subject<Comment> {
    this.connect();
    
    if (!this.commentStreams.has(postId)) {
      const subj = new Subject<Comment>();
      this.commentStreams.set(postId, subj);
      
      this.rxStomp!.watch(`/topic/posts/${postId}/comments`).subscribe({
        next: (msg) => {
          try {
            const comment: Comment = JSON.parse(msg.body);
            subj.next(comment);
          } catch (error) {
            console.error('Erreur parsing comment:', error);
          }
        },
        error: (err) => console.error(`Erreur stream comments ${postId}:`, err)
      });
    }
    
    return this.commentStreams.get(postId)!;
  }

  /** 
   * ✅ Stream en temps réel des réactions d'un post
   * - Crée un Subject unique par postId
   * - Réutilise le Subject existant si déjà créé
   */
  streamReactions(postId: number): Subject<ReactionSummary> {
    this.connect();
    
    if (!this.reactionStreams.has(postId)) {
      const subj = new Subject<ReactionSummary>();
      this.reactionStreams.set(postId, subj);
      
      this.rxStomp!.watch(`/topic/posts/${postId}/reactions`).subscribe({
        next: (msg) => {
          try {
            const summary: ReactionSummary = JSON.parse(msg.body);
            subj.next(summary);
          } catch (error) {
            console.error('Erreur parsing reactions:', error);
          }
        },
        error: (err) => console.error(`Erreur stream reactions ${postId}:`, err)
      });
    }
    
    return this.reactionStreams.get(postId)!;
  }

  /** 
   * ✅ Déconnexion propre du WebSocket
   * - Appelé dans ngOnDestroy du component
   * - Nettoie les ressources
   */
  disconnect() {
    if (this.rxStomp?.active) {
      this.rxStomp.deactivate();
      this.isConnected = false;
      
      // ✅ Nettoyage des streams
      this.commentStreams.clear();
      this.reactionStreams.clear();
    }
  }
}
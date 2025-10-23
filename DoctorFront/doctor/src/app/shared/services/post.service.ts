import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

import SockJS from 'sockjs-client';
import { RxStomp, IMessage } from '@stomp/rx-stomp';

// ---- Vos interfaces inchangées ----
export interface Post {
  id?: number;
  authorName: string;
  authorSpecialty?: string;
  content: string;
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

  private postStream$ = new Subject<Post>();
  post$ = this.postStream$.asObservable();

  private commentStreams = new Map<number, Subject<Comment>>();
  private reactionStreams = new Map<number, Subject<ReactionSummary>>();

  // ✅ RxStomp gère la connexion, reconnexion et les souscriptions différées
  private rxStomp?: RxStomp;

  // ---------- HTTP ----------
  list(): Observable<Post[]> { return this.http.get<Post[]>(this.api); }
  create(p: Post): Observable<Post> { return this.http.post<Post>(this.api, p); }

  listComments(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.api}/${postId}/comments`);
  }
  addComment(postId: number, c: Partial<Comment>): Observable<Comment> {
    return this.http.post<Comment>(`${this.api}/${postId}/comments`, c);
  }

  getReactions(postId: number, userId: string): Observable<ReactionSummary> {
    return this.http.get<ReactionSummary>(`${this.api}/${postId}/reactions`, { params: { userId } });
  }
  toggleReaction(postId: number, type: 'LIKE'|'CLAP'|'INSIGHTFUL', userId: string): Observable<ReactionSummary> {
    return this.http.post<ReactionSummary>(`${this.api}/${postId}/reactions/${type}/toggle`, null, { params: { userId } });
  }

  // ---------- WS ----------
  connect() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.rxStomp?.active) return;

    this.rxStomp = new RxStomp();
    this.rxStomp.configure({
      webSocketFactory: () => new SockJS(environment.wsUrl) as any,
      reconnectDelay: 3000,
      // debug: (msg) => console.log('[RxStomp]', msg),
    });

    this.rxStomp.activate();

    // ✅ On peut "watch" immédiatement : la souscription sera effective à la connexion
    this.rxStomp.watch('/topic/posts').subscribe((msg: IMessage) => {
      this.postStream$.next(JSON.parse(msg.body));
    });
  }

  streamComments(postId: number): Subject<Comment> {
    this.connect(); // s’assure que rxStomp est actif
    if (!this.commentStreams.has(postId)) {
      const subj = new Subject<Comment>();
      this.commentStreams.set(postId, subj);
      this.rxStomp!.watch(`/topic/posts/${postId}/comments`)
        .subscribe((msg) => subj.next(JSON.parse(msg.body)));
    }
    return this.commentStreams.get(postId)!;
  }

  streamReactions(postId: number): Subject<ReactionSummary> {
    this.connect(); // s’assure que rxStomp est actif
    if (!this.reactionStreams.has(postId)) {
      const subj = new Subject<ReactionSummary>();
      this.reactionStreams.set(postId, subj);
      this.rxStomp!.watch(`/topic/posts/${postId}/reactions`)
        .subscribe((msg) => subj.next(JSON.parse(msg.body)));
    }
    return this.reactionStreams.get(postId)!;
  }

  disconnect() { this.rxStomp?.deactivate(); }
}

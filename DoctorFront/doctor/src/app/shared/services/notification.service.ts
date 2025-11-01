import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import SockJS from 'sockjs-client';
import { RxStomp, IMessage } from '@stomp/rx-stomp';

export interface NotificationDTO {
  postId: number;
  toUserId: string;
  fromUserId: string;
  fromUserName: string;
  content: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private platformId = inject(PLATFORM_ID);
  private rxStomp?: RxStomp;
  private isConnected = false;

  private notif$ = new Subject<NotificationDTO>();
  notifications = this.notif$.asObservable();

  connect() {
    if (!isPlatformBrowser(this.platformId) || this.isConnected) return;

    this.rxStomp = new RxStomp();
    this.rxStomp.configure({
      webSocketFactory: () => new SockJS(environment.wsUrl) as any,
      reconnectDelay: 3000,
      debug: (msg) => console.log('[WS]', msg),
    });

    this.rxStomp.activate();
    this.isConnected = true;

    // ✅ Écoute toutes les notifications
    this.rxStomp.watch('/topic/notifications').subscribe({
      next: (msg: IMessage) => {
        try {
          const notif = JSON.parse(msg.body) as NotificationDTO;
          const myId = localStorage.getItem('userId');

          // 🔹 Filtrage local
          if (notif.toUserId === myId) {
            console.log('🔔 Notification reçue:', notif);
            this.notif$.next(notif);
          } else {
            console.log('ℹ️ Ignoré (pour un autre userId)', notif.toUserId);
          }
        } catch (e) {
          console.error('Erreur parsing notif', e);
        }
      },
      error: (err) => console.error('Erreur WS', err),
    });
  }

  disconnect() {
    if (this.rxStomp?.active) {
      this.rxStomp.deactivate();
      this.isConnected = false;
    }
  }
}

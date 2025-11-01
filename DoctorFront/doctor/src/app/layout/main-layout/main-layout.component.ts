import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BreakpointObserver, Breakpoints, LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationService, NotificationDTO } from '../../shared/services/notification.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private breakpoint = inject(BreakpointObserver);
  private notifSvc = inject(NotificationService);

  isMobile = signal(false);
  notifications: NotificationDTO[] = [];
  newNotifCount = signal(0);

  constructor() {
    this.breakpoint.observe([Breakpoints.Handset]).subscribe(res => {
      this.isMobile.set(res.matches);
    });
  }

  ngOnInit() {
    this.notifSvc.connect();
    this.notifSvc.notifications.subscribe((notif) => {
      this.notifications.unshift(notif);
      this.newNotifCount.set(this.newNotifCount() + 1);
    });
  }

  clearNotifications() {
    this.newNotifCount.set(0);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    this.notifSvc.disconnect();
  }
}

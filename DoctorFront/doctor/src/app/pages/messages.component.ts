import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `<h1>Messages</h1><p>Messagerie à venir…</p>`
})
export class MessagesComponent {}

(window as any).global = window;
(globalThis as any).global = globalThis;

// le bootstrap Angular en dessous...



import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig , )
  .catch((err) => console.error(err));

  
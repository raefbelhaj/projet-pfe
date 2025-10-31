import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { 
  MedicalAssistantService, 
  Message, 
  ExampleCase 
// Update the import path below if the service exists elsewhere, for example:
} from '../../shared/services/medical-assistant.service';
// Or create the file at the expected path if it does not exist.

@Component({
  selector: 'app-medical-assistant',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './medical-assistant.component.html',
  styleUrls: ['./medical-assistant.component.css']
})
export class MedicalAssistantComponent implements OnInit, AfterViewChecked {
  
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  
  // États
  symptoms = '';
  messages: Message[] = [];
  isLoading = false;
  examples: ExampleCase[] = [];
  apiStatus = 'checking';
  
  // Auto-scroll
  private shouldScroll = false;

  constructor(private assistantService: MedicalAssistantService) {}

  ngOnInit(): void {
    // Vérifier l'état de l'API
    this.assistantService.checkHealth().subscribe(status => {
      this.apiStatus = status.model_available ? 'online' : 'offline';
    });

    // Charger les exemples
    this.assistantService.getExamples().subscribe(examples => {
      this.examples = examples;
    });

    // S'abonner à l'historique
    this.assistantService.conversation$.subscribe(history => {
      this.messages = history;
      this.shouldScroll = true;
    });

    // S'abonner au chargement
    this.assistantService.isLoading$.subscribe(loading => {
      this.isLoading = loading;
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  /**
   * 🩺 Analyser les symptômes
   */
  analyzeSymptoms(): void {
    if (!this.symptoms.trim()) return;

    this.assistantService.analyzeSymptoms(this.symptoms).subscribe({
      next: () => {
        this.symptoms = '';
      },
      error: (err) => {
        console.error('Erreur analyse:', err);
        alert('❌ Erreur lors de l\'analyse. Veuillez réessayer.');
      }
    });
  }

  /**
   * 📨 Envoyer un message de suivi
   */
  sendMessage(): void {
    if (!this.symptoms.trim()) return;

    this.assistantService.chatWithAssistant(this.symptoms).subscribe({
      next: () => {
        this.symptoms = '';
      },
      error: (err) => {
        console.error('Erreur envoi message:', err);
        alert('❌ Erreur lors de l\'envoi. Veuillez réessayer.');
      }
    });
  }

  /**
   * 📝 Utiliser un exemple
   */
  useExample(example: ExampleCase): void {
    this.symptoms = example.symptoms;
  }

  /**
   * 🔄 Nouvelle conversation
   */
  newConversation(): void {
    if (this.messages.length > 0) {
      const confirm = window.confirm('Êtes-vous sûr de vouloir démarrer une nouvelle conversation ?');
      if (!confirm) return;
    }
    
    this.assistantService.resetConversation();
    this.symptoms = '';
  }

  /**
   * 📋 Copier le texte
   */
  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Vous pouvez ajouter un MatSnackBar ici
      console.log('✅ Texte copié');
    });
  }

  /**
   * 📥 Exporter la conversation
   */
  exportConversation(): void {
    const text = this.messages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consultation-${new Date().toISOString()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * 🔽 Scroll vers le bas
   */
  private scrollToBottom(): void {
    try {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = 
          this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Erreur scroll:', err);
    }
  }

  /**
   * ⌨️ Gérer l'entrée clavier
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (this.messages.length === 0) {
        this.analyzeSymptoms();
      } else {
        this.sendMessage();
      }
    }
  }

  /**
   * 🎨 Obtenir la classe CSS du message
   */
  getMessageClass(role: string): string {
    return role === 'user' ? 'message-user' : 'message-assistant';
  }
}
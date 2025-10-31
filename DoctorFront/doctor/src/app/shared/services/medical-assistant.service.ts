import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * 🤖 Service Assistant Médical IA
 * Intégration avec Qwen/Qwen2.5-72B-Instruct via Hugging Face
 */

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface AnalysisRequest {
  symptoms: string;
  conversation_history?: Message[];
}

export interface AnalysisResponse {
  response: string;
  timestamp: string;
  model_used: string;
  tokens_used?: number;
}

export interface ExampleCase {
  title: string;
  symptoms: string;
}

@Injectable({
  providedIn: 'root'
})
export class MedicalAssistantService {
  
  private readonly API_URL = 'http://localhost:5001';
  
  // État de la conversation
  private conversationHistory$ = new BehaviorSubject<Message[]>([]);
  public conversation$ = this.conversationHistory$.asObservable();
  
  // État du chargement
  private loading$ = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.loading$.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * 🩺 Analyse les symptômes d'un patient
   * @param symptoms Description des symptômes
   * @returns Analyse médicale complète
   */
  analyzeSymptoms(symptoms: string): Observable<AnalysisResponse> {
    this.loading$.next(true);
    
    const request: AnalysisRequest = {
      symptoms,
      conversation_history: this.conversationHistory$.value
    };

    return this.http.post<AnalysisResponse>(`${this.API_URL}/analyze-symptoms`, request)
      .pipe(
        map(response => {
          // Ajouter à l'historique
          this.addToHistory('user', symptoms);
          this.addToHistory('assistant', response.response);
          
          this.loading$.next(false);
          return response;
        }),
        catchError(error => {
          console.error('Erreur analyse:', error);
          this.loading$.next(false);
          throw error;
        })
      );
  }

  /**
   * 💬 Continue la conversation avec l'assistant
   * @param message Message de suivi
   * @returns Réponse de l'assistant
   */
  chatWithAssistant(message: string): Observable<{ response: string; timestamp: string }> {
    this.loading$.next(true);
    
    const request = {
      message,
      conversation_history: this.conversationHistory$.value
    };

    return this.http.post<{ response: string; timestamp: string }>(
      `${this.API_URL}/chat`, 
      request
    ).pipe(
      map(response => {
        this.addToHistory('user', message);
        this.addToHistory('assistant', response.response);
        this.loading$.next(false);
        return response;
      }),
      catchError(error => {
        console.error('Erreur chat:', error);
        this.loading$.next(false);
        throw error;
      })
    );
  }

  /**
   * ⚡ Analyse rapide sans historique
   * @param symptoms Symptômes du patient
   * @returns Analyse immédiate
   */
  quickAnalysis(symptoms: string): Observable<{ response: string; timestamp: string }> {
    this.loading$.next(true);
    
    return this.http.post<{ response: string; timestamp: string }>(
      `${this.API_URL}/quick-analysis`,
      null,
      { params: { symptoms } }
    ).pipe(
      map(response => {
        this.loading$.next(false);
        return response;
      }),
      catchError(error => {
        console.error('Erreur analyse rapide:', error);
        this.loading$.next(false);
        throw error;
      })
    );
  }

  /**
   * 📚 Obtient des exemples de cas médicaux
   * @returns Liste d'exemples
   */
  getExamples(): Observable<ExampleCase[]> {
    return this.http.get<{ examples: ExampleCase[] }>(`${this.API_URL}/examples`)
      .pipe(
        map(response => response.examples),
        catchError(error => {
          console.error('Erreur récupération exemples:', error);
          return of([]);
        })
      );
  }

  /**
   * 🔄 Réinitialise la conversation
   */
  resetConversation(): void {
    this.conversationHistory$.next([]);
  }

  /**
   * 📝 Ajoute un message à l'historique
   */
  private addToHistory(role: 'user' | 'assistant', content: string): void {
    const history = this.conversationHistory$.value;
    history.push({
      role,
      content,
      timestamp: new Date()
    });
    this.conversationHistory$.next(history);
  }

  /**
   * 📋 Obtient l'historique de la conversation
   */
  getHistory(): Message[] {
    return this.conversationHistory$.value;
  }

  /**
   * ✅ Vérifie l'état de santé de l'API
   */
  checkHealth(): Observable<{ status: string; model_available: boolean }> {
    return this.http.get<{ status: string; model_available: boolean }>(
      `${this.API_URL}/health`
    ).pipe(
      catchError(error => {
        console.error('Service médical indisponible:', error);
        return of({ status: 'unavailable', model_available: false });
      })
    );
  }
}
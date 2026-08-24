import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../services/session.service';
import { CreateTaskSessionDto } from '../../core/models/session.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css'
})
export class TaskFormComponent implements OnInit {
  private sessionService = inject(SessionService);

  @Output() sessionCreated = new EventEmitter<void>();
  @Output() formClosed = new EventEmitter<void>();

  title: string = '';
  description: string = '';
  isScheduled: boolean = false;
  date: string = '';
  startTime: string = '';
  endTime: string = '';

  ngOnInit(): void {
    this.setDefaultDateTime();
  }

  // Ustawienie dzisiejszej daty, najbliższej pełnej godziny i 1h czasu trwania
  private setDefaultDateTime(): void {
    const now = new Date();
    
    // Zaokrąglenie w górę do najbliższej pełnej godziny
    const start = new Date(now);
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);

    // Godzina zakończenia: 1h później
    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    // Formatowanie daty YYYY-MM-DD z uwzględnieniem lokalnego czasu
    const year = start.getFullYear();
    const month = String(start.getMonth() + 1).padStart(2, '0');
    const day = String(start.getDate()).padStart(2, '0');

    this.date = `${year}-${month}-${day}`;
    this.startTime = start.toTimeString().substring(0, 5);
    this.endTime = end.toTimeString().substring(0, 5);
  }

  autoGrow(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }

  close(): void {
    this.formClosed.emit();
  }

  submit(): void {
    if (!this.title.trim()) return;

    const payload: CreateTaskSessionDto = {
      title: this.title.trim(),
      description: this.description?.trim() || undefined
    };

    if (this.isScheduled) {
      if (!this.date || !this.startTime || !this.endTime) {
        alert('Proszę uzupełnić datę i godziny planowanego zadania.');
        return;
      }

      const startIso = new Date(`${this.date}T${this.startTime}:00`).toISOString();
      const endIso = new Date(`${this.date}T${this.endTime}:00`).toISOString();

      if (new Date(endIso) <= new Date(startIso)) {
        alert('Czas zakończenia musi być późniejszy niż czas rozpoczęcia.');
        return;
      }

      payload.startTime = startIso;
      payload.endTime = endIso;
    }

    this.sessionService.createSession(payload).subscribe({
      next: () => {
        this.sessionCreated.emit();
      },
      error: (err) => {
        console.error('Błąd tworzenia zadania:', err);
        alert('Wystąpił błąd podczas tworzenia zadania.');
      }
    });
  }
}
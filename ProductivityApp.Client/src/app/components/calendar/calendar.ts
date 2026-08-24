import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../services/session.service';
import { TaskSession, TaskSessionStatus } from '../../core/models/session.model';

export interface DayColumn {
  date: Date;
  label: string;
  isToday: boolean;
  sessions: TaskSession[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class CalendarComponent implements OnInit {
  private sessionService = inject(SessionService);

  TaskSessionStatus = TaskSessionStatus;
  days = signal<DayColumn[]>([]);
  isLoading = signal<boolean>(true);

  activeMenuSessionId = signal<number | null>(null);

  reschedulingSession = signal<TaskSession | null>(null);
  rescheduleDate: string = '';
  rescheduleStartTime: string = '';
  rescheduleEndTime: string = '';

  ngOnInit(): void {
    this.setupDays();
    this.loadSessions(true); // Pierwsze ładowanie z flagą pokazania wskaźnika
  }

  setupDays(): void {
    const today = new Date();
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    this.days.set([
      { date: yesterday, label: 'Wczoraj', isToday: false, sessions: [] },
      { date: today, label: 'Dzisiaj', isToday: true, sessions: [] },
      { date: tomorrow, label: 'Jutro', isToday: false, sessions: [] }
    ]);
  }

  // Flaga showLoader decyduje, czy niszczyć widok kalendarza podczas pobierania danych
  loadSessions(showLoader: boolean = false): void {
    if (showLoader) {
      this.isLoading.set(true);
    }

    const currentDays = this.days();
    
    const startRange = new Date(currentDays[0].date);
    startRange.setHours(0, 0, 0, 0);

    const endRange = new Date(currentDays[2].date);
    endRange.setHours(23, 59, 59, 999);

    this.sessionService.getCalendarSessions(startRange.toISOString(), endRange.toISOString()).subscribe({
      next: (sessions) => {
        const updatedDays = currentDays.map(day => {
          const dayDateString = day.date.toDateString();
          return {
            ...day,
            sessions: sessions.filter(s => s.startTime && new Date(s.startTime).toDateString() === dayDateString)
          };
        });

        this.days.set(updatedDays);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Błąd ładowania sesji kalendarza:', err);
        this.isLoading.set(false);
      }
    });
  }

  toggleMenu(sessionId?: number, event?: Event): void {
    if (event) event.stopPropagation();
    if (!sessionId) return;
    
    this.activeMenuSessionId.update(current => current === sessionId ? null : sessionId);
  }

  closeMenu(): void {
    this.activeMenuSessionId.set(null);
  }

  // Płynna zmiana statusu bez migania i bez skoków scrolla
  changeStatus(session: TaskSession, status: TaskSessionStatus): void {
    if (!session.id) return;
    this.closeMenu();

    this.sessionService.updateStatus(session.id, status).subscribe({
      next: () => {
        // Zamiast przeładowywać wszystko z serwera, aktualizujemy stan w sygnale lokalnie
        this.days.update(columns => 
          columns.map(col => ({
            ...col,
            sessions: col.sessions.map(s => s.id === session.id ? { ...s, status } : s)
          }))
        );
      },
      error: (err) => console.error('Błąd zmiany statusu:', err)
    });
  }

  openRescheduleModal(session: TaskSession): void {
    this.closeMenu();
    this.reschedulingSession.set(session);

    if (session.startTime && session.endTime) {
      const start = new Date(session.startTime);
      const end = new Date(session.endTime);

      start.setDate(start.getDate() + 1);
      end.setDate(end.getDate() + 1);

      this.rescheduleDate = start.toISOString().substring(0, 10);
      this.rescheduleStartTime = start.toTimeString().substring(0, 5);
      this.rescheduleEndTime = end.toTimeString().substring(0, 5);
    } else {
      this.rescheduleDate = new Date().toISOString().substring(0, 10);
      this.rescheduleStartTime = '14:00';
      this.rescheduleEndTime = '15:00';
    }
  }

  closeRescheduleModal(): void {
    this.reschedulingSession.set(null);
  }

  submitReschedule(): void {
    const session = this.reschedulingSession();
    if (!session?.id || !this.rescheduleDate || !this.rescheduleStartTime || !this.rescheduleEndTime) return;

    const newStart = new Date(`${this.rescheduleDate}T${this.rescheduleStartTime}:00`);
    const newEnd = new Date(`${this.rescheduleDate}T${this.rescheduleEndTime}:00`);

    if (newEnd <= newStart) {
      alert('Czas zakończenia musi być późniejszy niż czas rozpoczęcia.');
      return;
    }

    this.sessionService.rescheduleSession(session.id, {
      newStartTime: newStart.toISOString(),
      newEndTime: newEnd.toISOString()
    }).subscribe({
      next: () => {
        this.closeRescheduleModal();
        this.loadSessions(false); // Ciche przeładowanie bez niszczenia DOM
      },
      error: (err) => {
        alert(err.error || 'Nie udało się przesunąć zadania.');
      }
    });
  }

  deleteSession(id?: number): void {
    if (!id) return;
    this.closeMenu();
    if (!confirm('Czy na pewno chcesz usunąć tę sesję?')) return;

    this.sessionService.deleteSession(id).subscribe({
      next: () => {
        // Usunięcie z widoku bez migania
        this.days.update(columns => 
          columns.map(col => ({
            ...col,
            sessions: col.sessions.filter(s => s.id !== id)
          }))
        );
      },
      error: (err) => console.error('Błąd usuwania sesji:', err)
    });
  }
}
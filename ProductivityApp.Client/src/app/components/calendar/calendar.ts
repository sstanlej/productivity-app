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

  ngOnInit(): void {
    this.setupDays();
    this.loadSessions();
  }

  // Przygotowanie kolumn: Wczoraj, Dzisiaj, Jutro
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

  // Pobranie sesji dla całego 3-dniowego zakresu
  loadSessions(): void {
    this.isLoading.set(true);
    const currentDays = this.days();
    
    const startRange = new Date(currentDays[0].date);
    startRange.setHours(0, 0, 0, 0);

    const endRange = new Date(currentDays[2].date);
    endRange.setHours(23, 59, 59, 999);

    this.sessionService.getCalendarSessions(startRange.toISOString(), endRange.toISOString()).subscribe({
      next: (sessions) => {
        // Przypisanie sesji do odpowiadających im dni
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

  // Oznaczanie sesji (Completed / Missed)
  changeStatus(session: TaskSession, status: TaskSessionStatus): void {
    if (!session.id) return;

    this.sessionService.updateStatus(session.id, status).subscribe({
      next: () => {
        session.status = status;
      },
      error: (err) => console.error('Błąd zmiany statusu:', err)
    });
  }

  // Szybkie przesunięcie sesji o 1 dzień do przodu (Reschedule)
  rescheduleToTomorrow(session: TaskSession): void {
    if (!session.id || !session.startTime || !session.endTime) return;

    const currentStart = new Date(session.startTime);
    const currentEnd = new Date(session.endTime);

    currentStart.setDate(currentStart.getDate() + 1);
    currentEnd.setDate(currentEnd.getDate() + 1);

    this.sessionService.rescheduleSession(session.id, {
      newStartTime: currentStart.toISOString(),
      newEndTime: currentEnd.toISOString()
    }).subscribe({
      next: () => this.loadSessions(),
      error: (err) => alert(err.error || 'Nie można przesunąć sesji (przekroczono deadline!).')
    });
  }

  // Usunięcie pomyłkowej sesji
  deleteSession(id?: number): void {
    if (!id) return;
    if (!confirm('Czy na pewno chcesz usunąć tę sesję?')) return;

    this.sessionService.deleteSession(id).subscribe({
      next: () => this.loadSessions(),
      error: (err) => console.error('Błąd usuwania sesji:', err)
    });
  }
}
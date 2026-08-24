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

  // Dynamiczne godziny osi czasu
  startHour = signal<number>(8);
  endHour = signal<number>(20);
  timeSlots = signal<string[]>([]);
  pixelsPerMinute = 2; // 2px na minutę -> 15 min = 30px, 1h = 120px

  // Stan Modalu Szczegółów
  selectedSession = signal<TaskSession | null>(null);

  // Stan Modalu Przesuwania
  isRescheduling = signal<boolean>(false);
  rescheduleDate: string = '';
  rescheduleStartTime: string = '';
  rescheduleEndTime: string = '';

  ngOnInit(): void {
    this.setupDays();
    this.loadSessions(true);
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
        // 1. Obliczenie dynamicznego zakresu godzin
        this.calculateDynamicTimeline(sessions);

        // 2. Przypisanie sesji do dni
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

  // Obliczanie min i max godziny na podstawie wszystkich sesji z 3 dni
  private calculateDynamicTimeline(sessions: TaskSession[]): void {
    if (sessions.length === 0) {
      this.startHour.set(8);
      this.endHour.set(20);
      this.generateTimeSlots(8, 20);
      return;
    }

    let minH = 24;
    let maxH = 0;

    sessions.forEach(s => {
      if (s.startTime && s.endTime) {
        const start = new Date(s.startTime);
        const end = new Date(s.endTime);

        const sHour = start.getHours();
        const eHour = end.getHours() + (end.getMinutes() > 0 ? 1 : 0);

        if (sHour < minH) minH = sHour;
        if (eHour > maxH) maxH = eHour;
      }
    });

    // 1-godzinny bufor bezpieczeństwa i zaokrąglenie do parzystych godzin
    let finalStart = Math.max(0, Math.floor((minH - 1) / 2) * 2);
    let finalEnd = Math.min(24, Math.ceil((maxH + 1) / 2) * 2);

    if (finalEnd - finalStart < 6) {
      finalEnd = Math.min(24, finalStart + 6);
    }

    this.startHour.set(finalStart);
    this.endHour.set(finalEnd);
    this.generateTimeSlots(finalStart, finalEnd);
  }

  private generateTimeSlots(start: number, end: number): void {
    const slots: string[] = [];
    for (let h = start; h <= end; h += 2) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
    }
    this.timeSlots.set(slots);
  }

  // Wysokość całej siatki w pikselach
  getTotalTimelineHeight(): number {
    return (this.endHour() - this.startHour()) * 60 * this.pixelsPerMinute;
  }

  // Pozycja Y kafelka względem startHour
  getTopOffset(session: TaskSession): number {
    if (!session.startTime) return 0;
    const date = new Date(session.startTime);
    const minutesFromBase = (date.getHours() - this.startHour()) * 60 + date.getMinutes();
    return Math.max(0, minutesFromBase * this.pixelsPerMinute);
  }

  // Wysokość kafelka w pikselach
    isShortSession(session: TaskSession): boolean {
      if (!session.startTime || !session.endTime) return false;
      const diff = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60);
      return diff <= 35;
    }

    // Wysokość kafelka
    getHeight(session: TaskSession): number {
      if (!session.startTime || !session.endTime) return 38;
      const start = new Date(session.startTime);
      const end = new Date(session.endTime);
      const diffInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
      
      // Dla 15 min = 38px, dla 30 min = 60px, dla 1h = 120px
      return Math.max(diffInMinutes * this.pixelsPerMinute, 38);
    }

  // Otwarcie Modalu Szczegółów po kliknięciu w kafelek
  openDetails(session: TaskSession): void {
    this.selectedSession.set(session);
    this.isRescheduling.set(false);
  }

  closeDetails(): void {
    this.selectedSession.set(null);
    this.isRescheduling.set(false);
  }

  changeStatus(status: TaskSessionStatus): void {
    const session = this.selectedSession();
    if (!session?.id) return;

    this.sessionService.updateStatus(session.id, status).subscribe({
      next: () => {
        session.status = status;
        this.days.update(cols => 
          cols.map(c => ({
            ...c,
            sessions: c.sessions.map(s => s.id === session.id ? { ...s, status } : s)
          }))
        );
        this.closeDetails();
      },
      error: (err) => console.error('Błąd zmiany statusu:', err)
    });
  }

  startReschedule(): void {
    const session = this.selectedSession();
    if (!session?.startTime || !session?.endTime) return;

    const start = new Date(session.startTime);
    const end = new Date(session.endTime);

    this.rescheduleDate = start.toISOString().substring(0, 10);
    this.rescheduleStartTime = start.toTimeString().substring(0, 5);
    this.rescheduleEndTime = end.toTimeString().substring(0, 5);
    this.isRescheduling.set(true);
  }

  cancelReschedule(): void {
    this.isRescheduling.set(false);
  }

  submitReschedule(): void {
    const session = this.selectedSession();
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
        this.closeDetails();
        this.loadSessions(false);
      },
      error: (err) => alert(err.error || 'Nie udało się przesunąć zadania.')
    });
  }

  deleteCurrentSession(): void {
    const session = this.selectedSession();
    if (!session?.id) return;
    if (!confirm('Czy na pewno chcesz usunąć to zadanie?')) return;

    this.sessionService.deleteSession(session.id).subscribe({
      next: () => {
        const deletedId = session.id;
        this.closeDetails();
        this.days.update(cols => 
          cols.map(c => ({
            ...c,
            sessions: c.sessions.filter(s => s.id !== deletedId)
          }))
        );
      },
      error: (err) => console.error('Błąd usuwania:', err)
    });
  }

  formatSessionDate(startTime?: string | null): string {
    if (!startTime) return '';
    const date = new Date(startTime);
    const today = new Date();
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dateStr = date.toDateString();

    if (dateStr === today.toDateString()) return 'Dzisiaj';
    if (dateStr === yesterday.toDateString()) return 'Wczoraj';
    if (dateStr === tomorrow.toDateString()) return 'Jutro';

    return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
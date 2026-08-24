import { Component, OnInit, signal, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../services/session.service';
import { TaskSession, TaskSessionStatus } from '../../core/models/session.model';

@Component({
  selector: 'app-backlog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './backlog.html',
  styleUrl: './backlog.css'
})
export class BacklogComponent implements OnInit {
  private sessionService = inject(SessionService);

  @Output() taskScheduled = new EventEmitter<void>();

  unplannedSessions = signal<TaskSession[]>([]);
  isLoading = signal<boolean>(true);

  // Stan modalu planowania i szczegółów
  selectedSession = signal<TaskSession | null>(null);
  scheduleDate: string = new Date().toISOString().substring(0, 10);
  scheduleStartTime: string = '12:00';
  scheduleEndTime: string = '13:00';

  ngOnInit(): void {
    this.loadUnplannedSessions();
  }

  loadUnplannedSessions(): void {
    this.sessionService.getUnplannedSessions().subscribe({
      next: (sessions) => {
        this.unplannedSessions.set(sessions);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Błąd pobierania zadań niezaplanowanych:', err);
        this.isLoading.set(false);
      }
    });
  }

  // Otwarcie modalu po kliknięciu w kafelek
  openScheduleModal(session: TaskSession): void {
    this.selectedSession.set(session);
    this.scheduleDate = new Date().toISOString().substring(0, 10);
    this.scheduleStartTime = '12:00';
    this.scheduleEndTime = '13:00';
  }

  closeScheduleModal(): void {
    this.selectedSession.set(null);
  }

  submitSchedule(): void {
    const session = this.selectedSession();
    if (!session?.id || !this.scheduleDate || !this.scheduleStartTime || !this.scheduleEndTime) return;

    const startIso = new Date(`${this.scheduleDate}T${this.scheduleStartTime}:00`).toISOString();
    const endIso = new Date(`${this.scheduleDate}T${this.scheduleEndTime}:00`).toISOString();

    if (new Date(endIso) <= new Date(startIso)) {
      alert('Czas zakończenia musi być późniejszy niż czas rozpoczęcia.');
      return;
    }

    this.sessionService.rescheduleSession(session.id, {
      newStartTime: startIso,
      newEndTime: endIso
    }).subscribe({
      next: () => {
        this.closeScheduleModal();
        this.loadUnplannedSessions();
        this.taskScheduled.emit();
      },
      error: (err) => {
        alert(err.error || 'Nie udało się zaplanować zadania.');
      }
    });
  }

  deleteCurrentSession(): void {
    const session = this.selectedSession();
    if (!session?.id) return;
    if (!confirm('Czy na pewno chcesz usunąć to zadanie z backlogu?')) return;

    this.sessionService.deleteSession(session.id).subscribe({
      next: () => {
        const deletedId = session.id;
        this.closeScheduleModal();
        this.unplannedSessions.update(list => list.filter(s => s.id !== deletedId));
      },
      error: (err) => console.error('Błąd usuwania zadania:', err)
    });
  }
}
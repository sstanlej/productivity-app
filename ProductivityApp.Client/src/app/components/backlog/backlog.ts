import { Component, OnInit, signal, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../services/session.service';
import { TaskSession, TaskSessionStatus } from '../../core/models/session.model';
import { TaskFormComponent } from '../task-form/task-form';

@Component({
  selector: 'app-backlog',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskFormComponent],
  templateUrl: './backlog.html',
  styleUrl: './backlog.css'
})
export class BacklogComponent implements OnInit {
  private sessionService = inject(SessionService);

  @Output() taskScheduled = new EventEmitter<void>();

  unplannedSessions = signal<TaskSession[]>([]);
  isLoading = signal<boolean>(true);
  isFormOpen = signal<boolean>(false);

  activeMenuSessionId = signal<number | null>(null);

  // Stan modalu planowania
  schedulingSession = signal<TaskSession | null>(null);
  scheduleDate: string = new Date().toISOString().substring(0, 10);
  scheduleStartTime: string = '12:00';
  scheduleEndTime: string = '13:00';

  ngOnInit(): void {
    this.loadUnplannedSessions();
  }

  toggleForm(): void {
    this.isFormOpen.update(v => !v);
  }

  onFormSessionCreated(): void {
    this.isFormOpen.set(false);
    this.loadUnplannedSessions();
    this.taskScheduled.emit();
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

  toggleMenu(sessionId?: number, event?: Event): void {
    if (event) event.stopPropagation();
    if (!sessionId) return;
    this.activeMenuSessionId.update(current => current === sessionId ? null : sessionId);
  }

  closeMenu(): void {
    this.activeMenuSessionId.set(null);
  }

  openScheduleModal(session: TaskSession): void {
    this.closeMenu();
    this.schedulingSession.set(session);
    this.scheduleDate = new Date().toISOString().substring(0, 10);
  }

  closeScheduleModal(): void {
    this.schedulingSession.set(null);
  }

  submitSchedule(): void {
    const session = this.schedulingSession();
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

  deleteSession(id?: number): void {
    if (!id) return;
    this.closeMenu();
    if (!confirm('Czy na pewno chcesz usunąć to zadanie?')) return;

    this.sessionService.deleteSession(id).subscribe({
      next: () => {
        this.unplannedSessions.update(list => list.filter(s => s.id !== id));
      },
      error: (err) => console.error('Błąd usuwania zadania:', err)
    });
  }
}
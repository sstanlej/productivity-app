import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../services/session.service';
import { TaskSession, TaskSessionStatus } from '../../core/models/session.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css'
})
export class TaskFormComponent {
  private sessionService = inject(SessionService);

  @Output() sessionCreated = new EventEmitter<void>();
  @Output() formClosed = new EventEmitter<void>();

  title: string = '';
  description: string = '';
  isScheduled: boolean = true;

  date: string = new Date().toISOString().substring(0, 10);
  startTime: string = '12:00';
  endTime: string = '13:00';

  close(): void {
    this.formClosed.emit();
  }

  submit(): void {
    if (!this.title.trim()) return;

    let startIso: string | null = null;
    let endIso: string | null = null;
    let status: TaskSessionStatus = TaskSessionStatus.Unplanned;

    if (this.isScheduled && this.date && this.startTime && this.endTime) {
      startIso = new Date(`${this.date}T${this.startTime}:00`).toISOString();
      endIso = new Date(`${this.date}T${this.endTime}:00`).toISOString();
      status = TaskSessionStatus.Planned;
    }

    const newSession: TaskSession = {
      taskItemId: null,
      title: this.title,
      description: this.description || undefined,
      startTime: startIso,
      endTime: endIso,
      status: status
    };

    this.sessionService.createSession(newSession).subscribe({
      next: () => {
        this.title = '';
        this.description = '';
        this.sessionCreated.emit();
      },
      error: (err) => {
        alert(err.error || 'Nie udało się dodać zadania.');
      }
    });
  }

  autoGrow(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`; // rośnie max do 180px, potem włącza się scroll
  }
}
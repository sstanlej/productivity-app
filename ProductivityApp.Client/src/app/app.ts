import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarComponent } from './components/calendar/calendar';
import { TaskFormComponent } from './components/task-form/task-form';
import { BacklogComponent } from './components/backlog/backlog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CalendarComponent, TaskFormComponent, BacklogComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  @ViewChild(CalendarComponent) calendarComponent!: CalendarComponent;
  @ViewChild(BacklogComponent) backlogComponent!: BacklogComponent;

  // Wywoływane po dodaniu nowego zadania przez formularz
  onSessionCreated(): void {
    this.calendarComponent?.loadSessions(false);
    this.backlogComponent?.loadUnplannedSessions();
  }

  // Wywoływane po zaplanowaniu zadania z poziomu backlogu
  onTaskScheduled(): void {
    this.calendarComponent?.loadSessions(false);
  }
}
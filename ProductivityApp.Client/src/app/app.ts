import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarComponent } from './components/calendar/calendar';
import { TaskFormComponent } from './components/task-form/task-form';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CalendarComponent, TaskFormComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Referencja do komponentu kalendarza, aby odświeżać go po dodaniu zadania
  @ViewChild(CalendarComponent) calendarComponent!: CalendarComponent;

  onSessionCreated(): void {
    if (this.calendarComponent) {
      this.calendarComponent.loadSessions();
    }
  }
}
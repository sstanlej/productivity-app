import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarComponent } from './components/calendar/calendar';
import { BacklogComponent } from './components/backlog/backlog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CalendarComponent, BacklogComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  @ViewChild(CalendarComponent) calendarComponent!: CalendarComponent;

  onTaskScheduled(): void {
    this.calendarComponent?.loadSessions(false);
  }
}
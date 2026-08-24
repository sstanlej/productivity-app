import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarComponent } from './components/calendar/calendar';
import { BacklogComponent } from './components/backlog/backlog';
import { TaskFormComponent } from './components/task-form/task-form';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CalendarComponent, BacklogComponent, TaskFormComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  @ViewChild(CalendarComponent) calendarComponent!: CalendarComponent;
  @ViewChild(BacklogComponent) backlogComponent!: BacklogComponent;

  isDarkMode = signal<boolean>(false);
  isTaskFormOpen = signal<boolean>(false);

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.setTheme(true);
    } else {
      this.setTheme(false);
    }
  }

  toggleTheme(): void {
    this.setTheme(!this.isDarkMode());
  }

  private setTheme(dark: boolean): void {
    this.isDarkMode.set(dark);
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  openTaskForm(): void {
    this.isTaskFormOpen.set(true);
  }

  closeTaskForm(): void {
    this.isTaskFormOpen.set(false);
  }

  onSessionCreated(): void {
    this.closeTaskForm();
    this.calendarComponent?.loadSessions(false);
    this.backlogComponent?.loadUnplannedSessions();
  }

  onTaskScheduled(): void {
    this.calendarComponent?.loadSessions(false);
  }
}
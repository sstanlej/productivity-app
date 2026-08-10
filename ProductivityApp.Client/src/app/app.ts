import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from './task';
import { TaskItem, TaskPriority, TaskStatus } from './task.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private taskService = inject(TaskService);

  // Reaktywny stan aplikacji za pomocą Sygnałów (Signals)
  tasks = signal<TaskItem[]>([]);
  isLoading = signal<boolean>(true);

  // Model dla nowego zadania wpisywanego w formularzu
  newTaskTitle: string = '';
  newTaskDescription: string = '';

  ngOnInit(): void {
    this.loadTasks();
  }

  // Pobranie listy zadań z API .NET
  loadTasks(): void {
    this.isLoading.set(true);
    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Błąd pobierania zadań:', err);
        this.isLoading.set(false);
      }
    });
  }

  // Obsługa wysłania formularza (POST)
  addTask(): void {
    if (!this.newTaskTitle.trim()) return;

    const todayIso = new Date().toISOString();

    const newTask: TaskItem = {
      title: this.newTaskTitle,
      description: this.newTaskDescription,
      priority: TaskPriority.Medium,
      status: TaskStatus.ToDo,
      originalDueDate: todayIso,
      currentDueDate: todayIso
    };

    this.taskService.createTask(newTask).subscribe({
      next: (createdTask) => {
        // Po udanym dodaniu w bazie, aktualizujemy lokalny stan bez potrzeby przeładowania strony
        this.tasks.update(current => [...current, createdTask]);

        // Czyszczenie pól formularza
        this.newTaskTitle = '';
        this.newTaskDescription = '';
      },
      error: (err) => console.error('Błąd dodawania zadania:', err)
    });
  }
}
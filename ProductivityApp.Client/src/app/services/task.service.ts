import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskItem } from '../core/models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5148/api/tasks';

  getTasks(): Observable<TaskItem[]> {
    return this.http.get<TaskItem[]>(this.apiUrl);
  }

  getTask(id: number): Observable<TaskItem> {
    return this.http.get<TaskItem>(`${this.apiUrl}/${id}`);
  }

  createTask(task: TaskItem): Observable<TaskItem> {
    return this.http.post<TaskItem>(this.apiUrl, task);
  }

  shiftDeadline(id: number, newDeadline: string): Observable<TaskItem> {
    return this.http.patch<TaskItem>(`${this.apiUrl}/${id}/shift-deadline`, JSON.stringify(newDeadline), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
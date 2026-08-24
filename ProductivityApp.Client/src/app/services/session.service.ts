import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskSession, TaskSessionStatus, RescheduleRequest } from '../core/models/session.model';
import { CreateTaskSessionDto } from '../core/models/session.model';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5148/api/sessions';

  getCalendarSessions(from: string, to: string): Observable<TaskSession[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<TaskSession[]>(`${this.apiUrl}/calendar`, { params });
  }

  getUnplannedSessions(): Observable<TaskSession[]> {
    return this.http.get<TaskSession[]>(`${this.apiUrl}/unplanned`);
  }

  // Zmień sygnaturę metody createSession na:
createSession(session: CreateTaskSessionDto | TaskSession): Observable<TaskSession> {
  return this.http.post<TaskSession>(this.apiUrl, session);
}

  updateStatus(id: number, status: TaskSessionStatus): Observable<TaskSession> {
    return this.http.patch<TaskSession>(`${this.apiUrl}/${id}/status`, status, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  rescheduleSession(id: number, request: RescheduleRequest): Observable<TaskSession> {
    return this.http.patch<TaskSession>(`${this.apiUrl}/${id}/reschedule`, request);
  }

  deleteSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
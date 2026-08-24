export enum TaskSessionStatus {
  Unplanned = 0,
  Planned = 1,
  Completed = 2,
  Missed = 3
}

export interface TaskSession {
  id?: number;
  taskItemId?: number | null;
  title: string;
  description?: string;
  startTime?: string | null;
  endTime?: string | null;
  status: TaskSessionStatus;
  rescheduleCount?: number;
  createdAt?: string;
}

export interface CreateTaskSessionDto {
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
}

export interface RescheduleRequest {
  newStartTime: string;
  newEndTime: string;
}
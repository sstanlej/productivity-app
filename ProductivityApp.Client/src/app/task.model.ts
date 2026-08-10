export enum TaskPriority {
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4
}

export enum TaskStatus {
  ToDo = 1,
  InProgress = 2,
  Done = 3,
  Cancelled = 4
}

export interface TaskItem {
  id?: number;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt?: string;
  originalDueDate: string;
  currentDueDate: string;
  rescheduleCount?: number;
  pointsValue?: number;
}
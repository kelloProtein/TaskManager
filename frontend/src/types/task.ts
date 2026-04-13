// TypeScript interfaces that mirror the backend TaskResponse DTO.

export type TodoStatus = 'Todo' | 'InProgress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

// Matches Models/TaskItem.cs enum int values
export const TaskPriorityValue = {
  Low: 0,
  Medium: 1,
  High: 2,
} as const;

export const TodoStatusValue = {
  Todo: 0,
  InProgress: 1,
  Done: 2,
} as const;

// Shape returned by GET /api/tasks and GET /api/tasks/{id}
export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TodoStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// Shape sent to POST /api/tasks — priority is an int per the backend enum
export interface CreateTaskInput {
  title: string;
  description?: string | null;
  priority: 0 | 1 | 2;
  dueDate?: string | null;
}

// Shape sent to PUT /api/tasks/{id}
export interface UpdateTaskInput {
  title: string;
  description?: string | null;
  priority: 0 | 1 | 2;
  dueDate?: string | null;
  status: 0 | 1 | 2;
}

// Filters the frontend applies (forwarded as query params to GET /api/tasks)
export interface TaskFilters {
  status?: 0 | 1 | 2;
  priority?: 0 | 1 | 2;
  search?: string;
}

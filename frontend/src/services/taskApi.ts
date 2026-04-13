import axios from 'axios';
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
} from '../types/task';
import { TodoStatusValue } from '../types/task';

// Thin wrapper around axios — all backend communication goes through here.
// Keeping it centralized means tests can mock one module and components stay agnostic.

const BASE_URL = '/api/tasks';

export const taskApi = {
  getAll: async (filters?: TaskFilters): Promise<Task[]> => {
    const params: Record<string, string | number> = {};
    if (filters?.status !== undefined) params.status = filters.status;
    if (filters?.priority !== undefined) params.priority = filters.priority;
    if (filters?.search) params.search = filters.search;

    const response = await axios.get<Task[]>(BASE_URL, { params });
    return response.data;
  },

  create: async (input: CreateTaskInput): Promise<Task> => {
    const response = await axios.post<Task>(BASE_URL, input);
    return response.data;
  },

  update: async (id: number, input: UpdateTaskInput): Promise<Task> => {
    const response = await axios.put<Task>(`${BASE_URL}/${id}`, input);
    return response.data;
  },

  updateStatus: async (
    id: number,
    status: 0 | 1 | 2
  ): Promise<Task> => {
    const response = await axios.patch<Task>(
      `${BASE_URL}/${id}/status`,
      { status }
    );
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await axios.delete(`${BASE_URL}/${id}`);
  },
};

// Utility: cycle status Todo → InProgress → Done → Todo ...
// Lives near the api so callers don't have to reinvent it.
export function nextStatus(current: 'Todo' | 'InProgress' | 'Done'): 0 | 1 | 2 {
  switch (current) {
    case 'Todo':
      return TodoStatusValue.InProgress;
    case 'InProgress':
      return TodoStatusValue.Done;
    case 'Done':
      return TodoStatusValue.Todo;
  }
}

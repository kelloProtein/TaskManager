import axios from 'axios';
import type { Task, CreateTaskInput } from '../types/task';

// Thin wrapper around axios — all backend communication goes through here.
// Java parallel: this is the "HTTP client" class that all your Spring services would use.
// Keeping it centralized means tests can mock one module and components stay agnostic.

const BASE_URL = '/api/tasks';

export const taskApi = {
  getAll: async (): Promise<Task[]> => {
    const response = await axios.get<Task[]>(BASE_URL);
    return response.data;
  },

  create: async (input: CreateTaskInput): Promise<Task> => {
    const response = await axios.post<Task>(BASE_URL, input);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await axios.delete(`${BASE_URL}/${id}`);
  },
};

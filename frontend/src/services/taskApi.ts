import axios from 'axios';
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
} from '../types/task';

// Thin wrapper around axios — all backend communication goes through here.
// Keeping it centralized means tests can mock one module and components stay agnostic.

const BASE_URL = '/api/tasks';

// Separate axios instance so the Bearer token is only sent on task API calls,
// not on the login endpoint (which uses plain axios in authApi.ts).
const apiClient = axios.create();

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const taskApi = {
  getAll: async (filters?: TaskFilters): Promise<Task[]> => {
    const params: Record<string, string | number> = {};
    if (filters?.status !== undefined) params.status = filters.status;
    if (filters?.priority !== undefined) params.priority = filters.priority;
    if (filters?.search) params.search = filters.search;

    const response = await apiClient.get<Task[]>(BASE_URL, { params });
    return response.data;
  },

  create: async (input: CreateTaskInput): Promise<Task> => {
    const response = await apiClient.post<Task>(BASE_URL, input);
    return response.data;
  },

  update: async (id: number, input: UpdateTaskInput): Promise<Task> => {
    const response = await apiClient.put<Task>(`${BASE_URL}/${id}`, input);
    return response.data;
  },

  updateStatus: async (
    id: number,
    status: 0 | 1 | 2
  ): Promise<Task> => {
    const response = await apiClient.patch<Task>(
      `${BASE_URL}/${id}/status`,
      { status }
    );
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};

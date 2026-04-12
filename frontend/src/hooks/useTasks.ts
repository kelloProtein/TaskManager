import { useCallback, useEffect, useState } from 'react';
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
} from '../types/task';
import { taskApi } from '../services/taskApi';

// Custom React hook that encapsulates all task list state and mutations.
// Java parallel: think of this like a small "service bean" that components inject via
// `const { tasks, createTask, deleteTask } = useTasks()`.
// - useState is the state field
// - useEffect(fn, [deps]) runs fn after the component mounts AND whenever deps change
// - useCallback memoizes a function so its reference doesn't change every render

interface UseTasksResult {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filters: TaskFilters;
  setFilters: (filters: TaskFilters) => void;
  refresh: () => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<void>;
  updateTask: (id: number, input: UpdateTaskInput) => Promise<void>;
  updateStatus: (id: number, status: 0 | 1 | 2) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
}

export function useTasks(): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskApi.getAll(filters);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createTask = useCallback(async (input: CreateTaskInput) => {
    try {
      const created = await taskApi.create(input);
      // Prepend so the newest task appears at the top (matches backend sort order)
      setTasks(prev => [created, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  }, []);

  const updateTask = useCallback(async (id: number, input: UpdateTaskInput) => {
    try {
      const updated = await taskApi.update(id, input);
      setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  }, []);

  const updateStatus = useCallback(async (id: number, status: 0 | 1 | 2) => {
    try {
      const updated = await taskApi.updateStatus(id, status);
      setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  }, []);

  const deleteTask = useCallback(async (id: number) => {
    try {
      await taskApi.remove(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  }, []);

  // Re-fetch when filters change (including initial mount with empty filters)
  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    tasks,
    loading,
    error,
    filters,
    setFilters,
    refresh,
    createTask,
    updateTask,
    updateStatus,
    deleteTask,
  };
}

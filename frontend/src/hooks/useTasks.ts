import { useCallback, useEffect, useState } from 'react';
import type { Task, CreateTaskInput } from '../types/task';
import { taskApi } from '../services/taskApi';

// Custom React hook that encapsulates all task list state and mutations.
// Java parallel: think of this like a small "service bean" that components inject via
// `const { tasks, createTask, deleteTask } = useTasks()`.
// - useState is the state field
// - useEffect(fn, []) is like @PostConstruct — runs once after the component mounts
// - useCallback memoizes a function so its reference doesn't change every render

interface UseTasksResult {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
}

export function useTasks(): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskApi.getAll();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (input: CreateTaskInput) => {
    try {
      const created = await taskApi.create(input);
      // Prepend so the newest task appears at the top (matches backend sort order)
      setTasks(prev => [created, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
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

  // Load tasks on mount
  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { tasks, loading, error, refresh, createTask, deleteTask };
}

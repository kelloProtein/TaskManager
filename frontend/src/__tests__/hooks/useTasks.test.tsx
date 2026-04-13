import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useTasks } from '../../hooks/useTasks';
import { taskApi } from '../../services/taskApi';
import type { Task } from '../../types/task';

// Mock the service layer so the hook has no real HTTP dependency.
vi.mock('../../services/taskApi');
const mockedApi = vi.mocked(taskApi);

const taskA: Task = {
  id: 1, title: 'A', description: null, status: 'Todo', priority: 'Medium',
  dueDate: null, createdAt: '2026-04-11T00:00:00Z', updatedAt: '2026-04-11T00:00:00Z',
};
const taskB: Task = {
  id: 2, title: 'B', description: null, status: 'Todo', priority: 'High',
  dueDate: null, createdAt: '2026-04-11T00:00:00Z', updatedAt: '2026-04-11T00:00:00Z',
};

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads tasks on mount', async () => {
    mockedApi.getAll.mockResolvedValue([taskA, taskB]);

    const { result } = renderHook(() => useTasks());

    // Initially loading
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tasks).toEqual([taskA, taskB]);
    expect(mockedApi.getAll).toHaveBeenCalledTimes(1);
  });

  it('createTask prepends the new task to the list', async () => {
    mockedApi.getAll.mockResolvedValue([taskA]);
    const newTask: Task = { ...taskB, id: 99, title: 'Brand new' };
    mockedApi.create.mockResolvedValue(newTask);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createTask({ title: 'Brand new', priority: 1 });
    });

    expect(result.current.tasks[0]).toEqual(newTask);
    expect(result.current.tasks).toHaveLength(2);
  });

  it('updateTask replaces the task in the list', async () => {
    mockedApi.getAll.mockResolvedValue([taskA, taskB]);
    const updatedA: Task = { ...taskA, title: 'Changed' };
    mockedApi.update.mockResolvedValue(updatedA);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateTask(1, { title: 'Changed', priority: 1, status: 0 });
    });

    expect(result.current.tasks.find(t => t.id === 1)?.title).toBe('Changed');
    expect(result.current.tasks).toHaveLength(2);
  });

  it('updateStatus replaces the task with the updated status', async () => {
    mockedApi.getAll.mockResolvedValue([taskA]);
    const doneA: Task = { ...taskA, status: 'Done' };
    mockedApi.updateStatus.mockResolvedValue(doneA);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateStatus(1, 2);
    });

    expect(result.current.tasks[0].status).toBe('Done');
    expect(mockedApi.updateStatus).toHaveBeenCalledWith(1, 2);
  });

  it('deleteTask removes the task from the list', async () => {
    mockedApi.getAll.mockResolvedValue([taskA, taskB]);
    mockedApi.remove.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteTask(1);
    });

    expect(result.current.tasks).toEqual([taskB]);
    expect(mockedApi.remove).toHaveBeenCalledWith(1);
  });

  it('refetches with new filters when setFilters is called', async () => {
    mockedApi.getAll.mockResolvedValue([taskA, taskB]);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mockedApi.getAll.mockClear();
    mockedApi.getAll.mockResolvedValue([taskB]);

    act(() => {
      result.current.setFilters({ priority: 2 });
    });

    await waitFor(() =>
      expect(mockedApi.getAll).toHaveBeenCalledWith({ priority: 2 })
    );
    await waitFor(() => expect(result.current.tasks).toEqual([taskB]));
  });

  it('sets error message when getAll fails', async () => {
    mockedApi.getAll.mockRejectedValue(new Error('Network down'));

    const { result } = renderHook(() => useTasks());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Network down');
    expect(result.current.tasks).toEqual([]);
  });
});

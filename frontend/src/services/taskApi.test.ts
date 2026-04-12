import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { taskApi, nextStatus } from './taskApi';
import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/task';

// Mock the axios module — no real HTTP calls.
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('taskApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const sampleTask: Task = {
    id: 1,
    title: 'Sample',
    description: null,
    status: 'Todo',
    priority: 'Medium',
    dueDate: null,
    createdAt: '2026-04-11T00:00:00Z',
    updatedAt: '2026-04-11T00:00:00Z',
  };

  describe('getAll', () => {
    it('calls GET /api/tasks with no params when no filters are provided', async () => {
      mockedAxios.get.mockResolvedValue({ data: [sampleTask] });

      const result = await taskApi.getAll();

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/tasks', { params: {} });
      expect(result).toEqual([sampleTask]);
    });

    it('forwards status, priority, and search as query params', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      await taskApi.getAll({ status: 1, priority: 2, search: 'bug' });

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/tasks', {
        params: { status: 1, priority: 2, search: 'bug' },
      });
    });

    it('omits empty search strings', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      await taskApi.getAll({ search: '' });

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/tasks', { params: {} });
    });
  });

  describe('create', () => {
    it('POSTs the input and returns the created task', async () => {
      const input: CreateTaskInput = { title: 'New', priority: 2 };
      mockedAxios.post.mockResolvedValue({ data: sampleTask });

      const result = await taskApi.create(input);

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/tasks', input);
      expect(result).toEqual(sampleTask);
    });
  });

  describe('update', () => {
    it('PUTs to /api/tasks/:id with the input', async () => {
      const input: UpdateTaskInput = { title: 'Changed', priority: 0 };
      mockedAxios.put.mockResolvedValue({ data: sampleTask });

      const result = await taskApi.update(5, input);

      expect(mockedAxios.put).toHaveBeenCalledWith('/api/tasks/5', input);
      expect(result).toEqual(sampleTask);
    });
  });

  describe('updateStatus', () => {
    it('PATCHes /api/tasks/:id/status with the status int', async () => {
      mockedAxios.patch.mockResolvedValue({ data: sampleTask });

      await taskApi.updateStatus(3, 2);

      expect(mockedAxios.patch).toHaveBeenCalledWith(
        '/api/tasks/3/status',
        { status: 2 }
      );
    });
  });

  describe('remove', () => {
    it('DELETEs /api/tasks/:id', async () => {
      mockedAxios.delete.mockResolvedValue({});

      await taskApi.remove(42);

      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/tasks/42');
    });
  });
});

describe('nextStatus', () => {
  it('cycles Todo → InProgress', () => {
    expect(nextStatus('Todo')).toBe(1);
  });

  it('cycles InProgress → Done', () => {
    expect(nextStatus('InProgress')).toBe(2);
  });

  it('cycles Done → Todo', () => {
    expect(nextStatus('Done')).toBe(0);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { taskApi } from './taskApi';
import type { Task, CreateTaskInput } from '../types/task';

// Mock the axios module — no real HTTP calls.
// vi.mock hoists automatically, so this runs before the import is used.
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

  it('getAll calls GET /api/tasks and returns the data', async () => {
    mockedAxios.get.mockResolvedValue({ data: [sampleTask] });

    const result = await taskApi.getAll();

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/tasks');
    expect(result).toEqual([sampleTask]);
  });

  it('create calls POST /api/tasks with the input and returns the created task', async () => {
    const input: CreateTaskInput = { title: 'New', priority: 2 };
    mockedAxios.post.mockResolvedValue({ data: sampleTask });

    const result = await taskApi.create(input);

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/tasks', input);
    expect(result).toEqual(sampleTask);
  });

  it('remove calls DELETE /api/tasks/:id with the correct URL', async () => {
    mockedAxios.delete.mockResolvedValue({});

    await taskApi.remove(42);

    expect(mockedAxios.delete).toHaveBeenCalledWith('/api/tasks/42');
  });
});

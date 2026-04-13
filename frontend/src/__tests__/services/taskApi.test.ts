import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Task, CreateTaskInput, UpdateTaskInput } from '../../types/task';

// Build a fake axios instance that axios.create() will return.
// It needs the HTTP methods (get, post, etc.) and an interceptors stub.
const mockInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
};

// Mock the axios module — no real HTTP calls.
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockInstance),
    isAxiosError: vi.fn(),
  },
  __esModule: true,
}));

// Import after mocking so the module picks up the mocked axios.create()
const { taskApi } = await import('../../services/taskApi');

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
      mockInstance.get.mockResolvedValue({ data: [sampleTask] });

      const result = await taskApi.getAll();

      expect(mockInstance.get).toHaveBeenCalledWith('/api/tasks', { params: {} });
      expect(result).toEqual([sampleTask]);
    });

    it('forwards status, priority, and search as query params', async () => {
      mockInstance.get.mockResolvedValue({ data: [] });

      await taskApi.getAll({ status: 1, priority: 2, search: 'bug' });

      expect(mockInstance.get).toHaveBeenCalledWith('/api/tasks', {
        params: { status: 1, priority: 2, search: 'bug' },
      });
    });

    it('omits empty search strings', async () => {
      mockInstance.get.mockResolvedValue({ data: [] });

      await taskApi.getAll({ search: '' });

      expect(mockInstance.get).toHaveBeenCalledWith('/api/tasks', { params: {} });
    });
  });

  describe('create', () => {
    it('POSTs the input and returns the created task', async () => {
      const input: CreateTaskInput = { title: 'New', priority: 2 };
      mockInstance.post.mockResolvedValue({ data: sampleTask });

      const result = await taskApi.create(input);

      expect(mockInstance.post).toHaveBeenCalledWith('/api/tasks', input);
      expect(result).toEqual(sampleTask);
    });
  });

  describe('update', () => {
    it('PUTs to /api/tasks/:id with the input', async () => {
      const input: UpdateTaskInput = { title: 'Changed', priority: 0, status: 0 };
      mockInstance.put.mockResolvedValue({ data: sampleTask });

      const result = await taskApi.update(5, input);

      expect(mockInstance.put).toHaveBeenCalledWith('/api/tasks/5', input);
      expect(result).toEqual(sampleTask);
    });
  });

  describe('updateStatus', () => {
    it('PATCHes /api/tasks/:id/status with the status int', async () => {
      mockInstance.patch.mockResolvedValue({ data: sampleTask });

      await taskApi.updateStatus(3, 2);

      expect(mockInstance.patch).toHaveBeenCalledWith(
        '/api/tasks/3/status',
        { status: 2 }
      );
    });
  });

  describe('remove', () => {
    it('DELETEs /api/tasks/:id', async () => {
      mockInstance.delete.mockResolvedValue({});

      await taskApi.remove(42);

      expect(mockInstance.delete).toHaveBeenCalledWith('/api/tasks/42');
    });
  });
});


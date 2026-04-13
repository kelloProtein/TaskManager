import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../services/authApi';

vi.mock('../../services/authApi');
const mockedAuthApi = vi.mocked(authApi);

// Stub localStorage for the test environment
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the backing store
    for (const key of Object.keys(store)) delete store[key];
  });

  it('login stores token and sets isAuthenticated', async () => {
    mockedAuthApi.login.mockResolvedValue({
      token: 'test-jwt-token',
      expiration: '2026-04-14T00:00:00Z',
    });

    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);

    await act(async () => {
      await result.current.login({ username: 'demo', password: 'Password123!' });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'test-jwt-token');
  });

  it('login sets error on invalid credentials', async () => {
    const axiosError = Object.assign(new Error('Unauthorized'), {
      isAxiosError: true,
      response: { status: 401 },
    });
    mockedAuthApi.login.mockRejectedValue(axiosError);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({ username: 'wrong', password: 'wrong' });
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  it('logout clears token and sets isAuthenticated to false', async () => {
    mockedAuthApi.login.mockResolvedValue({
      token: 'test-jwt-token',
      expiration: '2026-04-14T00:00:00Z',
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({ username: 'demo', password: 'Password123!' });
    });
    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
  });

  it('initializes as authenticated when localStorage has token', () => {
    store['auth_token'] = 'existing-token';

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(true);
  });
});

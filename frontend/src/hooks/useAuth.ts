import { useState, useCallback } from 'react';
import axios from 'axios';
import { authApi } from '../services/authApi';
import type { LoginRequest } from '../types/auth';

const TOKEN_KEY = 'auth_token';

export function useAuth() {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login(credentials);
      localStorage.setItem(TOKEN_KEY, response.token);
      setToken(response.token);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('Invalid username or password');
      } else {
        setError(err instanceof Error ? err.message : 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  return {
    isAuthenticated: token !== null,
    loading,
    error,
    login,
    logout,
  };
}

import axios from 'axios';
import type { LoginRequest, LoginResponse } from '../types/auth';

const BASE_URL = '/api/auth';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>(`${BASE_URL}/login`, credentials);
    return response.data;
  },
};

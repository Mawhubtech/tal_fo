import api from '../lib/api';
import { LoginRequest, RegisterRequest, AuthResponse, User, BackendAuthResponse } from '../types/auth';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<BackendAuthResponse>('/auth/login', data);
    // Transform backend response to frontend format
    return {
      accessToken: response.data.token,
      refreshToken: response.data.token, // Backend doesn't provide refresh token yet
      user: response.data.user,
    };
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<BackendAuthResponse>('/auth/register', data);
    // Transform backend response to frontend format
    return {
      accessToken: response.data.token,
      refreshToken: response.data.token, // Backend doesn't provide refresh token yet
      user: response.data.user,
    };
  },  async getProfile(): Promise<User> {
    const response = await api.get<{ message: string; user: User }>('/auth/profile');
    return response.data.user;
  },
  async refreshToken(): Promise<{ accessToken: string }> {
    const response = await api.post<{ message: string; token: string }>('/auth/refresh');
    return { accessToken: response.data.token };
  },
  async logout(): Promise<void> {
    try {
      // Call the backend logout endpoint if it exists
      await api.post('/auth/logout');
    } catch (error) {
      // If backend call fails, still clean up local storage
      console.warn('Backend logout failed, cleaning up locally:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },
};

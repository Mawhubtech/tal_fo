import axios from 'axios';
import { config } from '../lib/config';
import { dispatchGmailAuthError } from '../contexts/GmailStatusContext';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check for Gmail-specific auth errors first
    if (error.response?.status === 401) {
      const message = error.response?.data?.message || error.response?.data?.error || '';
      
      if (message.includes('Gmail') || message.includes('expired') || message.includes('reconnect')) {
        // Dispatch Gmail auth error for global handling
        dispatchGmailAuthError(error);
        return Promise.reject(error);
      }
    }

    // If 401 and not already retrying, attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${config.apiBaseUrl}/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/signin';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

// Client API functions
export const clientApi = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/clients', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await apiClient.get(`/clients/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await apiClient.post('/clients', data);
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await apiClient.patch(`/clients/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await apiClient.delete(`/clients/${id}`);
    return response.data;
  },
  
  getStats: async () => {
    const response = await apiClient.get('/clients/stats');
    return response.data;
  },
  
  updateActivity: async (id: string) => {
    const response = await apiClient.patch(`/clients/${id}/activity`);
    return response.data;
  },
  
  updateMetrics: async (id: string, metrics: { openJobs?: number; totalHires?: number }) => {
    const response = await apiClient.patch(`/clients/${id}/metrics`, metrics);
    return response.data;
  }
};

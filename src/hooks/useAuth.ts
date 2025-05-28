import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import type { LoginRequest, RegisterRequest } from '../types/auth';

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      queryClient.setQueryData(['user'], data.user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      queryClient.setQueryData(['user'], data.user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useProfile = () => {
  const hasToken = !!localStorage.getItem('accessToken');
  
  return useQuery({
    queryKey: ['user'],
    queryFn: authService.getProfile,
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      queryClient.clear();
      // Force page reload to reset state and redirect to home
      window.location.href = '/';
    },
  });
};

export const useGoogleLogin = () => {
  return {
    mutate: authService.googleLogin,
    mutateAsync: authService.googleLogin,
  };
};

export const useLinkedInLogin = () => {
  return {
    mutate: authService.linkedinLogin,
    mutateAsync: authService.linkedinLogin,
  };
};

export const useAuth = () => {
  const { data: user, isLoading, error } = useProfile();
  const hasToken = !!localStorage.getItem('accessToken');
  
  // User is authenticated if we have both a token and user data
  const isAuthenticated = hasToken && !!user;

  // Debug logging
  console.log('Auth state:', {
    hasToken,
    user: !!user,
    isAuthenticated,
    isLoading,
    error: !!error
  });

  return {
    user,
    isAuthenticated,
    isLoading: hasToken ? isLoading : false, // Don't show loading if no token
    error,
  };
};

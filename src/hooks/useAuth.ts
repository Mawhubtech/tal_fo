import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import type { LoginRequest, RegisterRequest } from '../types/auth';
import { useToast } from '../contexts/ToastContext';

// Helper function to show welcome toast
export const useShowWelcomeToast = () => {
  const { addToast } = useToast();
  
  return () => {
    addToast({
      type: 'success',
      title: 'Welcome back!',
      message: 'You have been successfully signed in.',
    });
  };
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const showWelcomeToast = useShowWelcomeToast();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      queryClient.setQueryData(['user'], data.user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      // Show welcome toast here instead of in the LoginForm component
      showWelcomeToast();
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  const showWelcomeToast = useShowWelcomeToast();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      queryClient.setQueryData(['user'], data.user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      // Show welcome toast for new registrations too
      showWelcomeToast();
    },
  });
};

export const useJobSeekerRegister = () => {
  const queryClient = useQueryClient();
  const showWelcomeToast = useShowWelcomeToast();

  return useMutation({
    mutationFn: (data: Omit<RegisterRequest, 'userRole'>) => 
      authService.register({ ...data, userRole: 'jobseeker' }),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      queryClient.setQueryData(['user'], data.user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      // Show welcome toast for new registrations too
      showWelcomeToast();
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
    mutate: (source?: string) => authService.googleLogin(source),
    mutateAsync: (source?: string) => authService.googleLogin(source),
  };
};

export const useLinkedInLogin = () => {
  return {
    mutate: (source?: string) => authService.linkedinLogin(source),
    mutateAsync: (source?: string) => authService.linkedinLogin(source),
  };
};

export const useJobSeekerGoogleLogin = () => {
  return {
    mutate: () => authService.googleLogin('jobseeker'),
    mutateAsync: () => authService.googleLogin('jobseeker'),
  };
};

export const useJobSeekerLinkedInLogin = () => {
  return {
    mutate: () => authService.linkedinLogin('jobseeker'),
    mutateAsync: () => authService.linkedinLogin('jobseeker'),
  };
};

export const useAuth = () => {
  const { data: user, isLoading, error } = useProfile();
  const hasToken = !!localStorage.getItem('accessToken');
  
  // User is authenticated if we have both a token and user data
  const isAuthenticated = hasToken && !!user;

  // Debug logging
//   console.log('Auth state:', {
//     hasToken,
//     user: !!user,
//     isAuthenticated,
//     isLoading,
//     error: !!error
//   });

  return {
    user,
    isAuthenticated,
    isLoading: hasToken ? isLoading : false, // Don't show loading if no token
    error,
  };
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (data: { firstName?: string; lastName?: string; avatar?: string }) => 
      authService.updateProfile(data),
    onSuccess: (user) => {
      queryClient.setQueryData(['user'], user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully.',
      });
    },
    onError: () => {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update profile. Please try again.',
      });
    },
  });
};

export const useChangePassword = () => {
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => 
      authService.changePassword(data),
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Password Changed',
        message: 'Your password has been changed successfully.',
      });
    },
    onError: () => {
      addToast({
        type: 'error',
        title: 'Password Change Failed',
        message: 'Failed to change password. Please check your current password and try again.',
      });
    },
  });
};

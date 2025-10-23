import { AxiosError } from 'axios';
import { ApiError } from '../types/auth';
import { useToast } from '../contexts/ToastContext';

export const useApiError = () => {
  const { addToast } = useToast();

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
      // Handle specific HTTP status codes
      if (error.response?.status === 401) {
        const message = error.response?.data?.message || error.response?.data?.error || '';
        
        // Check for Gmail-specific auth errors
        if (message.includes('Gmail') || message.includes('expired') || message.includes('reconnect')) {
          return 'Gmail connection has expired. Please reconnect your Gmail account.';
        }
        
        return 'Invalid email or password. Please try again.';
      }
      
      if (error.response?.status === 409) {
        return 'An account with this email already exists. Please sign in instead.';
      }
      
      if (error.response?.status === 422) {
        return 'Please check your input and try again.';
      }
      
      if (error.response?.status === 500) {
        return 'Something went wrong on our end. Please try again later.';
      }
      
      // Try to get the error message from the response
      const apiError = error.response?.data as ApiError;
      if (apiError?.message) {
        return apiError.message;
      }
      
      // Network errors
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        return 'Unable to connect to the server. Please check your connection.';
      }
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return 'An unexpected error occurred. Please try again.';
  };

  const handleApiError = (error: unknown, customTitle?: string) => {
    console.error('API Error:', error);

    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        const message = error.response?.data?.message || error.response?.data?.error || '';
        
        if (message.includes('Gmail') || message.includes('expired') || message.includes('reconnect')) {
          addToast({
            type: 'error',
            title: 'Gmail Connection Expired',
            message: 'Your Gmail connection has expired. Please reconnect your Gmail account in Email Management.',
            duration: 8000,
          });
          return;
        }

        addToast({
          type: 'error',
          title: 'Authentication Error',
          message: 'Your session has expired. Please log in again.',
        });
        
        setTimeout(() => {
          window.location.href = '/signin';
        }, 2000);
        
      } else if (error.response?.status === 403) {
        addToast({
          type: 'error',
          title: 'Access Denied',
          message: 'You do not have permission to perform this action.',
        });
        
      } else if (error.response?.status >= 500) {
        addToast({
          type: 'error',
          title: 'Server Error',
          message: 'An internal server error occurred. Please try again later.',
        });
        
      } else if (error.response?.status === 429) {
        addToast({
          type: 'error',
          title: 'Rate Limit Exceeded',
          message: 'Too many requests. Please wait a moment before trying again.',
        });
        
      } else {
        addToast({
          type: 'error',
          title: customTitle || 'Error',
          message: getErrorMessage(error),
        });
      }
    } else {
      addToast({
        type: 'error',
        title: customTitle || 'Error',
        message: getErrorMessage(error),
      });
    }
  };

  return { getErrorMessage, handleApiError };
};

// Utility function to check if an error is a Gmail-related authentication error
export const isGmailAuthError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || error.response?.data?.error || '';
    return (
      error.response?.status === 401 && 
      (message.includes('Gmail') || 
       message.includes('expired') || 
       message.includes('reconnect') ||
       message.includes('connect your Gmail'))
    );
  }
  return false;
};

// Utility function to extract user-friendly error message
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || 
           error.response?.data?.error || 
           error.message || 
           'An unexpected error occurred';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

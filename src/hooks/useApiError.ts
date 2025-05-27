import { AxiosError } from 'axios';
import { ApiError } from '../types/auth';

export const useApiError = () => {
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
      // Handle specific HTTP status codes
      if (error.response?.status === 401) {
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

  return { getErrorMessage };
};

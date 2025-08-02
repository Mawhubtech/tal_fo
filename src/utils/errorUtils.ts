// Utility functions for handling API errors

export interface ApiError {
  response?: {
    data?: {
      message?: string | string[];
      error?: string;
      statusCode?: number;
    };
  };
  message?: string;
}

/**
 * Extract and format error messages from API responses
 */
export const formatApiError = (error: ApiError): string => {
  // Handle validation errors (array of messages)
  if (error.response?.data?.message) {
    const backendMessage = error.response.data.message;
    
    if (Array.isArray(backendMessage)) {
      // Join validation errors with proper formatting
      return backendMessage
        .map(msg => msg.charAt(0).toUpperCase() + msg.slice(1))
        .join('. ') + '.';
    } else {
      return backendMessage;
    }
  }
  
  // Handle other API errors
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  // Handle network or other errors
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Check if error is a validation error (400 status with array messages)
 */
export const isValidationError = (error: ApiError): boolean => {
  return (
    error.response?.data?.statusCode === 400 &&
    Array.isArray(error.response?.data?.message)
  );
};

/**
 * Extract field-specific validation errors for form handling
 */
export const extractFieldErrors = (error: ApiError): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};
  
  if (isValidationError(error)) {
    const messages = error.response?.data?.message as string[];
    
    messages.forEach(message => {
      // Try to extract field name from common validation message patterns
      if (message.includes('password')) {
        fieldErrors.password = message;
      } else if (message.includes('email')) {
        fieldErrors.email = message;
      } else if (message.includes('firstName') || message.includes('first name')) {
        fieldErrors.firstName = message;
      } else if (message.includes('lastName') || message.includes('last name')) {
        fieldErrors.lastName = message;
      } else {
        // Generic field error
        fieldErrors.general = message;
      }
    });
  }
  
  return fieldErrors;
};

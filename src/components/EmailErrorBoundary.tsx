import React from 'react';
import { AlertCircle, RefreshCw, Wifi, Server, ShieldAlert, Clock } from 'lucide-react';
import type { AxiosError } from 'axios';

interface EmailErrorDisplayProps {
  error: Error | AxiosError | null;
  context?: string;
  onRetry?: () => void;
  showDetails?: boolean;
}

export const EmailErrorDisplay: React.FC<EmailErrorDisplayProps> = ({
  error,
  context = 'email data',
  onRetry,
  showDetails = false,
}) => {
  if (!error) return null;

  const axiosError = error as AxiosError<{ message?: string; error?: string }>;
  const status = axiosError.response?.status;
  const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || error.message;

  // Determine error type and appropriate icon/message
  const getErrorInfo = () => {
    if (!status) {
      // Network error
      return {
        icon: <Wifi className="w-12 h-12 text-orange-500" />,
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection.',
        color: 'orange',
        canRetry: true,
      };
    }

    switch (status) {
      case 401:
      case 403:
        return {
          icon: <ShieldAlert className="w-12 h-12 text-red-500" />,
          title: 'Authentication Error',
          message: 'Your session has expired or you don\'t have permission to access this resource.',
          color: 'red',
          canRetry: false,
        };
      
      case 404:
        return {
          icon: <AlertCircle className="w-12 h-12 text-yellow-500" />,
          title: 'Not Found',
          message: `No ${context} found.`,
          color: 'yellow',
          canRetry: false,
        };
      
      case 429:
        return {
          icon: <Clock className="w-12 h-12 text-orange-500" />,
          title: 'Rate Limit Exceeded',
          message: 'Too many requests. Please wait a moment before trying again.',
          color: 'orange',
          canRetry: true,
        };
      
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          icon: <Server className="w-12 h-12 text-red-500" />,
          title: 'Server Error',
          message: 'The server encountered an error. Our team has been notified.',
          color: 'red',
          canRetry: true,
        };
      
      default:
        return {
          icon: <AlertCircle className="w-12 h-12 text-red-500" />,
          title: 'Error',
          message: errorMessage || `An error occurred while loading ${context}.`,
          color: 'red',
          canRetry: true,
        };
    }
  };

  const errorInfo = getErrorInfo();

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          {errorInfo.icon}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {errorInfo.title}
        </h3>
        
        <p className="text-gray-600 mb-4">
          {errorInfo.message}
        </p>

        {showDetails && errorMessage && (
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-xs text-gray-700 font-mono break-words">
              {errorMessage}
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          {errorInfo.canRetry && onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
          
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>

        {status && (
          <p className="text-xs text-gray-500 mt-4">
            Error Code: {status}
          </p>
        )}
      </div>
    </div>
  );
};

interface EmailDataEmptyStateProps {
  type: 'templates' | 'providers' | 'emails' | 'logs';
  onAction?: () => void;
  actionLabel?: string;
}

export const EmailDataEmptyState: React.FC<EmailDataEmptyStateProps> = ({
  type,
  onAction,
  actionLabel,
}) => {
  const getEmptyStateInfo = () => {
    switch (type) {
      case 'templates':
        return {
          title: 'No Email Templates',
          message: 'Get started by creating your first email template or importing preset templates.',
          defaultAction: 'Create Template',
        };
      case 'providers':
        return {
          title: 'No Email Providers',
          message: 'Connect an email service (Gmail, Outlook, or SMTP) to start sending emails.',
          defaultAction: 'Connect Provider',
        };
      case 'emails':
        return {
          title: 'No Emails',
          message: 'No emails have been sent or received yet.',
          defaultAction: undefined,
        };
      case 'logs':
        return {
          title: 'No Email Logs',
          message: 'Email activity will appear here once you start sending emails.',
          defaultAction: undefined,
        };
      default:
        return {
          title: 'No Data',
          message: 'No data available at the moment.',
          defaultAction: undefined,
        };
    }
  };

  const emptyInfo = getEmptyStateInfo();

  return (
    <div className="text-center py-12 px-4">
      <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {emptyInfo.title}
      </h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        {emptyInfo.message}
      </p>
      
      {(onAction || emptyInfo.defaultAction) && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
        >
          {actionLabel || emptyInfo.defaultAction}
        </button>
      )}
    </div>
  );
};

// Import missing icon
import { Mail } from 'lucide-react';

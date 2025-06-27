import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { config } from '../lib/config';
import type { Interview } from '../types/interview.types';

// Singleton pattern to prevent multiple simultaneous calls
let emailSettingsPromise: Promise<EmailSettings> | null = null;
let emailSettingsCache: EmailSettings | null = null;

// Create axios instance for email operations
const emailApi = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
emailApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Clear cache function
const clearEmailSettingsCache = () => {
  emailSettingsCache = null;
  emailSettingsPromise = null;
  localStorage.removeItem('emailSettings');
  localStorage.removeItem('emailSettingsTimestamp');
};

// Singleton fetch function
const fetchEmailSettings = async (): Promise<EmailSettings> => {
  if (emailSettingsCache) {
    console.log('📦 Using in-memory cache');
    return emailSettingsCache;
  }

  if (emailSettingsPromise) {
    console.log('⏳ Waiting for existing request');
    return emailSettingsPromise;
  }

  console.log('🔥 EMAIL SETTINGS API CALL - Making new request');
  console.trace(); // Add stack trace to see where calls are coming from

  emailSettingsPromise = emailApi.get('/email/settings').then(response => {
    emailSettingsCache = response.data;
    emailSettingsPromise = null;
    
    // Cache in localStorage as backup
    localStorage.setItem('emailSettings', JSON.stringify(response.data));
    localStorage.setItem('emailSettingsTimestamp', Date.now().toString());
    
    return response.data;
  }).catch(error => {
    emailSettingsPromise = null;
    throw error;
  });

  return emailSettingsPromise;
};

interface SendEmailParams {
  interviewId: string;
  emailType: string;
  recipients: string[];
  subject: string;
  body: string;
}

interface EmailSettings {
  isGmailConnected: boolean;
  gmailEmail?: string;
  hasRequiredScopes: boolean;
  lastConnected?: string;
}

export const useEmailService = (enabled: boolean = true) => {
  // Get email settings/status
  const {
    data: emailSettings,
    isLoading: isLoadingSettings,
    refetch: refetchSettings
  } = useQuery({
    queryKey: ['email-settings'],
    queryFn: fetchEmailSettings,
    enabled, // Only run if enabled
    staleTime: Infinity, // Data never becomes stale
    gcTime: Infinity, // Keep in cache forever
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: false, // Don't refetch on network reconnect
    refetchOnMount: false, // Don't refetch when component mounts if data exists
    retry: false, // Don't retry on failure
    refetchInterval: false, // Disable automatic refetching
    networkMode: 'offlineFirst', // Use cache even when offline
    placeholderData: () => {
      // Use localStorage cache as placeholder
      try {
        const cached = localStorage.getItem('emailSettings');
        const timestamp = localStorage.getItem('emailSettingsTimestamp');
        
        if (cached && timestamp) {
          const age = Date.now() - parseInt(timestamp);
          // Use cache if less than 10 minutes old
          if (age < 10 * 60 * 1000) {
            console.log('📦 Using cached email settings');
            return JSON.parse(cached);
          }
        }
      } catch (error) {
        console.warn('Failed to read email settings cache:', error);
      }
      return undefined;
    }
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: async (params: SendEmailParams) => {
      const response = await emailApi.post(`/interviews/${params.interviewId}/send-email`, {
        emailType: params.emailType,
        recipients: params.recipients,
        subject: params.subject,
        body: params.body
      });
      return response.data;
    }
  });

  // Connect Gmail OAuth
  const connectGmailMutation = useMutation({
    mutationFn: async () => {
      const response = await emailApi.post('/email/connect-gmail');
      return response.data;
    },
    // Remove automatic refetch - let the OAuth callback handle it
  });

  // Disconnect Gmail
  const disconnectGmailMutation = useMutation({
    mutationFn: async () => {
      const response = await emailApi.delete('/email/disconnect-gmail');
      return response.data;
    },
    onSuccess: () => {
      // Clear cache and refetch on successful disconnect
      clearEmailSettingsCache();
      refetchSettings();
    }
  });

  // Custom refetch that clears cache first
  const refetchSettingsWithCacheClear = () => {
    clearEmailSettingsCache();
    return refetchSettings();
  };

  return {
    emailSettings,
    isLoadingSettings,
    sendEmail: sendEmailMutation.mutateAsync,
    isSendingEmail: sendEmailMutation.isPending,
    connectGmail: connectGmailMutation.mutateAsync,
    isConnectingGmail: connectGmailMutation.isPending,
    disconnectGmail: disconnectGmailMutation.mutateAsync,
    isDisconnectingGmail: disconnectGmailMutation.isPending,
    refetchSettings: refetchSettingsWithCacheClear
  };
};

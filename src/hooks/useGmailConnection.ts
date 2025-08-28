import { useState, useCallback } from 'react';
import { emailApiService } from '../services/emailApiService';

export interface GmailConnectionStatus {
  isConnected: boolean;
  email?: string;
  hasRequiredScopes: boolean;
  lastConnected?: string;
}

export const useGmailConnection = () => {
  const [status, setStatus] = useState<GmailConnectionStatus>({
    isConnected: false,
    hasRequiredScopes: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const gmailSettings = await emailApiService.getGmailSettings();
      setStatus({
        isConnected: gmailSettings.isGmailConnected,
        email: gmailSettings.gmailEmail,
        hasRequiredScopes: gmailSettings.hasRequiredScopes,
        lastConnected: gmailSettings.lastConnected,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check Gmail status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleEmailError = useCallback((error: any): boolean => {
    // Check if this is a Gmail scope or authentication error
    if (error?.response?.data?.message) {
      const message = error.response.data.message;
      if (
        message.includes('insufficient authentication scopes') ||
        message.includes('Gmail account needs additional permissions') ||
        message.includes('Please reconnect your Gmail account')
      ) {
        return true; // This is a Gmail reconnection error
      }
    }
    
    if (error?.message) {
      if (
        error.message.includes('insufficient authentication scopes') ||
        error.message.includes('Gmail account needs additional permissions') ||
        error.message.includes('Please reconnect your Gmail account')
      ) {
        return true; // This is a Gmail reconnection error
      }
    }
    
    return false; // Not a Gmail reconnection error
  }, []);

  const reconnect = useCallback(async () => {
    try {
      const { authUrl } = await emailApiService.reconnectGmail();
      return authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate reconnection');
      throw err;
    }
  }, []);

  const disconnect = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await emailApiService.disconnectGmail();
      setStatus({
        isConnected: false,
        hasRequiredScopes: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect Gmail');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    status,
    isLoading,
    error,
    checkStatus,
    handleEmailError,
    reconnect,
    disconnect,
  };
};

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useEmailService } from '../hooks/useEmailService';
import { useToast } from './ToastContext';

interface GmailStatusContextType {
  isGmailConnectionExpired: boolean;
  showReconnectionPrompt: () => void;
  hideReconnectionPrompt: () => void;
  checkGmailStatus: () => void;
}

const GmailStatusContext = createContext<GmailStatusContextType | undefined>(undefined);

interface GmailStatusProviderProps {
  children: ReactNode;
}

export const GmailStatusProvider: React.FC<GmailStatusProviderProps> = ({ children }) => {
  const [isGmailConnectionExpired, setIsGmailConnectionExpired] = useState(false);
  const { emailSettings, refetchSettings } = useEmailService();
  const { addToast } = useToast();

  const checkGmailStatus = () => {
    // Check if Gmail was previously connected but is now disconnected
    const wasConnected = localStorage.getItem('gmailWasConnected') === 'true';
    const isCurrentlyConnected = emailSettings?.isGmailConnected;
    
    if (wasConnected && !isCurrentlyConnected) {
      setIsGmailConnectionExpired(true);
    }
    
    // Update localStorage with current status
    if (isCurrentlyConnected) {
      localStorage.setItem('gmailWasConnected', 'true');
      setIsGmailConnectionExpired(false);
    }
  };

  const showReconnectionPrompt = () => {
    setIsGmailConnectionExpired(true);
  };

  const hideReconnectionPrompt = () => {
    setIsGmailConnectionExpired(false);
  };

  // Monitor Gmail status changes
  useEffect(() => {
    checkGmailStatus();
  }, [emailSettings]);

  // Listen for API errors globally
  useEffect(() => {
    const handleGlobalError = (event: CustomEvent) => {
      const error = event.detail;
      
      // Check if this is a Gmail auth error
      if (error?.response?.status === 401) {
        const message = error.response?.data?.message || error.response?.data?.error || '';
        
        if (message.includes('Gmail') || message.includes('expired') || message.includes('reconnect')) {
          showReconnectionPrompt();
          
          addToast({
            type: 'error',
            title: 'Gmail Connection Expired',
            message: 'Your Gmail connection has expired. Please reconnect to continue sending emails.',
            duration: 8000,
          });
        }
      }
    };

    // Listen for custom gmail error events
    window.addEventListener('gmail-auth-error', handleGlobalError as EventListener);
    
    return () => {
      window.removeEventListener('gmail-auth-error', handleGlobalError as EventListener);
    };
  }, [addToast]);

  const value: GmailStatusContextType = {
    isGmailConnectionExpired,
    showReconnectionPrompt,
    hideReconnectionPrompt,
    checkGmailStatus,
  };

  return (
    <GmailStatusContext.Provider value={value}>
      {children}
    </GmailStatusContext.Provider>
  );
};

export const useGmailStatus = (): GmailStatusContextType => {
  const context = useContext(GmailStatusContext);
  if (context === undefined) {
    throw new Error('useGmailStatus must be used within a GmailStatusProvider');
  }
  return context;
};

// Utility function to dispatch Gmail auth errors
export const dispatchGmailAuthError = (error: any) => {
  const event = new CustomEvent('gmail-auth-error', { detail: error });
  window.dispatchEvent(event);
};

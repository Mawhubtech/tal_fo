import { useState } from 'react';
import { emailApiService } from '../services/emailApiService';

export const useGmailReauthorization = () => {
  const [isReauthorizing, setIsReauthorizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReauthorization = async () => {
    try {
      setIsReauthorizing(true);
      setError(null);
      
      const { authUrl } = await emailApiService.forceReauthorization();
      
      // Open the authorization URL in a new window
      const authWindow = window.open(
        authUrl,
        'gmail-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Poll for window closure (indicating auth completion)
      const pollTimer = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(pollTimer);
          setIsReauthorizing(false);
          // Optionally refresh the page or trigger a callback
          window.location.reload();
        }
      }, 1000);

      // Cleanup if window is not closed after 5 minutes
      setTimeout(() => {
        clearInterval(pollTimer);
        if (authWindow && !authWindow.closed) {
          authWindow.close();
        }
        setIsReauthorizing(false);
      }, 300000); // 5 minutes

    } catch (err: any) {
      console.error('Failed to initiate Gmail reauthorization:', err);
      setError(err.message || 'Failed to start reauthorization process');
      setIsReauthorizing(false);
    }
  };

  const clearError = () => setError(null);

  return {
    isReauthorizing,
    error,
    handleReauthorization,
    clearError
  };
};

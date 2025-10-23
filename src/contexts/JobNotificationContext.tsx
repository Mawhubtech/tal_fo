import React, { createContext, useContext, useCallback } from 'react';
import { useJobsWebSocket } from '../hooks/useJobsWebSocket';
import { useAuthContext } from './AuthContext';
import { useToast } from './ToastContext';

interface JobNotificationContextValue {
  isConnected: boolean;
}

const JobNotificationContext = createContext<JobNotificationContextValue | undefined>(undefined);

interface JobNotificationProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export const JobNotificationProvider: React.FC<JobNotificationProviderProps> = ({ 
  children, 
  enabled = true 
}) => {
  const { user } = useAuthContext();
  const { addToast } = useToast();

  // Notification handlers
  const handleJobCreated = useCallback((job: any) => {
    addToast({
      type: 'success',
      title: 'New Job Posted!',
      message: job.title,
      duration: 4000,
    });
  }, [addToast]);

  const handleJobUpdated = useCallback((job: any) => {
    // Only show notification for significant updates
    // You can add logic here to determine what counts as significant
    console.log('[JobNotifications] Job updated:', job);
  }, []);

  const handleJobDeleted = useCallback((data: { jobId: string }) => {
    addToast({
      type: 'info',
      title: 'Job Deleted',
      message: 'A job has been deleted',
      duration: 3000,
    });
  }, [addToast]);

  const handleJobStatusChanged = useCallback((data: { jobId: string; status: string }) => {
    const statusMessages: Record<string, string> = {
      Published: 'published',
      Draft: 'moved to draft',
      Paused: 'paused',
      Closed: 'closed',
      Archived: 'archived',
    };

    const message = statusMessages[data.status] || `status changed to ${data.status}`;
    
    addToast({
      type: 'info',
      title: 'Job Status Updated',
      message: `A job has been ${message}`,
      duration: 3000,
    });
  }, [addToast]);

  // Setup WebSocket connection
  const { isConnected } = useJobsWebSocket({
    enabled: enabled && !!user,
    onJobCreated: handleJobCreated,
    onJobUpdated: handleJobUpdated,
    onJobDeleted: handleJobDeleted,
    onJobStatusChanged: handleJobStatusChanged,
  });

  const value: JobNotificationContextValue = {
    isConnected,
  };

  return (
    <JobNotificationContext.Provider value={value}>
      {children}
    </JobNotificationContext.Provider>
  );
};

export const useJobNotifications = (): JobNotificationContextValue => {
  const context = useContext(JobNotificationContext);
  if (context === undefined) {
    throw new Error('useJobNotifications must be used within a JobNotificationProvider');
  }
  return context;
};

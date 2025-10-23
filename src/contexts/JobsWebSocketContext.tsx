import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

interface JobsWebSocketContextValue {
  isConnected: boolean;
}

const JobsWebSocketContext = createContext<JobsWebSocketContextValue | undefined>(undefined);

interface JobsWebSocketProviderProps {
  children: React.ReactNode;
}

export const JobsWebSocketProvider: React.FC<JobsWebSocketProviderProps> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const backendUrl =
      import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') ||
      'https://tal.mawhub.io';
    const token = localStorage.getItem('accessToken');

    if (!token) {
      console.log('[JobsWebSocket] No auth token - skipping WebSocket connection');
      return;
    }

    console.log('[JobsWebSocket] Connecting to:', `${backendUrl}/jobs`);

    const socket = io(`${backendUrl}/jobs`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: {
        token: token,
      },
      extraHeaders: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[JobsWebSocket] Connected to jobs WebSocket');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[JobsWebSocket] Disconnected from jobs WebSocket');
      setIsConnected(false);
    });

    // Listen for candidate added to job events
    socket.on('candidateAddedToJob', (data: { jobId: string; candidateId: string; jobApplication: any }) => {
      console.log('[JobsWebSocket] Candidate added to job:', data);
      
      // Invalidate job applications queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['jobApplications', 'byJob', data.jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
      
      // Invalidate job ATS page data
      queryClient.invalidateQueries({ queryKey: ['jobATSPageData'] });
      
      // Invalidate job details to update candidate count
      queryClient.invalidateQueries({ queryKey: ['jobs', data.jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      
      console.log('[JobsWebSocket] Invalidated queries for job:', data.jobId);
    });

    // Listen for job created events
    socket.on('jobCreated', (job: any) => {
      console.log('[JobsWebSocket] Job created:', job);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    });

    // Listen for job updated events
    socket.on('jobUpdated', (job: any) => {
      console.log('[JobsWebSocket] Job updated:', job);
      queryClient.invalidateQueries({ queryKey: ['jobs', job.id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    });

    // Listen for job deleted events
    socket.on('jobDeleted', (data: { jobId: string }) => {
      console.log('[JobsWebSocket] Job deleted:', data);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    });

    // Listen for job status changed events
    socket.on('jobStatusChanged', (data: { jobId: string; status: string }) => {
      console.log('[JobsWebSocket] Job status changed:', data);
      queryClient.invalidateQueries({ queryKey: ['jobs', data.jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    });

    socket.on('error', (error) => {
      console.error('[JobsWebSocket] Socket error:', error);
    });

    return () => {
      console.log('[JobsWebSocket] Cleaning up WebSocket connection');
      socket.disconnect();
    };
  }, [queryClient]);

  const value: JobsWebSocketContextValue = {
    isConnected,
  };

  return (
    <JobsWebSocketContext.Provider value={value}>
      {children}
    </JobsWebSocketContext.Provider>
  );
};

export const useJobsWebSocket = () => {
  const context = useContext(JobsWebSocketContext);
  if (context === undefined) {
    throw new Error('useJobsWebSocket must be used within a JobsWebSocketProvider');
  }
  return context;
};

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

interface UseJobsWebSocketProps {
  enabled?: boolean;
  onJobCreated?: (job: any) => void;
  onJobUpdated?: (job: any) => void;
  onJobDeleted?: (data: { jobId: string }) => void;
  onJobStatusChanged?: (data: { jobId: string; status: string }) => void;
}

interface UseJobsWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  cleanup: () => void;
}

export const useJobsWebSocket = ({
  enabled = true,
  onJobCreated,
  onJobUpdated,
  onJobDeleted,
  onJobStatusChanged,
}: UseJobsWebSocketProps): UseJobsWebSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  // Use refs for callbacks to avoid re-connecting when callbacks change
  const callbacksRef = useRef({
    onJobCreated,
    onJobUpdated,
    onJobDeleted,
    onJobStatusChanged,
  });

  // Update callbacks ref when props change
  useEffect(() => {
    callbacksRef.current = {
      onJobCreated,
      onJobUpdated,
      onJobDeleted,
      onJobStatusChanged,
    };
  }, [onJobCreated, onJobUpdated, onJobDeleted, onJobStatusChanged]);

  const invalidateJobQueries = useCallback(() => {
    // Invalidate all job-related queries to trigger refetch
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
    queryClient.invalidateQueries({ queryKey: ['job-stats'] });
  }, [queryClient]);

  useEffect(() => {
    if (!enabled) {
      console.log('[JobsWebSocket] Hook disabled');
      return;
    }

    const backendUrl =
      import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') ||
      'https://tal.mawhub.io';
    const token = localStorage.getItem('accessToken');

    console.log('[JobsWebSocket] Initializing connection:', {
      backendUrl,
      namespace: '/jobs',
      hasToken: !!token,
      enabled
    });

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
      console.log('[JobsWebSocket] Connected to jobs WebSocket - listening for all job events');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[JobsWebSocket] Disconnected from jobs WebSocket');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('[JobsWebSocket] Connection error:', error);
    });

    // Job events
    socket.on('jobCreated', (job: any) => {
      console.log('[JobsWebSocket] ✅ Job created event received:', job);
      
      // Invalidate queries to refetch data
      invalidateJobQueries();
      console.log('[JobsWebSocket] Invalidated queries - UI should update');
      
      // Call custom callback if provided
      if (callbacksRef.current.onJobCreated) {
        callbacksRef.current.onJobCreated(job);
      }
    });

    socket.on('jobUpdated', (job: any) => {
      console.log('[JobsWebSocket] Job updated:', job);
      
      // Invalidate queries to refetch data
      invalidateJobQueries();
      
      // Call custom callback if provided
      if (callbacksRef.current.onJobUpdated) {
        callbacksRef.current.onJobUpdated(job);
      }
    });

    socket.on('jobDeleted', (data: { jobId: string }) => {
      console.log('[JobsWebSocket] Job deleted:', data);
      
      // Invalidate queries to refetch data
      invalidateJobQueries();
      
      // Call custom callback if provided
      if (callbacksRef.current.onJobDeleted) {
        callbacksRef.current.onJobDeleted(data);
      }
    });

    socket.on('jobStatusChanged', (data: { jobId: string; status: string }) => {
      console.log('[JobsWebSocket] Job status changed:', data);
      
      // Invalidate queries to refetch data
      invalidateJobQueries();
      
      // Call custom callback if provided
      if (callbacksRef.current.onJobStatusChanged) {
        callbacksRef.current.onJobStatusChanged(data);
      }
    });

    socket.on('jobStatsUpdated', (stats: any) => {
      console.log('[JobsWebSocket] Job stats updated:', stats);
      
      // Invalidate stats queries
      queryClient.invalidateQueries({ queryKey: ['job-stats'] });
    });

    return () => {
      console.log('[JobsWebSocket] Cleaning up WebSocket connection');
      socket.disconnect();
    };
  }, [enabled, invalidateJobQueries, queryClient]);

  const cleanup = useCallback(() => {
    if (socketRef.current) {
      console.log('[JobsWebSocket] Manual cleanup');
      socketRef.current.disconnect();
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    cleanup,
  };
};

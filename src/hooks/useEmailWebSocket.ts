import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

interface UseEmailWebSocketProps {
  providerId?: string;
  enabled?: boolean;
  onNewEmail?: (data: { providerId: string; email: any }) => void;
  onEmailUpdated?: (data: { providerId: string; emailId: string; updates: any }) => void;
  onEmailSent?: (data: { providerId: string; email: any }) => void;
  onProviderExpired?: (data: { providerId: string; providerType: 'gmail' | 'outlook'; providerName: string; message: string }) => void;
}

interface UseEmailWebSocketReturn {
  isConnected: boolean;
  socket: Socket | null;
}

export const useEmailWebSocket = ({
  providerId,
  enabled = true,
  onNewEmail,
  onEmailUpdated,
  onEmailSent,
  onProviderExpired,
}: UseEmailWebSocketProps): UseEmailWebSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  // Use refs for callbacks to avoid re-connecting when callbacks change
  const callbacksRef = useRef({
    onNewEmail,
    onEmailUpdated,
    onEmailSent,
    onProviderExpired,
  });

  // Update callbacks ref when props change
  useEffect(() => {
    callbacksRef.current = {
      onNewEmail,
      onEmailUpdated,
      onEmailSent,
      onProviderExpired,
    };
  }, [onNewEmail, onEmailUpdated, onEmailSent, onProviderExpired]);

  useEffect(() => {
    if (!enabled) {
      console.log('[EmailWebSocket] Hook disabled');
      return;
    }

    const backendUrl =
      import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') ||
      'https://tal.mawhub.io';
    const token = localStorage.getItem('accessToken');

    if (!token) {
      console.log('[EmailWebSocket] No auth token - skipping WebSocket connection');
      return;
    }

    console.log('[EmailWebSocket] Initializing connection:', {
      backendUrl,
      namespace: '/emails',
      hasToken: !!token,
      enabled,
      providerId,
    });

    console.log('[EmailWebSocket] Connecting to:', `${backendUrl}/emails`);

    const socket = io(`${backendUrl}/emails`, {
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
      console.log('[EmailWebSocket] ✅ Connected to email updates');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[EmailWebSocket] ❌ Disconnected from email updates');
      setIsConnected(false);
    });

    socket.on('connected', (data) => {
      console.log('[EmailWebSocket] 🔔 Server acknowledged connection:', data);
    });

    // Listen for new emails
    socket.on('newEmail', (data: { providerId: string; email: any; timestamp: Date }) => {
      console.log('[EmailWebSocket] 📧 New email received:', data);

      // Only process if it's for current provider (or no provider filter)
      if (!providerId || data.providerId === providerId) {
        // Invalidate queries to trigger refetch
        queryClient.invalidateQueries({
          queryKey: ['providerMessages', data.providerId],
        });

        // Also invalidate the general messages query
        queryClient.invalidateQueries({
          queryKey: ['providerMessages'],
        });

        // Call callback if provided
        if (callbacksRef.current.onNewEmail) {
          callbacksRef.current.onNewEmail(data);
        }
      }
    });

    // Listen for email updates (read status, labels, etc.)
    socket.on(
      'emailUpdated',
      (data: { providerId: string; emailId: string; updates: any; timestamp: Date }) => {
        console.log('[EmailWebSocket] 🔄 Email updated:', data);

        if (!providerId || data.providerId === providerId) {
          // Invalidate queries to trigger refetch
          queryClient.invalidateQueries({
            queryKey: ['providerMessages', data.providerId],
          });

          if (callbacksRef.current.onEmailUpdated) {
            callbacksRef.current.onEmailUpdated(data);
          }
        }
      }
    );

    // Listen for sent email confirmation
    socket.on('emailSent', (data: { providerId: string; email: any; timestamp: Date }) => {
      console.log('[EmailWebSocket] ✉️ Email sent:', data);

      if (!providerId || data.providerId === providerId) {
        // Invalidate queries to show sent email immediately
        queryClient.invalidateQueries({
          queryKey: ['providerMessages', data.providerId],
        });

        if (callbacksRef.current.onEmailSent) {
          callbacksRef.current.onEmailSent(data);
        }
      }
    });

    // Listen for provider expiration notifications
    socket.on('providerExpired', (data: { 
      providerId: string; 
      providerType: 'gmail' | 'outlook'; 
      providerName: string; 
      message: string;
      timestamp: Date;
    }) => {
      console.warn('[EmailWebSocket] ⚠️ Provider expired:', data);

      // Invalidate provider queries to update UI
      queryClient.invalidateQueries({
        queryKey: ['emailProviders'],
      });

      queryClient.invalidateQueries({
        queryKey: ['providerMessages', data.providerId],
      });

      if (callbacksRef.current.onProviderExpired) {
        callbacksRef.current.onProviderExpired(data);
      }
    });

    socket.on('error', (error) => {
      console.error('[EmailWebSocket] ⚠️ Socket error:', error);
    });

    return () => {
      console.log('[EmailWebSocket] 🧹 Cleaning up WebSocket connection');
      socket.disconnect();
    };
  }, [enabled, providerId, queryClient]);

  return {
    isConnected,
    socket: socketRef.current,
  };
};

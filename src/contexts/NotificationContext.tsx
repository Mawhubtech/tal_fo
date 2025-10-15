import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Notification } from '../types/notification.types';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
}

const MAX_NOTIFICATIONS = 50; // Keep last 50 notifications

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const backendUrl =
      import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') ||
      'https://tal.mawhub.io';
    const token = localStorage.getItem('accessToken');

    if (!token) {
      console.log('[Notifications] No auth token - skipping WebSocket connection');
      return;
    }

    console.log('[Notifications] Connecting to:', `${backendUrl}/notifications`);

    const socket = io(`${backendUrl}/notifications`, {
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
      console.log('[Notifications] Connected to notifications WebSocket');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[Notifications] Disconnected from notifications WebSocket');
      setIsConnected(false);
    });

    socket.on('connected', (data) => {
      console.log('[Notifications] Server acknowledged connection:', data);
    });

    // Listen for notifications
    socket.on('notification', (notification: Notification) => {
      console.log('[Notifications] Received notification:', notification);
      
      setNotifications((prev) => {
        // Add new notification at the beginning
        const updated = [notification, ...prev];
        // Keep only last MAX_NOTIFICATIONS
        return updated.slice(0, MAX_NOTIFICATIONS);
      });

      // Show browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png',
          tag: notification.id,
        });
      }
    });

    socket.on('error', (error) => {
      console.error('[Notifications] Socket error:', error);
    });

    return () => {
      console.log('[Notifications] Cleaning up WebSocket connection');
      socket.disconnect();
    };
  }, []);

  // Request browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        console.log('[Notifications] Browser notification permission:', permission);
      });
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

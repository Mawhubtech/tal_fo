import React, { useState, useCallback } from 'react';
import Toast, { ToastProps } from './Toast';

interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

let toastId = 0;

// Global toast manager
class ToastManager {
  private listeners: ((toasts: ToastData[]) => void)[] = [];
  private toasts: ToastData[] = [];

  subscribe(listener: (toasts: ToastData[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  add(toast: Omit<ToastData, 'id'>) {
    const newToast = { ...toast, id: (++toastId).toString() };
    this.toasts.push(newToast);
    this.emit();
    return newToast.id;
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.emit();
  }

  clear() {
    this.toasts = [];
    this.emit();
  }
}

export const toastManager = new ToastManager();

// Convenience functions
export const toast = {
  success: (title: string, message?: string, duration?: number) =>
    toastManager.add({ type: 'success', title, message, duration }),
  error: (title: string, message?: string, duration?: number) =>
    toastManager.add({ type: 'error', title, message, duration }),
  warning: (title: string, message?: string, duration?: number) =>
    toastManager.add({ type: 'warning', title, message, duration }),
  info: (title: string, message?: string, duration?: number) =>
    toastManager.add({ type: 'info', title, message, duration }),
};

const ToastContainer: React.FC<ToastContainerProps> = ({ 
  position = 'top-right' 
}) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  React.useEffect(() => {
    return toastManager.subscribe(setToasts);
  }, []);

  const handleClose = useCallback((id: string) => {
    toastManager.remove(id);
  }, []);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className={`fixed z-50 ${getPositionClasses()}`}>
      <div className="space-y-3">
        {toasts.map((toastData) => (
          <Toast
            key={toastData.id}
            id={toastData.id}
            type={toastData.type}
            title={toastData.title}
            message={toastData.message}
            duration={toastData.duration}
            onClose={handleClose}
          />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setIsVisible(true);

    // Auto close
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300); // Wait for animation
  };

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          titleColor: 'text-green-800',
          messageColor: 'text-green-700'
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          titleColor: 'text-red-800',
          messageColor: 'text-red-700'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700'
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: <Info className="w-5 h-5 text-blue-600" />,
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700'
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          icon: <Info className="w-5 h-5 text-gray-600" />,
          titleColor: 'text-gray-800',
          messageColor: 'text-gray-700'
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className={`max-w-sm w-full border rounded-lg shadow-lg pointer-events-auto transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${styles.bg}`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {styles.icon}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-medium ${styles.titleColor}`}>
              {title}
            </p>
            {message && (
              <p className={`mt-1 text-sm ${styles.messageColor}`}>
                {message}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="rounded-md inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={handleClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;

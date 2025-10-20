import React, { useState } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register';
  defaultUserRole?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialView = 'login',
  defaultUserRole = 'user'
}) => {
  const [currentView, setCurrentView] = useState(initialView);

  if (!isOpen) return null;

  const handleSwitchToRegister = () => setCurrentView('register');
  const handleSwitchToLogin = () => setCurrentView('login');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Modal content */}
          <div className="mt-4">
            {currentView === 'login' ? (
              <LoginForm 
                onSwitchToRegister={handleSwitchToRegister}
                onClose={onClose}
              />
            ) : (
              <RegisterForm 
                onSwitchToLogin={handleSwitchToLogin}
                onClose={onClose}
                defaultUserRole={defaultUserRole}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

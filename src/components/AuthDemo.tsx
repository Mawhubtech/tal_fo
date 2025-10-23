import React from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { LogIn, UserPlus, LogOut } from 'lucide-react';
import Button from '../components/Button';

const AuthDemo: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const { addToast } = useToast();

  const showSuccessToast = () => {
    addToast({
      type: 'success',
      title: 'Success!',
      message: 'This is a success toast notification.',
    });
  };

  const showErrorToast = () => {
    addToast({
      type: 'error',
      title: 'Error!',
      message: 'This is an error toast notification.',
    });
  };

  const showInfoToast = () => {
    addToast({
      type: 'info',
      title: 'Info',
      message: 'This is an info toast notification.',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Authentication Demo
      </h3>

      {isAuthenticated ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800">Authenticated User</h4>
            <p className="text-sm text-green-700">
              Name: {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-green-700">Email: {user?.email}</p>
          </div>

          <Button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600">
              You are not currently logged in. Use the buttons below to test authentication.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => window.location.href = '/signin'}
              variant="outline"
              size="sm"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>

            <Button
              onClick={() => window.location.href = '/signin'}
              size="sm"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Register
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Toast Notifications Demo
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={showSuccessToast}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            Success
          </Button>
          <Button
            onClick={showErrorToast}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            Error
          </Button>
          <Button
            onClick={showInfoToast}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            Info
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthDemo;

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { isExternalUser } from '../utils/userUtils';

interface ExternalUserGuardProps {
  children: React.ReactNode;
}

const ExternalUserGuard: React.FC<ExternalUserGuardProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Check if user is an external user (has external-user role)
  if (!isExternalUser(user)) {
    // If not an external user, redirect to main dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // If user is authenticated and is an external user, render the children
  return <>{children}</>;
};

export default ExternalUserGuard;

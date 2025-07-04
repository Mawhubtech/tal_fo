import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { isExternalUser } from '../utils/userUtils';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the attempted location for redirecting after login
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // If user is external, check if they're trying to access an ATS route
  if (isExternalUser(user)) {
    // Allow external users to access ATS routes for jobs they have access to
    const isATSRoute = location.pathname.includes('/jobs/') && location.pathname.endsWith('/ats');
    
    if (isATSRoute) {
      // Allow access to ATS routes for external users
      return <>{children}</>;
    }
    
    // For all other dashboard routes, redirect external users to their dashboard
    return <Navigate to="/external/jobs" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

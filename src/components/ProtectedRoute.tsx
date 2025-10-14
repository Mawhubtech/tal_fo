import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { isExternalUser } from '../utils/userUtils';
import { useRoutePermissions } from '../hooks/usePermissionCheck';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresPermissions?: boolean; // New prop to enable permission checking
  fallbackComponent?: React.ReactNode; // Optional fallback component
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresPermissions = false,
  fallbackComponent = null
}) => {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const { canAccessRoute, isSuperAdmin } = useRoutePermissions();
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
    // Updated to match new URL format: /jobs/:jobId/:jobTitle or legacy /jobs/:jobId/ats
    const isATSRoute = location.pathname.includes('/jobs/') && 
      (location.pathname.endsWith('/ats') || 
       location.pathname.match(/\/jobs\/[^\/]+\/[^\/]+$/));
    
    if (isATSRoute) {
      // Allow access to ATS routes for external users
      return <>{children}</>;
    }
    
    // For all other dashboard routes, redirect external users to their dashboard
    return <Navigate to="/external/jobs" replace />;
  }

  // Check route permissions if enabled
  if (requiresPermissions && !isSuperAdmin) {
    if (!canAccessRoute(location.pathname)) {
      // If fallback component is provided, show it instead of redirecting
      if (fallbackComponent) {
        return <>{fallbackComponent}</>;
      }
      
      // Default behavior: redirect to dashboard
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

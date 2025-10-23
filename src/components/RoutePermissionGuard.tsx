import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRoutePermissions } from '../hooks/usePermissionCheck';
import { AlertCircle, Lock } from 'lucide-react';

interface RoutePermissionGuardProps {
  children: React.ReactNode;
  showAccessDenied?: boolean; // Whether to show access denied message or redirect
}

/**
 * Component that checks if user has permission to access the current route
 * Used within already authenticated dashboard routes
 */
const RoutePermissionGuard: React.FC<RoutePermissionGuardProps> = ({ 
  children, 
  showAccessDenied = false 
}) => {
  const { canAccessRoute, isSuperAdmin } = useRoutePermissions();
  const location = useLocation();

  // Super admin bypasses all checks
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // Check if user can access current route
  if (!canAccessRoute(location.pathname)) {
    if (showAccessDenied) {
      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-sm text-gray-500 mb-4">
              You don't have permission to access this page.
            </p>
            <div className="flex items-center justify-center text-sm text-gray-400">
              <AlertCircle className="h-4 w-4 mr-1" />
              Contact your administrator for access
            </div>
          </div>
        </div>
      );
    }

    // Redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RoutePermissionGuard;

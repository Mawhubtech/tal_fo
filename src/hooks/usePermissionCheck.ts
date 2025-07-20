import { useMemo } from 'react';
import { useAuthContext } from '../contexts/AuthContext';

export interface PermissionCheck {
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  userPermissions: string[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

/**
 * Hook to check user permissions based on their roles
 * @returns PermissionCheck object with utility functions
 */
export const usePermissionCheck = (): PermissionCheck => {
  const { user } = useAuthContext();

  const permissionCheck = useMemo(() => {
    // Extract all permissions from user's roles
    const userPermissions = user?.roles?.flatMap(role => 
      role.permissions?.map(permission => permission.name) || []
    ) || [];

    // Get user role names
    const userRoles = user?.roles?.map(role => role.name.toLowerCase()) || [];

    const hasPermission = (permission: string): boolean => {
      return userPermissions.includes(permission);
    };

    const hasAnyPermission = (permissions: string[]): boolean => {
      return permissions.some(permission => userPermissions.includes(permission));
    };

    const hasAllPermissions = (permissions: string[]): boolean => {
      return permissions.every(permission => userPermissions.includes(permission));
    };

    const isAdmin = userRoles.includes('admin') || userRoles.includes('super-admin');
    const isSuperAdmin = userRoles.includes('super-admin');

    return {
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      userPermissions,
      isAdmin,
      isSuperAdmin,
    };
  }, [user]);

  return permissionCheck;
};

/**
 * Sidebar-specific permission constants mapped to features
 */
export const SIDEBAR_PERMISSIONS = {
  // Dashboard
  DASHBOARD_ACCESS: 'dashboard:access',
  
  // Sourcing Module
  SOURCING_ACCESS: 'sourcing:access',
  SOURCING_OVERVIEW: 'sourcing:overview',
  SEARCH_CANDIDATES: 'search:candidates',
  OUTREACH_PROSPECTS: 'outreach:prospects',
  OUTREACH_CAMPAIGNS: 'outreach:campaigns',
  OUTREACH_TEMPLATES: 'outreach:templates',
  OUTREACH_ANALYTICS: 'outreach:analytics',
  
  // Jobs Module
  JOBS_ACCESS: 'jobs:access',
  JOBS_CREATE: 'jobs:create',
  JOBS_READ: 'jobs:read',
  JOBS_UPDATE: 'jobs:update',
  JOBS_DELETE: 'jobs:delete',
  ORGANIZATIONS_ACCESS: 'organizations:access',
  MY_JOBS_ACCESS: 'my-jobs:access',
  JOB_BOARDS_ACCESS: 'job-boards:access',
  
  // Candidates Module
  CANDIDATES_ACCESS: 'candidates:access',
  CANDIDATES_CREATE: 'candidates:create',
  CANDIDATES_READ: 'candidates:read',
  CANDIDATES_UPDATE: 'candidates:update',
  CANDIDATES_DELETE: 'candidates:delete',
  
  // Clients Module
  CLIENTS_ACCESS: 'clients:access',
  CLIENTS_CREATE: 'clients:create',
  CLIENTS_READ: 'clients:read',
  CLIENTS_UPDATE: 'clients:update',
  CLIENTS_DELETE: 'clients:delete',
  
  // Client Outreach Module
  CLIENT_OUTREACH_ACCESS: 'client-outreach:access',
  CLIENT_OUTREACH_OVERVIEW: 'client-outreach:overview',
  CLIENT_OUTREACH_PROSPECTS: 'client-outreach:prospects',
  CLIENT_OUTREACH_SEARCH: 'client-outreach:search',
  CLIENT_OUTREACH_CAMPAIGNS: 'client-outreach:campaigns',
  CLIENT_OUTREACH_TEMPLATES: 'client-outreach:templates',
  CLIENT_OUTREACH_ANALYTICS: 'client-outreach:analytics',
  
  // Contacts Module
  CONTACTS_ACCESS: 'contacts:access',
  CONTACTS_CREATE: 'contacts:create',
  CONTACTS_READ: 'contacts:read',
  CONTACTS_UPDATE: 'contacts:update',
  CONTACTS_DELETE: 'contacts:delete',
  
  // Admin Module
  ADMIN_ACCESS: 'admin:access',
  ADMIN_OVERVIEW: 'admin:overview',
  
  // Admin - Management
  ADMIN_USERS: 'admin:users',
  ADMIN_ROLES: 'admin:roles',
  ADMIN_EMAIL_MANAGEMENT: 'admin:email-management',
  ADMIN_TEAM_MANAGEMENT: 'admin:team-management',
  
  // Admin - System
  ADMIN_PIPELINES: 'admin:pipelines',
  ADMIN_EMAIL_SEQUENCES: 'admin:email-sequences',
  ADMIN_HIRING_TEAMS: 'admin:hiring-teams',
  ADMIN_JOB_BOARDS: 'admin:job-boards',
  ADMIN_ANALYTICS: 'admin:analytics',
  ADMIN_SETTINGS: 'admin:settings',
} as const;

/**
 * Route permission mapping
 */
export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/dashboard': [SIDEBAR_PERMISSIONS.DASHBOARD_ACCESS],
  
  // Sourcing routes
  '/dashboard/sourcing/outreach': [SIDEBAR_PERMISSIONS.SOURCING_ACCESS, SIDEBAR_PERMISSIONS.SOURCING_OVERVIEW],
  '/dashboard/sourcing/outreach/prospects': [SIDEBAR_PERMISSIONS.SOURCING_ACCESS, SIDEBAR_PERMISSIONS.OUTREACH_PROSPECTS],
  '/dashboard/sourcing/outreach/campaigns': [SIDEBAR_PERMISSIONS.SOURCING_ACCESS, SIDEBAR_PERMISSIONS.OUTREACH_CAMPAIGNS],
  '/dashboard/sourcing/sequences': [SIDEBAR_PERMISSIONS.SOURCING_ACCESS, SIDEBAR_PERMISSIONS.OUTREACH_TEMPLATES],
  '/dashboard/sourcing/outreach/analytics': [SIDEBAR_PERMISSIONS.SOURCING_ACCESS, SIDEBAR_PERMISSIONS.OUTREACH_ANALYTICS],
  
  // Jobs routes
  '/dashboard/organizations': [SIDEBAR_PERMISSIONS.JOBS_ACCESS, SIDEBAR_PERMISSIONS.ORGANIZATIONS_ACCESS],
  '/dashboard/my-jobs': [SIDEBAR_PERMISSIONS.JOBS_ACCESS, SIDEBAR_PERMISSIONS.MY_JOBS_ACCESS],
  '/dashboard/job-boards': [SIDEBAR_PERMISSIONS.ADMIN_ACCESS],
  
  // Candidates routes
  '/dashboard/candidates': [SIDEBAR_PERMISSIONS.CANDIDATES_ACCESS, SIDEBAR_PERMISSIONS.CANDIDATES_READ],
  
  // Clients routes
  '/dashboard/clients': [SIDEBAR_PERMISSIONS.CLIENTS_ACCESS, SIDEBAR_PERMISSIONS.CLIENTS_READ],
  
  // Client Outreach routes
  '/dashboard/client-outreach': [SIDEBAR_PERMISSIONS.CLIENT_OUTREACH_ACCESS, SIDEBAR_PERMISSIONS.CLIENT_OUTREACH_OVERVIEW],
  '/dashboard/client-outreach/prospects': [SIDEBAR_PERMISSIONS.CLIENT_OUTREACH_ACCESS, SIDEBAR_PERMISSIONS.CLIENT_OUTREACH_PROSPECTS],
  '/dashboard/client-outreach/search': [SIDEBAR_PERMISSIONS.CLIENT_OUTREACH_ACCESS, SIDEBAR_PERMISSIONS.CLIENT_OUTREACH_SEARCH],
  '/dashboard/client-outreach/campaigns': [SIDEBAR_PERMISSIONS.CLIENT_OUTREACH_ACCESS, SIDEBAR_PERMISSIONS.CLIENT_OUTREACH_CAMPAIGNS],
  '/dashboard/client-outreach/templates': [SIDEBAR_PERMISSIONS.CLIENT_OUTREACH_ACCESS, SIDEBAR_PERMISSIONS.CLIENT_OUTREACH_TEMPLATES],
  '/dashboard/client-outreach/analytics': [SIDEBAR_PERMISSIONS.CLIENT_OUTREACH_ACCESS, SIDEBAR_PERMISSIONS.CLIENT_OUTREACH_ANALYTICS],
  
  // Contacts routes
  '/dashboard/contacts': [SIDEBAR_PERMISSIONS.CONTACTS_ACCESS, SIDEBAR_PERMISSIONS.CONTACTS_READ],
  
  // Admin routes
  '/dashboard/admin': [SIDEBAR_PERMISSIONS.ADMIN_ACCESS, SIDEBAR_PERMISSIONS.ADMIN_OVERVIEW],
  '/dashboard/admin/users': [SIDEBAR_PERMISSIONS.ADMIN_ACCESS, SIDEBAR_PERMISSIONS.ADMIN_USERS],
  '/dashboard/admin/roles': [SIDEBAR_PERMISSIONS.ADMIN_ACCESS, SIDEBAR_PERMISSIONS.ADMIN_ROLES],
  '/dashboard/admin/email-management': [SIDEBAR_PERMISSIONS.ADMIN_ACCESS, SIDEBAR_PERMISSIONS.ADMIN_EMAIL_MANAGEMENT],
  '/dashboard/admin/team-management': [SIDEBAR_PERMISSIONS.ADMIN_ACCESS, SIDEBAR_PERMISSIONS.ADMIN_TEAM_MANAGEMENT],
  '/dashboard/admin/pipelines': [SIDEBAR_PERMISSIONS.ADMIN_ACCESS, SIDEBAR_PERMISSIONS.ADMIN_PIPELINES],
  '/dashboard/admin/email-sequences': [SIDEBAR_PERMISSIONS.ADMIN_ACCESS, SIDEBAR_PERMISSIONS.ADMIN_EMAIL_SEQUENCES],
  '/dashboard/admin/hiring-teams': [SIDEBAR_PERMISSIONS.ADMIN_ACCESS, SIDEBAR_PERMISSIONS.ADMIN_HIRING_TEAMS],
  '/dashboard/admin/job-boards': [SIDEBAR_PERMISSIONS.ADMIN_ACCESS, SIDEBAR_PERMISSIONS.ADMIN_JOB_BOARDS],
  '/dashboard/admin/analytics': [SIDEBAR_PERMISSIONS.ADMIN_ACCESS, SIDEBAR_PERMISSIONS.ADMIN_ANALYTICS],
  '/dashboard/admin/settings': [SIDEBAR_PERMISSIONS.ADMIN_ACCESS, SIDEBAR_PERMISSIONS.ADMIN_SETTINGS],
};

/**
 * Hook to check route permissions
 */
export const useRoutePermissions = () => {
  const { hasAnyPermission, isAdmin, isSuperAdmin } = usePermissionCheck();

  const canAccessRoute = (route: string): boolean => {
    // Super admin can access everything
    if (isSuperAdmin) {
      return true;
    }

    // Check if route requires specific permissions
    const requiredPermissions = ROUTE_PERMISSIONS[route];
    if (!requiredPermissions) {
      return true; // No specific permissions required
    }

    // Check if user has any of the required permissions
    return hasAnyPermission(requiredPermissions);
  };

  return {
    canAccessRoute,
    isAdmin,
    isSuperAdmin,
  };
};

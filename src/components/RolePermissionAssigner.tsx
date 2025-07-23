/**
 * RolePermissionAssigner - Hierarchical permission assignment component
 * 
 * Features:
 * - Menu-based permission structure matching sidebar
 * - Bulk select for entire menu sections
 * - Individual permission toggle
 * - Select all/none functionality
 * - Visual hierarchy with indentation
 * - Same icons and naming as sidebar
 */

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Minus, 
  ChevronDown, 
  ChevronRight, 
  LayoutGrid, 
  Search, 
  UserCircle, 
  Mail, 
  MessageSquare, 
  BarChart3, 
  Briefcase, 
  Atom, 
  UserPlus, 
  Building, 
  Users, 
  Shield, 
  KeyRound, 
  GitBranch, 
  Target,
  Settings
} from 'lucide-react';
import { type Permission } from '../services/roleApiService';

export interface PermissionGroup {
  id: string;
  name: string;
  icon: React.ReactNode;
  permissions: string[];
  children?: PermissionGroup[];
}

export interface RolePermissionAssignerProps {
  selectedPermissions: string[];
  onPermissionsChange: (permissions: string[]) => void;
  allPermissions: Permission[];
  disabled?: boolean;
}

// Permission hierarchy matching the sidebar structure
const PERMISSION_HIERARCHY: PermissionGroup[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: <LayoutGrid className="w-4 h-4" />,
    permissions: ['dashboard:access']
  },
  {
    id: 'sourcing',
    name: 'Sourcing',
    icon: <Search className="w-4 h-4" />,
    permissions: ['sourcing:access'],
    children: [
      {
        id: 'sourcing-overview',
        name: 'Overview',
        icon: <LayoutGrid className="w-3 h-3" />,
        permissions: ['sourcing:overview']
      },
      {
        id: 'search',
        name: 'Search',
        icon: <Search className="w-3 h-3" />,
        permissions: ['search:candidates']
      },
      {
        id: 'prospects',
        name: 'Prospects',
        icon: <UserCircle className="w-3 h-3" />,
        permissions: ['outreach:prospects']
      },
      {
        id: 'campaigns',
        name: 'Campaigns',
        icon: <Mail className="w-3 h-3" />,
        permissions: ['outreach:campaigns']
      },
      {
        id: 'templates',
        name: 'Templates',
        icon: <MessageSquare className="w-3 h-3" />,
        permissions: ['outreach:templates']
      },
      {
        id: 'sourcing-analytics',
        name: 'Analytics',
        icon: <BarChart3 className="w-3 h-3" />,
        permissions: ['outreach:analytics']
      }
    ]
  },
  {
    id: 'jobs',
    name: 'Jobs',
    icon: <Briefcase className="w-4 h-4" />,
    permissions: ['jobs:access', 'jobs:read', 'organizations:access']
  },
  {
    id: 'my-jobs',
    name: 'My Jobs',
    icon: <Atom className="w-4 h-4" />,
    permissions: ['my-jobs:access']
  },
  {
    id: 'candidates',
    name: 'Candidates',
    icon: <UserPlus className="w-4 h-4" />,
    permissions: ['candidates:access', 'candidates:read', 'candidates:create', 'candidates:update', 'candidates:delete']
  },
  {
    id: 'clients',
    name: 'Clients',
    icon: <Building className="w-4 h-4" />,
    permissions: ['clients:access', 'clients:read', 'clients:create', 'clients:update', 'clients:delete']
  },
  {
    id: 'client-outreach',
    name: 'Client Outreach',
    icon: <Mail className="w-4 h-4" />,
    permissions: ['client-outreach:access']
  },
  {
    id: 'contacts',
    name: 'Contacts',
    icon: <Users className="w-4 h-4" />,
    permissions: ['contacts:access', 'contacts:read', 'contacts:create', 'contacts:update', 'contacts:delete']
  },
  {
    id: 'admin',
    name: 'Admin',
    icon: <Shield className="w-4 h-4" />,
    permissions: ['admin:access'],
    children: [
      {
        id: 'admin-overview',
        name: 'Overview',
        icon: <LayoutGrid className="w-3 h-3" />,
        permissions: ['admin:overview']
      },
      {
        id: 'admin-users',
        name: 'Users',
        icon: <Users className="w-3 h-3" />,
        permissions: ['admin:users']
      },
      {
        id: 'admin-roles',
        name: 'Roles & Permissions',
        icon: <KeyRound className="w-3 h-3" />,
        permissions: ['admin:roles']
      },
      {
        id: 'admin-email',
        name: 'Email Management',
        icon: <Mail className="w-3 h-3" />,
        permissions: ['admin:email-management']
      },
      {
        id: 'admin-team',
        name: 'Team Management',
        icon: <Shield className="w-3 h-3" />,
        permissions: ['admin:team-management']
      },
      {
        id: 'admin-pipelines',
        name: 'Pipelines',
        icon: <GitBranch className="w-3 h-3" />,
        permissions: ['admin:pipelines']
      },
      {
        id: 'admin-hiring-teams',
        name: 'Hiring Teams',
        icon: <Users className="w-3 h-3" />,
        permissions: ['admin:hiring-teams']
      },
      {
        id: 'admin-job-boards',
        name: 'Job Boards',
        icon: <Target className="w-3 h-3" />,
        permissions: ['admin:job-boards']
      },
      {
        id: 'admin-analytics',
        name: 'Analytics',
        icon: <BarChart3 className="w-3 h-3" />,
        permissions: ['admin:analytics']
      },
      {
        id: 'admin-settings',
        name: 'Settings',
        icon: <Settings className="w-3 h-3" />,
        permissions: ['admin:settings']
      }
    ]
  }
];

const RolePermissionAssigner: React.FC<RolePermissionAssignerProps> = ({
  selectedPermissions,
  onPermissionsChange,
  allPermissions,
  disabled = false
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['sourcing', 'client-outreach', 'admin']));

  // Get all available permission names from the API
  const availablePermissionNames = allPermissions.map(p => `${p.resource}:${p.action}`);

  // Filter permissions that actually exist in the database
  const getAvailablePermissions = (permissions: string[]): string[] => {
    return permissions.filter(permission => availablePermissionNames.includes(permission));
  };

  // Calculate selection state for a group
  const getGroupSelectionState = (group: PermissionGroup): 'all' | 'some' | 'none' => {
    const groupPermissions = getAvailablePermissions(group.permissions);
    const childPermissions = group.children?.flatMap(child => getAvailablePermissions(child.permissions)) || [];
    const allGroupPermissions = [...groupPermissions, ...childPermissions];
    
    if (allGroupPermissions.length === 0) return 'none';
    
    const selectedCount = allGroupPermissions.filter(permission => 
      selectedPermissions.includes(permission)
    ).length;
    
    if (selectedCount === 0) return 'none';
    if (selectedCount === allGroupPermissions.length) return 'all';
    return 'some';
  };

  // Toggle group permissions
  const toggleGroup = (group: PermissionGroup) => {
    if (disabled) return;

    const groupPermissions = getAvailablePermissions(group.permissions);
    const childPermissions = group.children?.flatMap(child => getAvailablePermissions(child.permissions)) || [];
    const allGroupPermissions = [...groupPermissions, ...childPermissions];
    
    const selectionState = getGroupSelectionState(group);
    
    if (selectionState === 'all') {
      // Remove all group permissions
      const newPermissions = selectedPermissions.filter(permission => 
        !allGroupPermissions.includes(permission)
      );
      onPermissionsChange(newPermissions);
    } else {
      // Add all group permissions
      const newPermissions = Array.from(new Set([...selectedPermissions, ...allGroupPermissions]));
      onPermissionsChange(newPermissions);
    }
  };

  // Toggle individual permission
  const togglePermission = (permission: string) => {
    if (disabled) return;

    if (selectedPermissions.includes(permission)) {
      onPermissionsChange(selectedPermissions.filter(p => p !== permission));
    } else {
      onPermissionsChange([...selectedPermissions, permission]);
    }
  };

  // Toggle group expansion
  const toggleGroupExpansion = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  // Select all permissions
  const selectAll = () => {
    if (disabled) return;
    onPermissionsChange(availablePermissionNames);
  };

  // Deselect all permissions
  const selectNone = () => {
    if (disabled) return;
    onPermissionsChange([]);
  };

  const totalAvailablePermissions = availablePermissionNames.length;
  const totalSelectedPermissions = selectedPermissions.filter(p => availablePermissionNames.includes(p)).length;

  return (
    <div className="space-y-4">
      {/* Header with bulk actions */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Assign Permissions</h3>
          <p className="text-sm text-gray-500">
            {totalSelectedPermissions} of {totalAvailablePermissions} permissions selected
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={selectAll}
            disabled={disabled || totalSelectedPermissions === totalAvailablePermissions}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={selectNone}
            disabled={disabled || totalSelectedPermissions === 0}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select None
          </button>
        </div>
      </div>

      {/* Permission hierarchy */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {PERMISSION_HIERARCHY.map((group) => (
          <PermissionGroupItem
            key={group.id}
            group={group}
            selectedPermissions={selectedPermissions}
            onToggleGroup={toggleGroup}
            onTogglePermission={togglePermission}
            onToggleExpansion={toggleGroupExpansion}
            isExpanded={expandedGroups.has(group.id)}
            getAvailablePermissions={getAvailablePermissions}
            getGroupSelectionState={getGroupSelectionState}
            disabled={disabled}
            level={0}
          />
        ))}
      </div>
    </div>
  );
};

interface PermissionGroupItemProps {
  group: PermissionGroup;
  selectedPermissions: string[];
  onToggleGroup: (group: PermissionGroup) => void;
  onTogglePermission: (permission: string) => void;
  onToggleExpansion: (groupId: string) => void;
  isExpanded: boolean;
  getAvailablePermissions: (permissions: string[]) => string[];
  getGroupSelectionState: (group: PermissionGroup) => 'all' | 'some' | 'none';
  disabled: boolean;
  level: number;
}

const PermissionGroupItem: React.FC<PermissionGroupItemProps> = ({
  group,
  selectedPermissions,
  onToggleGroup,
  onTogglePermission,
  onToggleExpansion,
  isExpanded,
  getAvailablePermissions,
  getGroupSelectionState,
  disabled,
  level
}) => {
  const selectionState = getGroupSelectionState(group);
  const hasChildren = group.children && group.children.length > 0;
  const availablePermissions = getAvailablePermissions(group.permissions);
  const paddingLeft = level * 24;

  // Don't render groups with no available permissions
  if (availablePermissions.length === 0 && !hasChildren) {
    return null;
  }

  const renderCheckbox = () => {
    if (selectionState === 'all') {
      return <Check className="w-4 h-4 text-white" />;
    } else if (selectionState === 'some') {
      return <Minus className="w-4 h-4 text-white" />;
    }
    return null;
  };

  const getCheckboxClasses = () => {
    const baseClasses = "w-5 h-5 border-2 rounded flex items-center justify-center transition-colors";
    
    if (disabled) {
      return `${baseClasses} border-gray-300 bg-gray-100 cursor-not-allowed`;
    }
    
    if (selectionState === 'all') {
      return `${baseClasses} border-primary-500 bg-primary-500 cursor-pointer`;
    } else if (selectionState === 'some') {
      return `${baseClasses} border-primary-500 bg-primary-500 cursor-pointer`;
    } else {
      return `${baseClasses} border-gray-300 bg-white cursor-pointer hover:border-primary-400`;
    }
  };

  return (
    <div>
      {/* Group header */}
      <div 
        className="flex items-center space-x-2 py-2 px-3 hover:bg-gray-50 rounded-lg"
        style={{ paddingLeft: `${paddingLeft + 12}px` }}
      >
        {/* Expansion toggle */}
        {hasChildren && (
          <button
            type="button"
            onClick={() => onToggleExpansion(group.id)}
            className="p-1 hover:bg-gray-100 rounded"
            disabled={disabled}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-gray-400" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-400" />
            )}
          </button>
        )}
        
        {/* Checkbox */}
        <button
          type="button"
          onClick={() => onToggleGroup(group)}
          className={getCheckboxClasses()}
          disabled={disabled}
        >
          {renderCheckbox()}
        </button>

        {/* Icon and label */}
        <div className="flex items-center space-x-2 flex-1">
          <span className="text-gray-500">{group.icon}</span>
          <span className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
            {group.name}
          </span>
          {availablePermissions.length > 0 && (
            <span className="text-xs text-gray-400">
              ({availablePermissions.length} permission{availablePermissions.length !== 1 ? 's' : ''})
            </span>
          )}
        </div>
      </div>

      {/* Individual permissions for this group */}
      {availablePermissions.length > 0 && isExpanded && (
        <div className="ml-6" style={{ paddingLeft: `${paddingLeft + 12}px` }}>
          {availablePermissions.map((permission) => (
            <div
              key={permission}
              className="flex items-center space-x-2 py-1 px-3 hover:bg-gray-50 rounded"
            >
              <button
                type="button"
                onClick={() => onTogglePermission(permission)}
                className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${
                  disabled
                    ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                    : selectedPermissions.includes(permission)
                    ? 'border-primary-500 bg-primary-500 cursor-pointer'
                    : 'border-gray-300 bg-white cursor-pointer hover:border-primary-400'
                }`}
                disabled={disabled}
              >
                {selectedPermissions.includes(permission) && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </button>
              <span className={`text-xs ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
                {permission}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Child groups */}
      {hasChildren && isExpanded && (
        <div className="ml-4">
          {group.children?.map((childGroup) => (
            <PermissionGroupItem
              key={childGroup.id}
              group={childGroup}
              selectedPermissions={selectedPermissions}
              onToggleGroup={onToggleGroup}
              onTogglePermission={onTogglePermission}
              onToggleExpansion={onToggleExpansion}
              isExpanded={isExpanded}
              getAvailablePermissions={getAvailablePermissions}
              getGroupSelectionState={getGroupSelectionState}
              disabled={disabled}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RolePermissionAssigner;

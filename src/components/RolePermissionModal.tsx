import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  UserPlus,
  Building2,
  MessageSquare,
  TrendingUp,
  Search,
  Mail,
  Settings,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  Check,
  X
} from 'lucide-react';
import { type Role, type Permission } from '../services/roleApiService';

interface RolePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  permissions: Permission[];
  onSave: (roleId: string, permissionIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

interface MenuSection {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions: {
    access?: string;
    create?: string;
    read?: string;
    update?: string;
    delete?: string;
    [key: string]: string | undefined;
  };
  subsections?: MenuSection[];
}

// Define the menu structure with permissions
const MENU_STRUCTURE: MenuSection[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    permissions: {
      access: 'dashboard:access'
    }
  },
  {
    id: 'sourcing',
    label: 'Sourcing',
    icon: Search,
    permissions: {
      access: 'sourcing:access'
    },
    subsections: [
      {
        id: 'sourcing-overview',
        label: 'Overview',
        icon: TrendingUp,
        permissions: {
          access: 'sourcing:overview'
        }
      },
      {
        id: 'search-candidates',
        label: 'Search Candidates',
        icon: Search,
        permissions: {
          access: 'search:candidates'
        }
      },
      {
        id: 'outreach',
        label: 'Outreach',
        icon: Mail,
        permissions: {
          prospects: 'outreach:prospects',
          campaigns: 'outreach:campaigns',
          templates: 'outreach:templates',
          analytics: 'outreach:analytics'
        }
      }
    ]
  },
  {
    id: 'jobs',
    label: 'Jobs',
    icon: Briefcase,
    permissions: {
      access: 'jobs:access',
      create: 'jobs:create',
      read: 'jobs:read',
      update: 'jobs:update',
      delete: 'jobs:delete'
    },
    subsections: [
      {
        id: 'organizations',
        label: 'Organizations',
        icon: Building2,
        permissions: {
          access: 'organizations:access'
        }
      },
      {
        id: 'my-jobs',
        label: 'My Jobs',
        icon: Briefcase,
        permissions: {
          access: 'my-jobs:access'
        }
      }
    ]
  },
  {
    id: 'candidates',
    label: 'Candidates',
    icon: Users,
    permissions: {
      access: 'candidates:access',
      create: 'candidates:create',
      read: 'candidates:read',
      update: 'candidates:update',
      delete: 'candidates:delete'
    }
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: Building2,
    permissions: {
      access: 'clients:access',
      create: 'clients:create',
      read: 'clients:read',
      update: 'clients:update',
      delete: 'clients:delete'
    }
  },
  {
    id: 'client-outreach',
    label: 'Client Outreach',
    icon: Mail,
    permissions: {
      access: 'client-outreach:access'
    }
  },
  {
    id: 'contacts',
    label: 'Contacts',
    icon: UserPlus,
    permissions: {
      access: 'contacts:access',
      create: 'contacts:create',
      read: 'contacts:read',
      update: 'contacts:update',
      delete: 'contacts:delete'
    }
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: Settings,
    permissions: {
      access: 'admin:access',
      overview: 'admin:overview',
      users: 'admin:users',
      roles: 'admin:roles',
      'email-management': 'admin:email-management',
      'team-management': 'admin:team-management',
      pipelines: 'admin:pipelines',
      'hiring-teams': 'admin:hiring-teams',
      'job-boards': 'admin:job-boards',
      analytics: 'admin:analytics',
      settings: 'admin:settings'
    }
  }
];

export const RolePermissionModal: React.FC<RolePermissionModalProps> = ({
  isOpen,
  onClose,
  role,
  permissions,
  onSave,
  isLoading = false
}) => {
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Enhanced modal behavior: ESC key and body scroll prevention
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Handle ESC key to close modal
      const handleEscKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscKey);
      
      return () => {
        document.removeEventListener('keydown', handleEscKey);
        // Restore body scroll when modal closes
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  // Initialize selected permissions when role changes
  useEffect(() => {
    if (role?.permissions) {
      const currentPermissionNames = role.permissions.map(p => `${p.resource}:${p.action}`);
      setSelectedPermissions(new Set(currentPermissionNames));
    } else {
      setSelectedPermissions(new Set());
    }
  }, [role]);

  // Helper to check if a permission exists in the available permissions
  const getPermissionByName = (permissionName: string) => {
    return permissions.find(p => `${p.resource}:${p.action}` === permissionName);
  };

  // Toggle a single permission
  const togglePermission = (permissionName: string) => {
    const permission = getPermissionByName(permissionName);
    if (!permission) return;

    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionName)) {
      newSelected.delete(permissionName);
    } else {
      newSelected.add(permissionName);
    }
    setSelectedPermissions(newSelected);
  };

  // Select all permissions for a menu section
  const selectAllForSection = (section: MenuSection) => {
    const newSelected = new Set(selectedPermissions);
    const sectionPermissions = Object.values(section.permissions).filter(Boolean) as string[];
    
    sectionPermissions.forEach(permName => {
      if (getPermissionByName(permName)) {
        newSelected.add(permName);
      }
    });

    // Also add subsection permissions
    if (section.subsections) {
      section.subsections.forEach(subsection => {
        Object.values(subsection.permissions).filter(Boolean).forEach(permName => {
          if (getPermissionByName(permName as string)) {
            newSelected.add(permName as string);
          }
        });
      });
    }

    setSelectedPermissions(newSelected);
  };

  // Deselect all permissions for a menu section
  const deselectAllForSection = (section: MenuSection) => {
    const newSelected = new Set(selectedPermissions);
    const sectionPermissions = Object.values(section.permissions).filter(Boolean) as string[];
    
    sectionPermissions.forEach(permName => {
      newSelected.delete(permName);
    });

    // Also remove subsection permissions
    if (section.subsections) {
      section.subsections.forEach(subsection => {
        Object.values(subsection.permissions).filter(Boolean).forEach(permName => {
          newSelected.delete(permName as string);
        });
      });
    }

    setSelectedPermissions(newSelected);
  };

  // Check if all permissions for a section are selected
  const isSectionFullySelected = (section: MenuSection): boolean => {
    const sectionPermissions = Object.values(section.permissions).filter(Boolean) as string[];
    const subsectionPermissions = section.subsections 
      ? section.subsections.flatMap(sub => Object.values(sub.permissions).filter(Boolean) as string[])
      : [];
    
    const allPermissions = [...sectionPermissions, ...subsectionPermissions];
    return allPermissions.every(permName => selectedPermissions.has(permName));
  };

  // Check if some permissions for a section are selected
  const isSectionPartiallySelected = (section: MenuSection): boolean => {
    const sectionPermissions = Object.values(section.permissions).filter(Boolean) as string[];
    const subsectionPermissions = section.subsections 
      ? section.subsections.flatMap(sub => Object.values(sub.permissions).filter(Boolean) as string[])
      : [];
    
    const allPermissions = [...sectionPermissions, ...subsectionPermissions];
    return allPermissions.some(permName => selectedPermissions.has(permName)) && !isSectionFullySelected(section);
  };

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Select all permissions
  const selectAll = () => {
    const allPermissionNames = permissions.map(p => `${p.resource}:${p.action}`);
    setSelectedPermissions(new Set(allPermissionNames));
  };

  // Deselect all permissions
  const deselectAll = () => {
    setSelectedPermissions(new Set());
  };

  // Handle save
  const handleSave = async () => {
    if (!role) return;
    
    // Convert permission names back to IDs
    const selectedPermissionIds = Array.from(selectedPermissions)
      .map(permName => {
        const permission = getPermissionByName(permName);
        return permission?.id;
      })
      .filter(Boolean) as string[];

    await onSave(role.id, selectedPermissionIds);
  };

  // Handle overlay click to close modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !role) return null;

  const modalContent = (
    <div 
      className="fixed top-0 right-0 bottom-0 left-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Manage Permissions for "{role.name}"
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Select menu items and their specific permissions
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedPermissions.size} of {permissions.length} permissions selected
            </div>
            <div className="flex space-x-2">
              <button
                onClick={selectAll}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Deselect All
              </button>
            </div>
          </div>
        </div>

        {/* Permission List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {MENU_STRUCTURE.map((section) => {
              const Icon = section.icon;
              const isExpanded = expandedSections.has(section.id);
              const isFullySelected = isSectionFullySelected(section);
              const isPartiallySelected = isSectionPartiallySelected(section);

              return (
                <div key={section.id} className="border border-gray-200 rounded-lg">
                  {/* Section Header */}
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <Icon className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-900">{section.label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => selectAllForSection(section)}
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Select All
                        </button>
                        <button
                          onClick={() => deselectAllForSection(section)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Deselect All
                        </button>
                        <div className="ml-2">
                          {isFullySelected ? (
                            <CheckSquare className="w-5 h-5 text-green-600" />
                          ) : isPartiallySelected ? (
                            <div className="w-5 h-5 border-2 border-blue-600 bg-blue-100 rounded-sm flex items-center justify-center">
                              <div className="w-2 h-2 bg-blue-600 rounded-sm"></div>
                            </div>
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section Content */}
                  {isExpanded && (
                    <div className="p-4 space-y-3">
                      {/* Main permissions */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(section.permissions).map(([action, permissionName]) => {
                          if (!permissionName) return null;
                          const permission = getPermissionByName(permissionName);
                          if (!permission) return null;

                          return (
                            <label
                              key={permissionName}
                              className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPermissions.has(permissionName)}
                                onChange={() => togglePermission(permissionName)}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:outline-none"
                              />
                              <span className="text-sm text-gray-700 capitalize">
                                {action.replace('-', ' ')}
                              </span>
                            </label>
                          );
                        })}
                      </div>

                      {/* Subsections */}
                      {section.subsections && (
                        <div className="mt-4 space-y-3">
                          {section.subsections.map((subsection) => {
                            const SubIcon = subsection.icon;
                            return (
                              <div key={subsection.id} className="ml-6 border-l-2 border-gray-200 pl-4">
                                <div className="flex items-center space-x-2 mb-2">
                                  <SubIcon className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm font-medium text-gray-700">
                                    {subsection.label}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  {Object.entries(subsection.permissions).map(([action, permissionName]) => {
                                    if (!permissionName) return null;
                                    const permission = getPermissionByName(permissionName);
                                    if (!permission) return null;

                                    return (
                                      <label
                                        key={permissionName}
                                        className="flex items-center space-x-2 p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={selectedPermissions.has(permissionName)}
                                          onChange={() => togglePermission(permissionName)}
                                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:outline-none"
                                        />
                                        <span className="text-xs text-gray-600 capitalize">
                                          {action.replace('-', ' ')}
                                        </span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Managing permissions for <span className="font-medium">{role.name}</span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>Save Permissions</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

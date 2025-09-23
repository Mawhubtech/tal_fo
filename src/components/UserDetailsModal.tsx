import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Shield, 
  Building, 
  Briefcase, 
  MapPin, 
  Phone,
  Globe,
  Edit,
  Trash2,
  Archive,
  RotateCcw,
  Send,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { type User } from '../services/adminUserApiService';
import { useUserJobs, useUserOrganizations } from '../hooks/useAdminUsers';

interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onArchive: (userId: string) => void;
  onRestore: (userId: string) => void;
  onStatusChange: (userId: string, status: 'active' | 'inactive' | 'banned') => void;
  onSendPasswordReset: (userId: string) => void;
  onSendEmailVerification: (userId: string) => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  onStatusChange,
  onSendPasswordReset,
  onSendEmailVerification
}) => {
  const [showActions, setShowActions] = useState(false);
  
  // Always call hooks - React Query will handle the conditional logic internally
  const { data: userJobs } = useUserJobs(user?.id || '');
  const { data: userOrganizations } = useUserOrganizations(user?.id || '');

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

  // Early return AFTER all hooks have been called
  if (!isOpen || !user) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-yellow-600 bg-yellow-100';
      case 'banned':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return '🔗 Google';
      case 'linkedin':
        return '💼 LinkedIn';
      case 'local':
        return '🔐 Local';
      default:
        return provider;
    }
  };

  // Add a section to display roles and their permissions
  const renderRolesSection = () => (
    <div className="roles-section">
      <h3 className="text-lg font-semibold">Roles & Permissions</h3>
      <ul className="list-disc pl-5">
        {user.roles.map(role => (
          <li key={role.id}>
            <div className="flex items-center justify-between">
              <span>{role.name}</span>
              <span className="text-sm text-gray-500">{role.permissions.join(', ')}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  // Handle overlay click to close modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div 
      className="fixed top-0 right-0 bottom-0 left-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
           onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <span className="text-purple-600 font-semibold text-xl">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                  {user.status}
                </span>
                <span className="text-xs text-gray-500">
                  {getProviderIcon(user.provider)}
                </span>
                {!user.isEmailVerified && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full text-orange-600 bg-orange-100">
                    Email Not Verified
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onEdit(user);
                        setShowActions(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit className="w-4 h-4 mr-3" />
                      Edit User
                    </button>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <div className="px-4 py-1 text-xs font-semibold text-gray-500">Status</div>
                    <button
                      onClick={() => {
                        onStatusChange(user.id, 'active');
                        setShowActions(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-3" />
                      Set Active
                    </button>
                    <button
                      onClick={() => {
                        onStatusChange(user.id, 'inactive');
                        setShowActions(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                    >
                      <AlertCircle className="w-4 h-4 mr-3" />
                      Set Inactive
                    </button>
                    <button
                      onClick={() => {
                        onStatusChange(user.id, 'banned');
                        setShowActions(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-3" />
                      Ban User
                    </button>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    {!user.isEmailVerified && (
                      <button
                        onClick={() => {
                          onSendEmailVerification(user.id);
                          setShowActions(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                      >
                        <Send className="w-4 h-4 mr-3" />
                        Send Email Verification
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        onSendPasswordReset(user.id);
                        setShowActions(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                    >
                      <Send className="w-4 h-4 mr-3" />
                      Send Password Reset
                    </button>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <button
                      onClick={() => {
                        onArchive(user.id);
                        setShowActions(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-orange-700 hover:bg-orange-50"
                    >
                      <Archive className="w-4 h-4 mr-3" />
                      Archive User
                    </button>
                    
                    <button
                      onClick={() => {
                        onDelete(user.id);
                        setShowActions(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-3" />
                      Delete User
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Joined</p>
                    <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {user.lastLoginAt && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Last Login</p>
                      <p className="font-medium">{new Date(user.lastLoginAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Roles */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Roles & Permissions</h4>
              {user.roles && user.roles.length > 0 ? (
                <div className="space-y-3">
                  {user.roles.map((role) => (
                    <div key={role.id} className="bg-white rounded-lg p-3 border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Shield className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="font-medium">{role.name}</p>
                            {role.description && (
                              <p className="text-sm text-gray-600">{role.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      {role.permissions && role.permissions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {role.permissions.map((permission) => (
                            <span
                              key={permission.id}
                              className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded"
                            >
                              {permission.action} {permission.resource}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No roles assigned</p>
              )}
            </div>

            {/* Organizations */}
            {userOrganizations && userOrganizations.organizations && userOrganizations.organizations.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Organizations</h4>
                <div className="space-y-2">
                  {userOrganizations.organizations.map((org: any) => (
                    <div key={org.id} className="flex items-center space-x-3 bg-white rounded-lg p-3 border">
                      <Building className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{org.name}</p>
                        {org.description && (
                          <p className="text-sm text-gray-600">{org.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Jobs */}
            {userJobs && userJobs.jobs && userJobs.jobs.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Jobs Hiring For</h4>
                <div className="space-y-2">
                  {userJobs.jobs.map((job: any) => (
                    <div key={job.id} className="flex items-center space-x-3 bg-white rounded-lg p-3 border">
                      <Briefcase className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium">{job.title}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{job.department}</span>
                          <span>•</span>
                          <span>{job.location}</span>
                          <span>•</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            job.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Clients */}
            {user.clients && user.clients.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Clients</h4>
                <div className="space-y-2">
                  {user.clients.map((client) => (
                    <div key={client.id} className="bg-white rounded-lg p-3 border">
                      <div className="flex items-center space-x-3">
                        <Building className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-medium text-sm">{client.name}</p>
                          {client.email && (
                            <p className="text-xs text-gray-600">{client.email}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Account Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Account Details</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">User ID</p>
                  <p className="font-mono text-sm">{user.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Provider</p>
                  <p className="text-sm">{getProviderIcon(user.provider)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email Verified</p>
                  <p className="text-sm">{user.isEmailVerified ? '✅ Yes' : '❌ No'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Updated</p>
                  <p className="text-sm">{new Date(user.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render modal content in a portal to bypass any parent z-index issues
  return createPortal(modalContent, document.body);
};

export default UserDetailsModal;

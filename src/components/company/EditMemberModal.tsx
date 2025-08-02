import React, { useState, useEffect } from 'react';
import { X, User, Shield, Building, UserCheck, UserX, Edit, Save } from 'lucide-react';
import { CompanyMember } from '../../services/companyApiService';
import { useUpdateUser, useUpdateUserStatus, useRoles, useAssignRole, useRemoveRole } from '../../hooks/useAdminUsers';
import { toast } from '../ToastContainer';
import { formatApiError } from '../../utils/errorUtils';
import { filterRolesByCompanyType, getRoleDescriptionsForCompanyType } from '../../utils/companyRoleMapping';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: CompanyMember;
  companyType: string;
  onSuccess: () => void;
  onUpdateMember: (memberId: string, data: { role?: CompanyMember['role']; title?: string }) => Promise<void>;
  isUpdating?: boolean;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  onClose,
  member,
  companyType,
  onSuccess,
  onUpdateMember,
  isUpdating = false
}) => {
  const [role, setRole] = useState<CompanyMember['role']>(member.role);
  const [title, setTitle] = useState(member.title || '');
  const [activeTab, setActiveTab] = useState<'company' | 'user'>('company');
  
  // User data states
  const [firstName, setFirstName] = useState(member.user.firstName);
  const [lastName, setLastName] = useState(member.user.lastName);
  const [userStatus, setUserStatus] = useState(member.user.status);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(member.user.roles?.map(r => r.id) || []);

  // Hooks
  const updateUser = useUpdateUser();
  const updateUserStatus = useUpdateUserStatus();
  const { data: rolesData } = useRoles();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();

  // Get system roles filtered by company type
  const systemRoles = Array.isArray(rolesData) ? rolesData : rolesData?.roles || [];
  const availableRoles = filterRolesByCompanyType(systemRoles, companyType);
  const roleDescriptions = getRoleDescriptionsForCompanyType(companyType);

  useEffect(() => {
    if (isOpen) {
      setRole(member.role);
      setTitle(member.title || '');
      setFirstName(member.user.firstName);
      setLastName(member.user.lastName);
      setUserStatus(member.user.status);
      setSelectedRoles(member.user.roles?.map(r => r.id) || []);
      setActiveTab('company');
    }
  }, [isOpen, member]);

  const getRoleOptions = () => {
    if (companyType === 'external_hr_agency') {
      return [
        { value: 'hr_agency_specialist' as const, label: 'Specialist', description: 'Entry level with basic sourcing and candidate management' },
        { value: 'hr_agency_associate' as const, label: 'Associate', description: 'Mid-level with job management and client interaction' },
        { value: 'hr_agency_director' as const, label: 'Director', description: 'Senior level with team management and analytics access' },
        { value: 'hr_agency_admin' as const, label: 'Admin', description: 'Full administrative access for agency management' }
      ];
    }
    
    return [
      { value: 'viewer' as const, label: 'Viewer', description: 'Can view jobs and candidates' },
      { value: 'coordinator' as const, label: 'Coordinator', description: 'Can schedule interviews' },
      { value: 'recruiter' as const, label: 'Recruiter', description: 'Can manage jobs and candidates' },
      { value: 'hr_manager' as const, label: 'HR Manager', description: 'Can manage team and company settings' },
      { value: 'admin' as const, label: 'Admin', description: 'Full access to everything' }
    ];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (activeTab === 'company') {
        // Handle company role and title updates
        const updateData: { role?: CompanyMember['role']; title?: string } = {};
        
        if (role !== member.role) {
          updateData.role = role;
        }
        
        if (title !== (member.title || '')) {
          updateData.title = title || undefined;
        }

        // Only update if there are changes
        if (Object.keys(updateData).length === 0) {
          toast.info('No Changes', 'No changes were made to the member.');
          onClose();
          return;
        }

        await onUpdateMember(member.id, updateData);
        toast.success('Company Role Updated', `${member.user.firstName}'s company information has been updated successfully.`);
      } else {
        // Handle user details and system roles updates
        const hasUserDataChanges = 
          firstName !== member.user.firstName ||
          lastName !== member.user.lastName;

        const hasStatusChange = userStatus !== member.user.status;
        const currentRoleIds = member.user.roles?.map(r => r.id) || [];
        const hasRoleChanges = selectedRoles.length !== currentRoleIds.length || 
          selectedRoles.some(id => !currentRoleIds.includes(id));

        if (!hasUserDataChanges && !hasStatusChange && !hasRoleChanges) {
          toast.info('No Changes', 'No changes were made to the user.');
          return;
        }

        // Update user basic information
        if (hasUserDataChanges) {
          await updateUser.mutateAsync({
            id: member.user.id,
            userData: {
              firstName,
              lastName
            }
          });
        }

        // Update user status
        if (hasStatusChange) {
          await updateUserStatus.mutateAsync({
            id: member.user.id,
            status: userStatus
          });
        }

        // Handle role changes
        if (hasRoleChanges) {
          const rolesToAdd = selectedRoles.filter(id => !currentRoleIds.includes(id));
          const rolesToRemove = currentRoleIds.filter(id => !selectedRoles.includes(id));

          // Add new roles
          for (const roleId of rolesToAdd) {
            await assignRole.mutateAsync({ userId: member.user.id, roleId });
          }

          // Remove old roles
          for (const roleId of rolesToRemove) {
            await removeRole.mutateAsync({ userId: member.user.id, roleId });
          }
        }

        toast.success('User Updated', `${firstName}'s user information has been updated successfully.`);
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating member:', error);
      const errorMessage = formatApiError(error);
      toast.error('Update Failed', errorMessage);
    }
  };

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const toggleUserStatus = () => {
    setUserStatus(prev => prev === 'active' ? 'inactive' : 'active');
  };

  const formatRoleLabel = (roleValue: CompanyMember['role']) => {
    const option = getRoleOptions().find(opt => opt.value === roleValue);
    return option ? option.label : roleValue.replace('_', ' ');
  };

  if (!isOpen) return null;

  const roleOptions = getRoleOptions();
  const isOwner = member.role === 'owner';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Team Member</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6">
            <button
              onClick={() => setActiveTab('company')}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'company'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building className="h-4 w-4 inline mr-2" />
              Company Role
            </button>
            <button
              onClick={() => setActiveTab('user')}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'user'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User className="h-4 w-4 inline mr-2" />
              User Details
            </button>
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Member Info */}
          <div className="mb-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {member.user.firstName[0]}{member.user.lastName[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {member.user.firstName} {member.user.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{member.user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  member.user.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {member.user.status}
                </span>
                {member.user.roles && member.user.roles.length > 0 && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {member.user.roles.length} system role{member.user.roles.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Company Role Tab */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield className="h-4 w-4 inline mr-1" />
                  Company Role
                </label>
                {member.role === 'owner' ? (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium mr-2">
                        Owner
                      </span>
                      <span className="text-sm text-purple-700">Owner role cannot be changed</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as CompanyMember['role'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      {getRoleOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    
                    {/* Role Description */}
                    {getRoleOptions().find(opt => opt.value === role) && (
                      <p className="mt-2 text-sm text-gray-600">
                        {getRoleOptions().find(opt => opt.value === role)?.description}
                      </p>
                    )}

                    {/* HR Agency Hierarchy Info */}
                    {companyType === 'external_hr_agency' && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-700 font-medium mb-1">HR Agency Hierarchy:</p>
                        <p className="text-xs text-blue-600">
                          Specialist → Associate → Director → Admin
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Title Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="h-4 w-4 inline mr-1" />
                  Job Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Senior Recruiter, HR Coordinator"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Current vs New Comparison */}
              {(role !== member.role || title !== (member.title || '')) && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">Changes to be made:</h4>
                  <div className="space-y-1 text-sm text-yellow-700">
                    {role !== member.role && (
                      <div>Role: {formatRoleLabel(member.role)} → {formatRoleLabel(role)}</div>
                    )}
                    {title !== (member.title || '') && (
                      <div>Title: {member.title || '(none)'} → {title || '(none)'}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Details Tab */}
          {activeTab === 'user' && (
            <div className="space-y-6">
              {/* User Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={member.user.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                title="Email cannot be changed for security reasons"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Email addresses cannot be changed for security reasons
              </p>
            </div>              {/* User Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Status
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={toggleUserStatus}
                    className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                      userStatus === 'active'
                        ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                        : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    {userStatus === 'active' ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Active User
                      </>
                    ) : (
                      <>
                        <UserX className="h-4 w-4 mr-2" />
                        Inactive User
                      </>
                    )}
                  </button>
                  <span className="text-sm text-gray-500">
                    Click to {userStatus === 'active' ? 'deactivate' : 'activate'} user
                  </span>
                </div>
              </div>

              {/* System Roles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Shield className="h-4 w-4 inline mr-1" />
                  System Roles
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {availableRoles.length > 0 ? (
                    availableRoles.map((role) => (
                      <div key={role.id} className="border-b border-gray-100 pb-2 last:border-b-0">
                        <div className="flex items-center mb-1">
                          <input
                            type="checkbox"
                            id={`role-${role.id}`}
                            checked={selectedRoles.includes(role.id)}
                            onChange={() => handleRoleToggle(role.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`role-${role.id}`} className="ml-2 text-sm font-medium text-gray-900">
                            {role.name}
                          </label>
                        </div>
                        {(roleDescriptions[role.name] || role.description) && (
                          <p className="text-xs text-gray-600 ml-6">
                            {roleDescriptions[role.name] || role.description}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No system roles available for this company type</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 System roles control platform-wide permissions and access levels.
                </p>
              </div>

              {/* Changes Summary for User Tab */}
              {(firstName !== member.user.firstName || 
                lastName !== member.user.lastName || 
                userStatus !== member.user.status ||
                selectedRoles.length !== (member.user.roles?.length || 0) ||
                selectedRoles.some(id => !(member.user.roles?.map(r => r.id) || []).includes(id))) && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">User changes to be made:</h4>
                  <div className="space-y-1 text-sm text-yellow-700">
                    {firstName !== member.user.firstName && (
                      <div>First Name: {member.user.firstName} → {firstName}</div>
                    )}
                    {lastName !== member.user.lastName && (
                      <div>Last Name: {member.user.lastName} → {lastName}</div>
                    )}
                    {userStatus !== member.user.status && (
                      <div>Status: {member.user.status} → {userStatus}</div>
                    )}
                    {(selectedRoles.length !== (member.user.roles?.length || 0) ||
                      selectedRoles.some(id => !(member.user.roles?.map(r => r.id) || []).includes(id))) && (
                      <div>System Roles: Updated ({selectedRoles.length} selected)</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating || updateUser.isPending || updateUserStatus.isPending || 
                       assignRole.isPending || removeRole.isPending || (member.role === 'owner' && activeTab === 'company')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {(isUpdating || updateUser.isPending || updateUserStatus.isPending || 
                assignRole.isPending || removeRole.isPending) ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update {activeTab === 'company' ? 'Company Role' : 'User Details'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { X, User, Shield, Building } from 'lucide-react';
import { CompanyMember } from '../../services/companyApiService';
import { toast } from '../ToastContainer';
import { formatApiError } from '../../utils/errorUtils';

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

  useEffect(() => {
    if (isOpen) {
      setRole(member.role);
      setTitle(member.title || '');
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
      
      toast.success('Member Updated', `${member.user.firstName}'s information has been updated successfully.`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating member:', error);
      const errorMessage = formatApiError(error);
      toast.error('Update Failed', errorMessage);
    }
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Team Member</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Member Info */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
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
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Shield className="h-4 w-4 inline mr-1" />
              Role
            </label>
            {isOwner ? (
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
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                {/* Role Description */}
                {roleOptions.find(opt => opt.value === role) && (
                  <p className="mt-2 text-sm text-gray-600">
                    {roleOptions.find(opt => opt.value === role)?.description}
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
          <div className="mb-6">
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
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
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

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating || isOwner}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdating ? 'Updating...' : 'Update Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { useInviteMember } from '../../hooks/useCompany';
import { toast } from '../ToastContainer';
import { CompanyMember } from '../../services/companyApiService';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyType?: string;
  onSuccess?: () => void;
}

type MemberRole = CompanyMember['role'];

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  companyId,
  companyType,
  onSuccess,
}) => {
  // Determine default role based on company type
  const getDefaultRole = (): MemberRole => {
    if (companyType === 'external_hr_agency') {
      return 'hr_agency_specialist';
    }
    return 'recruiter';
  };

  const [formData, setFormData] = useState({
    email: '',
    role: getDefaultRole(),
    title: '',
  });

  // Get role options based on company type
  const getRoleOptions = () => {
    if (companyType === 'external_hr_agency') {
      return [
        { value: 'hr_agency_specialist', label: 'Specialist - Entry level with basic sourcing and candidate management' },
        { value: 'hr_agency_associate', label: 'Associate - Mid-level with job management and client interaction' },
        { value: 'hr_agency_director', label: 'Director - Senior level with team management and analytics access' },
        { value: 'hr_agency_admin', label: 'Admin - Full administrative access for agency management' },
      ];
    }
    
    // Default roles for other company types
    return [
      { value: 'viewer', label: 'Viewer - Can view jobs and candidates' },
      { value: 'coordinator', label: 'Coordinator - Can schedule interviews' },
      { value: 'recruiter', label: 'Recruiter - Can manage jobs and candidates' },
      { value: 'hr_manager', label: 'HR Manager - Can manage team and company settings' },
      { value: 'admin', label: 'Admin - Full access to everything' },
    ];
  };
  const [errors, setErrors] = useState<Record<string, string>>({});
  const inviteMember = useInviteMember();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.role) newErrors.role = 'Role is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await inviteMember.mutateAsync({
        companyId,
        data: {
          email: formData.email,
          role: formData.role,
          title: formData.title || undefined,
        }
      });
      toast.success('Invitation Sent', `Invitation has been sent to ${formData.email}.`);
      onSuccess?.();
      onClose();
      setFormData({ email: '', role: 'recruiter', title: '' });
      setErrors({});
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send invitation. Please try again.';
      toast.error('Invitation Failed', errorMessage);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <UserPlus className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Invite Team Member</h2>
              <p className="text-sm text-gray-600">Send an invitation to join your company</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="colleague@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            {companyType === 'external_hr_agency' && (
              <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>HR Agency Hierarchy:</strong> Select the appropriate level based on the member's experience and responsibilities.
                </p>
              </div>
            )}
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.role ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              {getRoleOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.role}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Senior Recruiter, HR Manager"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={inviteMember.isPending}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {inviteMember.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

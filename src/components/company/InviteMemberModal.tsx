import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, AlertCircle, Users } from 'lucide-react';
import { useInviteMember, useCheckUserExists } from '../../hooks/useCompany';
import { useRoles } from '../../hooks/useAdminUsers';
import { toast } from '../ToastContainer';
import { CompanyMember } from '../../services/companyApiService';
import { filterRolesByCompanyType, getRoleDescriptionsForCompanyType } from '../../utils/companyRoleMapping';

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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionError, setSubmissionError] = useState('');
  const [showCreateUserConfirm, setShowCreateUserConfirm] = useState(false);
  const [newUserRoles, setNewUserRoles] = useState<string[]>([]);

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
    
    return [
      { value: 'recruiter', label: 'Recruiter - Manage jobs and candidates' },
      { value: 'team_lead', label: 'Team Lead - Lead recruitment teams' },
      { value: 'admin', label: 'Admin - Full administrative access' },
    ];
  };

  const inviteMember = useInviteMember();
  const checkUserExists = useCheckUserExists();
  const { data: rolesData } = useRoles();

  // Filter roles based on company type - handle both array and object response
  const systemRoles = Array.isArray(rolesData) ? rolesData : rolesData?.roles || [];
  const availableRoles = filterRolesByCompanyType(systemRoles, companyType);
  const roleDescriptions = getRoleDescriptionsForCompanyType(companyType);

  // Enhanced modal behavior - ESC key and body scroll prevention
  useEffect(() => {
    if (!isOpen) return;

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Handle overlay click to close modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    setFormData({
      email: '',
      role: getDefaultRole(),
      title: '',
    });
    setErrors({});
    setSubmissionError('');
    setShowCreateUserConfirm(false);
    setNewUserRoles([]);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmissionError('');

    try {
      // First check if user exists
      const userExistsResult = await checkUserExists.mutateAsync(formData.email);
      
      if (!userExistsResult.exists) {
        // Show create user confirmation modal
        setShowCreateUserConfirm(true);
        return;
      }

      // User exists, proceed with normal invitation
      await sendInvitation();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to check user existence. Please try again.';
      setSubmissionError(errorMessage);
      toast.error('Invitation Failed', errorMessage);
    }
  };

  const sendInvitation = async (createUserWithRoles?: string[]) => {
    try {
      const invitationData = {
        email: formData.email,
        role: formData.role,
        title: formData.title || undefined,
        ...(createUserWithRoles && { userRoles: createUserWithRoles })
      };

      const result = await inviteMember.mutateAsync({
        companyId,
        data: invitationData
      });
      
      // Handle success with email status feedback
      if (result.userCreated) {
        // User was created automatically
        if (result.emailSent) {
          toast.success(
            'User Created & Account Setup Email Sent!', 
            `${formData.email} has been created as a new user. They will receive an email to set up their password and accept your company invitation.`,
            8000
          );
        } else {
          toast.warning(
            'User Created - Manual Setup Required', 
            `${formData.email} has been created as a new user, but the setup email could not be sent. Please contact them directly to set up their account.`,
            8000
          );
        }
      } else {
        // Existing user invited
        if (result.emailSent) {
          toast.success('Invitation Sent', `Invitation has been sent to ${formData.email}.`);
        } else {
          // Show warning if email failed but invitation was created
          if (result.emailError?.includes('Gmail not connected')) {
            toast.warning(
              'Invitation Created', 
              `Invitation created for ${formData.email}, but email could not be sent. Please connect your Gmail account to send invitation emails.`
            );
          } else {
            toast.warning(
              'Invitation Created', 
              `Invitation created for ${formData.email}, but email could not be sent. You can resend the invitation from the members list.`
            );
          }
        }
      }
      
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send invitation. Please try again.';
      setSubmissionError(errorMessage);
      toast.error('Invitation Failed', errorMessage);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Clear submission error when user starts typing
    if (submissionError) {
      setSubmissionError('');
    }
  };

  const handleCreateUserConfirm = async () => {
    setShowCreateUserConfirm(false);
    await sendInvitation(newUserRoles);
  };

  const handleCreateUserCancel = () => {
    setShowCreateUserConfirm(false);
    setNewUserRoles([]);
  };

  const handleRoleToggle = (roleId: string) => {
    setNewUserRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  if (!isOpen) return null;

  const roleOptions = getRoleOptions();

  return createPortal(
    <>
      {/* Main Invitation Modal */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
        onClick={handleOverlayClick}
      >
        <div 
          className="bg-white rounded-lg shadow-xl max-w-lg w-full m-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Invite Team Member</h2>
                <p className="text-sm text-gray-600">Send an invitation to join your company</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {submissionError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">Invitation Failed</p>
                  <p className="text-sm text-red-700 mt-1">{submissionError}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Company Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.role ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">{errors.role}</p>
              )}
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Job Title (Optional)
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Senior Recruiter"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={inviteMember.isPending || checkUserExists.isPending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center"
              >
                {inviteMember.isPending || checkUserExists.isPending ? (
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

      {/* Create User Confirmation Modal */}
      {showCreateUserConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div 
            className="bg-white rounded-lg shadow-xl max-w-lg w-full m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Create New User</h2>
                  <p className="text-sm text-gray-600">User {formData.email} doesn't exist yet</p>
                </div>
              </div>
              <button
                onClick={handleCreateUserCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>User Not Found:</strong> {formData.email} doesn't have an account yet. 
                  We will create a new user account and send them an email to set up their password and accept your company invitation.
                </p>
                <p className="text-xs text-yellow-700 mt-2">
                  💡 They will receive an "Account Setup" email with a secure link to create their password, then they can sign in and accept your invitation.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Select System Roles for New User:
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {availableRoles.map((role) => (
                    <div key={role.id} className="border-b border-gray-100 pb-2 last:border-b-0">
                      <div className="flex items-center mb-1">
                        <input
                          type="checkbox"
                          id={`new-user-role-${role.id}`}
                          checked={newUserRoles.includes(role.id)}
                          onChange={() => handleRoleToggle(role.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor={`new-user-role-${role.id}`} className="ml-2 text-sm font-medium text-gray-900">
                          {role.name}
                        </label>
                      </div>
                      {(roleDescriptions[role.name] || role.description) && (
                        <p className="text-xs text-gray-600 ml-6">
                          {roleDescriptions[role.name] || role.description}
                        </p>
                      )}
                    </div>
                  ))}
                  {availableRoles.length === 0 && (
                    <p className="text-sm text-gray-500">No roles available</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 These are system-wide roles. The company role "{formData.role}" will be assigned separately.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCreateUserCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateUserConfirm}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Create User & Send Invitation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

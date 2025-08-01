import React, { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { useInviteMember } from '../../hooks/useCompany';
import { toast } from '../ToastContainer';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
}

type MemberRole = 'admin' | 'hr_manager' | 'recruiter' | 'coordinator' | 'viewer';

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  companyId,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'recruiter' as MemberRole,
    title: '',
  });
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
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.role ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="viewer">Viewer - Can view jobs and candidates</option>
              <option value="coordinator">Coordinator - Can schedule interviews</option>
              <option value="recruiter">Recruiter - Can manage jobs and candidates</option>
              <option value="hr_manager">HR Manager - Can manage team and company settings</option>
              <option value="admin">Admin - Full access to everything</option>
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

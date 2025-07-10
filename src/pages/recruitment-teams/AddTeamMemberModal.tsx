import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { useAddTeamMember } from '../../hooks/useRecruitmentTeams';

interface AddTeamMemberModalProps {
  teamId: string;
  onClose: () => void;
  existingMemberIds: string[];
}

// For now, we'll use a simple email input. In a real app, you might want to
// integrate with a user search API or have a user directory
const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({
  teamId,
  onClose,
  existingMemberIds,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'member' as 'admin' | 'member',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addMemberMutation = useAddTeamMember();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // In a real implementation, you would need to look up the user by email
      // and get their userId. For now, we'll show an error message.
      setErrors({ 
        general: 'User lookup by email is not implemented yet. Please use the user ID directly.' 
      });
      
      // This is what the actual implementation would look like:
      // const user = await UserApiService.findByEmail(formData.email.trim());
      // await addMemberMutation.mutateAsync({
      //   teamId,
      //   data: {
      //     userId: user.id,
      //     role: formData.role,
      //   },
      // });
      // onClose();
    } catch (error) {
      console.error('Failed to add team member:', error);
      setErrors({ general: 'Failed to add team member. Please try again.' });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add Team Member</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-700 text-sm">
              <strong>Note:</strong> User search by email is not yet implemented. 
              This feature requires integration with a user directory or search API.
            </p>
          </div>

          <div>
            <label htmlFor="memberEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="memberEmail"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter user's email address"
                disabled={true} // Disabled until user search is implemented
              />
            </div>
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="memberRole" className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              id="memberRole"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Admins can add/remove members and manage team settings.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={addMemberMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
              disabled={addMemberMutation.isPending || true} // Disabled until implementation is complete
            >
              {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeamMemberModal;

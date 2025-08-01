import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useUpdateCompanyTeam } from '../../hooks/useCompany';
import { RecruitmentTeam } from '../../services/companyApiService';
import { toast } from '../ToastContainer';

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: RecruitmentTeam;
  companyId: string;
}

export const EditTeamModal: React.FC<EditTeamModalProps> = ({
  isOpen,
  onClose,
  team,
  companyId
}) => {
  const [formData, setFormData] = useState({
    name: team.name,
    description: team.description || '',
    isActive: team.isActive
  });

  const updateTeam = useUpdateCompanyTeam();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Validation Error', 'Team name is required.');
      return;
    }

    try {
      await updateTeam.mutateAsync({
        companyId,
        teamId: team.id,
        data: {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          isActive: formData.isActive
        }
      });

      toast.success('Team Updated', `${formData.name} has been updated successfully.`);
      onClose();
    } catch (error) {
      toast.error('Update Failed', 'Failed to update team. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Edit Recruitment Team</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Team Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Sales Team, Engineering Team"
              disabled={updateTeam.isPending}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Brief description of the team's purpose..."
              disabled={updateTeam.isPending}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              disabled={updateTeam.isPending}
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Team is active
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={updateTeam.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={updateTeam.isPending}
            >
              {updateTeam.isPending ? 'Updating...' : 'Update Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

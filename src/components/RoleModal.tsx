import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle } from 'lucide-react';
import { type Role, type Permission, type CreateRoleData, type UpdateRoleData } from '../services/roleApiService';
import RolePermissionAssigner from './RolePermissionAssigner';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roleData: CreateRoleData | UpdateRoleData) => void;
  isLoading: boolean;
  role?: Role | null;
  isEditing?: boolean;
  permissions: Permission[];
}

export const RoleModal: React.FC<RoleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  role,
  isEditing = false,
  permissions
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    selectedPermissions: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Reset form when modal opens/closes or role changes
  useEffect(() => {
    if (isOpen) {
      if (isEditing && role) {
        setFormData({
          name: role.name,
          description: role.description,
          isActive: role.isActive,
          selectedPermissions: role.permissions?.map(p => `${p.resource}:${p.action}`) || []
        });
      } else {
        setFormData({
          name: '',
          description: '',
          isActive: true,
          selectedPermissions: []
        });
      }
      setErrors({});
    }
  }, [isOpen, isEditing, role]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Convert selected permissions back to permission IDs for the API
    const permissionIds = formData.selectedPermissions.length > 0 
      ? permissions
          .filter(p => formData.selectedPermissions.includes(`${p.resource}:${p.action}`))
          .map(p => p.id)
      : undefined;

    const submitData: CreateRoleData | UpdateRoleData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      isActive: formData.isActive,
      permissionIds
    };

    onSubmit(submitData);
  };

  const handlePermissionsChange = (selectedPermissions: string[]) => {
    setFormData(prev => ({
      ...prev,
      selectedPermissions
    }));
  };

  // Handle overlay click to close modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed top-0 right-0 bottom-0 left-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Role' : 'Create New Role'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Role Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Role Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter role name (e.g., jobseeker, company-hr)"
              disabled={isLoading}
            />
            {errors.name && (
              <div className="flex items-center mt-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.name}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe the role's purpose and responsibilities"
              disabled={isLoading}
            />
            {errors.description && (
              <div className="flex items-center mt-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.description}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                disabled={isLoading}
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Active role (users can be assigned to this role)
              </label>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <RolePermissionAssigner
              selectedPermissions={formData.selectedPermissions}
              onPermissionsChange={handlePermissionsChange}
              allPermissions={permissions}
              disabled={isLoading}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update Role' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

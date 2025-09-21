import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { type Permission, type CreatePermissionData, type UpdatePermissionData } from '../services/roleApiService';

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (permissionData: CreatePermissionData | UpdatePermissionData) => void;
  isLoading: boolean;
  permission?: Permission | null;
  isEditing?: boolean;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  permission,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    resource: '',
    action: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Common resources and actions for suggestions
  const commonResources = ['users', 'roles', 'permissions', 'jobs', 'candidates', 'clients', 'teams', 'reports'];
  const commonActions = ['create', 'read', 'update', 'delete', 'list', 'manage', 'view', 'edit'];

  // Reset form when modal opens/closes or permission changes
  useEffect(() => {
    if (isOpen) {
      if (isEditing && permission) {
        setFormData({
          resource: permission.resource,
          action: permission.action,
          description: permission.description || ''
        });
      } else {
        setFormData({
          resource: '',
          action: '',
          description: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, isEditing, permission]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.resource.trim()) {
      newErrors.resource = 'Resource is required';
    }

    if (!formData.action.trim()) {
      newErrors.action = 'Action is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData: CreatePermissionData | UpdatePermissionData = {
      resource: formData.resource.trim().toLowerCase(),
      action: formData.action.trim().toLowerCase(),
      description: formData.description.trim() || undefined
    };

    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Permission' : 'Create New Permission'}
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
          {/* Resource */}
          <div>
            <label htmlFor="resource" className="block text-sm font-medium text-gray-700 mb-1">
              Resource *
            </label>
            <input
              type="text"
              id="resource"
              value={formData.resource}
              onChange={(e) => setFormData(prev => ({ ...prev, resource: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none ${
                errors.resource ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., users, jobs, candidates"
              disabled={isLoading}
              list="resources"
            />
            <datalist id="resources">
              {commonResources.map(resource => (
                <option key={resource} value={resource} />
              ))}
            </datalist>
            {errors.resource && (
              <div className="flex items-center mt-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.resource}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              The resource this permission applies to (lowercase, plural)
            </p>
          </div>

          {/* Action */}
          <div>
            <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-1">
              Action *
            </label>
            <input
              type="text"
              id="action"
              value={formData.action}
              onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none ${
                errors.action ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., create, read, update, delete"
              disabled={isLoading}
              list="actions"
            />
            <datalist id="actions">
              {commonActions.map(action => (
                <option key={action} value={action} />
              ))}
            </datalist>
            {errors.action && (
              <div className="flex items-center mt-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.action}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              The action that can be performed on the resource
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none"
              placeholder="Optional description of what this permission allows"
              disabled={isLoading}
            />
          </div>

          {/* Preview */}
          {formData.resource && formData.action && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Permission Preview:</p>
              <p className="font-mono text-sm font-medium text-gray-900">
                {formData.resource.toLowerCase()}:{formData.action.toLowerCase()}
              </p>
            </div>
          )}

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
              {isLoading ? 'Saving...' : isEditing ? 'Update Permission' : 'Create Permission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

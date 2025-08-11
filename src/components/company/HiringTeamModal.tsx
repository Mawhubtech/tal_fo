import React, { useState, useEffect } from 'react';
import { X, Users, Eye, Lock, Globe } from 'lucide-react';
import type { HiringTeam, CreateHiringTeamData, UpdateHiringTeamData } from '../../services/hiringTeamApiService';

interface HiringTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateHiringTeamData | UpdateHiringTeamData) => void;
  team?: HiringTeam | null;
  title: string;
  isLoading?: boolean;
}

const VISIBILITY_OPTIONS = [
  {
    value: 'organization',
    label: 'Organization Only',
    description: 'Only members of this company can see this team',
    icon: <Eye className="h-4 w-4" />
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only team members can see this team',
    icon: <Lock className="h-4 w-4" />
  },
  {
    value: 'public',
    label: 'Public',
    description: 'Anyone can see this team',
    icon: <Globe className="h-4 w-4" />
  }
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', description: 'Team is active and can be used' },
  { value: 'inactive', label: 'Inactive', description: 'Team is temporarily disabled' },
  { value: 'archived', label: 'Archived', description: 'Team is archived and cannot be used' }
];

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#10b981', '#06b6d4', '#3b82f6',
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316'
];

export const HiringTeamModal: React.FC<HiringTeamModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  team,
  title,
  isLoading = false
}) => {
  const isEditing = !!team;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'organization' as const, // Always organization-only
    status: 'active' as 'active' | 'inactive' | 'archived',
    isDefault: false,
    color: '#6366f1',
    icon: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when team changes
  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || '',
        description: team.description || '',
        visibility: 'organization', // Always organization-only
        status: team.status || 'active',
        isDefault: team.isDefault || false,
        color: team.color || '#6366f1',
        icon: team.icon || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        visibility: 'organization',
        status: 'active',
        isDefault: false,
        color: '#6366f1',
        icon: ''
      });
    }
    setErrors({});
  }, [team, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    }

    if (formData.name.length > 100) {
      newErrors.name = 'Team name must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      visibility: formData.visibility,
      status: formData.status,
      isDefault: formData.isDefault,
      color: formData.color,
      icon: formData.icon.trim() || undefined
    };

    onSubmit(submitData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Team Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter team name"
                disabled={isLoading}
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter team description (optional)"
                disabled={isLoading}
              />
              {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Settings</h3>
            
            {/* Visibility - Organization Only (Display Only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibility
              </label>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <Eye className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium text-purple-900">Organization Only</div>
                  <p className="text-sm text-purple-700">Only members of this company can see this team</p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
                Set as default team for this company
              </label>
            </div>
          </div>

          {/* Appearance */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Appearance</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Color
              </label>
              <div className="flex items-center space-x-4">
                <div 
                  className="w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center"
                  style={{ backgroundColor: formData.color }}
                >
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">Quick colors:</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleInputChange('color', color)}
                      className={`w-6 h-6 rounded border-2 ${
                        formData.color === color ? 'border-gray-800' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                      disabled={isLoading}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1">
                Team Icon (Emoji)
              </label>
              <input
                type="text"
                id="icon"
                value={formData.icon}
                onChange={(e) => handleInputChange('icon', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="👥 (optional emoji icon)"
                maxLength={2}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              )}
              {isEditing ? 'Update Team' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { type User, type CreateUserData, type UpdateUserData, type Role } from '../services/adminUserApiService';
import { filterRolesByCompanyType, getRoleDescriptionsForCompanyType } from '../utils/companyRoleMapping';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: CreateUserData | UpdateUserData) => void;
  isLoading: boolean;
  user?: User | null;
  isEditing?: boolean;
  roles: Role[];
  filterAdminRoles?: boolean; // Filter out admin/super-admin roles for team management
  companyType?: string; // Company type for role filtering
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  user,
  isEditing = false,
  roles,
  filterAdminRoles = false,
  companyType
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    status: 'active' as 'active' | 'inactive' | 'banned',
    roleIds: [] as string[]
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());

  // Filter roles based on context (exclude admin roles for team management or filter by company type)
  const availableRoles = (() => {
    let filteredRoles = roles;
    
    // Filter by company type if provided
    if (companyType) {
      filteredRoles = filterRolesByCompanyType(roles, companyType);
    }
    
    // Additional filtering for admin roles if requested
    if (filterAdminRoles) {
      filteredRoles = filteredRoles.filter(role => !['admin', 'super-admin'].includes(role.name.toLowerCase()));
    }
    
    return filteredRoles;
  })();

  // Get role descriptions for company type
  const roleDescriptions = companyType ? getRoleDescriptionsForCompanyType(companyType) : {};

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      if (isEditing && user) {
        setFormData({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: '',
          status: user.status,
          roleIds: user.roles?.map(role => role.id) || []
        });
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          status: 'active',
          roleIds: []
        });
      }
      setErrors({});
    }
  }, [isOpen, isEditing, user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Only validate email for new users since it can't be changed for existing users
    if (!isEditing) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!isEditing && !formData.password.trim()) {
      newErrors.password = 'Password is required for new users';
    }

    if (!isEditing && formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (isEditing) {
      // For editing, exclude email field as backend doesn't allow email updates
      const submitData: UpdateUserData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        status: formData.status,
        roleIds: formData.roleIds.length > 0 ? formData.roleIds : undefined
      };
      onSubmit(submitData);
    } else {
      // For creating, include all fields including email and password
      const submitData: CreateUserData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        status: formData.status,
        roleIds: formData.roleIds.length > 0 ? formData.roleIds : undefined
      };
      onSubmit(submitData);
    }
  };

  const handleRoleChange = (roleId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      roleIds: checked 
        ? [...prev.roleIds, roleId]
        : prev.roleIds.filter(id => id !== roleId)
    }));
  };

  const toggleRoleExpansion = (roleId: string) => {
    setExpandedRoles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roleId)) {
        newSet.delete(roleId);
      } else {
        newSet.add(roleId);
      }
      return newSet;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit User' : 'Create New User'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Company Type Info */}
          {companyType && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Roles for {companyType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Company
              </h4>
              <p className="text-sm text-blue-700">
                The available roles below are specifically curated for your company type to ensure the right permissions and access levels.
              </p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Basic Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
                {errors.firstName && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.firstName}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
                {errors.lastName && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.lastName}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
                {isEditing && <span className="text-sm text-gray-500 font-normal ml-1">(cannot be changed)</span>}
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } ${isEditing ? 'bg-gray-50' : ''}`}
                disabled={isLoading || isEditing}
              />
              {errors.email && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </div>
              )}
            </div>

            {!isEditing && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <p className="text-xs text-gray-500 mb-2">Must be at least 8 characters long</p>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none pr-10 ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password}
                  </div>
                )}
              </div>
            )}

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                disabled={isLoading}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>

          {/* Roles */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Roles</h4>
            <div className="space-y-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {availableRoles.map((role) => (
                <div key={role.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`role-${role.id}`}
                        checked={formData.roleIds.includes(role.id)}
                        onChange={(e) => handleRoleChange(role.id, e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        disabled={isLoading}
                      />
                      <label htmlFor={`role-${role.id}`} className="ml-2 text-sm font-medium text-gray-900">
                        {role.name}
                      </label>
                    </div>
                    {role.permissions && role.permissions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleRoleExpansion(role.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Toggle permissions"
                      >
                        {expandedRoles.has(role.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                  {/* Show company-specific description if available, otherwise use role description */}
                  {(roleDescriptions[role.name] || role.description) && (
                    <p className="text-xs text-gray-600 ml-6 mb-2">
                      {roleDescriptions[role.name] || role.description}
                    </p>
                  )}
                  {role.permissions && role.permissions.length > 0 && expandedRoles.has(role.id) && (
                    <div className="ml-6">
                      <p className="text-xs font-medium text-gray-700 mb-1">Permissions:</p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map((permission) => (
                          <span
                            key={permission.id}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                          >
                            {permission.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {availableRoles.length === 0 && (
                <p className="text-sm text-gray-500">No roles available</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;

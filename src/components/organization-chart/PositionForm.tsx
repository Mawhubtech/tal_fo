import React, { useState, useEffect } from 'react';
import { X, User, Building2, Mail, Phone, Users, Briefcase } from 'lucide-react';
import type { Position } from './OrganizationChart';

export interface PositionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (position: Omit<Position, 'id' | 'children' | 'isExpanded'>) => void;
  position?: Position;
  parentPosition?: Position;
  clientId: string;
  clientName: string;
  departments: Array<{ id: string; name: string; color: string }>;
  allPositions: Position[];
  mode: 'create' | 'edit';
}

const PositionForm: React.FC<PositionFormProps> = ({
  isOpen,
  onClose,
  onSave,
  position,
  parentPosition,
  clientId,
  clientName,
  departments,
  allPositions,
  mode
}) => {
  const [formData, setFormData] = useState({
    title: '',
    employeeName: '',
    email: '',
    phone: '',
    department: '',
    departmentId: '',
    parentId: '',
    level: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal behavior: Prevent body scroll and handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    // Handle ESC key to close modal
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);

    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && position) {
        setFormData({
          title: position.title || '',
          employeeName: position.employeeName || '',
          email: position.email || '',
          phone: position.phone || '',
          department: position.department || '',
          departmentId: position.departmentId || '',
          parentId: position.parentId || '',
          level: position.level || 0
        });
      } else if (mode === 'create') {
        // Calculate level based on parent
        const level = parentPosition ? parentPosition.level + 1 : 0;
        
        setFormData({
          title: '',
          employeeName: '',
          email: '',
          phone: '',
          department: parentPosition?.department || '',
          departmentId: parentPosition?.departmentId || '',
          parentId: parentPosition?.id || '',
          level
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, position, parentPosition]);

  // Get available parent positions (excluding current position and its descendants)
  const getAvailableParents = (): Position[] => {
    if (mode === 'create') {
      return allPositions;
    }

    // For edit mode, exclude the current position and its descendants
    const excludeIds = new Set<string>();
    
    const addDescendants = (pos: Position) => {
      excludeIds.add(pos.id);
      if (pos.children) {
        pos.children.forEach(child => addDescendants(child));
      }
    };

    if (position) {
      addDescendants(position);
    }

    return allPositions.filter(pos => !excludeIds.has(pos.id));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-update department name when department ID changes
    if (field === 'departmentId') {
      const selectedDept = departments.find(dept => dept.id === value);
      if (selectedDept) {
        setFormData(prev => ({ ...prev, department: selectedDept.name }));
      } else if (value === '') {
        // Clear department name when no department is selected
        setFormData(prev => ({ ...prev, department: '' }));
      }
    }

    // Update level when parent changes
    if (field === 'parentId') {
      const selectedParent = allPositions.find(pos => pos.id === value);
      const newLevel = selectedParent ? selectedParent.level + 1 : 0;
      setFormData(prev => ({ ...prev, level: newLevel }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Position title is required';
    }

    // Department is not required - can be left empty for executive positions
    // If department is selected, validate it exists
    if (formData.departmentId && !departments.find(dept => dept.id === formData.departmentId)) {
      newErrors.departmentId = 'Please select a valid department';
    }

    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const positionData = {
        title: formData.title.trim(),
        employeeName: formData.employeeName.trim() || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        department: formData.department || 'Executive', // Default to Executive if no department
        departmentId: formData.departmentId || undefined,
        parentId: formData.parentId || undefined,
        level: formData.level
      };

      await onSave(positionData);
      handleClose();
    } catch (error) {
      console.error('Error saving position:', error);
      setErrors({ submit: 'Failed to save position. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      employeeName: '',
      email: '',
      phone: '',
      department: '',
      departmentId: '',
      parentId: '',
      level: 0
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const availableParents = getAvailableParents();

  if (!isOpen) return null;

  // Handle overlay click to close modal
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? 'Add New Position' : 'Edit Position'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {mode === 'create' 
                ? `Create a new position ${parentPosition ? `under ${parentPosition.title}` : 'in the organization'}`
                : 'Update position information'
              }
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Position Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="w-4 h-4 inline mr-1" />
              Position Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-purple-500 focus:border-transparent ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Chief Executive Officer, Marketing Manager"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Employee Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Employee Name
            </label>
            <input
              type="text"
              value={formData.employeeName}
              onChange={(e) => handleInputChange('employeeName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              placeholder="e.g., John Smith (optional)"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty if position is vacant
            </p>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4 inline mr-1" />
              Department
              <span className="text-gray-400 ml-1">(optional)</span>
            </label>
            <select
              value={formData.departmentId}
              onChange={(e) => handleInputChange('departmentId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.departmentId ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">No specific department (Executive level)</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.departmentId && (
              <p className="mt-1 text-sm text-red-600">{errors.departmentId}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              💡 Leave empty for executive positions like CEO, or select a specific department for other roles
            </p>
          </div>

          {/* Parent Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Reports To
            </label>
            <select
              value={formData.parentId}
              onChange={(e) => handleInputChange('parentId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            >
              <option value="">No supervisor (Top level position)</option>
              {availableParents.map(pos => (
                <option key={pos.id} value={pos.id}>
                  {pos.title} {pos.employeeName ? `(${pos.employeeName})` : ''} - {pos.department}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Select the position this role reports to
            </p>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="employee@company.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Position Level Info */}
          {formData.parentId && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Position Hierarchy</h4>
              <p className="text-sm text-gray-600">
                This position will be at <strong>Level {formData.level}</strong> in the organization structure.
              </p>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Position' : 'Update Position'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PositionForm;

import React, { useState, useEffect } from 'react';
import { X, Building, User, Mail, Users, Palette, Type } from 'lucide-react';
import { DepartmentApiService } from '../../../recruitment/organizations/services/departmentApiService';
import type { CreateDepartmentRequest, UpdateDepartmentRequest, Department } from '../../../recruitment/organizations/services/departmentApiService';

interface DepartmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (department: Department) => void;
  clientId: string;
  clientName: string;
  department?: Department | null; // For editing
  mode?: 'create' | 'edit';
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({
  isOpen,
  onClose,
  onSave,
  clientId,
  clientName,
  department = null,
  mode = 'create'
}) => {
  const [formData, setFormData] = useState<CreateDepartmentRequest>({
    name: '',
    description: '',
    manager: '',
    managerEmail: '',
    totalEmployees: 0,
    color: '#3B82F6',
    icon: '🏢',
    clientId
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const departmentApiService = new DepartmentApiService();

  // Initialize form data when department prop changes (for editing)
  useEffect(() => {
    if (department && mode === 'edit') {
      setFormData({
        name: department.name || '',
        description: department.description || '',
        manager: department.manager || '',
        managerEmail: department.managerEmail || '',
        totalEmployees: department.totalEmployees || 0,
        color: department.color || '#3B82F6',
        icon: department.icon || '🏢',
        clientId: department.clientId
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        description: '',
        manager: '',
        managerEmail: '',
        totalEmployees: 0,
        color: '#3B82F6',
        icon: '🏢',
        clientId
      });
    }
    setErrors({});
  }, [department, mode, clientId]);

  // Predefined color options
  const colorOptions = [
    { value: '#3B82F6', label: 'Blue', class: 'bg-blue-500' },
    { value: '#10B981', label: 'Green', class: 'bg-green-500' },
    { value: '#8B5CF6', label: 'Purple', class: 'bg-purple-500' },
    { value: '#F59E0B', label: 'Yellow', class: 'bg-yellow-500' },
    { value: '#EF4444', label: 'Red', class: 'bg-red-500' },
    { value: '#6B7280', label: 'Gray', class: 'bg-gray-500' },
    { value: '#EC4899', label: 'Pink', class: 'bg-pink-500' },
    { value: '#06B6D4', label: 'Cyan', class: 'bg-cyan-500' },
    { value: '#84CC16', label: 'Lime', class: 'bg-lime-500' },
    { value: '#F97316', label: 'Orange', class: 'bg-orange-500' }
  ];

  // Predefined icon options
  const iconOptions = [
    '🏢', '💻', '👥', '🎯', '💼', '📊', '🔧', '🎨', '📱', '⚙️',
    '🏥', '🔬', '📚', '💰', '🚀', '🛡️', '📈', '🎪', '🏭', '🌐'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalEmployees' ? parseInt(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Department name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Department name must be at least 2 characters';
    }

    if (formData.managerEmail && !isValidEmail(formData.managerEmail)) {
      newErrors.managerEmail = 'Please enter a valid email address';
    }

    if (formData.totalEmployees < 0) {
      newErrors.totalEmployees = 'Employee count cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      let result: Department;
      
      if (mode === 'edit' && department) {
        // Update existing department
        const updateData: UpdateDepartmentRequest = {
          name: formData.name,
          description: formData.description,
          manager: formData.manager,
          managerEmail: formData.managerEmail,
          totalEmployees: formData.totalEmployees,
          color: formData.color,
          icon: formData.icon
        };
        result = await departmentApiService.updateDepartment(department.id, updateData);
      } else {
        // Create new department
        result = await departmentApiService.createDepartment(formData);
      }
      
      onSave(result);
    } catch (error: any) {
      console.error('Error saving department:', error);
      setErrors({
        submit: error.response?.data?.message || `Failed to ${mode} department. Please try again.`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        description: '',
        manager: '',
        managerEmail: '',
        totalEmployees: 0,
        color: '#3B82F6',
        icon: '🏢',
        clientId
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose} />
        
        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {mode === 'edit' ? 'Edit Department' : 'Create New Department'}
              </h3>
              <p className="text-sm text-gray-500">
                {mode === 'edit' 
                  ? `Update department details for ${clientName}` 
                  : `Add a new department to ${clientName}`
                }
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`pl-10 block w-full border rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Engineering, Marketing, Sales"
                    disabled={loading}
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Brief description of the department's role and responsibilities"
                  disabled={loading}
                />
              </div>

              {/* Manager Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="manager" className="block text-sm font-medium text-gray-700 mb-2">
                    Manager
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="manager"
                      name="manager"
                      value={formData.manager}
                      onChange={handleInputChange}
                      className="pl-10 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Manager's full name"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="managerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Manager Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="managerEmail"
                      name="managerEmail"
                      value={formData.managerEmail}
                      onChange={handleInputChange}
                      className={`pl-10 block w-full border rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 ${
                        errors.managerEmail ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="manager@company.com"
                      disabled={loading}
                    />
                  </div>
                  {errors.managerEmail && <p className="mt-1 text-sm text-red-600">{errors.managerEmail}</p>}
                </div>
              </div>

              {/* Total Employees */}
              <div>
                <label htmlFor="totalEmployees" className="block text-sm font-medium text-gray-700 mb-2">
                  Total Employees
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="totalEmployees"
                    name="totalEmployees"
                    value={formData.totalEmployees}
                    onChange={handleInputChange}
                    min="0"
                    className={`pl-10 block w-full border rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.totalEmployees ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    disabled={loading}
                  />
                </div>
                {errors.totalEmployees && <p className="mt-1 text-sm text-red-600">{errors.totalEmployees}</p>}
              </div>

              {/* Color and Icon */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department Color
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${color.class} ${
                          formData.color === color.value 
                            ? 'border-gray-900 scale-110' 
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                        disabled={loading}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department Icon
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon }))}
                        className={`w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center text-lg ${
                          formData.icon === icon 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                        disabled={loading}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                <div className="flex items-center">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl mr-3"
                    style={{ backgroundColor: formData.color }}
                  >
                    {formData.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{formData.name || 'Department Name'}</h3>
                    <p className="text-sm text-gray-500">{formData.manager || 'Manager Name'}</p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-purple-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {mode === 'edit' ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  mode === 'edit' ? 'Update Department' : 'Create Department'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DepartmentForm;

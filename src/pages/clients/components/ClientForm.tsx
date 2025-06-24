import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { clientApi } from '../../../services/api';
import { Client } from '../data/clientService';

interface ClientFormProps {
  client?: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  mode: 'add' | 'edit';
}

interface ClientFormData {
  name: string;
  industry: string;
  size: string;
  location: string;
  website: string;
  email: string;
  phone: string;
  status: string;
  employees: number;
  description: string;
}

interface FormErrors {
  name?: string;
  industry?: string;
  size?: string;
  location?: string;
  website?: string;
  email?: string;
  phone?: string;
  status?: string;
  employees?: string;
  description?: string;
}

const ClientForm: React.FC<ClientFormProps> = ({
  client,
  isOpen,
  onClose,
  onSave,
  mode
}) => {  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    industry: '',
    size: 'Small (1-50 employees)',
    location: '',
    website: '',
    email: '',
    phone: '',
    status: 'active',
    employees: 0,
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  useEffect(() => {
    if (client && mode === 'edit') {
      setFormData({
        name: client.name || '',
        industry: client.industry || '',
        size: client.size || 'Small (1-50 employees)',
        location: client.location || '',
        website: client.website || '',
        email: client.email || '',
        phone: client.phone || '',
        status: client.status || 'active',
        employees: client.employees || 0,
        description: client.description || ''
      });
    } else {
      // Reset form for add mode
      setFormData({
        name: '',
        industry: '',
        size: 'Small (1-50 employees)',
        location: '',
        website: '',
        email: '',
        phone: '',
        status: 'active',
        employees: 0,
        description: ''
      });
    }
    setErrors({});
  }, [client, mode, isOpen]);  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.industry.trim()) newErrors.industry = 'Industry is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    if (formData.employees < 0) newErrors.employees = 'Employees must be 0 or greater';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      let savedClient: Client;
      
      if (mode === 'edit' && client) {
        savedClient = await clientApi.update(client.id, formData);
      } else {
        savedClient = await clientApi.create(formData);
      }
      
      onSave(savedClient);
      onClose();
    } catch (error: any) {
      console.error('Error saving client:', error);
      // Handle API errors
      if (error.response?.data?.message) {
        if (error.response.data.message.includes('name already exists')) {
          setErrors({ name: 'A client with this name already exists' });
        } else if (error.response.data.message.includes('email already exists')) {
          setErrors({ email: 'A client with this email already exists' });
        } else {
          setErrors({ name: error.response.data.message });
        }
      }
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (field: keyof ClientFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'edit' ? 'Edit Client' : 'Add New Client'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter company name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry *
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.industry ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Technology, Healthcare"
              />
              {errors.industry && <p className="text-red-500 text-sm mt-1">{errors.industry}</p>}
            </div>

            {/* Company Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Size
              </label>
              <select
                value={formData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="Small (1-50 employees)">Small (1-50 employees)</option>
                <option value="Medium (51-200 employees)">Medium (51-200 employees)</option>
                <option value="Large (201-1000 employees)">Large (201-1000 employees)</option>
                <option value="Enterprise (1000+ employees)">Enterprise (1000+ employees)</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., San Francisco, CA"
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="contact@company.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.website ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://company.com"
              />
              {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>            {/* Employees */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Employees
              </label>
              <input
                type="number"
                min="0"
                value={formData.employees}
                onChange={(e) => handleInputChange('employees', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.employees ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.employees && <p className="text-red-500 text-sm mt-1">{errors.employees}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Brief description of the company..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {mode === 'edit' ? 'Update Client' : 'Create Client'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;

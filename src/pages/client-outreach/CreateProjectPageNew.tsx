import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Building, Target, Calendar, Plus, X } from 'lucide-react';
import { useCreateProject } from '../../hooks/useClientOutreach';
import { CreateProjectData } from '../../services/clientOutreachApiService';
import LoadingSpinner from '../../components/LoadingSpinner';

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const createProjectMutation = useCreateProject();

  const [formData, setFormData] = useState<CreateProjectData>({
    name: '',
    description: '',
    status: 'active',
    targetCriteria: {
      industries: [],
      locations: [],
      companySize: [],
      technologies: [],
      keywords: [],
    },
    goals: {
      targetProspects: undefined,
      targetRevenue: undefined,
      timeline: '',
      notes: '',
    },
    color: '#6366f1',
    tags: '',
  });

  const [industryInput, setIndustryInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [companySizeInput, setCompanySizeInput] = useState('');
  const [technologyInput, setTechnologyInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CreateProjectData] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const addToArray = (field: string, value: string, inputSetter: (value: string) => void) => {
    if (value.trim()) {
      const [parent, child] = field.split('.');
      const currentArray = (formData[parent as keyof CreateProjectData] as any)?.[child] || [];
      
      if (!currentArray.includes(value.trim())) {
        handleInputChange(field, [...currentArray, value.trim()]);
      }
      inputSetter('');
    }
  };

  const removeFromArray = (field: string, index: number) => {
    const [parent, child] = field.split('.');
    const currentArray = (formData[parent as keyof CreateProjectData] as any)?.[child] || [];
    const newArray = currentArray.filter((_: any, i: number) => i !== index);
    handleInputChange(field, newArray);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a project name');
      return;
    }

    try {
      const project = await createProjectMutation.mutateAsync(formData);
      navigate(`/dashboard/client-outreach/projects/${project.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error creating project. Please try again.');
    }
  };

  if (createProjectMutation.isPending) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard/client-outreach/projects"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Projects
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
          <p className="text-gray-600 mt-2">
            Set up a new client outreach project to organize your prospecting efforts.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Building className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Enterprise SaaS Outreach Q4 2025"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the project objectives and scope..."
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Q4, Enterprise, SaaS"
                />
              </div>
            </div>
          </div>

          {/* Target Criteria */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Target className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Target Criteria</h2>
            </div>

            <div className="space-y-6">
              {/* Industries */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Industries
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={industryInput}
                    onChange={(e) => setIndustryInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Technology, Healthcare, Finance"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('targetCriteria.industries', industryInput, setIndustryInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('targetCriteria.industries', industryInput, setIndustryInput)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.targetCriteria?.industries?.map((industry, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                    >
                      {industry}
                      <button
                        type="button"
                        onClick={() => removeFromArray('targetCriteria.industries', index)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Locations
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., United States, Canada, Europe"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('targetCriteria.locations', locationInput, setLocationInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('targetCriteria.locations', locationInput, setLocationInput)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.targetCriteria?.locations?.map((location, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-sm rounded"
                    >
                      {location}
                      <button
                        type="button"
                        onClick={() => removeFromArray('targetCriteria.locations', index)}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Company Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Size Ranges
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={companySizeInput}
                    onChange={(e) => setCompanySizeInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 51-200, 201-500, 500+"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('targetCriteria.companySize', companySizeInput, setCompanySizeInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('targetCriteria.companySize', companySizeInput, setCompanySizeInput)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.targetCriteria?.companySize?.map((size, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded"
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => removeFromArray('targetCriteria.companySize', index)}
                        className="ml-1 text-purple-600 hover:text-purple-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Calendar className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Project Goals</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="targetProspects" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Prospects
                </label>
                <input
                  type="number"
                  id="targetProspects"
                  value={formData.goals?.targetProspects || ''}
                  onChange={(e) => handleInputChange('goals.targetProspects', parseInt(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 100"
                />
              </div>

              <div>
                <label htmlFor="targetRevenue" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Revenue ($)
                </label>
                <input
                  type="number"
                  id="targetRevenue"
                  value={formData.goals?.targetRevenue || ''}
                  onChange={(e) => handleInputChange('goals.targetRevenue', parseInt(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 500000"
                />
              </div>

              <div>
                <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
                  Timeline
                </label>
                <input
                  type="text"
                  id="timeline"
                  value={formData.goals?.timeline || ''}
                  onChange={(e) => handleInputChange('goals.timeline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Q4 2025, 3 months"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={formData.goals?.notes || ''}
                  onChange={(e) => handleInputChange('goals.notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional goals and notes..."
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              to="/dashboard/client-outreach/projects"
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createProjectMutation.isPending || !formData.name.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectPage;

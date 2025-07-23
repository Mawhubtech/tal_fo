import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Building, Target, Calendar, Users, DollarSign } from 'lucide-react';
import { useCreateClientOutreachProject } from '../../hooks/useClientOutreachProjects';
import { CreateClientOutreachProjectData } from '../../services/clientOutreachProjectApiService';
import LoadingSpinner from '../../components/LoadingSpinner';

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const createProjectMutation = useCreateClientOutreachProject();

  const [formData, setFormData] = useState<CreateClientOutreachProjectData>({
    name: '',
    description: '',
    status: 'active',
    priority: 'medium',
    visibility: 'team',
    clientType: 'mid-market',
    objectives: {
      targetClients: undefined,
      targetMeetings: undefined,
      deadline: '',
      revenue: {
        target: undefined,
        currency: 'USD',
      },
      industries: [],
      companySize: [],
      location: [],
      serviceOfferings: [],
    },
    targets: {
      totalProspects: undefined,
      totalSearches: undefined,
      avgProspectsPerSearch: undefined,
      expectedResponseRate: undefined,
      expectedConversionRate: undefined,
      expectedRevenue: undefined,
    },
    startDate: '',
    targetCompletionDate: '',
    tags: [],
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [tagInput, setTagInput] = useState('');
  const [industryInput, setIndustryInput] = useState('');
  const [companySizeInput, setCompanySizeInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [serviceInput, setServiceInput] = useState('');

  const totalSteps = 4;

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CreateClientOutreachProjectData] as any),
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
      const currentArray = field.includes('.') 
        ? (formData as any)[field.split('.')[0]][field.split('.')[1]] || []
        : (formData as any)[field] || [];
      
      if (!currentArray.includes(value.trim())) {
        handleInputChange(field, [...currentArray, value.trim()]);
      }
      inputSetter('');
    }
  };

  const removeFromArray = (field: string, valueToRemove: string) => {
    const currentArray = field.includes('.') 
      ? (formData as any)[field.split('.')[0]][field.split('.')[1]] || []
      : (formData as any)[field] || [];
    
    handleInputChange(field, currentArray.filter((item: string) => item !== valueToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    
    try {
      const project = await createProjectMutation.mutateAsync(formData);
      console.log('Project created successfully:', project);
      navigate(`/dashboard/client-outreach/projects/${project.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter project name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Describe your client outreach project"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client Type
                    </label>
                    <select
                      value={formData.clientType}
                      onChange={(e) => handleInputChange('clientType', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="enterprise">Enterprise</option>
                      <option value="mid-market">Mid-Market</option>
                      <option value="smb">SMB</option>
                      <option value="startup">Startup</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visibility
                  </label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => handleInputChange('visibility', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="private">Private</option>
                    <option value="team">Team</option>
                    <option value="public">Public</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Objectives</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Clients
                    </label>
                    <input
                      type="number"
                      value={formData.objectives?.targetClients || ''}
                      onChange={(e) => handleInputChange('objectives.targetClients', parseInt(e.target.value) || undefined)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., 50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Meetings
                    </label>
                    <input
                      type="number"
                      value={formData.objectives?.targetMeetings || ''}
                      onChange={(e) => handleInputChange('objectives.targetMeetings', parseInt(e.target.value) || undefined)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., 20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Revenue
                    </label>
                    <input
                      type="number"
                      value={formData.objectives?.revenue?.target || ''}
                      onChange={(e) => handleInputChange('objectives.revenue.target', parseInt(e.target.value) || undefined)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., 100000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={formData.objectives?.deadline || ''}
                      onChange={(e) => handleInputChange('objectives.deadline', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

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
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('objectives.industries', industryInput, setIndustryInput))}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Add industry (press Enter)"
                    />
                    <button
                      type="button"
                      onClick={() => addToArray('objectives.industries', industryInput, setIndustryInput)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.objectives?.industries?.map((industry, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                        {industry}
                        <button
                          type="button"
                          onClick={() => removeFromArray('objectives.industries', industry)}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Company Sizes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Sizes
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={companySizeInput}
                      onChange={(e) => setCompanySizeInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('objectives.companySize', companySizeInput, setCompanySizeInput))}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., 10-50 employees (press Enter)"
                    />
                    <button
                      type="button"
                      onClick={() => addToArray('objectives.companySize', companySizeInput, setCompanySizeInput)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.objectives?.companySize?.map((size, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {size}
                        <button
                          type="button"
                          onClick={() => removeFromArray('objectives.companySize', size)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Targets</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Prospects Target
                    </label>
                    <input
                      type="number"
                      value={formData.targets?.totalProspects || ''}
                      onChange={(e) => handleInputChange('targets.totalProspects', parseInt(e.target.value) || undefined)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., 500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Searches Target
                    </label>
                    <input
                      type="number"
                      value={formData.targets?.totalSearches || ''}
                      onChange={(e) => handleInputChange('targets.totalSearches', parseInt(e.target.value) || undefined)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., 10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Response Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.targets?.expectedResponseRate ? formData.targets.expectedResponseRate * 100 : ''}
                      onChange={(e) => handleInputChange('targets.expectedResponseRate', parseFloat(e.target.value) / 100 || undefined)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., 25"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Conversion Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.targets?.expectedConversionRate ? formData.targets.expectedConversionRate * 100 : ''}
                      onChange={(e) => handleInputChange('targets.expectedConversionRate', parseFloat(e.target.value) / 100 || undefined)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., 10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Revenue
                  </label>
                  <input
                    type="number"
                    value={formData.targets?.expectedRevenue || ''}
                    onChange={(e) => handleInputChange('targets.expectedRevenue', parseInt(e.target.value) || undefined)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 250000"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline & Tags</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Completion Date
                    </label>
                    <input
                      type="date"
                      value={formData.targetCompletionDate}
                      onChange={(e) => handleInputChange('targetCompletionDate', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('tags', tagInput, setTagInput))}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Add tag (press Enter)"
                    />
                    <button
                      type="button"
                      onClick={() => addToArray('tags', tagInput, setTagInput)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags?.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeFromArray('tags', tag)}
                          className="ml-2 text-gray-600 hover:text-gray-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (createProjectMutation.isPending) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Link
          to="/dashboard/client-outreach/projects"
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Client Outreach Project</h1>
          <p className="text-gray-600">Set up a new business development project</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex space-x-3">
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={!formData.name || createProjectMutation.isPending}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Project
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProjectPage;

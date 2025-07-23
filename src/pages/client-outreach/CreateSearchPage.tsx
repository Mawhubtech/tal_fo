import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, Building, MapPin, DollarSign, Users } from 'lucide-react';
import { useCreateClientOutreachSearch } from '../../hooks/useClientOutreachSearches';
import { CreateClientOutreachSearchData } from '../../services/clientOutreachProjectApiService';
import LoadingSpinner from '../../components/LoadingSpinner';

const CreateSearchPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const createSearchMutation = useCreateClientOutreachSearch();

  const [formData, setFormData] = useState<CreateClientOutreachSearchData>({
    projectId: projectId!,
    name: '',
    description: '',
    searchCriteria: {
      industries: [],
      companySize: [],
      location: [],
      revenue: {
        min: undefined,
        max: undefined,
        currency: 'USD'
      },
      employees: {
        min: undefined,
        max: undefined
      },
      keywords: [],
      technologies: [],
      fundingStage: [],
      excludeCompanies: []
    },
    automationSettings: {
      autoRun: false,
      frequency: 'weekly',
      maxResults: 50,
      qualityThreshold: 7.0
    }
  });

  const [industryInput, setIndustryInput] = useState('');
  const [companySizeInput, setCompanySizeInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [technologyInput, setTechnologyInput] = useState('');
  const [excludeCompanyInput, setExcludeCompanyInput] = useState('');

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (parent === 'searchCriteria') {
        setFormData(prev => ({
          ...prev,
          searchCriteria: {
            ...prev.searchCriteria,
            [child]: value
          }
        }));
      } else if (parent === 'automationSettings') {
        setFormData(prev => ({
          ...prev,
          automationSettings: {
            ...prev.automationSettings,
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleArrayAdd = (field: string, value: string, inputSetter: React.Dispatch<React.SetStateAction<string>>) => {
    if (value.trim()) {
      const fieldPath = field.split('.');
      if (fieldPath.length === 2) {
        const [parent, child] = fieldPath;
        setFormData(prev => ({
          ...prev,
          searchCriteria: {
            ...prev.searchCriteria,
            [child]: [...(prev.searchCriteria as any)[child], value.trim()]
          }
        }));
      }
      inputSetter('');
    }
  };

  const handleArrayRemove = (field: string, valueToRemove: string) => {
    const fieldPath = field.split('.');
    if (fieldPath.length === 2) {
      const [parent, child] = fieldPath;
      setFormData(prev => ({
        ...prev,
        searchCriteria: {
          ...prev.searchCriteria,
          [child]: (prev.searchCriteria as any)[child].filter((item: string) => item !== valueToRemove)
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const search = await createSearchMutation.mutateAsync(formData);
      navigate(`/dashboard/client-outreach/projects/${projectId}/searches`);
    } catch (error) {
      console.error('Failed to create search:', error);
    }
  };

  if (createSearchMutation.isPending) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Link
          to={`/dashboard/client-outreach/projects/${projectId}/searches`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Searches
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Search</h1>
          <p className="text-gray-600">Set up search criteria to find potential prospects</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Tech Companies 500+ Employees"
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
                  placeholder="Describe the purpose and target of this search..."
                />
              </div>
            </div>
          </div>

          {/* Search Criteria */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Criteria</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Industries */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="w-4 h-4 inline mr-1" />
                  Industries
                </label>
                <div className="flex mb-2">
                  <input
                    type="text"
                    value={industryInput}
                    onChange={(e) => setIndustryInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleArrayAdd('searchCriteria.industries', industryInput, setIndustryInput))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Technology, Healthcare"
                  />
                  <button
                    type="button"
                    onClick={() => handleArrayAdd('searchCriteria.industries', industryInput, setIndustryInput)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.searchCriteria.industries?.map((industry, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                    >
                      {industry}
                      <button
                        type="button"
                        onClick={() => handleArrayRemove('searchCriteria.industries', industry)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Company Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Company Size
                </label>
                <div className="flex mb-2">
                  <input
                    type="text"
                    value={companySizeInput}
                    onChange={(e) => setCompanySizeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleArrayAdd('searchCriteria.companySize', companySizeInput, setCompanySizeInput))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 1-50, 51-200, 500+"
                  />
                  <button
                    type="button"
                    onClick={() => handleArrayAdd('searchCriteria.companySize', companySizeInput, setCompanySizeInput)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.searchCriteria.companySize?.map((size, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => handleArrayRemove('searchCriteria.companySize', size)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <div className="flex mb-2">
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleArrayAdd('searchCriteria.location', locationInput, setLocationInput))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., United States, California"
                  />
                  <button
                    type="button"
                    onClick={() => handleArrayAdd('searchCriteria.location', locationInput, setLocationInput)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.searchCriteria.location?.map((location, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                    >
                      {location}
                      <button
                        type="button"
                        onClick={() => handleArrayRemove('searchCriteria.location', location)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Search className="w-4 h-4 inline mr-1" />
                  Keywords
                </label>
                <div className="flex mb-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleArrayAdd('searchCriteria.keywords', keywordInput, setKeywordInput))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., SaaS, AI, Machine Learning"
                  />
                  <button
                    type="button"
                    onClick={() => handleArrayAdd('searchCriteria.keywords', keywordInput, setKeywordInput)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.searchCriteria.keywords?.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => handleArrayRemove('searchCriteria.keywords', keyword)}
                        className="ml-2 text-yellow-600 hover:text-yellow-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue Range */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Revenue Range (Annual)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <input
                    type="number"
                    value={formData.searchCriteria.revenue?.min || ''}
                    onChange={(e) => handleInputChange('searchCriteria.revenue.min', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Minimum revenue"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={formData.searchCriteria.revenue?.max || ''}
                    onChange={(e) => handleInputChange('searchCriteria.revenue.max', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Maximum revenue"
                  />
                </div>
                <div>
                  <select
                    value={formData.searchCriteria.revenue?.currency || 'USD'}
                    onChange={(e) => handleInputChange('searchCriteria.revenue.currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Employee Range */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Employee Count Range
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    value={formData.searchCriteria.employees?.min || ''}
                    onChange={(e) => handleInputChange('searchCriteria.employees.min', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Minimum employees"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={formData.searchCriteria.employees?.max || ''}
                    onChange={(e) => handleInputChange('searchCriteria.employees.max', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Maximum employees"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Automation Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Automation Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoRun"
                  checked={formData.automationSettings?.autoRun || false}
                  onChange={(e) => handleInputChange('automationSettings.autoRun', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="autoRun" className="ml-2 block text-sm text-gray-900">
                  Enable automatic search execution
                </label>
              </div>

              {formData.automationSettings?.autoRun && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      value={formData.automationSettings?.frequency || 'weekly'}
                      onChange={(e) => handleInputChange('automationSettings.frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Results
                    </label>
                    <input
                      type="number"
                      value={formData.automationSettings?.maxResults || 50}
                      onChange={(e) => handleInputChange('automationSettings.maxResults', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quality Threshold (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      value={formData.automationSettings?.qualityThreshold || 7.0}
                      onChange={(e) => handleInputChange('automationSettings.qualityThreshold', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="7.0"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Link
              to={`/dashboard/client-outreach/projects/${projectId}/searches`}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!formData.name || createSearchMutation.isPending}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createSearchMutation.isPending ? 'Creating...' : 'Create Search'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateSearchPage;

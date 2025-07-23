import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, Building, MapPin, Users, Plus, X } from 'lucide-react';
import { useSearchCompanies, useProjects } from '../../hooks/useClientOutreach';
import { SearchCompaniesData } from '../../services/clientOutreachApiService';
import LoadingSpinner from '../../components/LoadingSpinner';

const CreateSearchPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: projects = [] } = useProjects();
  const searchCompaniesMutation = useSearchCompanies();

  const project = projects.find(p => p.id.toString() === projectId);

  const [formData, setFormData] = useState<SearchCompaniesData>({
    searchName: '',
    searchText: '',
    projectId: projectId,
    searchType: 'ai',
    filters: {
      industries: [],
      locations: [],
      companySize: [],
      technologies: [],
      keywords: [],
    },
  });

  const [industryInput, setIndustryInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [companySizeInput, setCompanySizeInput] = useState('');
  const [technologyInput, setTechnologyInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');

  const addToArray = (field: string, value: string, inputSetter: (value: string) => void) => {
    if (value.trim()) {
      const currentArray = formData.filters[field as keyof typeof formData.filters] || [];
      
      if (!currentArray.includes(value.trim())) {
        setFormData(prev => ({
          ...prev,
          filters: {
            ...prev.filters,
            [field]: [...currentArray, value.trim()],
          },
        }));
      }
      inputSetter('');
    }
  };

  const removeFromArray = (field: string, index: number) => {
    const currentArray = formData.filters[field as keyof typeof formData.filters] || [];
    const newArray = currentArray.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [field]: newArray,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.searchName.trim()) {
      alert('Please enter a search name');
      return;
    }

    try {
      const result = await searchCompaniesMutation.mutateAsync({
        data: formData,
        pagination: { page: 1, limit: 50 }
      });
      
      // Navigate to the search results
      navigate(`/dashboard/client-outreach/searches/${result.search.id}/results`);
    } catch (error) {
      console.error('Error creating search:', error);
      alert('Error creating search. Please try again.');
    }
  };

  if (searchCompaniesMutation.isPending) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/dashboard/client-outreach/projects/${projectId}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Project
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Search</h1>
          <p className="text-gray-600 mt-2">
            Search for companies that match your criteria and add them to{' '}
            <span className="font-medium">{project?.name || 'this project'}</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Search className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Search Details</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="searchName" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Name *
                </label>
                <input
                  type="text"
                  id="searchName"
                  value={formData.searchName}
                  onChange={(e) => setFormData(prev => ({ ...prev, searchName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Healthcare SaaS Companies in CA"
                  required
                />
              </div>

              <div>
                <label htmlFor="searchText" className="block text-sm font-medium text-gray-700 mb-2">
                  Natural Language Search
                </label>
                <textarea
                  id="searchText"
                  value={formData.searchText || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, searchText: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe what you're looking for: 'Find healthcare technology companies in California with 50-200 employees that focus on EMR software'"
                />
              </div>

              <div>
                <label htmlFor="searchType" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Type
                </label>
                <select
                  id="searchType"
                  value={formData.searchType}
                  onChange={(e) => setFormData(prev => ({ ...prev, searchType: e.target.value as 'ai' | 'manual' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ai">AI-Powered Search</option>
                  <option value="manual">Manual Filter Search</option>
                </select>
              </div>
            </div>
          </div>

          {/* Search Filters */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Building className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Search Filters</h2>
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
                        addToArray('industries', industryInput, setIndustryInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('industries', industryInput, setIndustryInput)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.filters.industries?.map((industry, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                    >
                      {industry}
                      <button
                        type="button"
                        onClick={() => removeFromArray('industries', index)}
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
                  Locations
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., United States, California, New York"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('locations', locationInput, setLocationInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('locations', locationInput, setLocationInput)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.filters.locations?.map((location, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-sm rounded"
                    >
                      {location}
                      <button
                        type="button"
                        onClick={() => removeFromArray('locations', index)}
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
                  Company Size
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
                        addToArray('companySize', companySizeInput, setCompanySizeInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('companySize', companySizeInput, setCompanySizeInput)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.filters.companySize?.map((size, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded"
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => removeFromArray('companySize', index)}
                        className="ml-1 text-purple-600 hover:text-purple-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., machine learning, CRM, automation"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('keywords', keywordInput, setKeywordInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('keywords', keywordInput, setKeywordInput)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.filters.keywords?.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-sm rounded"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeFromArray('keywords', index)}
                        className="ml-1 text-orange-600 hover:text-orange-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              to={`/dashboard/client-outreach/projects/${projectId}`}
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={searchCompaniesMutation.isPending || !formData.searchName.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searchCompaniesMutation.isPending ? 'Searching...' : 'Run Search'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSearchPage;

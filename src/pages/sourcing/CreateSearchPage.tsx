import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Sparkles, FileText, Filter } from 'lucide-react';
import Button from '../../components/Button';
import { useProject } from '../../hooks/useSourcingProjects';
import { useCreateSearch } from '../../hooks/useSourcingSearches';
import { useToast } from '../../contexts/ToastContext';

interface SearchFilters {
  skills?: string[];
  experience?: {
    min?: number;
    max?: number;
  };
  locations?: string[];
  companies?: string[];
  industries?: string[];
  education?: string[];
  salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  remote?: boolean;
  excludeCompanies?: string[];
  excludeKeywords?: string[];
}

const CreateSearchPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [searchData, setSearchData] = useState({
    name: '',
    description: '',
    searchType: 'boolean' as 'boolean' | 'semantic' | 'ai_assisted',
    query: '',
    filters: {} as SearchFilters,
  });

  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  const { data: project, isLoading: projectLoading } = useProject(projectId!);
  const createSearchMutation = useCreateSearch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectId) {
      addToast({
        type: 'error',
        title: 'Project ID is required',
      });
      return;
    }

    try {
      await createSearchMutation.mutateAsync({
        ...searchData,
        searchType: searchData.searchType === 'semantic' ? 'natural_language' : searchData.searchType as any,
        projectId,
      });

      addToast({
        type: 'success',
        title: 'Search created successfully!',
      });
      navigate(`/sourcing/projects/${projectId}`);
    } catch (error) {
      console.error('Failed to create search:', error);
      addToast({
        type: 'error',
        title: 'Failed to create search',
      });
    }
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setSearchData(prev => ({
      ...prev,
      filters: newFilters,
    }));
  };

  if (projectLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/sourcing/projects/${projectId}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Project
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Search</h1>
          {project && (
            <p className="text-gray-600">
              for project: <span className="font-medium">{project.name}</span>
            </p>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Search Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={searchData.name}
                  onChange={(e) => setSearchData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Senior Software Engineers - Bay Area"
                />
              </div>

              <div>
                <label htmlFor="searchType" className="block text-sm font-medium text-gray-700">
                  Search Type
                </label>
                <select
                  id="searchType"
                  value={searchData.searchType}
                  onChange={(e) => setSearchData(prev => ({ ...prev, searchType: e.target.value as any }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="boolean">Boolean Search</option>
                  <option value="semantic">Semantic Search</option>
                  <option value="ai_assisted">AI-Assisted Search</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={searchData.description}
                onChange={(e) => setSearchData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what you're looking for..."
              />
            </div>

            {/* Search Query */}
            <div>
              <label htmlFor="query" className="block text-sm font-medium text-gray-700">
                Search Query *
              </label>
              <div className="mt-1 relative">
                <textarea
                  id="query"
                  required
                  rows={4}
                  value={searchData.query}
                  onChange={(e) => setSearchData(prev => ({ ...prev, query: e.target.value }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    searchData.searchType === 'boolean'
                      ? '(Software Engineer OR Developer) AND (Python OR JavaScript) AND "San Francisco"'
                      : searchData.searchType === 'semantic'
                      ? 'Find experienced software engineers who work with Python and JavaScript in the San Francisco Bay Area'
                      : 'I need talented software engineers with strong Python and JavaScript skills for our tech startup in San Francisco'
                  }
                />
                <div className="absolute bottom-2 right-2">
                  {searchData.searchType === 'ai_assisted' && (
                    <Sparkles className="w-5 h-5 text-purple-500" />
                  )}
                  {searchData.searchType === 'semantic' && (
                    <Search className="w-5 h-5 text-blue-500" />
                  )}
                  {searchData.searchType === 'boolean' && (
                    <FileText className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Search Filters</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                {isAdvancedMode ? 'Hide' : 'Show'} Advanced Filters
              </Button>
            </div>

            {/* Advanced Filters Section */}
            {isAdvancedMode && (
              <div className="border-t pt-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Skills */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Required Skills
                    </label>
                    <input
                      type="text"
                      placeholder="React, Node.js, Python..."
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => {
                        const skills = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        handleFiltersChange({ ...searchData.filters, skills });
                      }}
                    />
                  </div>

                  {/* Experience Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Experience Range (years)
                    </label>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        min="0"
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => {
                          const min = e.target.value ? parseInt(e.target.value) : undefined;
                          handleFiltersChange({
                            ...searchData.filters,
                            experience: { ...searchData.filters.experience, min }
                          });
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        min="0"
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => {
                          const max = e.target.value ? parseInt(e.target.value) : undefined;
                          handleFiltersChange({
                            ...searchData.filters,
                            experience: { ...searchData.filters.experience, max }
                          });
                        }}
                      />
                    </div>
                  </div>

                  {/* Locations */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Locations
                    </label>
                    <input
                      type="text"
                      placeholder="San Francisco, New York, Remote..."
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => {
                        const locations = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        handleFiltersChange({ ...searchData.filters, locations });
                      }}
                    />
                  </div>

                  {/* Remote Work */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remote"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      onChange={(e) => {
                        handleFiltersChange({ ...searchData.filters, remote: e.target.checked });
                      }}
                    />
                    <label htmlFor="remote" className="ml-2 block text-sm text-gray-900">
                      Open to remote work
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/sourcing/projects/${projectId}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createSearchMutation.isPending}
            className="flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            {createSearchMutation.isPending ? 'Creating...' : 'Create Search'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateSearchPage;

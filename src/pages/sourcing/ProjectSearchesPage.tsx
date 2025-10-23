import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search as SearchIcon, History, Calendar, User, Eye, Filter } from 'lucide-react';
import { useProject } from '../../hooks/useSourcingProjects';
import { useProjectSearches } from '../../hooks/useSourcingSearches';
import { Search } from '../../sourcing';
import type { SearchRef } from '../../sourcing';

// SearchHistoryTab Component
interface SearchHistoryTabProps {
  projectSearches: any[];
  isLoading: boolean;
  projectId: string;
  onRerunSearch?: (search: any) => void;
}

const SearchHistoryTab: React.FC<SearchHistoryTabProps> = ({ projectSearches, isLoading, projectId, onRerunSearch }) => {
  const [searchFilter, setSearchFilter] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSearchTypeIcon = (searchType: string) => {
    switch (searchType?.toLowerCase()) {
      case 'ai_assisted':
        return <SearchIcon className="w-4 h-4" />;
      case 'boolean':
        return <Filter className="w-4 h-4" />;
      case 'natural_language':
        return <SearchIcon className="w-4 h-4" />;
      default:
        return <SearchIcon className="w-4 h-4" />;
    }
  };

  // Filter searches based on search term
  const filteredSearches = projectSearches.filter(search => {
    const matchesSearch = !searchFilter || 
      search.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      search.description?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      search.query?.toLowerCase().includes(searchFilter.toLowerCase());
    
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading search history...</p>
      </div>
    );
  }

  if (!projectSearches || projectSearches.length === 0) {
    return (
      <div className="p-12 text-center">
        <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No searches yet</h3>
        <p className="text-gray-600 mb-4">
          Your search history will appear here once you create and run searches.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, description, or query..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
          />
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredSearches.length} of {projectSearches.length} searches
      </div>

      {/* Search List */}
      <div className="space-y-4">
        {filteredSearches.length === 0 ? (
          <div className="text-center py-8">
            <SearchIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No searches match your search criteria</p>
          </div>
        ) : (
          filteredSearches.map((search) => (
            <div 
              key={search.id} 
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {getSearchTypeIcon(search.searchType)}
                      <h3 className="font-medium text-gray-900">{search.name}</h3>
                    </div>
                    {search.searchType && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {search.searchType.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{search.description}</p>
                  
                  {search.query && (
                    <div className="bg-gray-50 rounded p-2 mb-2">
                      <p className="text-xs text-gray-500 mb-1">Search Query:</p>
                      <p className="text-sm text-gray-700 font-mono">{search.query}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Created: {formatDate(search.createdAt)}
                    </div>
                    {search.executedAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Executed: {formatDate(search.executedAt)}
                      </div>
                    )}
                    {search.createdBy && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        By: {search.createdBy.fullName || search.createdBy.email}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {search.status === 'completed' && (
                    <Link
                      to={`/sourcing/projects/${projectId}/search-results`}
                      state={{
                        query: search.query,
                        filters: search.filters,
                        searchId: search.id
                      }}
                      className="inline-flex items-center px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Results
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      if (onRerunSearch) {
                        onRerunSearch(search);
                      }
                    }}
                    className="inline-flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    title="Rerun this search"
                  >
                    <SearchIcon className="w-3 h-3 mr-1" />
                    Rerun
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ProjectSearchesPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading, error } = useProject(projectId!);
  const { data: projectSearches, isLoading: searchesLoading } = useProjectSearches(projectId!);
  const [activeTab, setActiveTab] = useState<'search' | 'history'>('search');
  const searchRef = useRef<SearchRef>(null);

  const handleNewSearch = () => {
    setActiveTab('search'); // Switch to search tab
    // Clear the search data using the ref
    if (searchRef.current) {
      searchRef.current.clearSearch();
    }
  };

  const handleRerunSearch = (search: any) => {
    // Navigate to search results directly with the search data
    navigate(`/sourcing/projects/${projectId}/search-results`, {
      state: {
        query: search.query,
        filters: search.filters,
        searchId: search.id
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
          <Link
            to="/sourcing/projects"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to={`/sourcing/projects/${project.id}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Project
          </Link>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name} - Searches</h1>
            <p className="text-gray-600 mt-1">Create new searches and view search history</p>
          </div>
          
          <button
            onClick={handleNewSearch}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Search
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('search')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'search'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <SearchIcon className="w-4 h-4" />
                Search
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Search History
                {projectSearches && projectSearches.length > 0 && (
                  <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {projectSearches.length}
                  </span>
                )}
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === 'search' ? (
          <Search ref={searchRef} />
        ) : (
          <SearchHistoryTab 
            projectSearches={projectSearches || []} 
            isLoading={searchesLoading}
            projectId={projectId!}
            onRerunSearch={handleRerunSearch}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectSearchesPage;

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Calendar, BarChart3 } from 'lucide-react';
import { useProjects, useProjectSearches } from '../../hooks/useClientOutreach';
import LoadingSpinner from '../../components/LoadingSpinner';

const ProjectSearchesPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { data: projects = [] } = useProjects();
  const { data: searches = [], isLoading } = useProjectSearches(projectId!);
  
  const project = projects.find(p => p.id.toString() === projectId);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
          <Link
            to="/dashboard/client-outreach/projects"
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/dashboard/client-outreach/projects/${projectId}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Project
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Searches</h1>
              <p className="text-gray-600 mt-2">
                Manage searches for <span className="font-medium">{project.name}</span>
              </p>
            </div>
            
            <Link
              to={`/dashboard/client-outreach/projects/${projectId}/search`}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Search
            </Link>
          </div>
        </div>

        {searches.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8">
            <div className="text-center">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No searches yet</h3>
              <p className="text-gray-600 mb-6">
                Start by creating your first search to find potential prospects for this project.
              </p>
              <Link
                to={`/dashboard/client-outreach/projects/${projectId}/search`}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Search
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-3">Search Name</div>
                <div className="col-span-2">Filters</div>
                <div className="col-span-2">Results</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2">Created</div>
                <div className="col-span-2">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {searches.map((search) => (
                <div key={search.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    
                    {/* Search Name & Query */}
                    <div className="col-span-3">
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        {search.name}
                      </h3>
                      {search.originalQuery && (
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {search.originalQuery}
                        </p>
                      )}
                      <div className="flex items-center mt-1">
                        <BarChart3 className="w-3 h-3 mr-1 text-gray-400" />
                        <span className="text-xs text-gray-500">{search.searchType}</span>
                      </div>
                    </div>

                    {/* Filters */}
                    <div className="col-span-2">
                      {search.filters && (
                        <div className="flex flex-wrap gap-1">
                          {search.filters.industries?.slice(0, 1).map((industry: string, index: number) => (
                            <span key={index} className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                              {industry.length > 15 ? `${industry.substring(0, 15)}...` : industry}
                            </span>
                          ))}
                          {search.filters.locations?.slice(0, 1).map((location: string, index: number) => (
                            <span key={index} className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                              {location}
                            </span>
                          ))}
                          {((search.filters.industries?.length || 0) > 1 || 
                            (search.filters.locations?.length || 0) > 1 || 
                            (search.filters.technologies?.length || 0) > 0 ||
                            (search.filters.keywords?.length || 0) > 0) && (
                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{((search.filters.industries?.length || 0) - 1) + 
                                 ((search.filters.locations?.length || 0) - 1) +
                                 (search.filters.technologies?.length || 0) +
                                 (search.filters.keywords?.length || 0)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Results Summary */}
                    <div className="col-span-2">
                      {search.results ? (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {search.results.total || search.results.companiesFound || 0} companies
                          </div>
                          <div className="text-xs text-gray-500">
                            {search.prospectsCount || 0} prospects saved
                          </div>
                          <div className="text-xs text-gray-500">
                            {search.results.executionTime ? `${search.results.executionTime}ms` : 'N/A'} • {search.results.apiCost || 6} credits
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No results</span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="col-span-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        search.status === 'active' ? 'bg-green-100 text-green-800' :
                        search.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {search.status}
                      </span>
                    </div>

                    {/* Created Date */}
                    <div className="col-span-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(search.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(search.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/dashboard/client-outreach/projects/${projectId}/searches/${search.id}/results`}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          Results
                        </Link>
                        <Link
                          to={`/dashboard/client-outreach/projects/${projectId}/prospects`}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          Prospects
                        </Link>
                        <button
                          onClick={() => {
                            // TODO: Implement search duplication
                            console.log('Duplicate search:', search.id);
                          }}
                          className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                        >
                          Duplicate
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSearchesPage;

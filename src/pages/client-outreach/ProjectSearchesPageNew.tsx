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
            to="/client-outreach/projects"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
            to={`/client-outreach/projects/${projectId}`}
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
              to={`/client-outreach/projects/${projectId}/search/create`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                to={`/client-outreach/projects/${projectId}/search/create`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Search
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searches.map((search) => (
              <div key={search.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {search.name}
                    </h3>
                    {search.originalQuery && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {search.originalQuery}
                      </p>
                    )}
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    search.status === 'active' ? 'bg-green-100 text-green-800' :
                    search.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {search.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(search.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    {search.searchType}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Link
                    to={`/client-outreach/searches/${search.id}/results`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View Results
                  </Link>
                  <Link
                    to={`/client-outreach/searches/${search.id}/edit`}
                    className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSearchesPage;

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building, MapPin, Users, ExternalLink, Plus } from 'lucide-react';
import { useProjects, useProjectProspects } from '../../hooks/useClientOutreach';
import LoadingSpinner from '../../components/LoadingSpinner';

const ProjectProspectsPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { data: projects = [] } = useProjects();
  const { data: prospects = [], isLoading } = useProjectProspects(projectId!);
  
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
              <h1 className="text-3xl font-bold text-gray-900">Prospects</h1>
              <p className="text-gray-600 mt-2">
                Manage prospects for <span className="font-medium">{project.name}</span>
              </p>
            </div>
            
            <Link
              to={`/client-outreach/projects/${projectId}/search/create`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Find More Prospects
            </Link>
          </div>
        </div>

        {prospects.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8">
            <div className="text-center">
              <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No prospects yet</h3>
              <p className="text-gray-600 mb-6">
                Start by running a search to find potential prospects for this project.
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
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500">Total Prospects</h3>
                <p className="text-2xl font-bold text-gray-900">{prospects.length}</p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500">New</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {prospects.filter(p => p.status === 'new').length}
                </p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500">Contacted</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {prospects.filter(p => p.status === 'contacted').length}
                </p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500">Responded</h3>
                <p className="text-2xl font-bold text-green-600">
                  {prospects.filter(p => p.status === 'responded').length}
                </p>
              </div>
            </div>

            {/* Prospects List */}
            <div className="grid grid-cols-1 gap-6">
              {prospects.map((prospect) => (
                <div key={prospect.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {prospect.companyName}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          prospect.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          prospect.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                          prospect.status === 'responded' ? 'bg-green-100 text-green-800' :
                          prospect.status === 'meeting_scheduled' ? 'bg-purple-100 text-purple-800' :
                          prospect.status === 'qualified' ? 'bg-emerald-100 text-emerald-800' :
                          prospect.status === 'unqualified' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {prospect.status.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          prospect.priority === 1 ? 'bg-red-100 text-red-800' :
                          prospect.priority === 2 ? 'bg-orange-100 text-orange-800' :
                          prospect.priority === 3 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          Priority {prospect.priority}
                        </span>
                      </div>

                      {prospect.description && (
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {prospect.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                        {prospect.industry && (
                          <div className="flex items-center">
                            <Building className="w-4 h-4 mr-1" />
                            {prospect.industry}
                          </div>
                        )}
                        {prospect.location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {prospect.location}
                          </div>
                        )}
                        {prospect.employeeCount && (
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {prospect.employeeCount} employees
                          </div>
                        )}
                        {prospect.sizeRange && (
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {prospect.sizeRange}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {prospect.website && (
                          <a
                            href={prospect.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Website
                          </a>
                        )}
                        {prospect.linkedinUrl && (
                          <a
                            href={prospect.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            LinkedIn
                          </a>
                        )}
                      </div>

                      {prospect.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                          <p className="text-sm text-gray-600">{prospect.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {prospect.matchScore && (
                        <div className="text-right">
                          <span className="text-sm text-gray-500">Match Score</span>
                          <div className="text-lg font-semibold text-green-600">
                            {(prospect.matchScore * 100).toFixed(0)}%
                          </div>
                        </div>
                      )}
                      
                      <div className="text-right text-sm text-gray-500">
                        Added {new Date(prospect.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectProspectsPage;

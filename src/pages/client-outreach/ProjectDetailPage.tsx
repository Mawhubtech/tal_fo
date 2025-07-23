import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Building, 
  Target, 
  Calendar,
  Search,
  BarChart3,
  Settings,
  Users,
  DollarSign,
  Mail
} from 'lucide-react';
import { useProjects } from '../../hooks/useClientOutreach';
import LoadingSpinner from '../../components/LoadingSpinner';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: projects = [], isLoading } = useProjects();
  
  const project = projects.find(p => p.id.toString() === id);

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
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard/client-outreach/projects"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Projects
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </div>
              {project.description && (
                <p className="text-gray-600">{project.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                {project.updatedAt !== project.createdAt && (
                  <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                to={`/dashboard/client-outreach/projects/${id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Project
              </Link>
              <Link
                to={`/dashboard/client-outreach/projects/${id}/settings`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to={`/dashboard/client-outreach/projects/${id}/searches`}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Search className="w-6 h-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Search</h3>
                    <p className="text-sm text-gray-500">View search history & create new searches</p>
                  </div>
                </Link>
                
                <Link
                  to={`/dashboard/client-outreach/projects/${id}/prospects`}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Users className="w-6 h-6 text-green-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Prospects</h3>
                    <p className="text-sm text-gray-500">Manage all prospects</p>
                  </div>
                </Link>
                
                <Link
                  to={`/dashboard/client-outreach/projects/${id}/sequences`}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Mail className="w-6 h-6 text-purple-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Sequences</h3>
                    <p className="text-sm text-gray-500">Email sequences & analytics</p>
                  </div>
                </Link>
                
                <Link
                  to={`/dashboard/client-outreach/projects/${id}/analytics`}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <BarChart3 className="w-6 h-6 text-orange-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Analytics</h3>
                    <p className="text-sm text-gray-500">View performance metrics</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No recent activity to display</p>
                <p className="text-sm">Start by creating a search to see activity here</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Stats */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Overview</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="text-gray-900">{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                
                {project.tags && (
                  <div>
                    <span className="text-gray-600 block mb-2">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {project.tags.split(',').filter(tag => tag.trim()).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Target Criteria */}
            {project.targetCriteria && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Target className="w-5 h-5 text-green-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Target Criteria</h2>
                </div>
                
                <div className="space-y-4">
                  {project.targetCriteria.industries && project.targetCriteria.industries.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Industries</h4>
                      <div className="flex flex-wrap gap-1">
                        {project.targetCriteria.industries.map((industry, index) => (
                          <span key={index} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {industry}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {project.targetCriteria.locations && project.targetCriteria.locations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Locations</h4>
                      <div className="flex flex-wrap gap-1">
                        {project.targetCriteria.locations.map((location, index) => (
                          <span key={index} className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            {location}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {project.targetCriteria.companySize && project.targetCriteria.companySize.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Company Size</h4>
                      <div className="flex flex-wrap gap-1">
                        {project.targetCriteria.companySize.map((size, index) => (
                          <span key={index} className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Goals */}
            {project.goals && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Goals</h2>
                </div>
                
                <div className="space-y-3">
                  {project.goals.targetProspects && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Target Prospects</span>
                      <span className="font-medium">{project.goals.targetProspects}</span>
                    </div>
                  )}
                  
                  {project.goals.targetRevenue && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Target Revenue</span>
                      <span className="font-medium">${project.goals.targetRevenue.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {project.goals.timeline && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Timeline</span>
                      <span className="font-medium">{project.goals.timeline}</span>
                    </div>
                  )}
                  
                  {project.goals.notes && (
                    <div>
                      <span className="text-gray-600 block mb-1">Notes</span>
                      <p className="text-sm text-gray-900">{project.goals.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;

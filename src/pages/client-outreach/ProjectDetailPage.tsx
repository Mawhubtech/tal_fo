import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  MoreVertical, 
  Building, 
  Target, 
  TrendingUp, 
  Calendar,
  Search,
  Mail,
  BarChart3,
  Settings,
  Archive,
  Pause,
  Play,
  CheckCircle,
  ChevronRight,
  Users,
  DollarSign
} from 'lucide-react';
import { useClientOutreachProject, useUpdateClientOutreachProject } from '../../hooks/useClientOutreachProjects';
import { useClientOutreachProjectSearches } from '../../hooks/useClientOutreachSearches';
import { useClientOutreachProjectProspects } from '../../hooks/useClientOutreachProspects';
import LoadingSpinner from '../../components/LoadingSpinner';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, error } = useClientOutreachProject(id!);
  const { data: searches = [] } = useClientOutreachProjectSearches(id!);
  const { data: prospectsData } = useClientOutreachProjectProspects(id!, 1, 5);
  const updateProjectMutation = useUpdateClientOutreachProject();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !project) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClientTypeColor = (clientType: string) => {
    switch (clientType) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'mid-market': return 'bg-blue-100 text-blue-800';
      case 'smb': return 'bg-green-100 text-green-800';
      case 'startup': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusToggle = async () => {
    const newStatus = project.status === 'active' ? 'paused' : 'active';
    await updateProjectMutation.mutateAsync({
      id: project.id,
      status: newStatus,
    });
  };

  const recentProspects = prospectsData?.prospects?.slice(0, 5) || [];

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link
            to="/dashboard/client-outreach/projects"
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
            <p className="text-gray-600">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleStatusToggle}
            disabled={updateProjectMutation.isPending}
            className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              project.status === 'active'
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            {project.status === 'active' ? (
              <>
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Activate
              </>
            )}
          </button>
          <Link
            to={`/dashboard/client-outreach/projects/${project.id}/edit`}
            className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Link>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Status and Info Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
              {project.status === 'active' && <TrendingUp className="w-4 h-4 mr-1" />}
              {project.status === 'paused' && <Pause className="w-4 h-4 mr-1" />}
              {project.status === 'completed' && <CheckCircle className="w-4 h-4 mr-1" />}
              {project.status === 'archived' && <Archive className="w-4 h-4 mr-1" />}
              <span className="capitalize">{project.status}</span>
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(project.priority)}`}>
              <Target className="w-4 h-4 mr-1" />
              {project.priority} priority
            </span>
            {project.clientType && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getClientTypeColor(project.clientType)}`}>
                <Building className="w-4 h-4 mr-1" />
                {project.clientType.replace('-', ' ')}
              </span>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            Created {new Date(project.createdAt).toLocaleDateString()}
            {project.targetCompletionDate && (
              <>
                <span className="mx-2">•</span>
                <Target className="w-4 h-4 mr-1" />
                Due {new Date(project.targetCompletionDate).toLocaleDateString()}
              </>
            )}
          </div>
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {project.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Prospects</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {project.progress?.totalProspects || 0}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Target: {project.targets?.totalProspects || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {project.progress?.responseRate ? `${(project.progress.responseRate * 100).toFixed(1)}%` : '0%'}
              </p>
              <p className="text-sm text-green-600 mt-1">
                Target: {project.targets?.expectedResponseRate ? `${(project.targets.expectedResponseRate * 100).toFixed(1)}%` : '0%'}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Meetings Scheduled</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {project.progress?.meetingsScheduled || 0}
              </p>
              <p className="text-sm text-purple-600 mt-1">
                This month
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue Generated</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${project.progress?.actualRevenue?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-orange-600 mt-1">
                Target: ${project.targets?.expectedRevenue?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          to={`/dashboard/client-outreach/projects/${project.id}/searches`}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Searches</h3>
                <p className="text-sm text-gray-600">{searches.length} active</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>

        <Link
          to={`/dashboard/client-outreach/projects/${project.id}/prospects`}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <Building className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Prospects</h3>
                <p className="text-sm text-gray-600">{prospectsData?.total || 0} total</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>

        <Link
          to={`/dashboard/client-outreach/projects/${project.id}/sequences`}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Sequences</h3>
                <p className="text-sm text-gray-600">{project.progress?.activeSequences || 0} active</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>

        <Link
          to={`/dashboard/client-outreach/projects/${project.id}/analytics`}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg mr-3">
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Analytics</h3>
                <p className="text-sm text-gray-600">View insights</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Searches */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Searches</h3>
              <Link
                to={`/dashboard/client-outreach/projects/${project.id}/searches`}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {searches.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No searches yet</p>
                <Link
                  to={`/dashboard/client-outreach/projects/${project.id}/searches/create`}
                  className="text-sm text-purple-600 hover:text-purple-700 mt-2 inline-block"
                >
                  Create your first search
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {searches.slice(0, 3).map((search) => (
                  <div key={search.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{search.name}</h4>
                      <p className="text-sm text-gray-600">
                        {search.results?.totalFound || 0} prospects found
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      search.status === 'active' ? 'bg-green-100 text-green-800' :
                      search.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {search.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Prospects */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Prospects</h3>
              <Link
                to={`/dashboard/client-outreach/projects/${project.id}/prospects`}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentProspects.length === 0 ? (
              <div className="text-center py-8">
                <Building className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No prospects yet</p>
                <Link
                  to={`/dashboard/client-outreach/projects/${project.id}/searches/create`}
                  className="text-sm text-purple-600 hover:text-purple-700 mt-2 inline-block"
                >
                  Run a search to find prospects
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProspects.map((prospect) => (
                  <div key={prospect.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{prospect.companyName}</h4>
                      <p className="text-sm text-gray-600">{prospect.industry}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      prospect.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      prospect.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                      prospect.status === 'responded' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {prospect.status.replace('-', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;

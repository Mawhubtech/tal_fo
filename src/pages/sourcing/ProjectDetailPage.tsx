import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  MoreVertical, 
  Users, 
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
  ChevronRight
} from 'lucide-react';
import { useProject, useUpdateProject } from '../../hooks/useSourcingProjects';
import { useProjectSearches } from '../../hooks/useSourcingSearches';
import { useProjectSequences } from '../../hooks/useSourcingSequences';
import LoadingSpinner from '../../components/LoadingSpinner';

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading, error } = useProject(projectId!);
  const { data: searches = [] } = useProjectSearches(projectId!);
  const { data: sequences = [] } = useProjectSequences(projectId!);
  const updateProjectMutation = useUpdateProject();

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
            to="/dashboard/sourcing/projects"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const handleStatusToggle = () => {
    const newStatus = project.status === 'active' ? 'paused' : 'active';
    updateProjectMutation.mutate({
      id: project.id,
      data: { status: newStatus }
    });
  };

  const handleArchive = () => {
    updateProjectMutation.mutate({
      id: project.id,
      data: { status: 'archived' }
    });
  };

  // Navigation cards data
  const navigationCards = [
    {
      title: 'Searches',
      description: 'Manage and create new talent searches',
      icon: Search,
      count: searches.length,
      link: `/dashboard/sourcing/projects/${project.id}/searches`,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    },
    {
      title: 'Prospects',
      description: 'View and manage prospects from searches',
      icon: Users,
      count: project.progress?.totalProspects || 0,
      link: `/dashboard/sourcing/projects/${project.id}/prospects`,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    },
    {
      title: 'Campaigns',
      description: 'Manage email templates and campaigns',
      icon: Mail,
      count: null,
      link: `/dashboard/sourcing/projects/${project.id}/email-templates`,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    },
    {
      title: 'Analytics',
      description: 'View performance metrics and insights',
      icon: BarChart3,
      count: null,
      link: `/dashboard/sourcing/projects/${project.id}/analytics`,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to="/dashboard/sourcing/projects"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Projects
          </Link>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600 mt-1">{project.description}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                project.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : project.status === 'paused'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {project.status === 'active' && <CheckCircle className="w-3 h-3 mr-1 inline" />}
                {project.status === 'paused' && <Pause className="w-3 h-3 mr-1 inline" />}
                {project.status === 'archived' && <Archive className="w-3 h-3 mr-1 inline" />}
                {project.status}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link
              to={`/dashboard/sourcing/projects/${project.id}/edit`}
              className="inline-flex items-center px-3 py-2 text-purple-700 bg-purple-50 border border-purple-300 rounded-lg hover:bg-purple-100"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
            
            <div className="relative">
              <button className="inline-flex items-center px-3 py-2 text-purple-700 bg-purple-50 border border-purple-300 rounded-lg hover:bg-purple-100">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Searches</p>
              <p className="text-2xl font-bold text-gray-900">{searches.length}</p>
            </div>
            <Search className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Prospects</p>
              <p className="text-2xl font-bold text-gray-900">{project.progress?.totalProspects || 0}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Sequences</p>
              <p className="text-2xl font-bold text-gray-900">{sequences.filter(s => s.status === 'active').length}</p>
            </div>
            <Mail className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900">{project.progress?.responseRate || 0}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Start Date</p>
                  <p className="text-sm text-gray-600">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Hire Target</p>
                  <p className="text-sm text-gray-600">{project.requirements?.targetHires || 'Not set'}</p>
                </div>
              </div>
              
              {project.assignedToTeam && (
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Assigned Team</p>
                    <p className="text-sm text-gray-600">{project.assignedToTeam.name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleStatusToggle}
                className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium ${
                  project.status === 'active'
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                }`}
              >
                {project.status === 'active' ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {project.status === 'active' ? 'Pause Project' : 'Resume Project'}
              </button>
              
              <button
                onClick={handleArchive}
                className="w-full flex items-center justify-center px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 font-medium"
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive Project
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Sections</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {navigationCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Link
                key={card.title}
                to={card.link}
                className={`block p-6 rounded-lg border-2 transition-colors ${card.color}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-lg border border-purple-200">
                      <IconComponent className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{card.title}</h4>
                      <p className="text-sm text-gray-600">{card.description}</p>
                      {card.count !== null && (
                        <p className="text-sm font-medium text-purple-700 mt-1">
                          {card.count} {card.title.toLowerCase()}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-purple-400" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;

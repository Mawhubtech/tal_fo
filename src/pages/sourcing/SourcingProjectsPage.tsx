import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Users, 
  Target, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Pause,
  Archive
} from 'lucide-react';
import { useProjects } from '../../hooks/useSourcingProjects';
import { SourcingProject } from '../../services/sourcingProjectApiService';
import LoadingSpinner from '../../components/LoadingSpinner';

const ProjectCard: React.FC<{ project: SourcingProject }> = ({ project }) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <TrendingUp className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'archived': return <Archive className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const progressPercentage = project.progress && project.targets ? 
    Math.min((project.progress.totalProspects || 0) / (project.targets.totalProspects || 1) * 100, 100) : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link 
              to={`/dashboard/sourcing/projects/${project.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-purple-600 transition-colors"
            >
              {project.name}
            </Link>
            {project.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
              {getStatusIcon(project.status)}
              <span className="ml-1 capitalize">{project.status}</span>
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
              <span className="capitalize">{project.priority}</span>
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {project.progress?.totalProspects || 0}
            </div>
            <div className="text-xs text-gray-500">Prospects</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {project.progress?.totalSearches || 0}
            </div>
            <div className="text-xs text-gray-500">Searches</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {project.progress?.activeSequences || 0}
            </div>
            <div className="text-xs text-gray-500">Active Sequences</div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {project.assignedToTeam && (
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>{project.assignedToTeam.name}</span>
              </div>
            )}
            {project.targetCompletionDate && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{new Date(project.targetCompletionDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1">
            {project.tags?.slice(0, 2).map((tag, index) => (
              <span 
                key={index}
                className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
              >
                {tag}
              </span>
            ))}
            {(project.tags?.length || 0) > 2 && (
              <span className="text-xs text-gray-400">+{(project.tags?.length || 0) - 2}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SourcingProjectsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  
  const { data: projectsData, isLoading, error } = useProjects({
    search: searchTerm || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    includeCollaborations: true,
  });

  const projects = projectsData?.projects || [];
  const total = projectsData?.total || 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading projects</h3>
        <p className="text-gray-600">Please try refreshing the page</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sourcing Projects</h1>
          <p className="text-gray-600 mt-1">
            Manage your talent sourcing projects and track progress
          </p>
        </div>
        <Link
          to="/dashboard/sourcing/projects/create"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Project
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-600">
          Showing {projects.length} of {total} projects
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select className="text-sm border border-gray-300 rounded px-2 py-1">
            <option>Latest</option>
            <option>Name</option>
            <option>Status</option>
            <option>Priority</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first sourcing project
          </p>
          <Link
            to="/dashboard/sourcing/projects/create"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SourcingProjectsPage;

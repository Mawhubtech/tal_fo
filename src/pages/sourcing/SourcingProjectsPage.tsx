import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Archive,
  Edit,
  Trash2
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useProjects } from '../../hooks/useSourcingProjects';
import { SourcingProject, sourcingProjectApiService } from '../../services/sourcingProjectApiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import QuickSearch from '../../components/QuickSearch';
import ConfirmationModal from '../../components/ConfirmationModal';

const ProjectCard: React.FC<{ project: SourcingProject }> = ({ project }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: string) => sourcingProjectApiService.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sourcing-projects'] });
    },
    onError: (error) => {
      console.error('Failed to delete project:', error);
      // You might want to add a toast notification here
    }
  });

  const handleEdit = () => {
    navigate(`/dashboard/sourcing/projects/${project.id}/edit`);
  };

  const handleDelete = () => {
    deleteProjectMutation.mutate(project.id);
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (seniority: string) => {
    switch (seniority) {
      case 'executive': return 'bg-red-100 text-red-800';
      case 'lead': return 'bg-orange-100 text-orange-800';
      case 'senior': return 'bg-blue-100 text-blue-800';
      case 'mid': return 'bg-green-100 text-green-800';
      case 'entry': return 'bg-gray-100 text-gray-800';
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
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-4">
            <Link 
              to={`/dashboard/sourcing/projects/${project.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-purple-600 transition-colors block truncate"
            >
              {project.name}
            </Link>
            {project.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
            )}
          </div>
          <div className="flex-shrink-0 flex items-center space-x-1">
            <div className="flex items-center space-x-1">
              <button
                onClick={handleEdit}
                className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                title="Edit project"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Badges Row - Separate from header to prevent overflow */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {getStatusIcon(project.status)}
            <span className="ml-1 capitalize">{project.status}</span>
          </span>
          {project.requirements?.experience && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.requirements.experience)}`}>
              <span className="capitalize">{project.requirements.experience} Level</span>
            </span>
          )}
          {project.metadata?.jobTitle && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              <span className="truncate max-w-[120px]">{project.metadata.jobTitle}</span>
            </span>
          )}
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
        <div className="pt-4 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {project.assignedToTeam && (
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{project.assignedToTeam.name}</span>
                </div>
              )}
              {project.targetCompletionDate && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span>{new Date(project.targetCompletionDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {project.tags?.slice(0, 2).map((tag, index) => (
                <span 
                  key={index}
                  className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded truncate max-w-[80px]"
                  title={tag}
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

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? This action cannot be undone and will remove all associated data including prospects, searches, and sequences.`}
        confirmText="Delete Project"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

const SourcingProjectsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [seniorityFilter, setSeniorityFilter] = useState('');
  
  const { data: projectsData, isLoading, error } = useProjects({
    search: searchTerm || undefined,
    status: statusFilter || undefined,
    // Note: We'll need to filter by seniority on the frontend since the API doesn't support it yet
    includeCollaborations: true,
  });

  const projects = projectsData?.projects || [];
  const total = projectsData?.total || 0;

  // Client-side filtering for seniority since API doesn't support it yet
  const filteredProjects = projects.filter(project => {
    if (seniorityFilter && project.requirements?.experience !== seniorityFilter) {
      return false;
    }
    return true;
  });

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
    <div className="max-w-none mx-auto px-6 lg:px-8 xl:px-12 2xl:px-16">
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

      {/* Quick Search Section - Moved to top and made more prominent */}
      <div className="mb-8">
        <QuickSearch className="max-w-4xl mx-auto" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
          
          <select
            value={seniorityFilter}
            onChange={(e) => setSeniorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none sm:col-span-2 lg:col-span-1"
          >
            <option value="">All Seniority Levels</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
            <option value="lead">Lead/Principal</option>
            <option value="executive">Executive</option>
          </select>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-600">
          Showing {filteredProjects.length} of {total} projects
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select className="text-sm border border-gray-300 rounded px-2 py-1">
            <option>Latest</option>
            <option>Name</option>
            <option>Status</option>
            <option>Seniority</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SourcingProjectsPage;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Building, 
  Target, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Pause,
  Archive,
  Mail,
  Users
} from 'lucide-react';
import { useProjects } from '../../hooks/useClientOutreach';
import { ClientOutreachProject } from '../../services/clientOutreachApiService';
import LoadingSpinner from '../../components/LoadingSpinner';

const ProjectCard: React.FC<{ project: ClientOutreachProject }> = ({ project }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
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

  return (
    <Link 
      to={`/client-outreach/projects/${project.id}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
            {project.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
              {getStatusIcon(project.status)}
              <span className="ml-1 capitalize">{project.status}</span>
            </span>
            <button className="p-1 hover:bg-gray-100 rounded">
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Tags */}
        {project.tags && (
          <div className="flex flex-wrap gap-1 mb-4">
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              {project.tags}
            </span>
          </div>
        )}

        {/* Target Criteria */}
        {project.targetCriteria && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">Target Criteria:</div>
            <div className="flex flex-wrap gap-1">
              {project.targetCriteria.industries?.slice(0, 2).map((industry, index) => (
                <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                  {industry}
                </span>
              ))}
              {project.targetCriteria.companySize?.slice(0, 1).map((size, index) => (
                <span key={index} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                  {size} employees
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Goals */}
        {project.goals && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            {project.goals.targetProspects && (
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {project.goals.targetProspects}
                </div>
                <div className="text-xs text-gray-500">Target Prospects</div>
              </div>
            )}
            {project.goals.targetRevenue && (
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  ${project.goals.targetRevenue.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Target Revenue</div>
              </div>
            )}
          </div>
        )}

        {/* Timeline */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            Created {new Date(project.createdAt).toLocaleDateString()}
          </div>
          {project.goals?.timeline && (
            <div className="flex items-center">
              <Target className="w-3 h-3 mr-1" />
              Due {project.goals.timeline}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

const ClientOutreachProjectsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [clientTypeFilter, setClientTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt' | 'priority'>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data: projects, isLoading, error } = useProjects();

  // Filter and sort projects on the frontend for now
  const filteredProjects = React.useMemo(() => {
    if (!projects) return [];
    
    return projects.filter(project => {
      if (statusFilter !== 'all' && project.status !== statusFilter) return false;
      if (searchTerm && !project.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    }).sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      if (sortBy === 'name') {
        return direction * a.name.localeCompare(b.name);
      }
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        return direction * (new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime());
      }
      return 0;
    });
  }, [projects, statusFilter, searchTerm, sortBy, sortDirection]);

  const totalPages = Math.ceil(filteredProjects.length / 12);
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * 12, currentPage * 12);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Projects</h2>
          <p className="text-gray-600">Failed to load client outreach projects. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Outreach Projects</h1>
          <p className="text-gray-600">Manage your business development and client acquisition projects</p>
        </div>
        <Link
          to="/client-outreach/create"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={clientTypeFilter}
              onChange={(e) => setClientTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            >
              <option value="all">All Client Types</option>
              <option value="enterprise">Enterprise</option>
              <option value="mid-market">Mid-Market</option>
              <option value="smb">SMB</option>
              <option value="startup">Startup</option>
            </select>

            <select
              value={`${sortBy}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortBy(field as any);
                setSortDirection(direction as 'asc' | 'desc');
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            >
              <option value="updatedAt-desc">Recently Updated</option>
              <option value="createdAt-desc">Recently Created</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="priority-desc">Priority High-Low</option>
            </select>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || clientTypeFilter !== 'all'
              ? 'Try adjusting your search criteria or filters.'
              : 'Get started by creating your first client outreach project.'}
          </p>
          <Link
            to="/client-outreach/create"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 2 && page <= currentPage + 2)
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] < page - 1 && (
                      <span className="px-3 py-2 text-gray-500">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 border rounded-lg ${
                        currentPage === page
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClientOutreachProjectsPage;

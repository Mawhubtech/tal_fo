import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Users, 
  Building, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader,
  Edit3,
  Trash2,
  Eye,
  Globe,
  MoreVertical,
  CheckCircle,
  PauseCircle,
  XCircle,
  Archive,
  User,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { useJobs, useDeleteJob, useUpdateJob } from '../../../hooks/useJobs';
import { useJobsWebSocket } from '../../../hooks/useJobsWebSocket';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { useMyAssignment } from '../../../hooks/useUserAssignment';
import { useUserTeamMemberships } from '../../../hooks/useHiringTeam';
import JobPreviewModal from '../../../components/modals/JobPreviewModal';
import { createJobUrl } from '../../../lib/urlUtils';
import type { JobFilters } from '../../../services/jobApiService';
import type { Job } from '../../data/types';

const AllJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<JobFilters>({
    page: 1,
    limit: 20, // Increased from 10 to show more jobs per page
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  });

  // Delete dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  
  // Preview modal states
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [jobToPreview, setJobToPreview] = useState<Job | null>(null);
  
  // Status change states
  const [showStatusMenu, setShowStatusMenu] = useState<string | null>(null);
  const [jobStatusChanging, setJobStatusChanging] = useState<string | null>(null);

  // Get user's organization assignment for navigation purposes
  const { data: userAssignment, isLoading: assignmentLoading } = useMyAssignment();
  
  // Get user's hiring team memberships to check if they have access through team membership
  const { data: userTeamMemberships, isLoading: teamMembershipsLoading } = useUserTeamMemberships(user?.id || '');

  // Determine user type for UI purposes
  const userRoleNames = user?.roles?.map(role => role.name.toLowerCase()) || [];
  const isSuperAdmin = userRoleNames.some(role => role === 'super-admin');
  const hasAssignmentRole = userRoleNames.some(role => 
    role === 'internal-recruiter' || 
    role === 'internal-hr' ||
    role === 'internal-admin' ||
    role === 'external-hr' ||
    role === 'freelance-hr' ||
    role === 'hr-agency-admin' ||
    role === 'hr-agency-associate' ||
    role === 'hr-agency-director' ||
    role === 'hr-agency-specialist' ||
    role === 'admin'
  );
  
  // Check if user has access through hiring team membership
  const hasHiringTeamAccess = userTeamMemberships && userTeamMemberships.length > 0;

  // Use the main jobs hook - WebSocket will handle real-time updates
  const { 
    data: jobsResponse,
    isLoading: loading,
    error: queryError,
    refetch: refetchJobs
  } = useJobs(filters); // Removed refetchInterval - WebSocket handles updates

  // Setup WebSocket connection for real-time job updates
  useJobsWebSocket({
    enabled: !!user,
    onJobCreated: (job) => {
      console.log('[AllJobsPage] New job created:', job);
      // Query will auto-refetch via invalidateQueries in the hook
    },
    onJobUpdated: (job) => {
      console.log('[AllJobsPage] Job updated:', job);
      // Query will auto-refetch via invalidateQueries in the hook
    },
    onJobDeleted: (data) => {
      console.log('[AllJobsPage] Job deleted:', data);
      // Query will auto-refetch via invalidateQueries in the hook
    },
    onJobStatusChanged: (data) => {
      console.log('[AllJobsPage] Job status changed:', data);
      // Query will auto-refetch via invalidateQueries in the hook
    },
  });

  const deleteJobMutation = useDeleteJob();
  const updateJobMutation = useUpdateJob();

  // Extract data from response - backend now includes collaborator jobs automatically
  // No need to fetch and merge separately since backend handles all access control
  const jobs = jobsResponse?.data || [];
  const backendTotal = jobsResponse?.total || 0;
  const backendPage = jobsResponse?.page || 1;
  const backendLimit = jobsResponse?.limit || 20;
  
  const pagination = {
    total: backendTotal, // ✅ Use backend total, not merged array length
    page: backendPage,
    limit: backendLimit
  };
  
  // Convert error to string format
  const error = queryError ? 'Failed to load jobs. Please try again.' : null;

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
  };

  const handleFilterChange = (newFilters: Partial<JobFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Refresh handler
  const handleRefresh = async () => {
    await refetchJobs();
    addToast({
      type: 'success',
      title: 'Data Refreshed',
      message: 'Jobs data has been updated successfully',
      duration: 3000
    });
  };

  // Handler functions for CRUD operations
  const handleEditJob = (job: Job) => {
    // Navigate to standalone job edit page
    navigate(`/jobs/create?edit=${job.id}`);
  };

  const handleCreateJob = () => {
    // Navigate to standalone job creation page
    // Backend handles all access control and validation
    navigate('/jobs/create');
  };

  const handleJobClick = (job: Job) => {
    // Navigate directly to job ATS page with slugified title
    navigate(createJobUrl(job.slug, job.title));
  };

  const handleDeleteJob = (job: Job) => {
    setJobToDelete(job);
    setShowDeleteDialog(true);
  };
  
  const handleViewJob = (job: Job) => {
    setJobToPreview(job);
    setShowPreviewModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;

    try {
      await deleteJobMutation.mutateAsync(jobToDelete.id);
      setShowDeleteDialog(false);
      setJobToDelete(null);
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Job deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting job:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to delete job. Please try again.';
      addToast({
        type: 'error',
        title: 'Deletion Failed',
        message: errorMessage
      });
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setJobToDelete(null);
  };

  const handleStatusChange = async (job: Job, newStatus: Job['status']) => {
    try {
      setJobStatusChanging(job.id);
      setShowStatusMenu(null);
      
      await updateJobMutation.mutateAsync({
        id: job.id,
        data: { status: newStatus }
      });
      
      addToast({
        type: 'success',
        title: 'Success',
        message: `Job status changed to ${newStatus}`
      });
    } catch (error: any) {
      console.error('Error changing job status:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to change job status. Please try again.';
      addToast({
        type: 'error',
        title: 'Status Update Failed',
        message: errorMessage
      });
    } finally {
      setJobStatusChanging(null);
    }
  };

  const getStatusIcon = (status: Job['status']) => {
    switch (status) {
      case 'Published': return CheckCircle;
      case 'Draft': return Edit3;
      case 'Paused': return PauseCircle;
      case 'Closed': return XCircle;
      case 'Archived': return Archive;
      default: return CheckCircle;
    }
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'Published': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Paused': return 'bg-yellow-100 text-yellow-800';
      case 'Closed': return 'bg-red-100 text-red-800';
      case 'Archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: Job['urgency']) => {
    switch (urgency) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUserRoleBadge = (job: Job) => {
    if (!user) return null;

    // Check if user is the creator
    const isCreator = job.createdBy?.id === user.id;
    
    // Check if user is a collaborator
    const isCollaborator = job.collaborators?.some(collab => collab.email === user.email);

    if (isCreator) {
      return {
        text: 'Creator',
        color: 'bg-blue-100 text-blue-800',
        icon: User
      };
    } else if (isCollaborator) {
      return {
        text: 'Collaborator',
        color: 'bg-purple-100 text-purple-800',
        icon: UserCheck
      };
    }

    return null;
  };

  const formatSalary = (job: Job) => {
    // Determine the salary period suffix
    const periodSuffix = (job as any).salaryPeriod 
      ? ` (${(job as any).salaryPeriod === 'monthly' ? '/mo' : '/yr'})` 
      : '';
    
    // Handle both new backend format and legacy format
    if (job.salaryMin && job.salaryMax) {
      return `${job.currency}${job.salaryMin.toLocaleString()} - ${job.currency}${job.salaryMax.toLocaleString()}${periodSuffix}`;
    } else if (job.salary?.min && job.salary?.max) {
      return `${job.salary.currency}${job.salary.min.toLocaleString()} - ${job.salary.currency}${job.salary.max.toLocaleString()}${periodSuffix}`;
    }
    return 'Salary not specified';
  };
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getPublishingInfo = (job: Job) => {
    const publishingOptions = job.publishingOptions;
    if (!publishingOptions) {
      return { text: 'Private Only', badges: [{ text: 'Private Only', color: 'bg-gray-100 text-gray-700', icon: null }] };
    }

    const badges = [];
    
    // Always show private status first
    badges.push({ text: 'Private', color: 'bg-gray-100 text-gray-700', icon: null });
    
    if (publishingOptions.talJobBoard) {
      badges.push({ text: 'TAL Board', color: 'bg-purple-100 text-purple-800', icon: Building });
    }
    if (publishingOptions.externalJobBoards && publishingOptions.externalJobBoards.length > 0) {
      badges.push({ 
        text: `${publishingOptions.externalJobBoards.length} External`, 
        color: 'bg-blue-100 text-blue-800',
        icon: Globe 
      });
    }

    return { text: '', badges };
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (loading || assignmentLoading || teamMembershipsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader className="h-6 w-6 animate-spin" />
          <span>Loading jobs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Jobs</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => refetchJobs()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-3 md:p-4">
      {/* Header */}
      <div className="bg-white border-2 border-purple-500 rounded-lg p-2 sm:p-3 md:p-4 mb-2 sm:mb-3 md:mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">
              {isSuperAdmin ? 'All Jobs' : ((hasAssignmentRole || hasHiringTeamAccess) ? 'My Jobs' : 'All Jobs')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">
              {isSuperAdmin 
                ? 'Manage all job openings across the platform'
                : ((hasAssignmentRole || hasHiringTeamAccess)
                    ? 'Manage job openings for your assigned organization or hiring teams'
                    : 'Manage all job openings across your clients')}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg flex items-center space-x-1.5 sm:space-x-2 border text-xs sm:text-sm whitespace-nowrap flex-shrink-0 bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100"
              title="Refresh jobs data"
            >
              <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleCreateJob}
              disabled={!isSuperAdmin && !hasHiringTeamAccess && !(hasAssignmentRole && userAssignment?.organizationId)}
              className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg flex items-center space-x-1.5 sm:space-x-2 border text-xs sm:text-sm whitespace-nowrap flex-shrink-0 justify-center ${
                !isSuperAdmin && !hasHiringTeamAccess && !(hasAssignmentRole && userAssignment?.organizationId)
                  ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed' 
                  : 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700 active:bg-purple-800'
              }`}
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Create Job</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-2 sm:p-3 md:p-4 rounded-lg shadow mb-2 sm:mb-3 md:mb-4">
        <div className="flex flex-col gap-2 sm:gap-3">
          {/* Search */}
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <input
                type="text"
                placeholder="Search jobs by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-8 sm:pl-10 pr-8 sm:pr-10 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 w-full text-xs sm:text-sm"
              />
              {loading && (
                <div className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2">
                  <Loader className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500 animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange({ status: e.target.value as any || undefined })}
              className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 focus:outline-none focus:border-purple-500 text-xs sm:text-sm flex-1"
            >
              <option value="">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Paused">Paused</option>
              <option value="Closed">Closed</option>
              <option value="Archived">Archived</option>
            </select>

            <select
              value={filters.type || ''}
              onChange={(e) => handleFilterChange({ type: e.target.value as any || undefined })}
              className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 focus:outline-none focus:border-purple-500 text-xs sm:text-sm flex-1"
            >
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>

            <select
              value={filters.urgency || ''}
              onChange={(e) => handleFilterChange({ urgency: e.target.value as any || undefined })}
              className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 focus:outline-none focus:border-purple-500 text-xs sm:text-sm flex-1"
            >
              <option value="">All Urgency</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <button
              onClick={handleSearch}
              className="bg-purple-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-purple-700 active:bg-purple-800 flex items-center justify-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Apply</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Header with Pagination Info */}
      <div className="bg-white rounded-lg shadow mb-3 sm:mb-4">
        <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900">
            {pagination.total} Jobs Found
          </h2>
          {totalPages > 1 && (
            <div className="text-xs sm:text-sm text-gray-600">
              Page {pagination.page} of {totalPages}
            </div>
          )}
        </div>

        {jobs.length === 0 ? (
          <div className="p-12 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {!isSuperAdmin && !hasHiringTeamAccess && !(hasAssignmentRole && userAssignment?.organizationId) ? (
              // User with no access
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Access</h3>
                <p className="text-gray-600 mb-4">
                  You haven't been assigned to a client organization or added to any hiring teams yet. Please contact your administrator to get access to jobs.
                </p>
              </>
            ) : (
              // Normal empty state
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search criteria or create a new job.</p>
                <button
                  onClick={handleCreateJob}
                  className="inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Job</span>
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Compact Job Cards */}
            <div className="divide-y divide-gray-200">
              {jobs.map((job) => (
                <div 
                  key={job.id} 
                  className="px-3 sm:px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleJobClick(job)}
                >
                  {/* Mobile Layout (< 768px) */}
                  <div className="md:hidden">
                    {/* Title and Status Row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-gray-900 hover:text-purple-600 flex-1 min-w-0 line-clamp-2">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {(() => {
                          const roleBadge = getUserRoleBadge(job);
                          return roleBadge ? (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5 ${roleBadge.color}`}>
                              <roleBadge.icon className="h-2.5 w-2.5" />
                              {roleBadge.text}
                            </span>
                          ) : null;
                        })()}
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 flex-shrink-0" />
                        <span>{job.applications?.length || 0} applicants</span>
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{job.type}</span>
                      </div>
                      <div className="flex items-center gap-1 col-span-2">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </div>
                    </div>

                    {/* Salary and Urgency */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-medium text-gray-900 truncate">
                        {formatSalary(job)}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border flex-shrink-0 ${getUrgencyColor(job.urgency)}`}>
                        {job.urgency}
                      </span>
                    </div>

                    {/* Publishing Badges */}
                    <div className="flex items-center gap-1 mb-2 overflow-x-auto pb-1">
                      {(() => {
                        const publishingInfo = getPublishingInfo(job);
                        return publishingInfo.badges.map((badge, index) => {
                          const IconComponent = badge.icon;
                          return (
                            <span
                              key={index}
                              className={`px-1.5 py-0.5 text-[10px] rounded flex items-center whitespace-nowrap ${badge.color}`}
                            >
                              {IconComponent && <IconComponent className="w-2.5 h-2.5 mr-0.5" />}
                              {badge.text}
                            </span>
                          );
                        });
                      })()}
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewJob(job);
                        }}
                        className="flex-1 p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 rounded-lg transition-colors text-xs font-medium flex items-center justify-center gap-1"
                        title="View Job"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditJob(job);
                        }}
                        className="flex-1 p-2 text-purple-600 bg-purple-50 hover:bg-purple-100 active:bg-purple-200 rounded-lg transition-colors text-xs font-medium flex items-center justify-center gap-1"
                        title="Edit Job"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                      
                      {/* Status Change Menu */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowStatusMenu(showStatusMenu === job.id ? null : job.id);
                          }}
                          className="p-2 text-gray-600 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
                          title="Change Status"
                          disabled={jobStatusChanging === job.id}
                        >
                          {jobStatusChanging === job.id ? (
                            <Loader className="h-3 w-3 animate-spin" />
                          ) : (
                            <MoreVertical className="h-3 w-3" />
                          )}
                        </button>
                        
                        {showStatusMenu === job.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowStatusMenu(null);
                              }}
                            />
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                              <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100">
                                Change Status
                              </div>
                              {(['Published', 'Draft', 'Paused', 'Closed', 'Archived'] as const).map((status) => {
                                const StatusIcon = getStatusIcon(status);
                                const isCurrentStatus = job.status === status;
                                
                                return (
                                  <button
                                    key={status}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(job, status);
                                    }}
                                    disabled={isCurrentStatus}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                                      isCurrentStatus
                                        ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                        : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                                  >
                                    <StatusIcon className="h-4 w-4" />
                                    <span>{status}</span>
                                    {isCurrentStatus && (
                                      <span className="ml-auto text-xs text-gray-400">(current)</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteJob(job);
                        }}
                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-lg transition-colors"
                        title="Delete Job"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Desktop Layout (>= 768px) */}
                  <div className="hidden md:flex items-center justify-between gap-4">
                    {/* Left Section: Job Info */}
                    <div className="flex-1 min-w-0">
                      {/* Title and Badges Row */}
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-base font-semibold text-gray-900 hover:text-purple-600 truncate">
                          {job.title}
                        </h3>
                        {(() => {
                          const roleBadge = getUserRoleBadge(job);
                          return roleBadge ? (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 flex-shrink-0 ${roleBadge.color}`}>
                              <roleBadge.icon className="h-3 w-3" />
                              {roleBadge.text}
                            </span>
                          ) : null;
                        })()}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${getUrgencyColor(job.urgency)}`}>
                          {job.urgency}
                        </span>
                      </div>

                      {/* Job Details Row */}
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span>{job.type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 flex-shrink-0" />
                          <span>{job.applications?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-900 font-medium">
                          <span className="truncate">{formatSalary(job)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section: Publishing Status and Actions */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Publishing Badges */}
                      <div className="flex items-center gap-1">
                        {(() => {
                          const publishingInfo = getPublishingInfo(job);
                          return publishingInfo.badges.slice(0, 2).map((badge, index) => {
                            const IconComponent = badge.icon;
                            return (
                              <span
                                key={index}
                                className={`px-2 py-0.5 text-xs rounded-full flex items-center ${badge.color}`}
                              >
                                {IconComponent && <IconComponent className="w-3 h-3 mr-1" />}
                                {badge.text}
                              </span>
                            );
                          });
                        })()}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewJob(job);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Job"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditJob(job);
                          }}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Edit Job"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        
                        {/* Status Change Menu */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowStatusMenu(showStatusMenu === job.id ? null : job.id);
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Change Status"
                            disabled={jobStatusChanging === job.id}
                          >
                            {jobStatusChanging === job.id ? (
                              <Loader className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreVertical className="h-4 w-4" />
                            )}
                          </button>
                          
                          {showStatusMenu === job.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowStatusMenu(null);
                                }}
                              />
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100">
                                  Change Status
                                </div>
                                {(['Published', 'Draft', 'Paused', 'Closed', 'Archived'] as const).map((status) => {
                                  const StatusIcon = getStatusIcon(status);
                                  const isCurrentStatus = job.status === status;
                                  
                                  return (
                                    <button
                                      key={status}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusChange(job, status);
                                      }}
                                      disabled={isCurrentStatus}
                                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                                        isCurrentStatus
                                          ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                          : 'hover:bg-gray-50 text-gray-700'
                                      }`}
                                    >
                                      <StatusIcon className="h-4 w-4" />
                                      <span>{status}</span>
                                      {isCurrentStatus && (
                                        <span className="ml-auto text-xs text-gray-400">(current)</span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteJob(job);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Job"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-3 sm:px-4 py-3 border-t border-gray-200">
                {/* Mobile Pagination */}
                <div className="md:hidden space-y-3">
                  <div className="text-xs text-gray-600 text-center">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Prev</span>
                    </button>
                    
                    <span className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium">
                      {pagination.page} / {totalPages}
                    </span>

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === totalPages}
                      className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-center">
                    <select
                      value={filters.limit}
                      onChange={(e) => handleFilterChange({ limit: parseInt(e.target.value) })}
                      className="border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                    >
                      <option value="10">10 per page</option>
                      <option value="20">20 per page</option>
                      <option value="50">50 per page</option>
                      <option value="100">100 per page</option>
                    </select>
                  </div>
                </div>

                {/* Desktop Pagination */}
                <div className="hidden md:flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                    </span>
                    <select
                      value={filters.limit}
                      onChange={(e) => handleFilterChange({ limit: parseInt(e.target.value) })}
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-purple-500"
                    >
                      <option value="10">10 per page</option>
                      <option value="20">20 per page</option>
                      <option value="50">50 per page</option>
                      <option value="100">100 per page</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {(() => {
                        const maxButtons = 7;
                        const pages = [];
                        
                        if (totalPages <= maxButtons) {
                          // Show all pages if total is small
                          for (let i = 1; i <= totalPages; i++) {
                            pages.push(i);
                          }
                        } else {
                          // Smart pagination with ellipsis
                          if (pagination.page <= 4) {
                            // Near start
                            for (let i = 1; i <= 5; i++) pages.push(i);
                            pages.push(-1); // Ellipsis
                            pages.push(totalPages);
                          } else if (pagination.page >= totalPages - 3) {
                            // Near end
                            pages.push(1);
                            pages.push(-1); // Ellipsis
                            for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
                          } else {
                            // Middle
                            pages.push(1);
                            pages.push(-1); // Ellipsis
                            for (let i = pagination.page - 1; i <= pagination.page + 1; i++) pages.push(i);
                            pages.push(-2); // Ellipsis
                            pages.push(totalPages);
                          }
                        }

                        return pages.map((pageNum, index) => {
                          if (pageNum === -1 || pageNum === -2) {
                            return (
                              <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                                ...
                              </span>
                            );
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-1.5 rounded-lg text-sm ${
                                pagination.page === pageNum
                                  ? 'bg-purple-600 text-white'
                                  : 'border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        });
                      })()}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === totalPages}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>    

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && jobToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50" 
            onClick={handleDeleteCancel}
          />
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 max-w-sm w-full relative z-10">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Confirm Deletion</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Are you sure you want to delete the job "{jobToDelete.title}"? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={handleDeleteCancel}
                className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 active:bg-gray-400 text-sm sm:text-base order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 active:bg-red-800 flex items-center justify-center space-x-2 text-sm sm:text-base order-1 sm:order-2"
                disabled={deleteJobMutation.isPending}
              >
                {deleteJobMutation.isPending && <Loader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />}
                <span>Delete Job</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Job Preview Modal */}
      {showPreviewModal && jobToPreview && (
        <JobPreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          job={jobToPreview}
        />
      )}
    </div>
  );
};

export default AllJobsPage;

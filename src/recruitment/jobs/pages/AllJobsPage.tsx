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
  Eye
} from 'lucide-react';
import { useJobs, useDeleteJob, useJobsByOrganization } from '../../../hooks/useJobs';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useMyAssignment } from '../../../hooks/useUserAssignment';
import type { JobFilters } from '../../../services/jobApiService';
import type { Job } from '../../data/types';

const AllJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<JobFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  });

  // Delete dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  // Internal recruiter state management
  const [isInternalRecruiter, setIsInternalRecruiter] = useState(false);
  const [defaultOrganizationId, setDefaultOrganizationId] = useState<string | null>(null);
  const [defaultDepartmentId, setDefaultDepartmentId] = useState<string | null>(null);

  // Get user's organization assignment for internal recruiters
  const { data: userAssignment, isLoading: assignmentLoading, error: assignmentError } = useMyAssignment();

  // Check if user is internal recruiter based on role or organization assignment
  useEffect(() => {
    if (!user) return;
    
    // Wait for assignment loading to complete before making decisions
    if (assignmentLoading) return;

    // Get user roles
    const userRoles = user?.roles?.map(role => role.name.toLowerCase()) || [];
    
    // Check for admin roles first (they take precedence)
    const hasAdminRole = userRoles.some(role => 
      role === 'admin' || role === 'super-admin'
    );
    
    if (hasAdminRole) {
      // Admins see all jobs, no assignment needed
      setIsInternalRecruiter(false);
      setDefaultOrganizationId(null);
      setDefaultDepartmentId(null);
      return;
    }
    
    // Check for roles that need organization assignment
    const hasAssignmentRole = userRoles.some(role => 
      role === 'internal-recruiter' || 
      role === 'internal-hr' || 
      role === 'user'
    );
    
    if (hasAssignmentRole) {
      setIsInternalRecruiter(true);
      
      // Get the organization ID from user's assignment
      const assignedOrgId = userAssignment?.organizationId || userAssignment?.clientId;
      const assignedDeptId = userAssignment?.departmentId;
      
      setDefaultOrganizationId(assignedOrgId || null);
      setDefaultDepartmentId(assignedDeptId || null);
    } else {
      // Other roles see all jobs
      setIsInternalRecruiter(false);
      setDefaultOrganizationId(null);
      setDefaultDepartmentId(null);
    }
  }, [user, userAssignment, assignmentLoading]);

  // Use appropriate hook based on user type
  // For internal recruiters, check if they have an assignment
  const shouldFetchJobs = !isInternalRecruiter || (isInternalRecruiter && !!defaultOrganizationId);
  
  // Determine which hooks should be enabled
  const enableAllJobs = shouldFetchJobs && !isInternalRecruiter;
  const enableOrgJobs = shouldFetchJobs && isInternalRecruiter && !!defaultOrganizationId;
  
  // Always call hooks, but with conditional parameters
  const { 
    data: allJobsResponse,
    isLoading: allJobsLoading,
    error: allJobsError,
    refetch: refetchAllJobs
  } = useJobs(filters, { enabled: enableAllJobs });

  const { 
    data: orgJobsResponse,
    isLoading: orgJobsLoading,
    error: orgJobsError,
    refetch: refetchOrgJobs
  } = useJobsByOrganization(
    defaultOrganizationId || '', 
    filters,
    { enabled: enableOrgJobs }
  );

  // Determine which data to use
  const jobsResponse = isInternalRecruiter && defaultOrganizationId ? orgJobsResponse : allJobsResponse;
  const loading = isInternalRecruiter && defaultOrganizationId ? orgJobsLoading : allJobsLoading;
  const queryError = isInternalRecruiter && defaultOrganizationId ? orgJobsError : allJobsError;
  const loadJobs = isInternalRecruiter && defaultOrganizationId ? refetchOrgJobs : refetchAllJobs;

  const deleteJobMutation = useDeleteJob();

  // Extract data from response or use defaults
  const jobs = !shouldFetchJobs 
    ? [] // Internal recruiter with no assignment - show no jobs
    : (isInternalRecruiter && defaultOrganizationId
        ? (jobsResponse as { jobs: Job[]; total: number })?.jobs || []
        : (jobsResponse as { data: Job[]; total: number; page: number; limit: number })?.data || []);
    
  const pagination = {
    total: !shouldFetchJobs 
      ? 0 // Internal recruiter with no assignment - show 0 total
      : (isInternalRecruiter && defaultOrganizationId
          ? (jobsResponse as { jobs: Job[]; total: number })?.total || 0
          : (jobsResponse as { data: Job[]; total: number; page: number; limit: number })?.total || 0),
    page: !shouldFetchJobs 
      ? 1
      : (isInternalRecruiter && defaultOrganizationId
          ? filters.page || 1
          : (jobsResponse as { data: Job[]; total: number; page: number; limit: number })?.page || 1),
    limit: !shouldFetchJobs 
      ? 10
      : (isInternalRecruiter && defaultOrganizationId
          ? filters.limit || 10
          : (jobsResponse as { data: Job[]; total: number; page: number; limit: number })?.limit || 10)
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

  // Handler functions for CRUD operations
  const handleEditJob = (job: Job) => {
    if (isInternalRecruiter && defaultOrganizationId && defaultDepartmentId) {
      // For internal recruiters, use their default organization and department
      navigate(`/dashboard/organizations/${defaultOrganizationId}/departments/${defaultDepartmentId}/create-job?edit=${job.id}`);
    } else {
      // For external recruiters, use the job's organization and department
      const organizationId = job.organizationId || 'default-org';
      const departmentId = job.departmentId || 'default-dept';
      navigate(`/dashboard/organizations/${organizationId}/departments/${departmentId}/create-job?edit=${job.id}`);
    }
  };

  const handleCreateJob = () => {
    // Prevent internal recruiters with no assignment from creating jobs
    if (isInternalRecruiter && !defaultOrganizationId) {
      return;
    }
    
    if (isInternalRecruiter && defaultOrganizationId) {
      // For internal recruiters, go directly to job creation within their assigned organization
      // Since they work across all departments, we can let them choose the department during creation
      navigate(`/dashboard/organizations/${defaultOrganizationId}/create-job`);
    } else {
      // For external recruiters, navigate to organizations page to choose client
      navigate('/dashboard/organizations');
    }
  };

  const handleJobClick = (job: Job) => {
    if (isInternalRecruiter && defaultOrganizationId) {
      // For internal recruiters, use their organization and the job's department
      const departmentId = job.departmentId || defaultDepartmentId || 'default-dept';
      navigate(`/dashboard/organizations/${defaultOrganizationId}/departments/${departmentId}/jobs/${job.id}/ats`);
    } else {
      // For external recruiters, use the job's organization and department
      const organizationId = job.organizationId || 'default-org';
      const departmentId = job.departmentId || 'default-dept';
      navigate(`/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs/${job.id}/ats`);
    }
  };

  const handleDeleteJob = (job: Job) => {
    setJobToDelete(job);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;

    try {
      await deleteJobMutation.mutateAsync(jobToDelete.id);
      setShowDeleteDialog(false);
      setJobToDelete(null);
    } catch (error) {
      console.error('Error deleting job:', error);
      // Error handling is managed by React Query, but we could add a toast here
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setJobToDelete(null);
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
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };
  const formatSalary = (job: Job) => {
    // Handle both new backend format and legacy format
    if (job.salaryMin && job.salaryMax) {
      return `${job.currency}${job.salaryMin.toLocaleString()} - ${job.currency}${job.salaryMax.toLocaleString()}`;
    } else if (job.salary?.min && job.salary?.max) {
      return `${job.salary.currency}${job.salary.min.toLocaleString()} - ${job.salary.currency}${job.salary.max.toLocaleString()}`;
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

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (loading) {
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
            onClick={() => loadJobs()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-2 border-purple-500 rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {(() => {
                const userRoles = user?.roles?.map(role => role.name.toLowerCase()) || [];
                const hasAdminRole = userRoles.some(role => role === 'admin' || role === 'super-admin');
                
                if (hasAdminRole) return 'All Jobs';
                if (isInternalRecruiter) return 'My Jobs';
                return 'All Jobs';
              })()}
            </h1>
            <p className="text-gray-600">
              {(() => {
                const userRoles = user?.roles?.map(role => role.name.toLowerCase()) || [];
                const hasAdminRole = userRoles.some(role => role === 'admin' || role === 'super-admin');
                
                if (hasAdminRole) return 'Manage all job openings across the platform (Admin)';
                if (isInternalRecruiter) return 'Manage job openings for your assigned organization';
                return 'Manage all job openings across your clients';
              })()}
            </p>
          </div>
          <button
            onClick={handleCreateJob}
            disabled={isInternalRecruiter && !defaultOrganizationId}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 border ${
              isInternalRecruiter && !defaultOrganizationId 
                ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed' 
                : 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>Create Job</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search jobs by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange({ status: e.target.value as any || undefined })}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
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
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
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
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Urgency</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <button
              onClick={handleSearch}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Apply</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {pagination.total} Jobs Found
          </h2>
        </div>

        {jobs.length === 0 ? (
          <div className="p-12 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {isInternalRecruiter && !defaultOrganizationId ? (
              // Internal recruiter with no assignment
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Organization Assignment</h3>
                <p className="text-gray-600 mb-4">
                  You haven't been assigned to an organization yet. Please contact your administrator to get assigned to an organization before you can view and manage jobs.
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
          <div className="divide-y divide-gray-200">
            {jobs.map((job) => (
              <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-purple-600 cursor-pointer">
                        <button 
                          onClick={() => handleJobClick(job)}
                          className="text-left hover:underline"
                        >
                          {job.title}
                        </button>
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                        <span className={`text-sm font-medium ${getUrgencyColor(job.urgency)}`}>
                          {job.urgency} Priority
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Building className="h-4 w-4" />
                        <span>{job.department}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{job.type}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{job.applicantsCount || job.applicants || 0} applicants</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Posted {formatDate(job.postedDate || job.createdAt)}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatSalary(job)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleEditJob(job)}
                      className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-3 py-2 rounded-lg transition-colors"
                      title="Edit Job"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span className="text-sm font-medium">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job)}
                      className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                      title="Delete Job"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-lg ${
                        pagination.page === pageNum
                          ? 'bg-purple-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === totalPages}
                className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>    

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && jobToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the job "{jobToDelete.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleDeleteCancel}
                className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
                disabled={deleteJobMutation.isPending}
              >
                {deleteJobMutation.isPending && <Loader className="h-5 w-5 animate-spin" />}
                <span>Delete Job</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllJobsPage;

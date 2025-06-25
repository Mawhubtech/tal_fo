import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Briefcase, MapPin, DollarSign, 
  Search, Grid3X3, List, ChevronRight, Plus,
  Edit3, Trash2, Eye, Loader
} from 'lucide-react';
import { OrganizationApiService, type Organization, type Department } from '../services/organizationApiService';
import { jobApiService } from '../../jobs/services/jobApiService';
import type { Job } from '../../data/types';

const DepartmentJobsPage: React.FC = () => {
  const { organizationId, departmentId } = useParams<{ organizationId: string; departmentId: string }>();
  const navigate = useNavigate();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  
  // State for data
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit and delete states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const organizationApiService = new OrganizationApiService();

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!organizationId || !departmentId) {
        setError('Missing organization or department ID');
        setLoading(false);
        return;
      }

      try {        setLoading(true);
          // Load organization
        const orgData = await organizationApiService.getOrganizationById(organizationId);
        setOrganization(orgData);
        
        // Load department
        const deptData = await organizationApiService.getDepartmentById(organizationId, departmentId);
        setDepartment(deptData);

        // Load jobs for department
        const jobsResponse = await organizationApiService.getJobsByDepartment(organizationId, departmentId);
        setJobs(jobsResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [organizationId, departmentId]);  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (job.skills && job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    const matchesLevel = levelFilter === 'all' || job.experienceLevel === levelFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesLevel;
  });
  const formatSalary = (job: Job) => {
    if (job.salaryMin && job.salaryMax) {
      return `${job.currency || '$'}${job.salaryMin.toLocaleString()} - ${job.currency || '$'}${job.salaryMax.toLocaleString()}`;
    } else if (job.salaryMin) {
      return `${job.currency || '$'}${job.salaryMin.toLocaleString()}+`;
    } else if (job.salaryMax) {
      return `Up to ${job.currency || '$'}${job.salaryMax.toLocaleString()}`;
    }
    return 'Salary not specified';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'paused':
        return 'bg-orange-100 text-orange-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Handler functions for CRUD operations
  const handleCreateJob = () => {
    navigate(`/dashboard/organizations/${organizationId}/departments/${departmentId}/create-job`);
  };

  const handleEditJob = (job: Job) => {
    // For now, let's navigate to the create job page with the job ID as a URL parameter
    navigate(`/dashboard/organizations/${organizationId}/departments/${departmentId}/create-job?edit=${job.id}`);
  };

  const handleDeleteJob = (job: Job) => {
    setJobToDelete(job);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;

    setDeleteLoading(true);
    setDeleteError(null); // Clear any previous errors
    
    try {
      await jobApiService.deleteJob(jobToDelete.id);
      // Remove job from local state
      setJobs(prev => prev.filter(job => job.id !== jobToDelete.id));
      // Only close dialog on success
      setShowDeleteDialog(false);
      setJobToDelete(null);
    } catch (error: any) {
      console.error('Error deleting job:', error);
      
      // Extract error message from backend response
      let errorMessage = 'Failed to delete job. Please try again.';
      
      // Handle axios error structure
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setDeleteError(errorMessage);
      // Don't close dialog on error - let user see the error and try again
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setJobToDelete(null);
    setDeleteError(null); // Clear any delete errors when canceling
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error || !organization || !department) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {error || 'Page not found'}
          </h3>
          <p className="text-gray-500 mb-4">
            {error || "The organization or department you're looking for doesn't exist."}
          </p>
          <Link 
            to="/dashboard/organizations" 
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to Organizations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link to="/dashboard/organizations" className="hover:text-gray-700">Organizations</Link>
        <span className="mx-2">/</span>        <Link to={`/dashboard/organizations/${organizationId}`} className="hover:text-gray-700">
          {organization.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{department.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">          <Link 
            to={`/dashboard/organizations/${organizationId}`}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
            <p className="text-gray-600 mt-1">
              <span className="font-medium">{department.name}</span> department in {organization.name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Create Job Button */}
          <button
            onClick={handleCreateJob}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Job
          </button>
          
          {/* View Toggle */}
          <div className="flex items-center bg-white rounded-lg border p-1">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-md transition-colors ${view === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List className="w-4 h-4" />
          </button>
          </div>
        </div>
      </div>

      {/* Department Info Card */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">{department.name} Department</h2>
              <p className="text-gray-600">{department.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
            <p className="text-sm text-gray-500">Total Jobs</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search jobs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="w-full py-2 px-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              className="w-full py-2 px-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <select
              className="w-full py-2 px-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
              <option value="lead">Lead Level</option>
              <option value="executive">Executive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Grid/List */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Job Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{job.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {formatSalary(job)}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(job.status)}`}>
                    {formatStatus(job.status)}
                  </span>
                </div>

                {/* Job Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium capitalize">{job.type.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Level:</span>
                    <span className="font-medium capitalize">{job.experienceLevel} Level</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Applicants:</span>
                    <span className="font-medium">{job.applicantsCount || 0}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    Posted {new Date(job.postedDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditJob(job)}
                      className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                      title="Edit job"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job)}
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                      title="Delete job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs/${job.id}/ats`}
                      className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center ml-2"
                    >
                      View ATS <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posted
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{job.title}</div>
                        <div className="text-sm text-gray-500">{formatSalary(job)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {job.type.replace('-', ' ')} • {job.experienceLevel} Level
                      </div>
                      <div className="text-sm text-gray-500">{job.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(job.status)}`}>
                        {formatStatus(job.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {job.applicantsCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(job.postedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditJob(job)}
                          className="text-green-600 hover:text-green-700 p-1 hover:bg-green-50 rounded"
                          title="Edit job"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job)}
                          className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                          title="Delete job"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs/${job.id}/ats`}
                          className="text-purple-600 hover:text-purple-700 p-1 hover:bg-purple-50 rounded"
                          title="View ATS"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredJobs.length === 0 && !loading && (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-500 mb-4">
            {jobs.length === 0 
              ? "This department doesn't have any jobs yet." 
              : "Try adjusting your search or filter criteria."
            }
          </p>
          <button
            onClick={handleCreateJob}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create New Job
          </button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && jobToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete the job <span className="font-medium">{jobToDelete.title}</span>? This action cannot be undone.
            </p>
            
            {/* Display delete error if any */}
            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{deleteError}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                ) : (
                  <Trash2 className="h-5 w-5 mr-2" />
                )}
                {deleteLoading ? 'Deleting...' : 'Delete Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentJobsPage;

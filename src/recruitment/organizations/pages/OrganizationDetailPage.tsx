import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Users, Briefcase, Building, 
  MapPin, Search, Grid3X3, List, ChevronDown, ChevronUp, Clock
} from 'lucide-react';
import { useOrganizationDetailPageData } from '../../../hooks/useOrganizations';
import type { Department } from '../services/organizationApiService';
import type { Job } from '../../data/types';

const OrganizationDetailPage: React.FC = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [jobsSearchTerm, setJobsSearchTerm] = useState('');
  
  // Single optimized React Query hook that fetches all data at once
  const { 
    data: pageData, 
    isLoading: loading, 
    error 
  } = useOrganizationDetailPageData(organizationId || '');

  const organization = pageData?.organization;
  const departments = pageData?.departments || [];
  const allJobs = pageData?.jobs || [];
  const loadingJobs = loading; // Same loading state for all data
  const errorMessage = error?.message;

  // Filter departments
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Filter jobs
  const filteredJobs = allJobs.filter(job =>
    job.title.toLowerCase().includes(jobsSearchTerm.toLowerCase()) ||
    job.department.toLowerCase().includes(jobsSearchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(jobsSearchTerm.toLowerCase()) ||
    (job.skills && job.skills.some(skill => skill.toLowerCase().includes(jobsSearchTerm.toLowerCase())))
  );
  // Helper function to format job status
  const getJobStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to format dates
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(dateObj);
  };

  // Helper function to format salary
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

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading organization details...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !organization) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {errorMessage || 'Organization not found'}
          </h3>
          <p className="text-gray-500 mb-4">
            {errorMessage || "The organization you're looking for doesn't exist."}
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
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{organization.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link 
            to="/dashboard/organizations"
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl mr-4">
              {organization.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
              <p className="text-gray-600 mt-1">{organization.industry} • {organization.location}</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Link
            to={`/dashboard/organizations/${organizationId}/job-boards`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-purple-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Grid3X3 className="w-4 h-4 mr-2" />
            Manage Job Board
          </Link>
          <Link
            to="/dashboard/jobs/create"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Job
          </Link>
        </div>
      </div>

      {/* Organization Info */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <p className="text-gray-700 mb-4">{organization.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{organization.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Building className="w-4 h-4 mr-2" />
            <span>{organization.departmentCount} Departments</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Briefcase className="w-4 h-4 mr-2" />
            <span>{allJobs.length} Total Jobs</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            <span>{organization.totalEmployees.toLocaleString()} Employees</span>
          </div>
        </div>
      </div>

      {/* All Jobs Section */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={() => setShowAllJobs(!showAllJobs)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center">
              <Briefcase className="w-5 h-5 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                All Jobs ({allJobs.length})
              </h2>
            </div>
            {showAllJobs ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          <p className="text-gray-600 mt-1 ml-8">View all job openings across departments</p>
        </div>

        {showAllJobs && (
          <div className="p-6">
            {loadingJobs ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading jobs...</p>
              </div>
            ) : (
              <>
                {/* Search Jobs */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search jobs..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      value={jobsSearchTerm}
                      onChange={(e) => setJobsSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Jobs List */}
                {filteredJobs.length > 0 ? (
                  <div className="space-y-4">
                    {filteredJobs.map((job) => (
                      <Link
                        key={job.id}
                        to={`/dashboard/jobs/${job.id}/ats`}
                        className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJobStatusColor(job.status)}`}>
                                {job.status}
                              </span>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <Building className="w-4 h-4 mr-1" />
                              <span className="mr-4">{job.department}</span>
                              <MapPin className="w-4 h-4 mr-1" />
                              <span className="mr-4">{job.location}</span>
                              <Clock className="w-4 h-4 mr-1" />                              <span className="mr-4">{job.type}</span>
                              <Users className="w-4 h-4 mr-1" />
                              <span>{job.applicantsCount} applicants</span>
                            </div>

                            <div className="flex items-center justify-between">                              <div className="flex items-center text-sm text-gray-500">
                                <span>Posted: {formatDate(job.createdAt)}</span>
                                {job.applicationDeadline && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <span>Deadline: {formatDate(job.applicationDeadline)}</span>
                                  </>
                                )}
                              </div><div className="text-sm font-medium text-gray-900">
                                {formatSalary(job)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                      {jobsSearchTerm ? 'No jobs found matching your search' : 'No jobs found'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="w-full">
        {/* Departments */}
        <div>
          {/* Departments Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Departments</h2>
            
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

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search departments..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Departments Grid/List */}
          {view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDepartments.map((dept) => (
                <Link
                  key={dept.id}
                  to={`/dashboard/organizations/${organizationId}/departments/${dept.id}/jobs`}
                  className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <Briefcase className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{dept.name}</h3>
                        <p className="text-sm text-gray-500">Manager: {dept.manager}</p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{dept.description}</p>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Jobs: <span className="font-medium text-gray-900">{dept.totalJobs}</span></span>
                    <span className="text-gray-500">Employees: <span className="font-medium text-gray-900">{dept.totalEmployees}</span></span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Manager
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Active Jobs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employees
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDepartments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/dashboard/organizations/${organizationId}/departments/${dept.id}/jobs`}
                          className="flex items-center text-purple-600 hover:text-purple-700"
                        >
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                            <Briefcase className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{dept.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{dept.description}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dept.manager}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dept.totalJobs}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dept.totalEmployees}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}          {/* Empty State for Departments */}
          {filteredDepartments.length === 0 && (
            <div className="text-center py-8">
              <Building className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No departments found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationDetailPage;

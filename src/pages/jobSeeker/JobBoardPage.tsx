import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  DollarSign, 
  Users, 
  Search, 
  Filter,
  Building,
  Clock,
  ArrowRight,
  Briefcase,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { usePublishedJobs } from '../../hooks/usePublicJobs';
import { useAuthContext } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  formatSalaryRange,
  formatPostedDate,
  getExperienceBadgeColor,
  formatExperienceLevel,
  getJobTypeBadgeColor,
  getDeadlineStatus,
  truncateText
} from '../../utils/jobUtils';
import type { PublicJobFilters } from '../../services/publicJobApiService';

const JobBoardPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [remoteFilter, setRemoteFilter] = useState<boolean | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();

  // Build filters for API call
  const filters: PublicJobFilters = {
    page: currentPage,
    limit: 20,
    ...(searchTerm && { search: searchTerm }),
    ...(locationFilter && { location: locationFilter }),
    ...(typeFilter && { type: typeFilter as any }),
    ...(experienceFilter && { experienceLevel: experienceFilter }),
    ...(remoteFilter !== undefined && { remote: remoteFilter }),
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    // Filter for TAL platform jobs only
    talJobBoard: true,
  };

  const {
    data: jobsResponse,
    isLoading,
    error,
    refetch
  } = usePublishedJobs(filters);
  const handleApplyClick = (jobId: string) => {
    if (isAuthenticated) {
      // Redirect to job application page or dashboard
      navigate(`/dashboard/jobs/${jobId}/apply`);
    } else {
      // Redirect to job seeker login page with return URL
      navigate(`/job-seeker/login?returnTo=/jobs/${jobId}/apply`);
    }
  };

  const handleClearFilters = () => {
    setLocationFilter('');
    setTypeFilter('');
    setExperienceFilter('');
    setRemoteFilter(undefined);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get jobs from response
  const jobs = jobsResponse?.jobs || [];
  const totalJobs = jobsResponse?.total || 0;
  const totalPages = Math.ceil(totalJobs / (filters.limit || 20));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading available positions...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className=" text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Dream Job on TAL
            </h1>
            <p className="text-xl mb-8 text-purple-600">
              Discover amazing opportunities from companies using the TAL platform
            </p>
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search for jobs, skills, or companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none ring-2 ring-purple-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-gray-600 font-medium">
                {totalJobs} job{totalJobs !== 1 ? 's' : ''} found
              </span>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Filter Controls */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, Remote"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  >
                    <option value="">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Level
                  </label>
                  <select
                    value={experienceFilter}
                    onChange={(e) => setExperienceFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  >
                    <option value="">All Levels</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remote Work
                  </label>
                  <select
                    value={remoteFilter === undefined ? '' : remoteFilter.toString()}
                    onChange={(e) => {
                      const value = e.target.value;
                      setRemoteFilter(value === '' ? undefined : value === 'true');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  >
                    <option value="">All Options</option>
                    <option value="true">Remote Only</option>
                    <option value="false">On-site Only</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleClearFilters}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Jobs List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Jobs</h3>
              <p className="text-red-600 mb-4">
                We couldn't load the job listings. Please try again.
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {!error && jobs.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters to find more opportunities.
            </p>
          </div>
        )}

        {!error && jobs.length > 0 && (
          <div className="space-y-6">
            {jobs.map((job) => {
              const deadlineStatus = getDeadlineStatus(job.applicationDeadline);
              
              return (
                <div
                  key={job.id}
                  className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="text-xl font-semibold text-gray-900 hover:text-purple-600 transition-colors"
                        >
                          {job.title}
                        </Link>
                        <div className="flex gap-2 ml-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            TAL Platform
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getExperienceBadgeColor(job.experienceLevel)}`}>
                            {formatExperienceLevel(job.experienceLevel)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getJobTypeBadgeColor(job.type)}`}>
                            {job.type}
                          </span>
                          {job.remote && (
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                              Remote
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-3">
                        {job.clientName && (
                          <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                            <Building className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-blue-700">{job.clientName}</span>
                          </div>
                        )}
                        {job.departmentDetails && (
                          <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                            <span className="text-green-600 font-medium">{job.departmentDetails.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatSalaryRange(job)}</span>
                        </div>
                        {job.applicationDeadline && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span className={
                              deadlineStatus.status === 'expired' ? 'text-red-600' :
                              deadlineStatus.status === 'warning' ? 'text-yellow-600' :
                              'text-gray-600'
                            }>
                              {deadlineStatus.text}
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-gray-700 mb-4">
                        {truncateText(job.description || '', 200)}
                      </p>

                      {/* Skills */}
                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills.slice(0, 5).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
                              +{job.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatPostedDate(job.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{job.applicantsCount} applicant{job.applicantsCount !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 lg:mt-0 lg:ml-6 flex-shrink-0 flex gap-3">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        View Details
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleApplyClick(job.id)}
                        disabled={deadlineStatus.status === 'expired'}
                        className={`px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium ${
                          deadlineStatus.status === 'expired'
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        {deadlineStatus.status === 'expired' ? 'Expired' : 'Apply Now'}
                        {deadlineStatus.status !== 'expired' && <ArrowRight className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!error && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                const pageNum = Math.max(1, currentPage - 2) + index;
                if (pageNum > totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 border rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default JobBoardPage;

import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Filter,
  Search,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Heart,
  HeartOff
} from 'lucide-react';
import { useJobs } from '../../../../hooks/useJobs';
import { useOrganizations } from '../../../../recruitment/organizations/hooks/useOrganizations';
import JobDetailModal from './JobDetailModal';
import type { Job } from '../../../../recruitment/data/types';
import type { JobFilters as ApiJobFilters } from '../../../../services/jobApiService';

interface JobFilters {
  search: string;
  type: string;
  location: string;
  salaryMin: string;
  salaryMax: string;
  remote: string;
}

const AllJobsTab: React.FC = () => {
  const [filters, setFilters] = useState<JobFilters>({
    search: '',
    type: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    remote: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Build query filters for the API
  const queryFilters: ApiJobFilters = {
    search: filters.search || undefined,
    type: filters.type ? filters.type as 'Full-time' | 'Part-time' | 'Contract' | 'Internship' : undefined,
    location: filters.location || undefined,
    remote: filters.remote === 'true' ? true : filters.remote === 'false' ? false : undefined,
    status: 'Published' as const,
    page: 1,
    limit: 20
  };

  const { data: jobsResponse, isLoading, error } = useJobs(queryFilters);
  const { data: organizations } = useOrganizations();
  const jobs = jobsResponse?.data || [];

  // Create a map of organization IDs to organization names for quick lookup
  const organizationMap = useMemo(() => {
    const map = new Map();
    if (organizations) {
      organizations.forEach(org => {
        map.set(org.id, org.name);
      });
    }
    return map;
  }, [organizations]);

  const getOrganizationName = (organizationId?: string) => {
    if (!organizationId) return 'Company Name';
    return organizationMap.get(organizationId) || organizationId;
  };

  const handleFilterChange = (key: keyof JobFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      location: '',
      salaryMin: '',
      salaryMax: '',
      remote: ''
    });
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const handleApplyToJob = (jobId: string) => {
    setAppliedJobs(prev => new Set(prev).add(jobId));
    // Close modal if it's open
    if (selectedJobId === jobId) {
      setSelectedJobId(null);
    }
    // Here you would typically make an API call to apply to the job
    // For now, we'll just update the local state
  };

  const handleViewDetails = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  const formatSalary = (min?: number | string, max?: number | string, currency = 'USD') => {
    const minNum = typeof min === 'string' ? parseFloat(min) : min;
    const maxNum = typeof max === 'string' ? parseFloat(max) : max;
    
    if (!minNum && !maxNum) return 'Salary not specified';
    if (minNum && maxNum) return `$${minNum.toLocaleString()} - $${maxNum.toLocaleString()}`;
    if (minNum) return `From $${minNum.toLocaleString()}`;
    if (maxNum) return `Up to $${maxNum.toLocaleString()}`;
    return 'Salary not specified';
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading jobs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="text-red-500 text-lg mb-2">Error loading jobs</div>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Jobs</h1>
            <p className="text-gray-600 mt-1">
              {jobsResponse?.total || 0} jobs available
            </p>
          </div>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters
                  ? 'bg-purple-100 border-purple-300 text-purple-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="City, State"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remote Work
                </label>
                <select
                  value={filters.remote}
                  onChange={(e) => handleFilterChange('remote', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="true">Remote</option>
                  <option value="false">On-site</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">
              {filters.search || filters.type || filters.location
                ? 'Try adjusting your search criteria or filters.'
                : 'Check back later for new job opportunities.'}
            </p>
          </div>
        ) : (
          jobs.map((job: Job) => (
            <div key={job.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {job.title}
                      </h3>
                      <p className="text-lg text-gray-700 font-medium">
                        {getOrganizationName(job.organizationId)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => toggleSaveJob(job.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          savedJobs.has(job.id)
                            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={savedJobs.has(job.id) ? 'Remove from saved jobs' : 'Save job'}
                      >
                        {savedJobs.has(job.id) ? (
                          <BookmarkCheck className="h-5 w-5" />
                        ) : (
                          <Bookmark className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location || 'Location not specified'}</span>
                      {job.remote && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                          Remote
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Briefcase className="h-4 w-4" />
                      <span>{job.type || 'Full-time'}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatSalary(job.salaryMin, job.salaryMax, job.currency)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Posted {formatDate(job.createdAt)}</span>
                    </div>
                  </div>

                  {job.description && (
                    <div className="text-gray-700 mb-4">
                      <p className="line-clamp-2">
                        {job.description.length > 200 
                          ? `${job.description.substring(0, 200)}...` 
                          : job.description}
                      </p>
                    </div>
                  )}

                  {job.skills && Array.isArray(job.skills) && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills.slice(0, 5).map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 5 && (
                        <span className="text-gray-500 text-xs px-2 py-1">
                          +{job.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 lg:w-48">
                  <button
                    onClick={() => handleApplyToJob(job.id)}
                    disabled={appliedJobs.has(job.id)}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                      appliedJobs.has(job.id)
                        ? 'bg-green-100 text-green-800 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {appliedJobs.has(job.id) ? 'Applied' : 'Apply Now'}
                  </button>
                  
                  <button
                    onClick={() => handleViewDetails(job.id)}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {jobs.length > 0 && jobsResponse && jobs.length < jobsResponse.total && (
        <div className="text-center">
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Load More Jobs
          </button>
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJobId && (
        <JobDetailModal
          jobId={selectedJobId}
          isOpen={!!selectedJobId}
          onClose={() => setSelectedJobId(null)}
          onApply={handleApplyToJob}
          onSave={toggleSaveJob}
          isApplied={appliedJobs.has(selectedJobId)}
          isSaved={savedJobs.has(selectedJobId)}
        />
      )}
    </div>
  );
};

export default AllJobsTab;

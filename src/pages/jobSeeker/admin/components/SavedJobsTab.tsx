import React, { useState, useMemo } from 'react';
import { 
  Building,
  MapPin,
  Briefcase,
  DollarSign,
  Bookmark,
  ExternalLink,
  Clock,
  BookmarkCheck
} from 'lucide-react';
import { useSavedJobs, useRemoveSavedJob, useApplyToJob, useJobApplications, useWithdrawApplication } from '../../../../hooks/useJobSeekerProfile';
import { useOrganizations } from '../../../../recruitment/organizations/hooks/useOrganizations';
import { useToast } from '../../../../hooks/useToast';
import JobDetailModal from './JobDetailModal';
import type { Job } from '../../../../recruitment/data/types';

const SavedJobsTab: React.FC = () => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState<{
    removing: Set<string>;
    applying: Set<string>;
    withdrawing: Set<string>;
  }>({
    removing: new Set(),
    applying: new Set(),
    withdrawing: new Set()
  });
  
  const { data: savedJobsData, isLoading, error } = useSavedJobs();
  const { data: applications = [] } = useJobApplications();
  const { data: organizations } = useOrganizations();
  const removeSavedJobMutation = useRemoveSavedJob();
  const applyToJobMutation = useApplyToJob();
  const withdrawApplicationMutation = useWithdrawApplication();
  const { showToast } = useToast();

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

  // Create a set of applied job IDs for quick lookup
  const appliedJobIds = useMemo(() => {
    const jobIds = new Set<string>();
    if (applications && Array.isArray(applications)) {
      applications.forEach(application => {
        // Check multiple ways to get the job ID from the application
        const jobId = application.jobId || application.job?.id || application.id;
        if (jobId) jobIds.add(jobId);
      });
    }
    return jobIds;
  }, [applications]);

  // Create a mapping from jobId to applicationId for withdrawing applications
  const jobIdToApplicationId = useMemo(() => {
    const map = new Map<string, string>();
    if (applications && Array.isArray(applications)) {
      applications.forEach(application => {
        const jobId = application.jobId || application.job?.id;
        const applicationId = application.id;
        if (jobId && applicationId) {
          map.set(jobId, applicationId);
        }
      });
    }
    return map;
  }, [applications]);

  const getOrganizationName = (organizationId?: string) => {
    if (!organizationId) return 'Company Name';
    return organizationMap.get(organizationId) || organizationId;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const handleRemoveSavedJob = async (jobId: string) => {
    setLoadingStates(prev => ({
      ...prev,
      removing: new Set([...prev.removing, jobId])
    }));

    try {
      await removeSavedJobMutation.mutateAsync(jobId);
      showToast('Job removed from saved jobs', 'success');
    } catch (error) {
      console.error('Error removing saved job:', error);
      showToast('Failed to remove job. Please try again.', 'error');
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        removing: new Set([...prev.removing].filter(id => id !== jobId))
      }));
    }
  };

  const handleApplyToJob = async (jobId: string) => {
    setLoadingStates(prev => ({
      ...prev,
      applying: new Set([...prev.applying, jobId])
    }));

    try {
      await applyToJobMutation.mutateAsync({ jobId });
      showToast('Application submitted successfully!', 'success');
    } catch (error) {
      console.error('Error applying to job:', error);
      showToast('Failed to submit application. Please try again.', 'error');
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        applying: new Set([...prev.applying].filter(id => id !== jobId))
      }));
    }
  };

  const handleWithdrawApplication = async (jobId: string) => {
    const applicationId = jobIdToApplicationId.get(jobId);
    if (!applicationId) {
      showToast('Application ID not found. Please refresh and try again.', 'error');
      return;
    }

    setLoadingStates(prev => ({
      ...prev,
      withdrawing: new Set([...prev.withdrawing, jobId])
    }));

    try {
      await withdrawApplicationMutation.mutateAsync(applicationId);
      showToast('Application withdrawn successfully!', 'success');
    } catch (error) {
      console.error('Error withdrawing application:', error);
      showToast('Failed to withdraw application. Please try again.', 'error');
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        withdrawing: new Set([...prev.withdrawing].filter(id => id !== jobId))
      }));
    }
  };

  const handleViewDetails = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading saved jobs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="text-red-500 text-lg mb-2">Error loading saved jobs</div>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  const savedJobs = savedJobsData || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
        <p className="text-gray-600">Jobs you've saved for later ({savedJobs.length} jobs)</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="space-y-4">
            {savedJobs.map((savedJob) => {
              // Handle both job objects and job references with nested job data
              const job = savedJob.job || savedJob;
              return (
                <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                      <p className="text-lg text-gray-700 font-medium mb-3">
                        {getOrganizationName(job.organizationId)}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <div key="location" className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location || 'Location not specified'}</span>
                          {job.remote && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium ml-2">
                              Remote
                            </span>
                          )}
                        </div>
                        
                        <div key="type" className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          <span>{job.type || 'Full-time'}</span>
                        </div>
                        
                        <div key="salary" className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatSalary(job.salaryMin, job.salaryMax, job.currency)}</span>
                        </div>
                        
                        <div key="posted" className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Posted {formatDate(job.createdAt)}</span>
                        </div>
                      </div>

                      {job.description && (
                        <div className="text-gray-700 mb-3">
                          <p className="line-clamp-2">
                            {job.description.length > 150 
                              ? `${job.description.substring(0, 150)}...` 
                              : job.description}
                          </p>
                        </div>
                      )}

                      {job.skills && Array.isArray(job.skills) && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {job.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 3 && (
                            <span className="text-gray-500 text-xs px-2 py-1">
                              +{job.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 lg:mt-0 lg:ml-6 flex-shrink-0 flex flex-col space-y-2 lg:w-48">
                      {appliedJobIds.has(job.id) ? (
                        <button 
                          key="withdraw"
                          onClick={() => handleWithdrawApplication(job.id)}
                          disabled={loadingStates.withdrawing.has(job.id)}
                          className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                            loadingStates.withdrawing.has(job.id)
                              ? 'bg-red-300 text-white cursor-not-allowed'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          {loadingStates.withdrawing.has(job.id) ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                              <span>Withdrawing...</span>
                            </div>
                          ) : (
                            'Withdraw Application'
                          )}
                        </button>
                      ) : (
                        <button 
                          key="apply"
                          onClick={() => handleApplyToJob(job.id)}
                          disabled={loadingStates.applying.has(job.id)}
                          className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                            loadingStates.applying.has(job.id)
                              ? 'bg-purple-300 text-white cursor-not-allowed'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                        >
                          {loadingStates.applying.has(job.id) ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                              <span>Applying...</span>
                            </div>
                          ) : (
                            'Apply Now'
                          )}
                        </button>
                      )}
                      
                      <button 
                        key="details"
                        onClick={() => handleViewDetails(job.id)}
                        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                      
                      <button 
                        key="remove"
                        onClick={() => handleRemoveSavedJob(job.id)}
                        className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center space-x-2"
                      >
                        <BookmarkCheck className="h-4 w-4" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {savedJobs.length === 0 && (
              <div className="text-center py-12">
                <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No saved jobs yet</h3>
                <p className="text-gray-600 mb-4">Save jobs you're interested in to view them here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Detail Modal */}
      {selectedJobId && (
        <JobDetailModal
          jobId={selectedJobId}
          isOpen={!!selectedJobId}
          onClose={() => setSelectedJobId(null)}
          onApply={handleApplyToJob}
          onWithdraw={handleWithdrawApplication}
          onSave={handleRemoveSavedJob}
          isApplied={appliedJobIds.has(selectedJobId)}
          isSaved={true}
          isApplying={loadingStates.applying.has(selectedJobId)}
          isWithdrawing={loadingStates.withdrawing.has(selectedJobId)}
        />
      )}
    </div>
  );
};

export default SavedJobsTab;

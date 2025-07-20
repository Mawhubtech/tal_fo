import React, { useState, useMemo } from 'react';
import { 
  Building,
  MapPin,
  Briefcase,
  DollarSign,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  FileText,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useJobApplications, useWithdrawApplication } from '../../../../hooks/useJobSeekerProfile';
import { useOrganizations } from '../../../../recruitment/organizations/hooks/useOrganizations';
import { useToast } from '../../../../hooks/useToast';
import JobDetailModal from './JobDetailModal';

type ApplicationStatus = 'pending' | 'reviewing' | 'interview' | 'rejected' | 'accepted' | 'Applied' | 'Screening' | 'Phone Interview' | 'Technical Interview' | 'Final Interview' | 'Offer Extended' | 'Hired' | 'Rejected' | 'Withdrawn';

const ApplicationsTab: React.FC = () => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [withdrawingApplications, setWithdrawingApplications] = useState<Set<string>>(new Set());
  
  const { data: applicationsData = [], isLoading, error } = useJobApplications();
  const { data: organizations } = useOrganizations();
  const withdrawApplicationMutation = useWithdrawApplication();
  const { showToast } = useToast();

  // Create a map of organization IDs to organization names for quick lookup
  const organizationMap = useMemo(() => {
    const map = new Map();
    if (organizations && Array.isArray(organizations)) {
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

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
      case 'Applied':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewing':
      case 'Screening':
        return 'bg-blue-100 text-blue-800';
      case 'interview':
      case 'Phone Interview':
      case 'Technical Interview':
      case 'Final Interview':
        return 'bg-purple-100 text-purple-800';
      case 'Offer Extended':
        return 'bg-indigo-100 text-indigo-800';
      case 'accepted':
      case 'Hired':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Withdrawn':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'accepted':
      case 'Hired':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
      case 'Rejected':
      case 'Withdrawn':
        return <XCircle className="h-4 w-4" />;
      case 'interview':
      case 'Phone Interview':
      case 'Technical Interview':
      case 'Final Interview':
        return <Calendar className="h-4 w-4" />;
      case 'Offer Extended':
        return <FileText className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
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
    
    if (!minNum && !maxNum) return null;
    if (minNum && maxNum) return `$${minNum.toLocaleString()} - $${maxNum.toLocaleString()}`;
    if (minNum) return `From $${minNum.toLocaleString()}`;
    if (maxNum) return `Up to $${maxNum.toLocaleString()}`;
    return null;
  };

  const handleViewDetails = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  const handleWithdrawApplication = async (applicationId: string) => {
    setWithdrawingApplications(prev => new Set([...prev, applicationId]));

    try {
      await withdrawApplicationMutation.mutateAsync(applicationId);
      showToast('Application withdrawn successfully!', 'success');
    } catch (error) {
      console.error('Error withdrawing application:', error);
      showToast('Failed to withdraw application. Please try again.', 'error');
    } finally {
      setWithdrawingApplications(prev => {
        const newSet = new Set(prev);
        newSet.delete(applicationId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="text-red-500 text-lg mb-2">Error loading applications</div>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  const applications = Array.isArray(applicationsData) ? applicationsData : [];

  // Check if application can be withdrawn (not rejected, hired, or already withdrawn)
  const canWithdrawApplication = (status: string) => {
    const nonWithdrawableStatuses = ['Rejected', 'Hired', 'Withdrawn'];
    return !nonWithdrawableStatuses.includes(status);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600">Track your job applications and their status ({applications.length} applications)</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="space-y-4">
            {applications.map((application) => {
              // Handle both application objects and applications with nested job data
              const job = application.job || application;
              const applicationStatus = application.status || 'pending';
              
              return (
                <div key={application.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {job.title || application.jobTitle}
                          </h3>
                          <p className="text-lg text-gray-700 font-medium">
                            {getOrganizationName(job.organizationId) || application.company}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(applicationStatus as ApplicationStatus)}`}>
                          {getStatusIcon(applicationStatus as ApplicationStatus)}
                          <span className="ml-1">{applicationStatus}</span>
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location || application.location || 'Location not specified'}</span>
                          {job.remote && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium ml-2">
                              Remote
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          <span>{job.type || application.type || 'Full-time'}</span>
                        </div>
                        
                        {(job.salaryMin || job.salaryMax || application.salary) && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>
                              {formatSalary(job.salaryMin, job.salaryMax, job.currency) || application.salary}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Applied {formatDate(application.appliedDate || application.createdAt)}</span>
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
                    
                    <div className="mt-4 lg:mt-0 lg:ml-6 flex-shrink-0 lg:w-48">
                      <div className="flex flex-col space-y-2">
                        <button 
                          onClick={() => handleViewDetails(job.id)}
                          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                        
                        {canWithdrawApplication(application.status) && (
                          <button 
                            onClick={() => handleWithdrawApplication(application.id)}
                            disabled={withdrawingApplications.has(application.id)}
                            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                              withdrawingApplications.has(application.id)
                                ? 'bg-red-300 text-white cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                          >
                            {withdrawingApplications.has(application.id) ? (
                              <>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                <span>Withdrawing...</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4" />
                                <span>Withdraw</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {applications.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-600 mb-4">Start applying to jobs to see them here</p>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-all-jobs'))}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Browse Jobs
                </button>
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
          onApply={() => {}}
          onWithdraw={() => {}}
          onSave={() => {}}
          isApplied={true}
          isSaved={false}
          isApplying={false}
          isWithdrawing={false}
        />
      )}
    </div>
  );
};

export default ApplicationsTab;

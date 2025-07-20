import React, { useState } from 'react';
import { 
  X,
  MapPin, 
  DollarSign, 
  Users, 
  Building,
  Clock,
  Briefcase,
  Calendar,
  CheckCircle,
  AlertCircle,
  Share2,
  BookmarkPlus,
  ExternalLink
} from 'lucide-react';
import { useJob } from '../../../../hooks/useJobs';
import { useOrganizations } from '../../../../recruitment/organizations/hooks/useOrganizations';
import type { Job } from '../../../../recruitment/data/types';

// Create a simple salary formatter since the utils expect PublicJob
const formatSalary = (min?: number | string, max?: number | string, currency = 'USD') => {
  const minNum = typeof min === 'string' ? parseFloat(min) : min;
  const maxNum = typeof max === 'string' ? parseFloat(max) : max;
  
  if (!minNum && !maxNum) return 'Competitive salary';
  const symbol = currency === 'USD' ? '$' : currency;
  if (minNum && maxNum) return `${symbol}${minNum.toLocaleString()} - ${symbol}${maxNum.toLocaleString()}`;
  if (minNum) return `From ${symbol}${minNum.toLocaleString()}`;
  if (maxNum) return `Up to ${symbol}${maxNum.toLocaleString()}`;
  return 'Competitive salary';
};

// Simple date formatter
const formatDate = (date: string | Date) => {
  const d = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - d.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
};

// Simple deadline status
const getSimpleDeadlineStatus = (deadline?: Date | string) => {
  if (!deadline) return { status: 'active' as const, text: 'No deadline' };
  
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { status: 'expired' as const, text: 'Expired' };
  if (diffDays <= 7) return { status: 'warning' as const, text: `${diffDays} days left` };
  return { status: 'active' as const, text: `${diffDays} days left` };
};

const getJobTypeBadgeColor = (jobType: string): string => {
  switch (jobType?.toLowerCase()) {
    case 'full-time': return 'bg-blue-100 text-blue-800';
    case 'part-time': return 'bg-green-100 text-green-800';
    case 'contract': return 'bg-yellow-100 text-yellow-800';
    case 'internship': return 'bg-pink-100 text-pink-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getExperienceBadgeColor = (exp: string): string => {
  switch (exp?.toLowerCase()) {
    case 'entry': case 'junior': case 'entry level': return 'bg-green-100 text-green-800';
    case 'mid': case 'intermediate': case 'mid level': return 'bg-blue-100 text-blue-800';
    case 'senior': case 'senior level': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const generateJobShareUrl = (jobId: string): string => {
  return `${window.location.origin}/jobs/${jobId}`;
};

// Helper function to parse comma-separated strings into arrays
const parseStringToArray = (str?: string): string[] => {
  if (!str || typeof str !== 'string') return [];
  return str.split(',').map(item => item.trim()).filter(item => item.length > 0);
};

interface JobDetailModalProps {
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
  onApply?: (jobId: string) => void;
  onWithdraw?: (jobId: string) => void;
  onSave?: (jobId: string) => void;
  isApplied?: boolean;
  isSaved?: boolean;
  isApplying?: boolean;
  isWithdrawing?: boolean;
}

const JobDetailModal: React.FC<JobDetailModalProps> = ({
  jobId,
  isOpen,
  onClose,
  onApply,
  onWithdraw,
  onSave,
  isApplied = false,
  isSaved = false,
  isApplying = false,
  isWithdrawing = false
}) => {
  const [copied, setCopied] = useState(false);
  
  const {
    data: job,
    isLoading,
    error
  } = useJob(jobId);

  const { data: organizations } = useOrganizations();

  // Get organization name
  const getOrganizationName = (organizationId?: string) => {
    if (!organizationId) return 'Company Name';
    if (!organizations) return organizationId;
    const org = organizations.find(o => o.id === organizationId);
    return org?.name || organizationId;
  };

  if (!isOpen) return null;

  const handleShare = async () => {
    if (job) {
      const shareUrl = generateJobShareUrl(job.id);
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleBackdropClick}>
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleBackdropClick}>
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Job Not Found</h2>
            <p className="text-gray-600 mb-6">
              The job details could not be loaded.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const deadlineStatus = getSimpleDeadlineStatus(job.applicationDeadline);
  const isExpired = deadlineStatus.status === 'expired';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Job Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Job Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {job.title}
                </h1>
                
                <div className="flex items-center gap-2 mb-4">
                  <Building className="h-5 w-5 text-gray-400" />
                  <span className="text-lg text-gray-700 font-medium">
                    {getOrganizationName(job.organizationId)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                    {job.remote && (
                      <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Remote
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getJobTypeBadgeColor(job.type)}`}>
                      {job.type}
                    </span>
                  </div>
                  
                  {job.experienceLevel && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getExperienceBadgeColor(job.experienceLevel)}`}>
                        {job.experienceLevel}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col lg:items-end gap-3">
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(job.createdAt)}
                  </div>
                </div>

                {job.applicationDeadline && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className={`text-sm ${
                      deadlineStatus.status === 'expired' 
                        ? 'text-red-600' 
                        : deadlineStatus.status === 'warning' 
                        ? 'text-yellow-600' 
                        : 'text-gray-600'
                    }`}>
                      {deadlineStatus.text}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            {isApplied ? (
              <button
                onClick={() => onWithdraw?.(job.id)}
                disabled={isWithdrawing}
                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                  isWithdrawing
                    ? 'bg-red-300 text-white cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isWithdrawing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Withdrawing...
                  </>
                ) : (
                  'Withdraw Application'
                )}
              </button>
            ) : (
              <button
                onClick={() => onApply?.(job.id)}
                disabled={isExpired || isApplying}
                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                  isExpired
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isApplying
                    ? 'bg-purple-300 text-white cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isApplying ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Applying...
                  </>
                ) : isExpired ? (
                  'Application Closed'
                ) : (
                  'Apply Now'
                )}
              </button>
            )}

            <button
              onClick={() => onSave?.(job.id)}
              className={`px-4 py-3 rounded-lg border font-medium flex items-center gap-2 transition-colors ${
                isSaved
                  ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BookmarkPlus className="h-4 w-4" />
              {isSaved ? 'Saved' : 'Save Job'}
            </button>

            <button
              onClick={handleShare}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              {copied ? 'Copied!' : 'Share'}
            </button>

            <a
              href={`/jobs/${job.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
            </a>
          </div>

          {/* Job Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Job Description
                </h3>
                <div className="text-gray-700 prose prose-sm max-w-none">
                  {job.description ? (
                    <div dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br />') }} />
                  ) : (
                    <p>No description available for this position.</p>
                  )}
                </div>
              </div>

              {/* Responsibilities */}
              {job.responsibilities && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Responsibilities
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {(Array.isArray(job.responsibilities) ? job.responsibilities : parseStringToArray(job.responsibilities)).map((responsibility, index) => (
                      <li key={index}>{responsibility}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {job.requirements && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Requirements
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {(Array.isArray(job.requirements) ? job.requirements : parseStringToArray(job.requirements)).map((requirement, index) => (
                      <li key={index}>{requirement}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {job.benefits && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Benefits
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {(Array.isArray(job.benefits) ? job.benefits : parseStringToArray(job.benefits)).map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Skills */}
              {job.skills && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(job.skills) ? job.skills : parseStringToArray(job.skills)).map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Job Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Job Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Department:</span>
                    <span className="text-gray-900 font-medium">{job.department}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Job Type:</span>
                    <span className="text-gray-900 font-medium">{job.type}</span>
                  </div>
                  
                  {job.experienceLevel && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience:</span>
                      <span className="text-gray-900 font-medium">
                        {job.experienceLevel}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Remote Work:</span>
                    <span className="text-gray-900 font-medium">
                      {job.remote ? 'Yes' : 'No'}
                    </span>
                  </div>
                  
                    <div className="flex justify-between">
                      <span className="text-gray-600">Posted:</span>
                      <span className="text-gray-900 font-medium">
                        {formatDate(job.createdAt)}
                      </span>
                    </div>                  {job.applicationDeadline && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deadline:</span>
                      <span className={`font-medium ${
                        deadlineStatus.status === 'expired' 
                          ? 'text-red-600' 
                          : deadlineStatus.status === 'warning' 
                          ? 'text-yellow-600' 
                          : 'text-gray-900'
                      }`}>
                        {new Date(job.applicationDeadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;

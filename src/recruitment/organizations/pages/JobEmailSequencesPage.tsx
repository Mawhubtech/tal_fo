import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Mail, Eye, Settings, Users, Play, Pause, Archive, AlertCircle } from 'lucide-react';
import { useJob, useJobBySlug } from '../../../hooks/useJobs';
import { useExternalJobDetail } from '../../../hooks/useExternalJobs';
import { useEmailSequences, useUpdateEmailSequence } from '../../../hooks/useEmailSequences';
import { useAuthContext } from '../../../contexts/AuthContext';
import { isExternalUser } from '../../../utils/userUtils';
import { createJobUrl } from '../../../lib/urlUtils';
import ConfirmationModal from '../../../components/ConfirmationModal';

const JobEmailSequencesPage: React.FC = () => {
  const { slug, jobId } = useParams<{ 
    slug?: string;
    jobId?: string; 
  }>();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  // State for confirmation modals
  const [sequenceToActivate, setSequenceToActivate] = useState<string | null>(null);
  const [sequenceToDeactivate, setSequenceToDeactivate] = useState<string | null>(null);

  // Determine if current user is external and use appropriate hook
  const isExternal = isExternalUser(user);
  
  // Get job data to derive organizationId
  // Use slug-based lookup for protected routes, jobId for external routes
  const { data: job, isLoading, error } = isExternal 
    ? useJob(jobId || '') 
    : useJobBySlug(slug || '');
    
  const organizationId = job?.organizationId;
  const departmentId = job?.departmentId;
  const effectiveJobId = job?.id; // Get the actual UUID for filtering
  
  const { 
    data: externalJob, 
    isLoading: externalJobLoading, 
    error: externalJobError 
  } = useExternalJobDetail(isExternal ? (jobId || '') : '');

  // Get email sequences for this job - filter by jobId on backend
  const { data: sequences, isLoading: sequencesLoading, refetch } = useEmailSequences({
    organizationId: organizationId,
    category: 'recruitment' as any,
    isActive: true,
    jobId: effectiveJobId // Add jobId filter
  });

  // Mutation for updating sequences
  const updateSequenceMutation = useUpdateEmailSequence();

  // Use the appropriate data based on user type
  const effectiveJob = isExternal ? externalJob : job;
  const effectiveLoading = isExternal ? externalJobLoading : isLoading;
  const effectiveError = isExternal ? externalJobError : error;

  if (effectiveLoading || sequencesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (effectiveError || !effectiveJob) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4">The job you're looking for doesn't exist.</p>
          <Link
            to={isExternal 
              ? "/external/jobs"
              : "/my-jobs"
            }
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-red-100 text-red-800'
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      active: <Play className="h-4 w-4" />,
      inactive: <Pause className="h-4 w-4" />,
      draft: <Settings className="h-4 w-4" />,
      archived: <Archive className="h-4 w-4" />
    };
    return icons[status as keyof typeof icons] || icons.draft;
  };

  // Handler functions for sequence actions
  const handleActivateSequence = async (sequenceId: string) => {
    try {
      await updateSequenceMutation.mutateAsync({
        id: sequenceId,
        data: { status: 'active' }
      });
      await refetch();
      setSequenceToActivate(null);
    } catch (error) {
      console.error('Failed to activate sequence:', error);
    }
  };

  const handleDeactivateSequence = async (sequenceId: string) => {
    try {
      await updateSequenceMutation.mutateAsync({
        id: sequenceId,
        data: { status: 'inactive' }
      });
      await refetch();
      setSequenceToDeactivate(null);
    } catch (error) {
      console.error('Failed to deactivate sequence:', error);
    }
  };

  const handleViewSequence = (sequenceId: string) => {
    const url = isExternal 
      ? `/external/jobs/${jobId}/email-sequences/${sequenceId}`
      : `/jobs/${slug}/email-sequences/${sequenceId}`;
    navigate(url);
  };

  const handleManageSteps = (sequenceId: string) => {
    const url = isExternal 
      ? `/external/jobs/${jobId}/email-sequences/${sequenceId}/steps`
      : `/jobs/${slug}/email-sequences/${sequenceId}/steps`;
    navigate(url);
  };

  const handleViewEnrollments = (sequenceId: string) => {
    const url = isExternal 
      ? `/external/jobs/${jobId}/email-sequences/${sequenceId}/enrollments`
      : `/jobs/${slug}/email-sequences/${sequenceId}/enrollments`;
    navigate(url);
  };

  // Construct the back URL based on user type
  const backUrl = isExternal 
    ? `/external/jobs/${jobId}`
    : (slug && effectiveJob ? createJobUrl(effectiveJob.slug || '', effectiveJob.title || '') : '/my-jobs');

  return (
    <div className="p-6">
      {/* Breadcrumbs - Only show for internal users */}
      {!isExternal && effectiveJob && (
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link to="/my-jobs" className="hover:text-gray-700">Jobs</Link>
          <span className="mx-2">/</span>
          <Link to={backUrl} className="hover:text-gray-700">
            {effectiveJob.title}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Email Sequences</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to={backUrl}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to {isExternal ? 'Job' : 'ATS'}
          </Link>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{effectiveJob.title} - Email Sequences</h1>
            <p className="text-gray-600 mt-1">Manage outreach sequences for this job position</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              to={isExternal 
                ? `/external/jobs/${jobId}/email-templates`
                : `/jobs/${slug}/email-templates`
              }
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Templates
            </Link>
            <Link
              to={isExternal 
                ? `/external/jobs/${jobId}/email-sequences/create`
                : `/jobs/${slug}/email-sequences/create`
              }
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Sequence
            </Link>
          </div>
        </div>
      </div>

      {/* Email Sequences Content */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Email Sequences</h2>
          <p className="text-gray-600 text-sm mt-1">
            Manage automated email sequences for candidate outreach
          </p>
        </div>
        
        <div className="p-6">
          {sequencesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : sequences && sequences.data && sequences.data.length > 0 ? (
            <div className="space-y-4">
              {sequences.data.map((sequence) => (
                <div key={sequence.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">{/* No need to filter here anymore - backend filters by jobId */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{sequence.name}</h3>
                      {sequence.description && (
                        <p className="text-gray-600 text-sm mb-3">{sequence.description}</p>
                      )}
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(sequence.status)}`}>
                        {getStatusIcon(sequence.status)}
                        <span className="ml-1 capitalize">{sequence.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-lg font-semibold text-gray-900">{sequence.steps?.length || 0}</div>
                      <div className="text-xs text-gray-600">Steps</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-lg font-semibold text-blue-600">{sequence.usageCount || 0}</div>
                      <div className="text-xs text-gray-600">Used</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-lg font-semibold text-green-600">{sequence.responseRate || 0}%</div>
                      <div className="text-xs text-gray-600">Response Rate</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <div className="text-lg font-semibold text-purple-600">{sequence.category}</div>
                      <div className="text-xs text-gray-600">Category</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Start/Stop Button */}
                    {sequence.status === 'active' ? (
                      <button
                        onClick={() => setSequenceToDeactivate(sequence.id)}
                        className="inline-flex items-center px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 text-sm font-medium transition-colors"
                        title="Stop sequence"
                      >
                        <Pause className="w-4 h-4 mr-1" />
                        Stop
                      </button>
                    ) : sequence.status === 'inactive' || sequence.status === 'draft' ? (
                      <button
                        onClick={() => setSequenceToActivate(sequence.id)}
                        className="inline-flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium transition-colors"
                        title="Start sequence"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </button>
                    ) : null}

                    <button
                      onClick={() => handleViewSequence(sequence.id)}
                      className="inline-flex items-center px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </button>
                    
                    <button
                      onClick={() => handleManageSteps(sequence.id)}
                      className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Manage Steps
                    </button>

                    <button
                      onClick={() => handleViewEnrollments(sequence.id)}
                      className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium transition-colors"
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Enrollments
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No email sequences yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first email sequence to start automating candidate outreach for this job.
              </p>
              <Link
                to={isExternal 
                  ? `/external/jobs/${jobId}/email-sequences/create`
                  : `/jobs/${slug}/email-sequences/create`
                }
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Sequence
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={sequenceToActivate !== null}
        onClose={() => setSequenceToActivate(null)}
        onConfirm={() => sequenceToActivate && handleActivateSequence(sequenceToActivate)}
        title="Activate Email Sequence"
        message="Are you sure you want to activate this email sequence? Active sequences will start sending emails to enrolled candidates."
        confirmText="Activate"
      />

      <ConfirmationModal
        isOpen={sequenceToDeactivate !== null}
        onClose={() => setSequenceToDeactivate(null)}
        onConfirm={() => sequenceToDeactivate && handleDeactivateSequence(sequenceToDeactivate)}
        title="Deactivate Email Sequence"
        message="Are you sure you want to stop this email sequence? No new emails will be sent, but existing enrollments will remain."
        confirmText="Deactivate"
      />
    </div>
  );
};

export default JobEmailSequencesPage;

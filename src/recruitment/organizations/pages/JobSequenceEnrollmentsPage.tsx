import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useJob, useJobBySlug } from '../../../hooks/useJobs';
import { useExternalJobDetail } from '../../../hooks/useExternalJobs';
import { useEmailSequence } from '../../../hooks/useEmailSequences';
import { useAuthContext } from '../../../contexts/AuthContext';
import { isExternalUser } from '../../../utils/userUtils';
import { createJobUrl } from '../../../lib/urlUtils';
import EnrollmentManagement from '../components/EnrollmentManagement';

const JobSequenceEnrollmentsPage: React.FC = () => {
  const { slug, jobId, sequenceId } = useParams<{ 
    slug?: string;
    jobId?: string; 
    sequenceId: string; 
  }>();
  const { user } = useAuthContext();

  // Determine if current user is external
  const isExternal = isExternalUser(user);
  
  // Get job data using slug for internal users, jobId for external
  const { data: job, isLoading: jobLoading } = isExternal 
    ? useJob(jobId || '') 
    : useJobBySlug(slug || '');
    
  const organizationId = job?.organizationId;
  const departmentId = job?.departmentId;
  
  const { data: externalJob, isLoading: externalJobLoading } = useExternalJobDetail(isExternal ? (jobId || '') : '');
  const { data: sequence, isLoading: sequenceLoading } = useEmailSequence(sequenceId || '');

  // Use appropriate data
  const effectiveJob = isExternal ? externalJob : job;
  const effectiveJobLoading = isExternal ? externalJobLoading : jobLoading;

  // Construct URLs
  const backUrl = isExternal 
    ? `/external/jobs/${jobId}/email-sequences`
    : `/jobs/${slug}/email-sequences`;

  const sequenceDetailUrl = isExternal 
    ? `/external/jobs/${jobId}/email-sequences/${sequenceId}`
    : `/jobs/${slug}/email-sequences/${sequenceId}`;

  if (effectiveJobLoading || sequenceLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!effectiveJob || !sequence) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {!effectiveJob ? 'Job Not Found' : 'Sequence Not Found'}
          </h2>
          <p className="text-gray-600 mb-4">
            {!effectiveJob 
              ? 'The job you\'re looking for doesn\'t exist.' 
              : 'The email sequence you\'re looking for doesn\'t exist.'
            }
          </p>
          <Link
            to={backUrl}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Email Sequences
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumbs - Only show for internal users */}
      {!isExternal && effectiveJob && (
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link to="/my-jobs" className="hover:text-gray-700">Jobs</Link>
          <span className="mx-2">/</span>
          <Link to={createJobUrl(effectiveJob.slug || '', effectiveJob.title)} className="hover:text-gray-700">
            {effectiveJob.title}
          </Link>
          <span className="mx-2">/</span>
          <Link to={backUrl} className="hover:text-gray-700">
            Email Sequences
          </Link>
          <span className="mx-2">/</span>
          <Link to={sequenceDetailUrl} className="hover:text-gray-700">
            {sequence.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Enrollments</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to={sequenceDetailUrl}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Sequence
          </Link>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{sequence.name} - Enrollments</h1>
            <p className="text-gray-600 mt-1">
              Manage candidate enrollments for this email sequence
            </p>
          </div>
        </div>
      </div>

      {/* Sequence Info */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">{sequence.name}</h3>
              <p className="text-gray-600 text-sm">
                {sequence.type} • {sequence.category} • {effectiveJob.title}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Status</p>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              sequence.status === 'active' ? 'bg-green-100 text-green-800' :
              sequence.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {sequence.status}
            </span>
          </div>
        </div>
      </div>

      {/* Enrollment Management Component */}
      <EnrollmentManagement
        sequenceId={sequenceId || ''}
        jobId={jobId || ''}
        isExternal={isExternal}
        organizationId={organizationId}
        departmentId={departmentId}
      />
    </div>
  );
};

export default JobSequenceEnrollmentsPage;

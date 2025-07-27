import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Mail } from 'lucide-react';
import { useJob } from '../../../hooks/useJobs';
import { useExternalJobDetail } from '../../../hooks/useExternalJobs';
import { useAuthContext } from '../../../contexts/AuthContext';
import { isExternalUser } from '../../../utils/userUtils';

const JobEmailTemplatesPage: React.FC = () => {
  const { organizationId, departmentId, jobId } = useParams<{ 
    organizationId: string; 
    departmentId: string; 
    jobId: string; 
  }>();
  const { user } = useAuthContext();

  // Determine if current user is external and use appropriate hook
  const isExternal = isExternalUser(user);
  
  // Get job data
  const { data: job, isLoading, error } = useJob(jobId || '');
  const { 
    data: externalJob, 
    isLoading: externalJobLoading, 
    error: externalJobError 
  } = useExternalJobDetail(isExternal ? (jobId || '') : '');

  // Use the appropriate data based on user type
  const effectiveJob = isExternal ? externalJob : job;
  const effectiveLoading = isExternal ? externalJobLoading : isLoading;
  const effectiveError = isExternal ? externalJobError : error;

  if (effectiveLoading) {
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
              : `/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs`
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

  // Construct the back URL based on user type
  const backUrl = isExternal 
    ? `/external/jobs/${jobId}`
    : `/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs/${jobId}/email-sequences`;

  return (
    <div className="p-6">
      {/* Breadcrumbs - Only show for internal users */}
      {!isExternal && (
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <span className="mx-2">/</span>
          <Link to="/dashboard/organizations" className="hover:text-gray-700">Organizations</Link>
          <span className="mx-2">/</span>
          <Link to={`/dashboard/organizations/${organizationId}`} className="hover:text-gray-700">
            Organization
          </Link>
          <span className="mx-2">/</span>
          <Link to={`/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs`} className="hover:text-gray-700">
            {effectiveJob.department}
          </Link>
          <span className="mx-2">/</span>
          <Link to={`/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs/${jobId}/ats`} className="hover:text-gray-700">
            ATS - {effectiveJob.title}
          </Link>
          <span className="mx-2">/</span>
          <Link to={backUrl} className="hover:text-gray-700">
            Email Sequences
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Email Templates</span>
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
            Back to Email Sequences
          </Link>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{effectiveJob.title} - Email Templates</h1>
            <p className="text-gray-600 mt-1">Manage email templates for this job position</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              to={`${backUrl.replace('/email-sequences', '/email-templates/create')}`}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Link>
          </div>
        </div>
      </div>

      {/* Job Info Card */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">{effectiveJob.title}</h3>
            <p className="text-gray-600 text-sm">
              {effectiveJob.department} • {effectiveJob.location} • {effectiveJob.type}
            </p>
          </div>
        </div>
      </div>

      {/* Email Templates Content */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Email Templates</h3>
          <p className="text-gray-500 mb-4">
            Create and manage email templates for your outreach sequences.
          </p>
          <Link
            to={`${backUrl.replace('/email-sequences', '/email-templates/create')}`}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Template
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobEmailTemplatesPage;

import React, { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Settings, Users, Mail, Eye, Plus, Archive, Edit, Search, Filter, X, BarChart3 } from 'lucide-react';
import { useJob } from '../../../hooks/useJobs';
import { useExternalJobDetail } from '../../../hooks/useExternalJobs';
import { useEmailSequence, useUpdateEmailSequence } from '../../../hooks/useEmailSequences';
import { useAuthContext } from '../../../contexts/AuthContext';
import { isExternalUser } from '../../../utils/userUtils';
import { createJobUrl } from '../../../lib/urlUtils';
import { EmailSequence } from '../../../services/emailSequencesApiService';
import { EmailTrackingAnalytics } from '../../../components/EmailTrackingAnalytics';
import EnrollmentManagement from '../components/EnrollmentManagement';

// Edit Sequence Modal Component
interface EditSequenceModalProps {
  sequence: EmailSequence | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

const EditSequenceModal: React.FC<EditSequenceModalProps> = ({ sequence, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: sequence?.name || '',
    description: sequence?.description || '',
    type: sequence?.type || 'initial' as EmailSequence['type'],
    category: sequence?.category || 'recruitment' as EmailSequence['category'],
    status: sequence?.status || 'draft' as EmailSequence['status'],
    tags: sequence?.tags?.join(', ') || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      });
    } catch (error) {
      console.error('Failed to save sequence:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !sequence) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Edit Sequence</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sequence Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as EmailSequence['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="initial">Initial Outreach</option>
                <option value="follow_up">Follow Up</option>
                <option value="cold_outreach">Cold Outreach</option>
                <option value="warm_intro">Warm Introduction</option>
                <option value="candidate_outreach">Candidate Outreach</option>
                <option value="thank_you">Thank You</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as EmailSequence['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="recruiting, follow-up, technical"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const JobSequenceDetailPage: React.FC = () => {
  const { jobId, sequenceId } = useParams<{ 
    jobId: string; 
    sequenceId: string; 
  }>();
  const { user } = useAuthContext();
  const location = useLocation();

  // State for modals and forms
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'enrollments'>('overview');

  // Determine if current user is external and use appropriate hook
  const isExternal = isExternalUser(user);
  
  // Get job data to derive organizationId and departmentId
  const { data: job, isLoading: jobLoading, error: jobError } = useJob(jobId || '');
  const organizationId = job?.organizationId;
  const departmentId = job?.departmentId;
  
  const { 
    data: externalJob, 
    isLoading: externalJobLoading, 
    error: externalJobError 
  } = useExternalJobDetail(isExternal ? (jobId || '') : '');

  // Get sequence data
  const { data: sequence, isLoading: sequenceLoading, error: sequenceError, refetch: refetchSequence } = useEmailSequence(sequenceId || '');

  // Mutations
  const updateSequenceMutation = useUpdateEmailSequence();

  // Use the appropriate data based on user type
  const effectiveJob = isExternal ? externalJob : job;
  const effectiveJobLoading = isExternal ? externalJobLoading : jobLoading;
  const effectiveJobError = isExternal ? externalJobError : jobError;

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

  if (effectiveJobError || sequenceError || !effectiveJob || !sequence) {
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
            to={isExternal 
              ? `/external/jobs/${jobId}/email-sequences`
              : `/dashboard/jobs/${jobId}/email-sequences`
            }
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Email Sequences
          </Link>
        </div>
      </div>
    );
  }

  // Construct URLs
  const backUrl = isExternal 
    ? `/external/jobs/${jobId}/email-sequences`
    : `/dashboard/jobs/${jobId}/email-sequences`;

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      archived: 'bg-red-100 text-red-800 border-red-200'
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

  return (
    <div className="p-6">
      {/* Breadcrumbs - Only show for internal users */}
      {!isExternal && (
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <span className="mx-2">/</span>
          <Link to="/dashboard/my-jobs" className="hover:text-gray-700">Jobs</Link>
          <span className="mx-2">/</span>
          <Link to={createJobUrl(jobId || '', effectiveJob.title)} className="hover:text-gray-700">
            {effectiveJob.title}
          </Link>
          <span className="mx-2">/</span>
          <Link to={backUrl} className="hover:text-gray-700">
            Email Sequences
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{sequence.name}</span>
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
            <h1 className="text-2xl font-bold text-gray-900">{sequence.name}</h1>
            <p className="text-gray-600 mt-1">{sequence.description || 'No description provided'}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full border text-xs font-medium ${getStatusBadge(sequence.status)}`}>
                {getStatusIcon(sequence.status)}
                <span className="ml-1 capitalize">{sequence.status}</span>
              </span>
              <span className="text-sm text-gray-500">
                • {effectiveJob.title} • {effectiveJob.department}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              to={`${location.pathname}/steps`}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Steps
            </Link>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Sequence
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Steps</p>
              <p className="text-2xl font-bold text-gray-900">{sequence.steps?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Usage Count</p>
              <p className="text-2xl font-bold text-gray-900">{sequence.usageCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900">{sequence.responseRate || 0}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Eye className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last Used</p>
              <p className="text-sm font-bold text-gray-900">
                {sequence.lastUsedAt 
                  ? new Date(sequence.lastUsedAt).toLocaleDateString()
                  : 'Never'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-1 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('enrollments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'enrollments'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Enrollments
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">{/* Sequence Steps */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Sequence Steps</h2>
              <Link
                to={isExternal 
                  ? `/external/jobs/${jobId}/email-sequences/${sequenceId}/steps`
                  : `${backUrl}/${sequenceId}/steps`
                }
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Manage Steps
              </Link>
            </div>
          </div>
          <div className="p-6">
            {sequence.steps && sequence.steps.length > 0 ? (
              <div className="space-y-4">
                {sequence.steps.map((step, index) => (
                  <div key={step.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{step.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{step.type}</p>
                      {step.subject && (
                        <p className="text-sm text-gray-500 mt-1">Subject: {step.subject}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Settings className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No steps configured</h3>
                <p className="mt-1 text-sm text-gray-500">Add steps to define your sequence workflow</p>
                <Link
                  to={isExternal 
                    ? `/external/jobs/${jobId}/email-sequences/${sequenceId}/steps`
                    : `${backUrl}/${sequenceId}/steps`
                  }
                  className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Step
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sequence Info & Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Sequence Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{sequence.type}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{sequence.category}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Scope</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{sequence.scope}</p>
            </div>

            {sequence.tags && sequence.tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Tags</label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {sequence.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Created</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(sequence.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Last Modified</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(sequence.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Enrollments Tab */}
      {activeTab === 'enrollments' && (
        <EnrollmentManagement 
          sequenceId={sequenceId || ''}
          jobId={jobId || ''}
          isExternal={isExternal}
          organizationId={organizationId}
          departmentId={departmentId}
        />
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <EmailTrackingAnalytics 
          sequenceId={sequenceId || ''}
        />
      )}

      {/* Edit Sequence Modal */}
      {isEditModalOpen && (
        <EditSequenceModal
          sequence={sequence}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={async (data) => {
            await updateSequenceMutation.mutateAsync({ id: sequenceId || '', data });
            await refetchSequence();
            setIsEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default JobSequenceDetailPage;

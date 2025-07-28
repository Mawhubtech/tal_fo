import React, { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Settings, Users, Mail, Eye, Plus, Archive, Edit, Search, Filter, X } from 'lucide-react';
import { useJob } from '../../../hooks/useJobs';
import { useExternalJobDetail } from '../../../hooks/useExternalJobs';
import { useEmailSequence, useUpdateEmailSequence } from '../../../hooks/useEmailSequences';
import { useAuthContext } from '../../../contexts/AuthContext';
import { isExternalUser } from '../../../utils/userUtils';
import { EmailSequence } from '../../../services/emailSequencesApiService';

// Mock enrollment data type
interface Enrollment {
  id: string;
  candidateName: string;
  candidateEmail: string;
  currentStep: number;
  status: 'active' | 'paused' | 'completed' | 'failed';
  enrolledAt: string;
  lastActivity: string;
  progress: number;
}

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

// Enrollment Management Component
interface EnrollmentManagementProps {
  sequenceId: string;
  jobId: string;
  isExternal: boolean;
  onEnrollCandidate: () => void;
}

const EnrollmentManagement: React.FC<EnrollmentManagementProps> = ({ 
  sequenceId, 
  jobId, 
  isExternal, 
  onEnrollCandidate 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Mock enrollment data - replace with actual API call
  const mockEnrollments: Enrollment[] = [
    {
      id: '1',
      candidateName: 'John Doe',
      candidateEmail: 'john.doe@email.com',
      currentStep: 2,
      status: 'active',
      enrolledAt: '2025-01-15',
      lastActivity: '2025-01-20',
      progress: 40
    },
    {
      id: '2',
      candidateName: 'Jane Smith',
      candidateEmail: 'jane.smith@email.com',
      currentStep: 1,
      status: 'paused',
      enrolledAt: '2025-01-18',
      lastActivity: '2025-01-18',
      progress: 20
    },
    {
      id: '3',
      candidateName: 'Mike Johnson',
      candidateEmail: 'mike.j@email.com',
      currentStep: 5,
      status: 'completed',
      enrolledAt: '2025-01-10',
      lastActivity: '2025-01-22',
      progress: 100
    }
  ];

  const filteredEnrollments = mockEnrollments.filter(enrollment => {
    const matchesSearch = enrollment.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Sequence Enrollments</h2>
          <button
            onClick={onEnrollCandidate}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Enroll Candidate
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {filteredEnrollments.length > 0 ? (
          <div className="space-y-4">
            {filteredEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{enrollment.candidateName}</h3>
                    <p className="text-sm text-gray-600">{enrollment.candidateEmail}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(enrollment.status)}`}>
                    {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Current Step</p>
                    <p className="text-sm font-medium">{enrollment.currentStep}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Progress</p>
                    <p className="text-sm font-medium">{enrollment.progress}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Enrolled</p>
                    <p className="text-sm font-medium">{new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Activity</p>
                    <p className="text-sm font-medium">{new Date(enrollment.lastActivity).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${enrollment.progress}%` }}
                  ></div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                    View Details
                  </button>
                  <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                    Pause
                  </button>
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No enrollments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start by enrolling candidates in this sequence'
              }
            </p>
            {(!searchTerm && statusFilter === 'all') && (
              <button
                onClick={onEnrollCandidate}
                className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Enroll First Candidate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Enroll Candidate Modal Component
interface EnrollCandidateModalProps {
  sequenceId: string;
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (candidateData: any) => Promise<void>;
}

const EnrollCandidateModal: React.FC<EnrollCandidateModalProps> = ({ 
  sequenceId, 
  jobId, 
  isOpen, 
  onClose, 
  onEnroll 
}) => {
  const [formData, setFormData] = useState({
    candidateName: '',
    candidateEmail: '',
    startStep: 1,
    scheduledStart: '',
    notes: ''
  });
  const [enrolling, setEnrolling] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrolling(true);
    try {
      await onEnroll(formData);
      setFormData({
        candidateName: '',
        candidateEmail: '',
        startStep: 1,
        scheduledStart: '',
        notes: ''
      });
    } catch (error) {
      console.error('Failed to enroll candidate:', error);
    } finally {
      setEnrolling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Enroll Candidate</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Candidate Name
            </label>
            <input
              type="text"
              value={formData.candidateName}
              onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.candidateEmail}
              onChange={(e) => setFormData({ ...formData, candidateEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start from Step
            </label>
            <select
              value={formData.startStep}
              onChange={(e) => setFormData({ ...formData, startStep: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {[1, 2, 3, 4, 5].map(step => (
                <option key={step} value={step}>Step {step}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scheduled Start (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledStart}
              onChange={(e) => setFormData({ ...formData, scheduledStart: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="Any special notes or instructions..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              disabled={enrolling}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={enrolling}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {enrolling ? 'Enrolling...' : 'Enroll Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const JobSequenceDetailPage: React.FC = () => {
  const { organizationId, departmentId, jobId, sequenceId } = useParams<{ 
    organizationId: string; 
    departmentId: string; 
    jobId: string; 
    sequenceId: string; 
  }>();
  const { user } = useAuthContext();
  const location = useLocation();

  // State for modals and forms
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'enrollments'>('overview');

  // Determine if current user is external and use appropriate hook
  const isExternal = isExternalUser(user);
  
  // Get job data
  const { data: job, isLoading: jobLoading, error: jobError } = useJob(jobId || '');
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
              : `/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs/${jobId}/email-sequences`
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
    : `/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs/${jobId}/email-sequences`;

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
          onEnrollCandidate={() => setIsEnrollmentModalOpen(true)}
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

      {/* Enroll Candidate Modal */}
      {isEnrollmentModalOpen && (
        <EnrollCandidateModal
          sequenceId={sequenceId || ''}
          jobId={jobId || ''}
          isOpen={isEnrollmentModalOpen}
          onClose={() => setIsEnrollmentModalOpen(false)}
          onEnroll={async (candidateData) => {
            // Handle enrollment logic here
            console.log('Enrolling candidate:', candidateData);
            setIsEnrollmentModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default JobSequenceDetailPage;

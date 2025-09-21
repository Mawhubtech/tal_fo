import React, { useState } from 'react';
import { Users, Plus, Settings, ToggleLeft, ToggleRight, Play, Pause, Trash2, UserCheck, Clock, CheckCircle, AlertCircle, Search, Filter } from 'lucide-react';
import { 
  useSequenceEnrollmentsList, 
  useAutoEnrollmentConfig, 
  useConfigureAutoEnrollment,
  useBulkEnrollment,
  usePauseEnrollment,
  useResumeEnrollment,
  useRemoveEnrollment
} from '../../../hooks/useSequenceEnrollments';
import { useJobApplicationsByJob } from '../../../hooks/useJobApplications';
import { useJobWithPipeline } from '../../../hooks/useJobs';

interface EnrollmentManagementProps {
  sequenceId: string;
  jobId: string;
  isExternal: boolean;
  organizationId?: string;
  departmentId?: string;
}

interface EnrollCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  sequenceId: string;
  jobId: string;
  onEnroll: (candidateIds: string[]) => Promise<void>;
}

const EnrollmentManagement: React.FC<EnrollmentManagementProps> = ({
  sequenceId,
  jobId,
  isExternal,
  organizationId,
  departmentId
}) => {
  const [selectedTab, setSelectedTab] = useState<'enrollments' | 'auto-config'>('enrollments');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  
  // Data hooks
  const { data: enrollmentsResponse, isLoading: enrollmentsLoading } = useSequenceEnrollmentsList(sequenceId);
  const { data: autoConfig, isLoading: autoConfigLoading } = useAutoEnrollmentConfig(sequenceId);
  const { data: jobApplicationsData } = useJobApplicationsByJob(jobId);
  const { data: jobWithPipeline } = useJobWithPipeline(jobId);
  
  // Extract enrollments array from the paginated response
  const enrollments = Array.isArray(enrollmentsResponse) 
    ? enrollmentsResponse 
    : enrollmentsResponse?.data || [];
  
  // Extract applications array from the response
  const jobApplications = jobApplicationsData?.applications || [];
  const pipeline = jobWithPipeline?.pipeline;
  
  // Mutations
  const configureAutoEnrollmentMutation = useConfigureAutoEnrollment();
  const bulkEnrollmentMutation = useBulkEnrollment();
  const pauseEnrollmentMutation = usePauseEnrollment();
  const resumeEnrollmentMutation = useResumeEnrollment();
  const removeEnrollmentMutation = useRemoveEnrollment();

  // Filter enrollments
  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = enrollment.jobApplication?.candidate?.fullName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase()) || 
      enrollment.jobApplication?.candidate?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    const icons = {
      active: <Play className="w-4 h-4 text-green-600" />,
      paused: <Pause className="w-4 h-4 text-yellow-600" />,
      completed: <CheckCircle className="w-4 h-4 text-blue-600" />,
      failed: <AlertCircle className="w-4 h-4 text-red-600" />,
      unsubscribed: <UserCheck className="w-4 h-4 text-gray-600" />
    };
    return icons[status as keyof typeof icons] || <Clock className="w-4 h-4 text-gray-400" />;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      unsubscribed: 'bg-gray-100 text-gray-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const handleToggleAutoEnrollment = async (enabled: boolean) => {
    try {
      await configureAutoEnrollmentMutation.mutateAsync({
        sequenceId,
        autoEnrollEnabled: enabled,
        triggerStages: autoConfig?.triggerStages || [],
        includeExistingCandidates: autoConfig?.includeExistingCandidates || false,
        excludeStages: autoConfig?.excludeStages || []
      });
    } catch (error) {
      console.error('Failed to toggle auto enrollment:', error);
    }
  };

  const handleConfigureStages = async (triggerStages: string[], excludeStages: string[]) => {
    try {
      await configureAutoEnrollmentMutation.mutateAsync({
        sequenceId,
        autoEnrollEnabled: autoConfig?.enabled || false,
        triggerStages,
        includeExistingCandidates: autoConfig?.includeExistingCandidates || false,
        excludeStages
      });
    } catch (error) {
      console.error('Failed to configure stages:', error);
    }
  };

  const handleEnrollCandidates = async (candidateIds: string[]) => {
    try {
      const jobApplicationIds = jobApplications
        .filter(app => candidateIds.includes(app.candidateId))
        .map(app => app.id);

      await bulkEnrollmentMutation.mutateAsync({
        sequenceId,
        jobApplicationIds,
        enrollmentTrigger: 'manual',
        metadata: { enrolledBy: 'manual', enrolledAt: new Date().toISOString() }
      });
      
      setIsEnrollModalOpen(false);
    } catch (error) {
      console.error('Failed to enroll candidates:', error);
    }
  };

  const handlePauseEnrollment = async (enrollmentId: string) => {
    try {
      await pauseEnrollmentMutation.mutateAsync(enrollmentId);
    } catch (error) {
      console.error('Failed to pause enrollment:', error);
    }
  };

  const handleResumeEnrollment = async (enrollmentId: string) => {
    try {
      await resumeEnrollmentMutation.mutateAsync(enrollmentId);
    } catch (error) {
      console.error('Failed to resume enrollment:', error);
    }
  };

  const handleRemoveEnrollment = async (enrollmentId: string) => {
    if (window.confirm('Are you sure you want to remove this candidate from the sequence?')) {
      try {
        await removeEnrollmentMutation.mutateAsync(enrollmentId);
      } catch (error) {
        console.error('Failed to remove enrollment:', error);
      }
    }
  };

  if (enrollmentsLoading || autoConfigLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setSelectedTab('enrollments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'enrollments'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Enrollments ({enrollments.length})
          </button>
          <button
            onClick={() => setSelectedTab('auto-config')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'auto-config'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Auto Enrollment
          </button>
        </nav>
      </div>

      {selectedTab === 'enrollments' ? (
        <div className="space-y-4">
          {/* Enrollment Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="unsubscribed">Unsubscribed</option>
              </select>
            </div>
            <button
              onClick={() => setIsEnrollModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Enroll Candidates
            </button>
          </div>

          {/* Enrollments List */}
          <div className="bg-white rounded-lg border">
            {filteredEnrollments.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getStatusIcon(enrollment.status)}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {enrollment.jobApplication?.candidate?.fullName || 'Unknown Candidate'}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {enrollment.jobApplication?.candidate?.email}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(enrollment.status)}`}>
                              {enrollment.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              Step {enrollment.currentStepOrder}
                            </span>
                            <span className="text-xs text-gray-500">
                              Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {enrollment.status === 'active' ? (
                          <button
                            onClick={() => handlePauseEnrollment(enrollment.id)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                            title="Pause enrollment"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        ) : enrollment.status === 'paused' ? (
                          <button
                            onClick={() => handleResumeEnrollment(enrollment.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Resume enrollment"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        ) : null}
                        <button
                          onClick={() => handleRemoveEnrollment(enrollment.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Remove enrollment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No enrollments</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No enrollments match your filters'
                    : 'Start by enrolling candidates in this sequence'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <AutoEnrollmentConfig
          sequenceId={sequenceId}
          autoConfig={autoConfig}
          pipeline={pipeline}
          onToggleAutoEnrollment={handleToggleAutoEnrollment}
          onConfigureStages={handleConfigureStages}
          isLoading={configureAutoEnrollmentMutation.isPending}
        />
      )}

      {/* Enroll Candidates Modal */}
      <EnrollCandidateModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        sequenceId={sequenceId}
        jobId={jobId}
        onEnroll={handleEnrollCandidates}
      />
    </div>
  );
};

// Auto Enrollment Configuration Component
interface AutoEnrollmentConfigProps {
  sequenceId: string;
  autoConfig: any;
  pipeline: any;
  onToggleAutoEnrollment: (enabled: boolean) => Promise<void>;
  onConfigureStages: (triggerStages: string[], excludeStages: string[]) => Promise<void>;
  isLoading: boolean;
}

const AutoEnrollmentConfig: React.FC<AutoEnrollmentConfigProps> = ({
  autoConfig,
  pipeline,
  onToggleAutoEnrollment,
  onConfigureStages,
  isLoading
}) => {
  const [triggerStages, setTriggerStages] = useState<string[]>(autoConfig?.triggerStages || []);
  const [excludeStages, setExcludeStages] = useState<string[]>(autoConfig?.excludeStages || []);

  const handleSaveConfiguration = async () => {
    await onConfigureStages(triggerStages, excludeStages);
  };

  return (
    <div className="space-y-6">
      {/* Auto Enrollment Toggle */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Automatic Enrollment</h3>
            <p className="text-sm text-gray-600 mt-1">
              Automatically enroll candidates when they reach specific pipeline stages
            </p>
          </div>
          <button
            onClick={() => onToggleAutoEnrollment(!autoConfig?.enabled)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
              autoConfig?.enabled ? 'bg-purple-600' : 'bg-gray-200'
            }`}
            disabled={isLoading}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                autoConfig?.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Stage Configuration */}
      {autoConfig?.enabled && pipeline && (
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Pipeline Stage Configuration</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trigger Stages (candidates entering these stages will be enrolled)
              </label>
              <div className="space-y-2">
                {pipeline.stages?.map((stage: any) => (
                  <label key={stage.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={triggerStages.includes(stage.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTriggerStages([...triggerStages, stage.id]);
                        } else {
                          setTriggerStages(triggerStages.filter(id => id !== stage.id));
                        }
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:outline-none"
                    />
                    <span className="ml-2 text-sm text-gray-700">{stage.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exclude Stages (candidates in these stages will be skipped)
              </label>
              <div className="space-y-2">
                {pipeline.stages?.map((stage: any) => (
                  <label key={stage.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={excludeStages.includes(stage.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setExcludeStages([...excludeStages, stage.id]);
                        } else {
                          setExcludeStages(excludeStages.filter(id => id !== stage.id));
                        }
                      }}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{stage.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveConfiguration}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Enroll Candidate Modal Component
const EnrollCandidateModal: React.FC<EnrollCandidateModalProps> = ({
  isOpen,
  onClose,
  sequenceId,
  jobId,
  onEnroll
}) => {
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: jobApplicationsData } = useJobApplicationsByJob(jobId);
  const { data: enrollmentsResponse } = useSequenceEnrollmentsList(sequenceId);

  // Extract applications array from the response
  const jobApplications = jobApplicationsData?.applications || [];
  
  // Extract enrollments array from the paginated response
  const enrollments = Array.isArray(enrollmentsResponse) 
    ? enrollmentsResponse 
    : enrollmentsResponse?.data || [];

  // Get enrolled candidate IDs
  const enrolledCandidateIds = new Set(
    enrollments.map(enrollment => enrollment.jobApplication?.candidate?.id).filter(Boolean)
  );

  // Filter available candidates (not already enrolled)
  const availableCandidates = jobApplications
    .filter(app => app.candidate && !enrolledCandidateIds.has(app.candidateId))
    .filter(app => 
      !searchTerm || 
      app.candidate?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.candidate?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidates(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleSelectAll = () => {
    const allCandidateIds = availableCandidates.map(app => app.candidateId);
    setSelectedCandidates(
      selectedCandidates.length === allCandidateIds.length ? [] : allCandidateIds
    );
  };

  const handleEnroll = async () => {
    if (selectedCandidates.length > 0) {
      await onEnroll(selectedCandidates);
      setSelectedCandidates([]);
      setSearchTerm('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Enroll Candidates</h3>
          <p className="text-sm text-gray-600 mt-1">
            Select candidates to enroll in this email sequence
          </p>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              />
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedCandidates.length === availableCandidates.length && availableCandidates.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:outline-none"
              />
              <span className="ml-2 text-sm text-gray-700">
                Select all ({availableCandidates.length})
              </span>
            </label>
            <span className="text-sm text-gray-500">
              {selectedCandidates.length} selected
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto border rounded-lg">
            {availableCandidates.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {availableCandidates.map((application) => (
                  <label
                    key={application.id}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCandidates.includes(application.candidateId)}
                      onChange={() => handleSelectCandidate(application.candidateId)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:outline-none"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {application.candidate?.fullName || 'Unknown Candidate'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {application.candidate?.email}
                      </p>
                      <p className="text-xs text-gray-400">
                        {application.currentPipelineStageName || 'No stage'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No candidates match your search' : 'No candidates available for enrollment'}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleEnroll}
            disabled={selectedCandidates.length === 0}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            Enroll {selectedCandidates.length} Candidate{selectedCandidates.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentManagement;

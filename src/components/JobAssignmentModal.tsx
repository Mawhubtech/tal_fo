import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Plus, 
  Minus, 
  Users, 
  Briefcase, 
  CheckSquare, 
  Square,
  ArrowRight,
  ArrowLeft,
  Building,
  Calendar,
  DollarSign,
  MapPin,
  Clock
} from 'lucide-react';
import { 
  useJobsForTeamAssignment, 
  useJobsAssignedToTeam,
  useAssignJobToTeam,
  useUnassignJobFromTeam,
  useBulkAssignJobsToTeam,
  useBulkUnassignJobsFromTeam
} from '../hooks/useJobAssignment';
import type { Job } from '../recruitment/data/types';
import type { HiringTeam } from '../services/hiringTeamApiService';
import ToastContainer, { toast } from './ToastContainer';

interface JobAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: HiringTeam;
}

const JobAssignmentModal: React.FC<JobAssignmentModalProps> = ({
  isOpen,
  onClose,
  team
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAvailableJobs, setSelectedAvailableJobs] = useState<string[]>([]);
  const [selectedAssignedJobs, setSelectedAssignedJobs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'assigned'>('available');

  // Fetch data
  const { data: availableJobs = [], isLoading: loadingAvailable, error: errorAvailable } = useJobsForTeamAssignment(team.id);
  const { data: assignedJobs = [], isLoading: loadingAssigned, error: errorAssigned } = useJobsAssignedToTeam(team.id);

  // Mutations
  const assignJobMutation = useAssignJobToTeam();
  const unassignJobMutation = useUnassignJobFromTeam();
  const bulkAssignMutation = useBulkAssignJobsToTeam();
  const bulkUnassignMutation = useBulkUnassignJobsFromTeam();

  // Filter jobs based on search
  const filteredAvailableJobs = useMemo(() => {
    if (!searchTerm) return availableJobs;
    return availableJobs.filter(job =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableJobs, searchTerm]);

  const filteredAssignedJobs = useMemo(() => {
    if (!searchTerm) return assignedJobs;
    return assignedJobs.filter(job =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [assignedJobs, searchTerm]);

  // Handle individual job assignment
  const handleAssignJob = async (jobId: string) => {
    try {
      await assignJobMutation.mutateAsync({ jobId, teamId: team.id });
      toast.success('Job assigned successfully!');
    } catch (error) {
      toast.error('Failed to assign job. Please try again.');
    }
  };

  // Handle individual job unassignment
  const handleUnassignJob = async (jobId: string) => {
    try {
      await unassignJobMutation.mutateAsync({ jobId, teamId: team.id });
      toast.success('Job unassigned successfully!');
    } catch (error) {
      toast.error('Failed to unassign job. Please try again.');
    }
  };

  // Handle bulk assignment
  const handleBulkAssign = async () => {
    if (selectedAvailableJobs.length === 0) return;
    try {
      const result = await bulkAssignMutation.mutateAsync({ 
        jobIds: selectedAvailableJobs, 
        teamId: team.id 
      });
      toast.success(`Successfully assigned ${result.success} job(s)!`);
      if (result.failed.length > 0) {
        toast.error(`Failed to assign ${result.failed.length} job(s).`);
      }
      setSelectedAvailableJobs([]);
    } catch (error) {
      toast.error('Failed to assign jobs. Please try again.');
    }
  };

  // Handle bulk unassignment
  const handleBulkUnassign = async () => {
    if (selectedAssignedJobs.length === 0) return;
    try {
      const result = await bulkUnassignMutation.mutateAsync({ 
        jobIds: selectedAssignedJobs, 
        teamId: team.id 
      });
      toast.success(`Successfully unassigned ${result.success} job(s)!`);
      if (result.failed.length > 0) {
        toast.error(`Failed to unassign ${result.failed.length} job(s).`);
      }
      setSelectedAssignedJobs([]);
    } catch (error) {
      toast.error('Failed to unassign jobs. Please try again.');
    }
  };

  // Handle job selection
  const handleJobSelection = (jobId: string, isSelected: boolean, type: 'available' | 'assigned') => {
    if (type === 'available') {
      setSelectedAvailableJobs(prev =>
        isSelected ? [...prev, jobId] : prev.filter(id => id !== jobId)
      );
    } else {
      setSelectedAssignedJobs(prev =>
        isSelected ? [...prev, jobId] : prev.filter(id => id !== jobId)
      );
    }
  };

  // Handle select all
  const handleSelectAll = (type: 'available' | 'assigned', selectAll: boolean) => {
    if (type === 'available') {
      setSelectedAvailableJobs(selectAll ? filteredAvailableJobs.map(job => job.id) : []);
    } else {
      setSelectedAssignedJobs(selectAll ? filteredAssignedJobs.map(job => job.id) : []);
    }
  };

  const formatSalary = (min?: number, max?: number, currency = 'USD') => {
    if (!min && !max) return null;
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${currency} ${min.toLocaleString()}+`;
    if (max) return `Up to ${currency} ${max.toLocaleString()}`;
    return null;
  };

  const JobCard: React.FC<{ 
    job: Job; 
    type: 'available' | 'assigned';
    isSelected: boolean;
    onSelect: (selected: boolean) => void;
    onAction: () => void;
  }> = ({ job, type, isSelected, onSelect, onAction }) => (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
              <div className="flex items-center">
                <Building className="h-4 w-4 mr-1" />
                {job.department}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {job.location}
              </div>
              {job.type && (
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1" />
                  {job.type}
                </div>
              )}
            </div>
            {(job.salaryMin || job.salaryMax) && (
              <div className="flex items-center mt-1 text-sm text-gray-600">
                <DollarSign className="h-4 w-4 mr-1" />
                {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
              </div>
            )}
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              Created {new Date(job.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        <button
          onClick={onAction}
          className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
            type === 'available'
              ? 'text-green-700 bg-green-50 hover:bg-green-100'
              : 'text-red-700 bg-red-50 hover:bg-red-100'
          }`}
          disabled={assignJobMutation.isPending || unassignJobMutation.isPending}
        >
          {type === 'available' ? (
            <>
              <Plus className="h-4 w-4" />
              <span>Assign</span>
            </>
          ) : (
            <>
              <Minus className="h-4 w-4" />
              <span>Remove</span>
            </>
          )}
        </button>
      </div>
      
      {job.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{job.description}</p>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className={`px-2 py-1 rounded-full ${
          job.status === 'Active' ? 'bg-green-100 text-green-800' :
          job.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
          job.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {job.status}
        </span>
        {job.urgency && (
          <span className={`px-2 py-1 rounded-full ${
            job.urgency === 'High' ? 'bg-red-100 text-red-800' :
            job.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {job.urgency} Priority
          </span>
        )}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Manage Jobs for {team.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Assign jobs to this hiring team or remove existing assignments
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('available')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'available'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>Available Jobs ({filteredAvailableJobs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('assigned')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'assigned'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Assigned Jobs ({filteredAssignedJobs.length})</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'available' ? (
            <div>
              {/* Bulk actions for available jobs */}
              {selectedAvailableJobs.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-900">
                      {selectedAvailableJobs.length} job(s) selected
                    </span>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedAvailableJobs([])}
                        className="text-sm text-purple-600 hover:text-purple-800"
                      >
                        Clear selection
                      </button>
                      <button
                        onClick={handleBulkAssign}
                        disabled={bulkAssignMutation.isPending}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                      >
                        <ArrowRight className="h-4 w-4" />
                        <span>
                          {bulkAssignMutation.isPending ? 'Assigning...' : 'Assign Selected'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Select all for available jobs */}
              {filteredAvailableJobs.length > 0 && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedAvailableJobs.length === filteredAvailableJobs.length && filteredAvailableJobs.length > 0}
                      onChange={(e) => handleSelectAll('available', e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Select all ({filteredAvailableJobs.length})
                    </span>
                  </div>
                </div>
              )}

              {/* Available jobs list */}
              {loadingAvailable ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : errorAvailable ? (
                <div className="text-center py-12">
                  <p className="text-red-600">Error loading available jobs</p>
                </div>
              ) : filteredAvailableJobs.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm ? 'No jobs match your search' : 'No jobs available for assignment'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAvailableJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      type="available"
                      isSelected={selectedAvailableJobs.includes(job.id)}
                      onSelect={(selected) => handleJobSelection(job.id, selected, 'available')}
                      onAction={() => handleAssignJob(job.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Bulk actions for assigned jobs */}
              {selectedAssignedJobs.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-900">
                      {selectedAssignedJobs.length} job(s) selected
                    </span>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedAssignedJobs([])}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Clear selection
                      </button>
                      <button
                        onClick={handleBulkUnassign}
                        disabled={bulkUnassignMutation.isPending}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>
                          {bulkUnassignMutation.isPending ? 'Removing...' : 'Remove Selected'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Select all for assigned jobs */}
              {filteredAssignedJobs.length > 0 && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedAssignedJobs.length === filteredAssignedJobs.length && filteredAssignedJobs.length > 0}
                      onChange={(e) => handleSelectAll('assigned', e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Select all ({filteredAssignedJobs.length})
                    </span>
                  </div>
                </div>
              )}

              {/* Assigned jobs list */}
              {loadingAssigned ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : errorAssigned ? (
                <div className="text-center py-12">
                  <p className="text-red-600">Error loading assigned jobs</p>
                </div>
              ) : filteredAssignedJobs.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm ? 'No assigned jobs match your search' : 'No jobs assigned to this team yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAssignedJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      type="assigned"
                      isSelected={selectedAssignedJobs.includes(job.id)}
                      onSelect={(selected) => handleJobSelection(job.id, selected, 'assigned')}
                      onAction={() => handleUnassignJob(job.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {activeTab === 'available' 
                ? `${filteredAvailableJobs.length} jobs available for assignment`
                : `${filteredAssignedJobs.length} jobs currently assigned`
              }
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default JobAssignmentModal;

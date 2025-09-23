import React, { useState, useEffect } from 'react';
import { X, Search, Plus, User } from 'lucide-react';
import { candidateApiService, type Candidate } from '../../candidates/services/candidateApiService';
import { jobApplicationApiService } from '../../../services/jobApplicationApiService';
import { useStageMovement } from '../../../hooks/useStageMovement';
import { StageChangeReason } from '../../../types/stageMovement.types';
import type { Pipeline } from '../../../services/pipelineService';

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  onCandidateAdded: () => void;
  pipeline?: Pipeline | null; // Add pipeline prop
  onDataChange?: () => Promise<void>;
}

const AddCandidateModal: React.FC<AddCandidateModalProps> = ({
  isOpen,
  onClose,
  jobId,
  onCandidateAdded,
  pipeline,
  onDataChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingCandidateId, setAddingCandidateId] = useState<string | null>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [existingCandidateIds, setExistingCandidateIds] = useState<Set<string>>(new Set());
  
  // Stage movement hook for tracking initial application
  const stageMovement = useStageMovement();

  useEffect(() => {
    if (isOpen) {
      loadCandidates();
      loadExistingCandidates();
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Add ESC key handler
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          handleClose();
        }
      };
      
      document.addEventListener('keydown', handleEsc);
      
      return () => {
        document.removeEventListener('keydown', handleEsc);
        // Restore body scroll when modal closes
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const delayedSearch = setTimeout(() => {
        searchCandidates();
      }, 300);
      return () => clearTimeout(delayedSearch);
    } else {
      loadCandidates();
    }
  }, [searchQuery]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const { candidates: candidateList } = await candidateApiService.getAllCandidates({
        status: 'active',
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });
      setCandidates(candidateList);
    } catch (error) {
      console.error('Error loading candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchCandidates = async () => {
    try {
      setLoading(true);
      const { candidates: candidateList } = await candidateApiService.searchCandidates({
        search: searchQuery,
        status: 'active',
        limit: 50,
      });
      setCandidates(candidateList);
    } catch (error) {
      console.error('Error searching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingCandidates = async () => {
    try {
      const { applications } = await jobApplicationApiService.getJobApplicationsByJobId(jobId);
      const existingIds = new Set(applications.map(app => app.candidateId));
      setExistingCandidateIds(existingIds);
    } catch (error) {
      console.error('Error loading existing candidates for job:', error);
    }
  };

  const addCandidateToJob = async (candidateId: string) => {
    try {
      setAddingCandidateId(candidateId);
      
      // Get the first stage from the pipeline (sorted by order)
      const firstStage = pipeline?.stages
        ?.filter(stage => stage.isActive)
        ?.sort((a, b) => a.order - b.order)?.[0];
      
      // Create the job application with proper pipeline stage tracking
      const newApplication = await jobApplicationApiService.createJobApplication({
        jobId,
        candidateId,
        status: 'Applied',
        stage: firstStage ? 'Application' : 'Application', // Use fallback enum value for backward compatibility
        appliedDate: new Date().toISOString().split('T')[0],
        // New pipeline-based fields
        currentPipelineStageId: firstStage?.id,
        currentPipelineStageName: firstStage?.name,
        pipelineId: pipeline?.id,
      });
      
      // Track the initial stage movement (application submission)
      if (firstStage && newApplication.id) {
        try {
          await stageMovement.moveWithDefaults(
            newApplication.id,
            firstStage.id,
            {
              reason: StageChangeReason.APPLICATION_SUBMITTED,
              notes: `Candidate applied and entered ${firstStage.name} stage`,
              metadata: {
                moveType: 'initial_application',
                trigger: 'candidate_application',
                initialStage: firstStage.name,
                applicationDate: newApplication.appliedDate,
              }
            }
          );
        } catch (stageError) {
          console.error('Error tracking initial stage movement:', stageError);
          // Don't fail the application creation if stage tracking fails
        }
      }
      
      setSelectedCandidates(prev => new Set([...prev, candidateId]));
      setExistingCandidateIds(prev => new Set([...prev, candidateId]));
      onCandidateAdded();
      
      // Call onDataChange if provided to invalidate all queries
      if (onDataChange) {
        await onDataChange();
      }
    } catch (error) {
      console.error('Error adding candidate to job:', error);
      alert('Failed to add candidate to job. They may already be applied to this position.');
    } finally {
      setAddingCandidateId(null);
    }
  };
  const handleClose = () => {
    setSearchQuery('');
    setSelectedCandidates(new Set());
    setExistingCandidateIds(new Set());
    // Restore body scroll before closing
    document.body.style.overflow = 'unset';
    onClose();
  };

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Helper function to generate initials from name
  const getInitials = (fullName: string) => {
    if (!fullName || fullName.trim() === '') return '?';
    
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Add Candidate to Job</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search candidates by name, email, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Candidates List - Made scrollable */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading candidates...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
              <p className="text-gray-500">
                {searchQuery ? 'Try adjusting your search terms.' : 'No active candidates available.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      {candidate.avatar ? (
                        <img
                          src={candidate.avatar}
                          alt={candidate.fullName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-purple-600 font-medium text-lg">
                          {getInitials(candidate.fullName)}
                        </span>
                      )}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">{candidate.fullName}</h4>
                      <p className="text-sm text-gray-500">{candidate.email}</p>
                      {candidate.currentPosition && (
                        <p className="text-sm text-gray-500">{candidate.currentPosition}</p>
                      )}
                      {candidate.location && (
                        <p className="text-xs text-gray-400">{candidate.location}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right mr-4">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500">Rating:</span>
                        <span className="ml-1 text-sm font-medium text-gray-900">
                          {candidate.rating}/10
                        </span>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        candidate.status === 'active' ? 'bg-green-100 text-green-800' :
                        candidate.status === 'interviewing' ? 'bg-blue-100 text-blue-800' :
                        candidate.status === 'hired' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {candidate.status}
                      </span>
                    </div>
                    {existingCandidateIds.has(candidate.id) ? (
                      <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md text-sm font-medium">
                        Already Added
                      </div>
                    ) : selectedCandidates.has(candidate.id) ? (
                      <div className="px-4 py-2 bg-green-100 text-green-800 rounded-md text-sm font-medium">
                        Added ✓
                      </div>
                    ) : (
                      <button
                        onClick={() => addCandidateToJob(candidate.id)}
                        disabled={addingCandidateId === candidate.id}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-w-[100px] justify-center"
                      >
                        {addingCandidateId === candidate.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3 mr-1" />
                            Add to Job
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50 flex-shrink-0">
          <p className="text-sm text-gray-500">
            {selectedCandidates.size} candidate(s) added to this job
            {existingCandidateIds.size > 0 && (
              <span className="ml-2 text-gray-400">
                • {existingCandidateIds.size} already in job
              </span>
            )}
          </p>
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCandidateModal;

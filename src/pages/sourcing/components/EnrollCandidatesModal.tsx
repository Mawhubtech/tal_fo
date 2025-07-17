import React, { useState } from 'react';
import { X, Search, UserPlus, Users, Check } from 'lucide-react';
import { useProjectProspects } from '../../../hooks/useSourcingProjects';
import { useEnrollCandidate, useBulkEnrollCandidates } from '../../../hooks/useSourcingSequences';
import { useToast } from '../../../contexts/ToastContext';

interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  stage?: {
    id: string;
    name: string;
  };
}

interface EnrollCandidatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  sequenceId: string;
  sequenceName: string;
  projectId: string;
}

export const EnrollCandidatesModal: React.FC<EnrollCandidatesModalProps> = ({
  isOpen,
  onClose,
  sequenceId,
  sequenceName,
  projectId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [enrollmentTrigger, setEnrollmentTrigger] = useState<'manual' | 'automatic' | 'pipeline_stage'>('manual');

  const { addToast } = useToast();
  
  // Fetch project prospects (which contain candidate information)
  const { data: prospects, isLoading } = useProjectProspects(projectId);
  
  // Transform prospects to candidate format for the UI
  const candidates: Candidate[] = prospects?.map(prospect => ({
    id: prospect.candidateId,
    fullName: prospect.candidate?.fullName || prospect.candidate?.name || 'Unknown',
    email: prospect.candidate?.email || '',
    phone: prospect.candidate?.phone,
    company: prospect.candidate?.currentCompany || prospect.candidate?.company,
    position: prospect.candidate?.currentPosition || prospect.candidate?.position,
    stage: prospect.currentStage ? {
      id: prospect.currentStageId || '',
      name: prospect.currentStage.name || 'Unknown Stage'
    } : undefined
  })) || [];
  
  const enrollCandidateMutation = useEnrollCandidate();
  const bulkEnrollMutation = useBulkEnrollCandidates();

  // Filter candidates based on search term
  const filteredCandidates = candidates.filter((candidate: Candidate) =>
    candidate.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCandidates.length === filteredCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(filteredCandidates.map((c: Candidate) => c.id));
    }
  };

  const handleEnroll = async () => {
    if (selectedCandidates.length === 0) {
      addToast({
        type: 'error',
        title: 'Please select at least one candidate'
      });
      return;
    }

    try {
      if (selectedCandidates.length === 1) {
        await enrollCandidateMutation.mutateAsync({
          candidateId: selectedCandidates[0],
          sequenceId,
          enrollmentTrigger
        });
      } else {
        await bulkEnrollMutation.mutateAsync({
          candidateIds: selectedCandidates,
          sequenceId,
          enrollmentTrigger
        });
      }

      addToast({
        type: 'success',
        title: `Successfully enrolled ${selectedCandidates.length} candidate${selectedCandidates.length > 1 ? 's' : ''}`
      });
      
      onClose();
      setSelectedCandidates([]);
      setSearchTerm('');
    } catch (error: any) {
      console.error('Error enrolling candidates:', error);
      addToast({
        type: 'error',
        title: error.response?.data?.message || 'Failed to enroll candidates'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Enroll Candidates</h2>
            <p className="text-sm text-gray-600 mt-1">
              Select candidates to enroll in "{sequenceName}"
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search candidates by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="w-48">
              <select
                value={enrollmentTrigger}
                onChange={(e) => setEnrollmentTrigger(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="manual">Manual Trigger</option>
                <option value="automatic">Automatic</option>
                <option value="pipeline_stage">Pipeline Stage</option>
              </select>
            </div>
          </div>

          {/* Selection Controls */}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={handleSelectAll}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              {selectedCandidates.length === filteredCandidates.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-sm text-gray-600">
              {selectedCandidates.length} of {filteredCandidates.length} candidates selected
            </span>
          </div>
        </div>

        {/* Candidates List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No candidates found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Add candidates to this project first.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCandidates.map((candidate: Candidate) => (
                <div
                  key={candidate.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedCandidates.includes(candidate.id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSelectCandidate(candidate.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedCandidates.includes(candidate.id)
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedCandidates.includes(candidate.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{candidate.fullName}</div>
                        <div className="text-sm text-gray-600">{candidate.email}</div>
                        {candidate.company && (
                          <div className="text-sm text-gray-500">
                            {candidate.position && `${candidate.position} at `}{candidate.company}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {candidate.stage && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {candidate.stage.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleEnroll}
            disabled={selectedCandidates.length === 0 || enrollCandidateMutation.isPending || bulkEnrollMutation.isPending}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(enrollCandidateMutation.isPending || bulkEnrollMutation.isPending) ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <UserPlus className="w-4 h-4 mr-2" />
            )}
            Enroll {selectedCandidates.length > 0 && `${selectedCandidates.length} `}Candidate{selectedCandidates.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

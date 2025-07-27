import React, { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import type { Candidate } from '../../../data/mock';
import type { Pipeline } from '../../../../../services/pipelineService';
import { PipelineFilters } from './PipelineFilters';
import { PipelineStats } from './PipelineStats';
import { PipelineListView } from './PipelineListView';
import { PipelineKanbanView } from './PipelineKanbanView';

interface PipelineTabProps {
  candidates: Candidate[];
  pipeline?: Pipeline | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStage: string;
  onStageChange: (stage: string) => void;
  sortBy: 'date' | 'score';
  onSortChange: (sort: 'date' | 'score') => void;
  onCandidateClick?: (candidate: Candidate) => void;
  onCandidateUpdate?: (candidate: Candidate) => void;
  onCandidateRemove?: (candidate: Candidate) => void;
  onCandidateStageChange?: (candidateId: string, newStage: string) => void;
  onDataChange?: () => Promise<void>;
  movingCandidates?: Set<string>;
}

export const PipelineTab: React.FC<PipelineTabProps> = ({
  candidates,
  pipeline,
  searchQuery,
  onSearchChange,
  selectedStage,
  onStageChange,
  sortBy,
  onSortChange,
  onCandidateClick,
  onCandidateUpdate,
  onCandidateRemove,
  onCandidateStageChange,
  movingCandidates = new Set()
}) => {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStage = selectedStage === 'all' || candidate.stage === selectedStage;
    
    return matchesSearch && matchesStage;
  });

  // Sort candidates
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
    } else {
      return b.score - a.score;
    }
  });

  const getCandidatesByStage = (stage: string) => {
    return sortedCandidates.filter(candidate => candidate.stage === stage);
  };

  const handleCandidateStageChange = (candidateId: string, newStage: string) => {
    // Use the specific stage change handler if provided (for proper tracking)
    if (onCandidateStageChange) {
      onCandidateStageChange(candidateId, newStage);
    } else if (onCandidateUpdate) {
      // Fallback to general candidate update (legacy behavior)
      const candidate = candidates.find(c => c.id === candidateId);
      if (candidate) {
        const updatedCandidate = { ...candidate, stage: newStage };
        onCandidateUpdate(updatedCandidate);
      }
    }
  };

  return (
    <>
      {/* Header with View Toggle */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex-1">
          <PipelineFilters
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            selectedStage={selectedStage}
            onStageChange={onStageChange}
            sortBy={sortBy}
            onSortChange={onSortChange}
            pipeline={pipeline}
          />
        </div>
        
        {/* View Toggle */}
        <div className="flex justify-between items-center">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-2 text-sm flex items-center transition-colors ${
                view === 'kanban' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Kanban</span>
              <span className="sm:hidden">Board</span>
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 text-sm flex items-center transition-colors ${
                view === 'list' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <List className="w-4 h-4 mr-2" />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Content based on view */}
      {view === 'kanban' ? (
        <PipelineKanbanView
          candidates={sortedCandidates}
          pipeline={pipeline}
          onCandidateClick={onCandidateClick}
          onCandidateStageChange={handleCandidateStageChange}
          onCandidateRemove={onCandidateRemove}
          movingCandidates={movingCandidates}
        />      ) : (
        <PipelineListView
          candidates={sortedCandidates}
          pipeline={pipeline}
          onCandidateClick={onCandidateClick}
          onCandidateStageChange={handleCandidateStageChange}
          onCandidateRemove={onCandidateRemove}
        />
      )}

      {/* Quick Stats */}
      {/* <PipelineStats
        candidates={candidates}
        getCandidatesByStage={getCandidatesByStage}
      /> */}
    </>
  );
};

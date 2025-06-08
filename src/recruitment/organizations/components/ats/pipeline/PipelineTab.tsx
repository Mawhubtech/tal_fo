import React from 'react';
import type { Candidate } from '../../../data/mock';
import { STAGES } from '../../../data/mock';
import { PipelineFilters } from './PipelineFilters';
import { StageColumn } from './StageColumn';
import { PipelineStats } from './PipelineStats';

interface PipelineTabProps {
  candidates: Candidate[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStage: string;
  onStageChange: (stage: string) => void;
  sortBy: 'date' | 'score';
  onSortChange: (sort: 'date' | 'score') => void;
  onCandidateClick?: (candidate: Candidate) => void;
}

export const PipelineTab: React.FC<PipelineTabProps> = ({
  candidates,
  searchQuery,
  onSearchChange,
  selectedStage,
  onStageChange,
  sortBy,
  onSortChange,
  onCandidateClick
}) => {
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStage = selectedStage === 'all' || candidate.stage === selectedStage;
    
    return matchesSearch && matchesStage;
  });

  const getCandidatesByStage = (stage: string) => {
    return filteredCandidates.filter(candidate => candidate.stage === stage);
  };

  return (
    <>
      <PipelineFilters
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        selectedStage={selectedStage}
        onStageChange={onStageChange}
        sortBy={sortBy}
        onSortChange={onSortChange}
      />

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4 mb-6 overflow-x-auto min-h-[calc(100vh-400px)]">
        {STAGES.map((stage) => (
          <StageColumn
            key={stage}
            stage={stage}
            candidates={getCandidatesByStage(stage)}
            onCandidateClick={onCandidateClick}
          />
        ))}
      </div>

      {/* Quick Stats */}
      <PipelineStats
        candidates={candidates}
        getCandidatesByStage={getCandidatesByStage}
      />
    </>
  );
};

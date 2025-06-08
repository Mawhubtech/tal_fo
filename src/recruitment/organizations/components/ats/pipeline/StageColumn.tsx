import React from 'react';
import { MoreHorizontal, Users } from 'lucide-react';
import type { Candidate } from '../../../data/mock';
import { getStageColor } from '../shared';
import { CandidateCard } from './CandidateCard';

interface StageColumnProps {
  stage: string;
  candidates: Candidate[];
  onCandidateClick?: (candidate: Candidate) => void;
}

export const StageColumn: React.FC<StageColumnProps> = ({
  stage,
  candidates,
  onCandidateClick
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm min-w-[280px]">
      {/* Stage Header */}
      <div className={`px-4 py-3 border-t-4 rounded-t-lg flex justify-between items-center ${getStageColor(stage)}`}>
        <div>
          <h2 className="font-semibold text-gray-800">{stage}</h2>
          <p className="text-xs text-gray-500">{candidates.length} candidates</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      
      {/* Candidates in this stage */}
      <div className="p-2 overflow-y-auto max-h-[calc(100vh-450px)]">
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            onClick={() => onCandidateClick?.(candidate)}
          />
        ))}
        
        {/* Empty State for Stage */}
        {candidates.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Users className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No candidates in this stage</p>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MoreHorizontal, Users, Plus } from 'lucide-react';
import type { Pipeline } from '../../../services/pipelineService';
import { getStageColor } from '../../../recruitment/organizations/components/ats/shared';
import { DraggableSourcingCandidateCard } from './DraggableSourcingCandidateCard';

// Sourcing-specific candidate interface
interface SourcingCandidate {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  stage: string;
  score: number; // This represents prospect rating
  lastUpdated: string;
  tags: string[];
  source: string;
  appliedDate: string;
  candidateRating?: number; // Overall candidate rating from database
}

interface SourcingDraggableStageColumnProps {
  stage: string;
  candidates: SourcingCandidate[];
  pipeline?: Pipeline | null;
  onCandidateClick?: (candidate: SourcingCandidate) => void;
  onCandidateRemove?: (candidate: SourcingCandidate) => void;
  pendingMoves?: Set<string>; // Add pending moves prop
  movingCandidates?: Map<string, { originalStage: string; targetStage: string }>; // Add moving candidates prop
}

export const SourcingDraggableStageColumn: React.FC<SourcingDraggableStageColumnProps> = ({
  stage,
  candidates,
  pipeline,
  onCandidateClick,
  onCandidateRemove,
  pendingMoves = new Set(),
  movingCandidates = new Map()
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  const candidateIds = candidates.map(candidate => candidate.id);

  return (
    <div 
      ref={setNodeRef}
      className={`bg-white rounded-lg shadow-sm w-full min-w-[140px] sm:min-w-[180px] md:min-w-[220px] transition-all duration-200 ${
        isOver ? 'ring-2 ring-purple-500 ring-opacity-50 bg-purple-50' : ''
      }`}
    >
      {/* Stage Header */}
      <div className={`px-1 py-1 sm:px-1.5 sm:py-1.5 md:px-3 md:py-2 border-t-4 rounded-t-lg flex justify-between items-center ${getStageColor(stage, pipeline)}`}>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base truncate">{stage}</h2>
          <p className="text-xs text-gray-500">{candidates.length}</p>
        </div>
        <div className="flex items-center space-x-0.5 sm:space-x-1 flex-shrink-0">
          <button className="text-gray-400 hover:text-gray-600 p-0.5 rounded hover:bg-white/50">
            <Plus className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-4 md:h-4" />
          </button>
          <button className="text-gray-400 hover:text-gray-600 p-0.5 rounded hover:bg-white/50">
            <MoreHorizontal className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-4 md:h-4" />
          </button>
        </div>
      </div>
      
      {/* Drop Zone */}
      <div className={`p-0.5 sm:p-1 md:p-2 overflow-y-auto max-h-[180px] sm:max-h-[220px] md:max-h-[280px] lg:max-h-[calc(100vh-450px)] min-h-[80px] sm:min-h-[100px] md:min-h-[120px] lg:min-h-[280px] transition-colors ${
        isOver ? 'bg-purple-25' : ''
      }`}>
        <SortableContext items={candidateIds} strategy={verticalListSortingStrategy}>
          {candidates.map((candidate) => {
            const isMoving = movingCandidates.has(candidate.id);
            const isPending = pendingMoves.has(candidate.id);
            
            return (
              <DraggableSourcingCandidateCard
                key={candidate.id}
                candidate={candidate}
                onClick={() => onCandidateClick?.(candidate)}
                onRemove={() => onCandidateRemove?.(candidate)}
                isPending={isPending || isMoving}
              />
            );
          })}
        </SortableContext>
        
        {/* Empty State for Stage */}
        {candidates.length === 0 && (
          <div className={`text-center py-1 sm:py-2 md:py-4 rounded-lg border-2 border-dashed transition-colors ${
            isOver 
              ? 'border-purple-300 bg-purple-50 text-purple-600' 
              : 'border-gray-200 text-gray-400'
          }`}>
            <Users className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 mx-auto mb-0.5 sm:mb-1" />
            <p className="text-xs">
              {isOver ? 'Drop here' : 'No prospects'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

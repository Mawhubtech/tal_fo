import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MoreHorizontal, Users, Plus } from 'lucide-react';
import type { Candidate } from '../../../data/mock';
import { getStageColor } from '../shared';
import { DraggableCandidateCard } from './DraggableCandidateCard';

interface DraggableStageColumnProps {
  stage: string;
  candidates: Candidate[];
  onCandidateClick?: (candidate: Candidate) => void;
}

export const DraggableStageColumn: React.FC<DraggableStageColumnProps> = ({
  stage,
  candidates,
  onCandidateClick
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  const candidateIds = candidates.map(candidate => candidate.id);

  return (
    <div 
      ref={setNodeRef}
      className={`bg-white rounded-lg shadow-sm min-w-[280px] transition-all duration-200 ${
        isOver ? 'ring-2 ring-purple-500 ring-opacity-50 bg-purple-50' : ''
      }`}
    >
      {/* Stage Header */}
      <div className={`px-4 py-3 border-t-4 rounded-t-lg flex justify-between items-center ${getStageColor(stage)}`}>
        <div>
          <h2 className="font-semibold text-gray-800">{stage}</h2>
          <p className="text-xs text-gray-500">{candidates.length} candidates</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-white/50">
            <Plus className="w-4 h-4" />
          </button>
          <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-white/50">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Drop Zone */}
      <div className={`p-2 overflow-y-auto max-h-[calc(100vh-450px)] min-h-[200px] transition-colors ${
        isOver ? 'bg-purple-25' : ''
      }`}>
        <SortableContext items={candidateIds} strategy={verticalListSortingStrategy}>
          {candidates.map((candidate) => (
            <DraggableCandidateCard
              key={candidate.id}
              candidate={candidate}
              onClick={() => onCandidateClick?.(candidate)}
            />
          ))}
        </SortableContext>
        
        {/* Empty State for Stage */}
        {candidates.length === 0 && (
          <div className={`text-center py-8 rounded-lg border-2 border-dashed transition-colors ${
            isOver 
              ? 'border-purple-300 bg-purple-50 text-purple-600' 
              : 'border-gray-200 text-gray-400'
          }`}>
            <Users className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">
              {isOver ? 'Drop candidate here' : 'No candidates in this stage'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MoreHorizontal, Users, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import type { Candidate } from '../../../data/mock';
import type { Pipeline } from '../../../../../services/pipelineService';
import { getStageColor } from '../shared';
import { DraggableCandidateCard } from './DraggableCandidateCard';

interface DraggableStageColumnProps {
  stage: string;
  candidates: Candidate[];
  pipeline?: Pipeline | null;
  onCandidateClick?: (candidate: Candidate) => void;
  onCandidateRemove?: (candidate: Candidate) => void;
  pendingMoves?: Set<string>; // Add pending moves prop
  movingCandidates?: Map<string, { originalStage: string; targetStage: string }>; // Add moving candidates prop
  isExpanded?: boolean;
  onExpansionChange?: (expanded: boolean) => void;
}

export const DraggableStageColumn: React.FC<DraggableStageColumnProps> = ({
  stage,
  candidates,
  pipeline,
  onCandidateClick,
  onCandidateRemove,
  pendingMoves = new Set(),
  movingCandidates = new Map(),
  isExpanded = false,
  onExpansionChange
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  // Create a secondary drop zone for the header area
  const { setNodeRef: setHeaderNodeRef, isOver: isHeaderOver } = useDroppable({
    id: `${stage}-header`,
  });

  // Create a third drop zone for the entire content area when expanded
  const { setNodeRef: setContentNodeRef, isOver: isContentOver } = useDroppable({
    id: `${stage}-content`,
  });

  const candidateIds = candidates.map(candidate => candidate.id);

  // Combine all isOver states
  const isAnyOver = isOver || isHeaderOver || isContentOver;

  const handleHeaderClick = () => {
    if (onExpansionChange) {
      onExpansionChange(!isExpanded);
    }
  };

  return (
    <div 
      ref={setNodeRef}
      className={`bg-white rounded-lg shadow-sm transition-all duration-200 ${
        isExpanded 
          ? 'w-full lg:min-w-[280px] lg:max-w-[320px] lg:flex-shrink-0' 
          : 'w-full lg:w-[120px] lg:flex-shrink-0 lg:h-fit'
      } ${
        isAnyOver 
          ? 'ring-2 ring-purple-500 ring-opacity-50 bg-purple-50 shadow-lg transform scale-[1.02]' 
          : 'hover:shadow-md'
      }`}
    >
      {/* Stage Header - Clickable to toggle and also a drop zone */}
      <div 
        ref={setHeaderNodeRef}
        className={`border-t-4 rounded-t-lg cursor-pointer transition-colors ${getStageColor(stage, pipeline)} ${
          isExpanded 
            ? 'px-4 py-3 flex justify-between items-center hover:bg-opacity-80' 
            : `px-2 py-4 lg:py-8 flex flex-col items-center text-center lg:h-[200px] lg:justify-center relative ${
                isAnyOver ? 'bg-opacity-90 ring-2 ring-purple-400 ring-opacity-30' : 'hover:bg-opacity-80'
              }`
        }`}
        onClick={handleHeaderClick}
      >
        {isExpanded ? (
          // Expanded layout - horizontal
          <>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {/* Expand/Collapse Icon */}
              <div className="text-gray-600 flex-shrink-0">
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-semibold text-gray-800 truncate">{stage}</h2>
                  {isAnyOver && (
                    <span className="text-xs text-purple-600 font-medium bg-purple-100 px-2 py-1 rounded-full animate-pulse whitespace-nowrap">
                      Drop card here
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{candidates.length} candidates</p>
              </div>
            </div>
            
            {/* Action buttons - only show when expanded */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button 
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-white/50"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent toggle when clicking action buttons
                }}
              >
                <Plus className="w-4 h-4" />
              </button>
              <button 
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-white/50"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent toggle when clicking action buttons
                }}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          // Collapsed layout - vertical
          <>
            <div className="text-gray-600 flex-shrink-0 mb-2">
              <ChevronRight className="w-4 h-4" />
            </div>
            <div className="text-center">
              <div className="flex flex-col items-center lg:flex-row lg:justify-center lg:gap-1">
                <h2 className="font-semibold text-gray-800 text-sm lg:text-xs lg:leading-tight lg:transform lg:-rotate-90 lg:whitespace-nowrap lg:origin-center">{stage}</h2>
                {isAnyOver && (
                  <span className="mt-1 lg:mt-0 text-[10px] text-purple-600 font-medium bg-purple-100 px-1 py-0.5 rounded-full animate-pulse lg:transform lg:-rotate-90 lg:whitespace-nowrap">
                    Drop here
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 lg:text-[10px] mt-1">{candidates.length}</p>
            </div>
          </>
        )}
      </div>
      
      {/* Drop Zone - Always present for drag and drop, but content changes based on expanded state */}
      <div 
        ref={setContentNodeRef}
        className={`transition-all duration-200 ${
          isExpanded 
            ? `p-2 overflow-y-auto max-h-[200px] lg:max-h-[calc(100vh-500px)] min-h-[100px] lg:min-h-[200px]`
            : isAnyOver 
              ? 'h-12 p-2 border-t border-purple-300 bg-purple-50 flex items-center justify-center' 
              : 'h-0 overflow-hidden'
        } ${
          isAnyOver && isExpanded ? 'bg-purple-25' : ''
        }`}>
        {isExpanded ? (
          <>
            <SortableContext items={candidateIds} strategy={verticalListSortingStrategy}>
              {candidates.map((candidate) => {
                const isMoving = movingCandidates.has(candidate.id);
                const isPending = pendingMoves.has(candidate.id);
                
                return (
                  <DraggableCandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onClick={() => onCandidateClick?.(candidate)}
                    onRemove={() => onCandidateRemove?.(candidate)}
                    isPending={isPending || isMoving}
                  />
                );
              })}
            </SortableContext>
            
            {/* Always show a drop area at the bottom, even when there are cards */}
            <div className={`mt-2 py-4 rounded-lg border-2 border-dashed transition-colors min-h-[40px] ${
              isAnyOver 
                ? 'border-purple-300 bg-purple-50 text-purple-600' 
                : 'border-gray-200 border-opacity-50'
            }`}>
              {isAnyOver && (
                <p className="text-xs text-center text-purple-600 font-medium">
                  Drop candidate here
                </p>
              )}
            </div>
            
            {/* Empty State for Stage - only show when truly empty */}
            {candidates.length === 0 && (
              <div className={`text-center py-8 rounded-lg border-2 border-dashed transition-colors ${
                isAnyOver 
                  ? 'border-purple-300 bg-purple-50 text-purple-600' 
                  : 'border-gray-200 text-gray-400'
              }`}>
                <Users className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">
                  {isAnyOver ? 'Drop candidate here' : 'No candidates in this stage'}
                </p>
              </div>
            )}
          </>
        ) : (
          /* Collapsed state - show drop indicator when dragging over */
          isAnyOver && (
            <div className="text-center text-purple-600 text-xs font-medium">
              Drop here
            </div>
          )
        )}
      </div>
    </div>
  );
};

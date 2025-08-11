import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverEvent,
} from '@dnd-kit/core';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Candidate } from '../../../data/mock';
import type { Pipeline } from '../../../../../services/pipelineService';
import { DraggableStageColumn } from './DraggableStageColumn';
import { DraggableCandidateCard } from './DraggableCandidateCard';

interface PipelineKanbanViewProps {
  candidates: Candidate[];
  pipeline?: Pipeline | null;
  onCandidateClick?: (candidate: Candidate) => void;
  onCandidateStageChange?: (candidateId: string, newStage: string) => void;
  onCandidateRemove?: (candidate: Candidate) => void;
  movingCandidates?: Set<string>;
}

export const PipelineKanbanView: React.FC<PipelineKanbanViewProps> = ({
  candidates,
  pipeline,
  onCandidateClick,
  onCandidateStageChange,
  onCandidateRemove,
  movingCandidates: externalMovingCandidates = new Set()
}) => {
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
  // Track pending moves for visual feedback and prevent flickering
  const [pendingMoves, setPendingMoves] = useState<Set<string>>(new Set());
  // Track candidates that are currently being moved (with loading state)
  const [movingCandidates, setMovingCandidates] = useState<Map<string, { originalStage: string; targetStage: string }>>(new Map());
  // Track global expand/collapse state
  const [expandAll, setExpandAll] = useState<boolean>(false);
  // Track individual column expansion states
  const [columnExpansion, setColumnExpansion] = useState<Map<string, boolean>>(new Map());

  // Combine external moving candidates with internal tracking
  const allMovingCandidates = new Set([...externalMovingCandidates, ...pendingMoves]);

  // Update optimistic candidates when prop candidates change, but preserve pending moves
  useEffect(() => {
    // Component updated - tracking for potential future debugging
  }, [candidates, pendingMoves, movingCandidates]);

  // Get stages from pipeline, sorted by order
  const stages = pipeline?.stages
    ?.filter(stage => stage.isActive)
    ?.sort((a, b) => a.order - b.order)
    ?.map(stage => stage.name) || [];

  // Handle expand/collapse all
  const handleExpandCollapseAll = () => {
    const newExpandAll = !expandAll;
    setExpandAll(newExpandAll);
    
    // Update all column states
    const newColumnExpansion = new Map();
    stages.forEach(stage => {
      newColumnExpansion.set(stage, newExpandAll);
    });
    setColumnExpansion(newColumnExpansion);
  };

  // Handle individual column expansion
  const handleColumnExpansion = (stage: string, isExpanded: boolean) => {
    setColumnExpansion(prev => new Map(prev.set(stage, isExpanded)));
    
    // Update global state based on individual column states
    const allExpanded = stages.every(s => columnExpansion.get(s) === true || (s === stage && isExpanded));
    const allCollapsed = stages.every(s => columnExpansion.get(s) === false || (s === stage && !isExpanded));
    
    if (allExpanded) {
      setExpandAll(true);
    } else if (allCollapsed) {
      setExpandAll(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getCandidatesByStage = (stage: string) => {
    const stageCandidates = candidates.filter(candidate => {
      // If candidate is being moved, show it in the target stage
      const movingInfo = movingCandidates.get(candidate.id);
      if (movingInfo) {
        return movingInfo.targetStage === stage;
      }
      return candidate.stage === stage;
    });
    
    return stageCandidates;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const candidate = candidates.find(c => c.id === active.id);
    setActiveCandidate(candidate || null);
  };
  const handleDragOver = (_event: DragOverEvent) => {
    // Optional: Add visual feedback during drag over
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCandidate(null);

    if (!over) return;

    const candidateId = active.id as string;
    let newStage = over.id as string;

    // Handle header drop zones (remove the -header suffix)
    if (newStage.includes('-header')) {
      newStage = newStage.replace('-header', '');
    }

    // Handle content drop zones (remove the -content suffix)
    if (newStage.includes('-content')) {
      newStage = newStage.replace('-content', '');
    }

    // Handle card drop zones (extract stage from card drop target)
    if (newStage.includes('-card-')) {
      const stagePart = newStage.split('-card-')[0];
      newStage = stagePart;
    }

    // Check if we're dropping over a stage column
    if (stages.includes(newStage)) {
      const candidate = candidates.find(c => c.id === candidateId);
      if (candidate && candidate.stage !== newStage) {
        // Immediately move candidate to target stage visually and track as moving
        setMovingCandidates(prev => new Map(prev.set(candidateId, {
          originalStage: candidate.stage,
          targetStage: newStage
        })));
        
        // Track this move as pending for additional visual feedback
        setPendingMoves(prev => new Set([...prev, candidateId]));
        
        try {
          // Call the actual stage change handler and await it
          if (onCandidateStageChange) {
            await onCandidateStageChange(candidateId, newStage);
          }
          
          // Clear states after successful move
          setTimeout(() => {
            setMovingCandidates(prev => {
              const newMap = new Map(prev);
              newMap.delete(candidateId);
              return newMap;
            });
            setPendingMoves(prev => {
              const newSet = new Set(prev);
              newSet.delete(candidateId);
              return newSet;
            });
          }, 500); // Longer delay to ensure server updates are reflected
        } catch (error) {
          // Revert to original position on error
          setMovingCandidates(prev => {
            const newMap = new Map(prev);
            newMap.delete(candidateId);
            return newMap;
          });
          setPendingMoves(prev => {
            const newSet = new Set(prev);
            newSet.delete(candidateId);
            return newSet;
          });
          
          console.error('Failed to move candidate:', error);
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/* Expand/Collapse All Toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleExpandCollapseAll}
          className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          {expandAll ? (
            <>
              <ChevronDown className="w-4 h-4" />
              Collapse All
            </>
          ) : (
            <>
              <ChevronRight className="w-4 h-4" />
              Expand All
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-2 mb-6 min-h-[calc(100vh-400px)]">
        {/* Mobile & Tablet: Stack columns vertically */}
        <div className="lg:hidden space-y-2">
          {stages.map((stage) => {
            const stageCandidates = getCandidatesByStage(stage);
            const isExpanded = columnExpansion.get(stage) ?? false;
            return (
              <DraggableStageColumn
                key={stage}
                stage={stage}
                candidates={stageCandidates}
                pipeline={pipeline}
                onCandidateClick={onCandidateClick}
                onCandidateRemove={onCandidateRemove}
                pendingMoves={allMovingCandidates}
                movingCandidates={movingCandidates}
                isExpanded={isExpanded}
                onExpansionChange={(expanded) => handleColumnExpansion(stage, expanded)}
              />
            );
          })}
        </div>
        
        {/* Desktop: Horizontal scrollable layout */}
        <div className="hidden lg:flex gap-2 overflow-x-auto w-full pb-4 items-start">
          {stages.map((stage) => {
            const stageCandidates = getCandidatesByStage(stage);
            const isExpanded = columnExpansion.get(stage) ?? false;
            return (
              <DraggableStageColumn
                key={stage}
                stage={stage}
                candidates={stageCandidates}
                pipeline={pipeline}
                onCandidateClick={onCandidateClick}
                onCandidateRemove={onCandidateRemove}
                pendingMoves={allMovingCandidates}
                movingCandidates={movingCandidates}
                isExpanded={isExpanded}
                onExpansionChange={(expanded) => handleColumnExpansion(stage, expanded)}
              />
            );
          })}
        </div>
      </div>

      <DragOverlay>
        {activeCandidate ? (
          <div className="rotate-3 transform">
            <DraggableCandidateCard
              candidate={activeCandidate}
              isDragging
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

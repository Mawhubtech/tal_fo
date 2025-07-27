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
    const newStage = over.id as string;

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
      <div className="flex flex-col lg:flex-row gap-4 mb-6 min-h-[calc(100vh-400px)]">
        {/* Mobile & Tablet: Stack columns vertically */}
        <div className="lg:hidden space-y-4">
          {stages.map((stage) => {
            const stageCandidates = getCandidatesByStage(stage);
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
              />
            );
          })}
        </div>
        
        {/* Desktop: Horizontal scrollable layout */}
        <div className="hidden lg:flex gap-4 overflow-x-auto w-full pb-4">
          {stages.map((stage) => {
            const stageCandidates = getCandidatesByStage(stage);
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

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
import type { Pipeline } from '../../../services/pipelineService';
import { SourcingDraggableStageColumn } from './SourcingDraggableStageColumn';
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

interface SourcingKanbanViewProps {
  candidates: SourcingCandidate[];
  pipeline?: Pipeline | null;
  onCandidateClick?: (candidate: SourcingCandidate) => void;
  onCandidateStageChange?: (candidateId: string, newStage: string) => void;
  onCandidateRemove?: (candidate: SourcingCandidate) => void;
}

export const SourcingKanbanView: React.FC<SourcingKanbanViewProps> = ({
  candidates,
  pipeline,
  onCandidateClick,
  onCandidateStageChange,
  onCandidateRemove
}) => {
  const [activeCandidate, setActiveCandidate] = useState<SourcingCandidate | null>(null);
  // Track pending moves for visual feedback and prevent flickering
  const [pendingMoves, setPendingMoves] = useState<Set<string>>(new Set());
  // Track candidates that are currently being moved (with loading state)
  const [movingCandidates, setMovingCandidates] = useState<Map<string, { originalStage: string; targetStage: string }>>(new Map());

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
    return candidates.filter(candidate => {
      // If candidate is being moved, show it in the target stage
      const movingInfo = movingCandidates.get(candidate.id);
      if (movingInfo) {
        return movingInfo.targetStage === stage;
      }
      return candidate.stage === stage;
    });
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
          
          console.error('Failed to move sourcing prospect:', error);
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
        <div className="lg:hidden space-y-1 sm:space-y-2 md:space-y-4">
          {stages.map((stage) => {
            const stageCandidates = getCandidatesByStage(stage);
            return (
              <SourcingDraggableStageColumn
                key={stage}
                stage={stage}
                candidates={stageCandidates}
                pipeline={pipeline}
                onCandidateClick={onCandidateClick}
                onCandidateRemove={onCandidateRemove}
                pendingMoves={pendingMoves}
                movingCandidates={movingCandidates}
              />
            );
          })}
        </div>
        
        {/* Desktop: Responsive grid layout */}
        <div className={`hidden lg:${stages.length <= 5 ? 'grid' : 'flex overflow-x-auto'} gap-1 sm:gap-2 md:gap-3 w-full pb-4`} 
             style={stages.length <= 5 ? { gridTemplateColumns: `repeat(${stages.length}, minmax(140px, 1fr))` } : undefined}>
          {stages.map((stage) => {
            const stageCandidates = getCandidatesByStage(stage);
            return (
              <SourcingDraggableStageColumn
                key={stage}
                stage={stage}
                candidates={stageCandidates}
                pipeline={pipeline}
                onCandidateClick={onCandidateClick}
                onCandidateRemove={onCandidateRemove}
                pendingMoves={pendingMoves}
                movingCandidates={movingCandidates}
              />
            );
          })}
        </div>
      </div>

      <DragOverlay>
        {activeCandidate ? (
          <div className="rotate-3 transform">
            <DraggableSourcingCandidateCard
              candidate={activeCandidate}
              isDragging
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

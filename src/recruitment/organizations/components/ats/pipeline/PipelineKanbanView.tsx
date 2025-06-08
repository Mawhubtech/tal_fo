import React from 'react';
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
import { STAGES } from '../../../data/mock';
import { DraggableStageColumn } from './DraggableStageColumn';
import { DraggableCandidateCard } from './DraggableCandidateCard';

interface PipelineKanbanViewProps {
  candidates: Candidate[];
  onCandidateClick?: (candidate: Candidate) => void;
  onCandidateStageChange?: (candidateId: string, newStage: string) => void;
}

export const PipelineKanbanView: React.FC<PipelineKanbanViewProps> = ({
  candidates,
  onCandidateClick,
  onCandidateStageChange
}) => {
  const [activeCandidate, setActiveCandidate] = React.useState<Candidate | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getCandidatesByStage = (stage: string) => {
    return candidates.filter(candidate => candidate.stage === stage);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const candidate = candidates.find(c => c.id === active.id);
    setActiveCandidate(candidate || null);
  };
  const handleDragOver = (_event: DragOverEvent) => {
    // Optional: Add visual feedback during drag over
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCandidate(null);

    if (!over) return;

    const candidateId = active.id as string;
    const newStage = over.id as string;

    // Check if we're dropping over a stage column
    if (STAGES.includes(newStage as any)) {
      const candidate = candidates.find(c => c.id === candidateId);
      if (candidate && candidate.stage !== newStage) {
        onCandidateStageChange?.(candidateId, newStage);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4 mb-6 overflow-x-auto min-h-[calc(100vh-400px)]">
        {STAGES.map((stage) => {
          const stageCandidates = getCandidatesByStage(stage);
          return (
            <DraggableStageColumn
              key={stage}
              stage={stage}
              candidates={stageCandidates}
              onCandidateClick={onCandidateClick}
            />
          );
        })}
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

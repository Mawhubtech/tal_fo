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
import { ClientOutreachDraggableStageColumn } from './ClientOutreachDraggableStageColumn';
import { DraggableClientOutreachProspectCard } from './DraggableClientOutreachProspectCard';

// Client outreach prospect interface
export interface ClientOutreachProspect {
  id: string;
  companyName: string;
  website?: string;
  industry?: string;
  location?: string;
  employeeCount?: number;
  sizeRange?: string;
  description?: string;
  status: string;
  priority: number;
  matchScore?: number;
  notes?: string;
  linkedinUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface ClientOutreachKanbanViewProps {
  prospects: ClientOutreachProspect[];
  stages: string[];
  onProspectClick?: (prospect: ClientOutreachProspect) => void;
  onProspectStageChange?: (prospectId: string, newStage: string) => void;
  onProspectRemove?: (prospect: ClientOutreachProspect) => void;
}

export const ClientOutreachKanbanView: React.FC<ClientOutreachKanbanViewProps> = ({
  prospects,
  stages,
  onProspectClick,
  onProspectStageChange,
  onProspectRemove
}) => {
  const [activeProspect, setActiveProspect] = useState<ClientOutreachProspect | null>(null);
  const [pendingMoves, setPendingMoves] = useState<Set<string>>(new Set());
  const [movingProspects, setMovingProspects] = useState<Map<string, { originalStage: string; targetStage: string }>>(new Map());

  useEffect(() => {
    // Component updated - tracking for potential future debugging
  }, [prospects, pendingMoves, movingProspects]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getProspectsByStage = (stage: string) => {
    return prospects.filter(prospect => {
      // If prospect is being moved, show it in the target stage
      const movingInfo = movingProspects.get(prospect.id);
      if (movingInfo) {
        return movingInfo.targetStage === stage;
      }
      return prospect.status === stage;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const prospect = prospects.find(p => p.id === active.id);
    setActiveProspect(prospect || null);
  };
  
  const handleDragOver = (_event: DragOverEvent) => {
    // Optional: Add visual feedback during drag over
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProspect(null);

    if (!over) return;

    const prospectId = active.id as string;
    const newStage = over.id as string;
    const prospect = prospects.find(p => p.id === prospectId);

    if (!prospect || prospect.status === newStage) return;

    // Add to pending moves
    setPendingMoves(prev => new Set(prev).add(prospectId));
    
    // Add to moving prospects for optimistic update
    setMovingProspects(prev => new Map(prev).set(prospectId, {
      originalStage: prospect.status,
      targetStage: newStage
    }));

    try {
      // Call the stage change handler
      await onProspectStageChange?.(prospectId, newStage);
    } catch (error) {
      console.error('Failed to move prospect:', error);
      
      // Revert optimistic update on error
      setMovingProspects(prev => {
        const newMap = new Map(prev);
        newMap.delete(prospectId);
        return newMap;
      });
    } finally {
      // Remove from pending moves
      setPendingMoves(prev => {
        const newSet = new Set(prev);
        newSet.delete(prospectId);
        return newSet;
      });
      
      // Remove from moving prospects after a delay to allow props to update
      setTimeout(() => {
        setMovingProspects(prev => {
          const newMap = new Map(prev);
          newMap.delete(prospectId);
          return newMap;
        });
      }, 100);
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
      <div className="flex gap-6 overflow-x-auto pb-6 min-h-[600px]">
        {stages.map((stage) => {
          const stageProspects = getProspectsByStage(stage);
          return (
            <ClientOutreachDraggableStageColumn
              key={stage}
              stage={stage}
              prospects={stageProspects}
              onProspectClick={onProspectClick}
              onProspectRemove={onProspectRemove}
              pendingMoves={pendingMoves}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeProspect && (
          <div className="rotate-3 opacity-95">
            <DraggableClientOutreachProspectCard
              prospect={activeProspect}
              isDragging={true}
              onClick={() => {}}
              onRemove={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

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
import { Pipeline } from '../../../../services/pipelineService';
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
  currentStageId?: string;
  currentStage?: {
    id: string;
    name: string;
    description?: string;
    type: string;
    order: number;
    color: string;
    icon?: string;
    isActive: boolean;
    isTerminal: boolean;
    metadata?: any;
    pipelineId: string;
    createdAt: string;
    updatedAt: string;
  };
  notes?: string;
  linkedinUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface ClientOutreachKanbanViewProps {
  prospects: ClientOutreachProspect[];
  pipeline: Pipeline;
  onProspectClick?: (prospect: ClientOutreachProspect) => void;
  onProspectStageChange?: (prospectId: string, newStage: string) => void;
  onProspectRemove?: (prospect: ClientOutreachProspect) => void;
}

export const ClientOutreachKanbanView: React.FC<ClientOutreachKanbanViewProps> = ({
  prospects,
  pipeline,
  onProspectClick,
  onProspectStageChange,
  onProspectRemove
}) => {
  const [activeProspect, setActiveProspect] = useState<ClientOutreachProspect | null>(null);

  // Extract stages from pipeline
  const stages = pipeline.stages.sort((a, b) => a.order - b.order);
  const [pendingMoves, setPendingMoves] = useState<Set<string>>(new Set());
  const [movingProspects, setMovingProspects] = useState<Map<string, { originalStage: string; targetStage: string }>>(new Map());

  useEffect(() => {
    // Performance: Using optimistic updates for instant UI feedback
    // No need to wait for server response to update the UI
  }, [prospects, pendingMoves, movingProspects]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Helper function to get the current stage ID for a prospect
  const getProspectStageId = (prospect: ClientOutreachProspect): string => {
    if (prospect.currentStageId) {
      return prospect.currentStageId;
    }
    if (prospect.currentStage?.id) {
      return prospect.currentStage.id;
    }
    // Fallback to status for backward compatibility
    return prospect.status;
  };

  const getProspectsByStage = (stageId: string) => {
    const firstStageId = stages[0]?.id;
    
    return prospects.filter(prospect => {
      // If prospect is being moved, show it in the target stage
      const movingInfo = movingProspects.get(prospect.id);
      if (movingInfo) {
        return movingInfo.targetStage === stageId;
      }
      
      // Use the helper function to get the stage ID
      const prospectStageId = getProspectStageId(prospect);
      
      // If prospect has no stage or invalid stage, put it in the first stage
      if (!prospectStageId || !stages.find(s => s.id === prospectStageId)) {
        return stageId === firstStageId;
      }
      
      return prospectStageId === stageId;
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

    console.log('DEBUG: Drag end - prospectId:', prospectId, 'newStage:', newStage);
    console.log('DEBUG: Available stages:', stages.map(s => ({ id: s.id, name: s.name })));

    if (!prospect) return;

    // Use the helper function to get current stage
    const currentStageId = getProspectStageId(prospect);
    if (currentStageId === newStage) return;

    // Immediately move prospect to target stage visually with minimal feedback
    setMovingProspects(prev => new Map(prev.set(prospectId, {
      originalStage: currentStageId,
      targetStage: newStage
    })));
    
    // Use a shorter pending state since updates are optimistic
    setPendingMoves(prev => new Set([...prev, prospectId]));

    try {
      // Call the stage change handler with optimistic updates
      await onProspectStageChange?.(prospectId, newStage);
      
      // Clear states immediately since we're using optimistic updates
      setMovingProspects(prev => {
        const newMap = new Map(prev);
        newMap.delete(prospectId);
        return newMap;
      });
      setPendingMoves(prev => {
        const newSet = new Set(prev);
        newSet.delete(prospectId);
        return newSet;
      });
    } catch (error) {
      console.error('Failed to move prospect:', error);
      
      // Revert optimistic update on error
      setMovingProspects(prev => {
        const newMap = new Map(prev);
        newMap.delete(prospectId);
        return newMap;
      });
      setPendingMoves(prev => {
        const newSet = new Set(prev);
        newSet.delete(prospectId);
        return newSet;
      });
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
          const stageProspects = getProspectsByStage(stage.id);
          return (
            <ClientOutreachDraggableStageColumn
              key={stage.id}
              stage={stage}
              prospects={stageProspects}
              onProspectClick={onProspectClick}
              onProspectRemove={onProspectRemove}
              pendingMoves={pendingMoves}
              movingProspects={movingProspects}
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

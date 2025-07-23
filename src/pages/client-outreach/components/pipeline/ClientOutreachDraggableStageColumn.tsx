import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Building } from 'lucide-react';
import { DraggableClientOutreachProspectCard } from './DraggableClientOutreachProspectCard';
import type { ClientOutreachProspect } from './ClientOutreachKanbanView';

interface ClientOutreachDraggableStageColumnProps {
  stage: string;
  prospects: ClientOutreachProspect[];
  onProspectClick?: (prospect: ClientOutreachProspect) => void;
  onProspectRemove?: (prospect: ClientOutreachProspect) => void;
  pendingMoves: Set<string>;
}

const getStageColor = (stage: string) => {
  switch (stage.toLowerCase()) {
    case 'new':
      return 'bg-blue-50 border-blue-200';
    case 'contacted':
      return 'bg-yellow-50 border-yellow-200';
    case 'responded':
      return 'bg-green-50 border-green-200';
    case 'meeting_scheduled':
      return 'bg-purple-50 border-purple-200';
    case 'qualified':
      return 'bg-emerald-50 border-emerald-200';
    case 'unqualified':
      return 'bg-red-50 border-red-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

const getStageHeaderColor = (stage: string) => {
  switch (stage.toLowerCase()) {
    case 'new':
      return 'text-blue-700 bg-blue-100';
    case 'contacted':
      return 'text-yellow-700 bg-yellow-100';
    case 'responded':
      return 'text-green-700 bg-green-100';
    case 'meeting_scheduled':
      return 'text-purple-700 bg-purple-100';
    case 'qualified':
      return 'text-emerald-700 bg-emerald-100';
    case 'unqualified':
      return 'text-red-700 bg-red-100';
    default:
      return 'text-gray-700 bg-gray-100';
  }
};

export const ClientOutreachDraggableStageColumn: React.FC<ClientOutreachDraggableStageColumnProps> = ({
  stage,
  prospects,
  onProspectClick,
  onProspectRemove,
  pendingMoves
}) => {
  const {
    isOver,
    setNodeRef
  } = useDroppable({
    id: stage,
  });

  const prospectIds = prospects.map(prospect => prospect.id);

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 rounded-lg border-2 transition-colors ${
        isOver 
          ? 'border-blue-400 bg-blue-50' 
          : getStageColor(stage)
      }`}
    >
      {/* Stage Header */}
      <div className={`p-4 rounded-t-lg ${getStageHeaderColor(stage)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            <h3 className="font-semibold capitalize">
              {stage.replace('_', ' ')}
            </h3>
          </div>
          <span className="text-sm font-medium bg-white bg-opacity-50 px-2 py-1 rounded-full">
            {prospects.length}
          </span>
        </div>
      </div>

      {/* Prospects List */}
      <div className="p-3 space-y-3 min-h-[500px] max-h-[600px] overflow-y-auto">
        <SortableContext items={prospectIds} strategy={verticalListSortingStrategy}>
          {prospects.map((prospect) => (
            <DraggableClientOutreachProspectCard
              key={prospect.id}
              prospect={prospect}
              onClick={() => onProspectClick?.(prospect)}
              onRemove={() => onProspectRemove?.(prospect)}
              isPending={pendingMoves.has(prospect.id)}
            />
          ))}
        </SortableContext>
        
        {prospects.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <Building className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No prospects in this stage</p>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Mail, Phone, GripVertical, Trash2 } from 'lucide-react';

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

interface DraggableSourcingCandidateCardProps {
  candidate: SourcingCandidate;
  onClick?: () => void;
  onRemove?: () => void;
  isDragging?: boolean;
  isPending?: boolean;
}

export const DraggableSourcingCandidateCard: React.FC<DraggableSourcingCandidateCardProps> = ({ 
  candidate,
  onClick,
  onRemove,
  isDragging = false,
  isPending = false
}) => {
  // Helper function to generate initials from name
  const getInitials = (name: string) => {
    if (!name || name.trim() === '') return '?';
    
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isBeingDragged,
  } = useSortable({
    id: candidate.id,
  });

  // Make each card also a drop target for the stage
  const { setNodeRef: setDropNodeRef, isOver } = useDroppable({
    id: `${candidate.stage}-card-${candidate.id}`,
  });

  // Combine both refs
  const setRefs = (node: HTMLElement | null) => {
    setNodeRef(node);
    setDropNodeRef(node);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setRefs}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg p-2 sm:p-3 mb-1 sm:mb-2 transition-all duration-200 ${
        isBeingDragged || isDragging
          ? 'shadow-lg ring-2 ring-purple-500 ring-opacity-50 opacity-90 cursor-grabbing' 
          : 'hover:shadow-md cursor-pointer'
      } ${
        isPending 
          ? 'opacity-75 pointer-events-none relative overflow-hidden border-blue-300 bg-blue-50' 
          : ''
      } ${
        isOver
          ? 'ring-2 ring-purple-400 ring-opacity-30 bg-purple-50 border-purple-300'
          : ''
      }`}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      {/* Pending indicator with loading animation */}
      {isPending && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100 to-transparent opacity-60 animate-pulse" />
          <div className="absolute top-2 right-2 w-3 h-3">
            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </>
      )}
      
      <div className="flex items-start gap-2">
        {/* Drag Handle */}
        <div 
          {...attributes}
          {...listeners}
          className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing flex-shrink-0 mt-1"
        >
          <GripVertical className="w-3 h-3" />
        </div>

        {/* Card Content - Simplified layout */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-purple-100 flex-shrink-0">
                {candidate.avatar ? (
                  <img 
                    src={candidate.avatar} 
                    alt={candidate.name} 
                    className="w-6 h-6 rounded-full object-cover" 
                  />
                ) : (
                  <span className="text-purple-600 font-medium text-xs">
                    {getInitials(candidate.name)}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick?.();
                  }}
                  className="text-sm font-medium text-gray-900 truncate hover:text-purple-600 hover:underline cursor-pointer transition-colors text-left block w-full"
                  title={`${candidate.name} - ${candidate.email} - ${candidate.phone || 'No phone'}`}
                >
                  {candidate.name}
                </button>
                <div className="text-xs text-gray-500 truncate">
                  {candidate.email}
                </div>
                {candidate.phone && (
                  <div className="text-xs text-gray-500 truncate">
                    {candidate.phone}
                  </div>
                )}
                
                {/* Sourcing-specific: Show source */}
                <div className="mt-1">
                  <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                    {candidate.source}
                  </span>
                </div>
              </div>
            </div>
            {/* Remove Button */}
            {onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors flex-shrink-0"
                title="Remove prospect from pipeline"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Mail, Phone, Star, GripVertical, Trash2 } from 'lucide-react';
import type { Candidate } from '../../../data/mock';
import { getScoreColor } from '../shared';

interface DraggableCandidateCardProps {
  candidate: Candidate;
  onClick?: () => void;
  onRemove?: () => void;
  isDragging?: boolean;
  isPending?: boolean; // Add pending state prop
}

export const DraggableCandidateCard: React.FC<DraggableCandidateCardProps> = ({ 
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg p-3 mb-2 transition-all duration-200 ${
        isBeingDragged || isDragging
          ? 'shadow-lg ring-2 ring-purple-500 ring-opacity-50 opacity-90 cursor-grabbing' 
          : 'hover:shadow-md cursor-pointer'
      } ${
        isPending 
          ? 'opacity-75 pointer-events-none relative overflow-hidden' 
          : ''
      }`}
    >
      {/* Pending indicator */}
      {isPending && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-pulse" />
      )}
      
      <div className="flex items-start gap-2">
        {/* Drag Handle */}
        <div 
          {...attributes}
          {...listeners}
          className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing flex-shrink-0 mt-1"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Card Content */}
        <div className="flex-1 min-w-0" onClick={onClick}>
          {/* Candidate Info */}
          <div className="flex items-center mb-2 gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-100 flex-shrink-0">
              {candidate.avatar ? (
                <img 
                  src={candidate.avatar} 
                  alt={candidate.name} 
                  className="w-8 h-8 rounded-full object-cover" 
                />
              ) : (
                <span className="text-purple-600 font-medium text-xs">
                  {getInitials(candidate.name)}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {candidate.name}
              </p>
              <div className="flex items-center">
                <Star className="w-3 h-3 text-yellow-400 mr-1 flex-shrink-0" />
                <span className={`text-xs font-medium ${getScoreColor(candidate.score)}`}>
                  {candidate.score}
                </span>
              </div>
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="text-xs text-gray-500 mb-2 space-y-1">
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate flex-1">{candidate.email}</span>
            </div>
            {candidate.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{candidate.phone}</span>
              </div>
            )}
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {candidate.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded truncate max-w-[80px]"
                title={tag}
              >
                {tag}
              </span>
            ))}
            {candidate.tags.length > 2 && (
              <span 
                className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                title={candidate.tags.slice(2).join(', ')}
              >
                +{candidate.tags.length - 2}
              </span>
            )}
          </div>
          
          {/* Applied Date */}
          <div className="flex items-center text-xs text-gray-400 mb-2 gap-1">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">Applied {new Date(candidate.appliedDate).toLocaleDateString()}</span>
          </div>
          
          {/* Source */}
          <div className="text-xs text-gray-500">
            Source: {candidate.source}
          </div>
        </div>

        {/* Remove Button */}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              onRemove();
            }}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors flex-shrink-0 self-start"
            title="Remove candidate from this job"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

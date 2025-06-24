import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Mail, Phone, Star, GripVertical } from 'lucide-react';
import type { Candidate } from '../../../data/mock';
import { getScoreColor } from '../shared';

interface DraggableCandidateCardProps {
  candidate: Candidate;
  onClick?: () => void;
  isDragging?: boolean;
}

export const DraggableCandidateCard: React.FC<DraggableCandidateCardProps> = ({ 
  candidate,
  onClick,
  isDragging = false
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
      }`}
    >
      <div className="flex items-start">
        {/* Drag Handle */}
        <div 
          {...attributes}
          {...listeners}
          className="text-gray-400 hover:text-gray-600 mr-2 mt-1 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Card Content */}
        <div className="flex-1 min-w-0" onClick={onClick}>          {/* Candidate Info */}
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full mr-2 flex items-center justify-center bg-purple-100">
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
                <Star className="w-3 h-3 text-yellow-400 mr-1" />
                <span className={`text-xs font-medium ${getScoreColor(candidate.score)}`}>
                  {candidate.score}
                </span>
              </div>
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="text-xs text-gray-500 mb-2 space-y-1">
            <div className="flex items-center">
              <Mail className="w-3 h-3 mr-1" />
              <span className="truncate">{candidate.email}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-3 h-3 mr-1" />
              <span>{candidate.phone}</span>
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {candidate.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {candidate.tags.length > 3 && (
              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                +{candidate.tags.length - 3}
              </span>
            )}
          </div>
          
          {/* Applied Date */}
          <div className="flex items-center text-xs text-gray-400 mb-2">
            <Calendar className="w-3 h-3 mr-1" />
            Applied {new Date(candidate.appliedDate).toLocaleDateString()}
          </div>
          
          {/* Source */}
          <div className="text-xs text-gray-500">
            Source: {candidate.source}
          </div>
        </div>
      </div>
    </div>
  );
};

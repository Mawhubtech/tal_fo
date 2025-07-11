import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Mail, Phone, Star, GripVertical, Trash2 } from 'lucide-react';

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

  // Render star rating with half-star support
  const renderStarRating = (rating: number, color = 'yellow', size = 'sm') => {
    const starSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
    const starColor = color === 'yellow' ? 'text-yellow-400' : 'text-purple-400';
    
    // Ensure rating is a valid number
    const validRating = typeof rating === 'number' && !isNaN(rating) ? Math.max(0, Math.min(5, rating)) : 0;
    
    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.floor(validRating);
          const isHalf = star === Math.floor(validRating) + 1 && validRating % 1 >= 0.5;
          
          return (
            <div key={star} className={`relative ${starSize}`}>
              {/* Background (empty) star */}
              <Star className={`${starSize} text-gray-300 absolute`} />
              
              {/* Filled or half-filled star */}
              {(isFilled || isHalf) && (
                <div 
                  className="absolute overflow-hidden"
                  style={{ 
                    width: isHalf ? '50%' : '100%',
                    height: '100%'
                  }}
                >
                  <Star className={`${starSize} ${starColor} fill-current`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
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
        <div className="flex-1 min-w-0">
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
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card drag from interfering
                  onClick?.();
                }}
                className="text-sm font-medium text-gray-900 truncate hover:text-purple-600 hover:underline cursor-pointer transition-colors text-left block w-full"
                title="Click to view full profile"
              >
                {candidate.name}
              </button>
            </div>
          </div>

          {/* Dual Rating Display */}
          <div className="mb-2 space-y-1">
            {/* Candidate Rating - Always show for consistency */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Candidate:</span>
              <div className="flex items-center">
                {candidate.candidateRating !== undefined && 
                 candidate.candidateRating !== null && 
                 typeof candidate.candidateRating === 'number' && 
                 candidate.candidateRating >= 0 ? (
                  <>
                    {renderStarRating(candidate.candidateRating, 'yellow', 'sm')}
                    <span className="ml-1 text-xs text-gray-600">{candidate.candidateRating.toFixed(1)}</span>
                  </>
                ) : (
                  <>
                    {renderStarRating(0, 'yellow', 'sm')}
                    <span className="ml-1 text-xs text-gray-500">No rating</span>
                  </>
                )}
              </div>
            </div>
            
            {/* Prospect Rating */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Pipeline:</span>
              <div className="flex items-center">
                {renderStarRating(typeof candidate.score === 'number' ? candidate.score : 0, 'purple', 'sm')}
                <span className="ml-1 text-xs text-gray-600">
                  {typeof candidate.score === 'number' && candidate.score > 0 ? candidate.score.toFixed(1) : 'No rating'}
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
            <span className="truncate">Added {new Date(candidate.appliedDate).toLocaleDateString()}</span>
          </div>
          
          {/* Source */}
          <div className="text-xs">
            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
              {candidate.source}
            </span>
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
            title="Remove prospect from pipeline"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

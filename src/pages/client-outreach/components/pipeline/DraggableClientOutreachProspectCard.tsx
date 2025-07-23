import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Building, 
  MapPin, 
  Users, 
  ExternalLink, 
  X, 
  Loader2,
  Star,
  Globe
} from 'lucide-react';
import type { ClientOutreachProspect } from './ClientOutreachKanbanView';

interface DraggableClientOutreachProspectCardProps {
  prospect: ClientOutreachProspect;
  onClick?: () => void;
  onRemove?: () => void;
  isPending?: boolean;
  isDragging?: boolean;
}

const getPriorityColor = (priority: number) => {
  switch (priority) {
    case 1:
      return 'bg-red-100 text-red-800 border-red-200';
    case 2:
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 3:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'new':
      return 'bg-blue-100 text-blue-800';
    case 'contacted':
      return 'bg-yellow-100 text-yellow-800';
    case 'responded':
      return 'bg-green-100 text-green-800';
    case 'meeting_scheduled':
      return 'bg-purple-100 text-purple-800';
    case 'qualified':
      return 'bg-emerald-100 text-emerald-800';
    case 'unqualified':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const DraggableClientOutreachProspectCard: React.FC<DraggableClientOutreachProspectCardProps> = ({
  prospect,
  onClick,
  onRemove,
  isPending = false,
  isDragging = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: prospect.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative bg-white rounded-lg border shadow-sm p-4 cursor-grab active:cursor-grabbing
        hover:shadow-md transition-all duration-200
        ${isDragging ? 'shadow-lg ring-2 ring-blue-500 ring-opacity-50' : ''}
        ${isPending ? 'opacity-50' : ''}
      `}
      onClick={onClick}
    >
      {/* Loading indicator for pending operations */}
      {isPending && (
        <div className="absolute inset-0 bg-white bg-opacity-80 rounded-lg flex items-center justify-center z-10">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        </div>
      )}

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors z-20"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Company Name */}
      <div className="mb-3">
        <h4 className="font-semibold text-gray-900 pr-6 text-sm leading-tight">
          {prospect.companyName}
        </h4>
      </div>

      {/* Priority and Status Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(prospect.priority)}`}>
          Priority {prospect.priority}
        </span>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prospect.status)}`}>
          {prospect.status.replace('_', ' ')}
        </span>
      </div>

      {/* Company Details */}
      <div className="space-y-2 mb-3">
        {prospect.industry && (
          <div className="flex items-center text-xs text-gray-600">
            <Building className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">{prospect.industry}</span>
          </div>
        )}
        
        {prospect.location && (
          <div className="flex items-center text-xs text-gray-600">
            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">{prospect.location}</span>
          </div>
        )}

        {(prospect.employeeCount || prospect.sizeRange) && (
          <div className="flex items-center text-xs text-gray-600">
            <Users className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">
              {prospect.employeeCount ? `${prospect.employeeCount} employees` : prospect.sizeRange}
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      {prospect.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {prospect.description}
        </p>
      )}

      {/* Match Score */}
      {prospect.matchScore && (
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500">Match Score</span>
          <div className="flex items-center">
            <Star className="w-3 h-3 text-yellow-500 mr-1" />
            <span className="text-xs font-semibold text-green-600">
              {(prospect.matchScore * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      )}

      {/* Links */}
      <div className="flex gap-3">
        {prospect.website && (
          <a
            href={prospect.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700"
          >
            <Globe className="w-3 h-3 mr-1" />
            Website
          </a>
        )}
        {prospect.linkedinUrl && (
          <a
            href={prospect.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            LinkedIn
          </a>
        )}
      </div>

      {/* Footer with date */}
      <div className="mt-3 pt-2 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Added {new Date(prospect.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Notes indicator */}
      {prospect.notes && (
        <div className="absolute bottom-2 right-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

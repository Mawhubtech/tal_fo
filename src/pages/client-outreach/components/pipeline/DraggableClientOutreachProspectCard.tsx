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

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'new':
      return 'bg-purple-100 text-purple-800';
    case 'contacted':
      return 'bg-purple-100 text-purple-800';
    case 'responded':
      return 'bg-purple-100 text-purple-800';
    case 'meeting_scheduled':
      return 'bg-purple-100 text-purple-800';
    case 'qualified':
      return 'bg-purple-100 text-purple-800';
    case 'unqualified':
      return 'bg-gray-100 text-gray-800';
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
        ${isDragging ? 'shadow-lg ring-2 ring-purple-500 ring-opacity-50' : ''}
        ${isPending ? 'opacity-50' : ''}
      `}
      onClick={onClick}
    >
      {/* Loading indicator for pending operations */}
      {isPending && (
        <div className="absolute inset-0 bg-white bg-opacity-80 rounded-lg flex items-center justify-center z-10">
          <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
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
        <h4 
          className="font-semibold text-gray-900 pr-6 text-sm leading-tight cursor-pointer hover:text-purple-600 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          {prospect.companyName}
        </h4>
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


      </div>



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

    
    </div>
  );
};

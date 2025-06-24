import React from 'react';
import { Calendar, Clock, MapPin, Video, Phone, Users } from 'lucide-react';
import type { Interview } from '../../../data/mock';
import { getStatusColor } from '../shared';

interface InterviewCardProps {
  interview: Interview;
  onClick?: () => void;
}

export const InterviewCard: React.FC<InterviewCardProps> = ({ 
  interview, 
  onClick 
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

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'Video': return <Video className="w-4 h-4" />;
      case 'Phone': return <Phone className="w-4 h-4" />;
      case 'In-person': return <MapPin className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <div 
      className="px-6 py-4 hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-b-0"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">        <div className="flex items-start space-x-3 flex-1">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100">
            {interview.candidateAvatar ? (
              <img 
                src={interview.candidateAvatar} 
                alt={interview.candidateName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-purple-600 font-medium text-sm">
                {getInitials(interview.candidateName)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-gray-900">
                {interview.candidateName}
              </h4>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                {interview.status}
              </span>
            </div>
            
            <p className="text-sm text-purple-600 font-medium mb-2">
              {interview.interviewType} Interview
            </p>
            
            <div className="space-y-1 text-xs text-gray-500">
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-2" />
                <span>{new Date(interview.date).toLocaleDateString()}</span>
                <Clock className="w-3 h-3 mr-1 ml-3" />
                <span>
                  {new Date(interview.date).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} ({interview.duration}min)
                </span>
              </div>
              
              <div className="flex items-center">
                {getFormatIcon(interview.format)}
                <span className="ml-2">{interview.location}</span>
              </div>
              
              <div className="flex items-center">
                <Users className="w-3 h-3 mr-2" />
                <span>{interview.interviewers.join(', ')}</span>
              </div>
            </div>
            
            {interview.notes && (
              <p className="text-xs text-gray-600 mt-2 italic">
                {interview.notes}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

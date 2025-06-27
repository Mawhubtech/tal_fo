import React from 'react';
import { Calendar, Clock, MapPin, Video, Phone, Users, User, ExternalLink, Star, AlertCircle, CheckCircle } from 'lucide-react';
import type { Interview } from '../../../../../types/interview.types';

interface InterviewCardProps {
  interview: Interview;
  onClick?: () => void;
  showJobInfo?: boolean;
  onStatusUpdate?: (interview: Interview, status: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'In Progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    case 'Rescheduled':
      return 'bg-orange-100 text-orange-800';
    case 'No Show':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getParticipantStatusIcon = (status: string) => {
  switch (status) {
    case 'Accepted':
      return <CheckCircle className="w-3 h-3 text-green-600" />;
    case 'Declined':
      return <AlertCircle className="w-3 h-3 text-red-600" />;
    case 'Tentative':
      return <AlertCircle className="w-3 h-3 text-yellow-600" />;
    default:
      return <Clock className="w-3 h-3 text-gray-400" />;
  }
};

export const InterviewCard: React.FC<InterviewCardProps> = ({ 
  interview, 
  onClick,
  showJobInfo = false,
  onStatusUpdate
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

  const getFormatIcon = (mode: string) => {
    switch (mode) {
      case 'Video Call': return <Video className="w-4 h-4" />;
      case 'Phone Call': return <Phone className="w-4 h-4" />;
      case 'In-person': return <MapPin className="w-4 h-4" />;
      case 'Hybrid': return <Users className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const candidateName = interview.jobApplication?.candidate?.fullName || 
                       'Unknown Candidate';
  const candidateAvatar = interview.jobApplication?.candidate?.avatar;
  const candidateEmail = interview.jobApplication?.candidate?.email;
  const jobTitle = interview.jobApplication?.job?.title || 'Unknown Position';
  const jobDepartment = interview.jobApplication?.job?.department;
  const schedulerName = interview.scheduler ? 
    `${interview.scheduler.firstName} ${interview.scheduler.lastName}`.trim() : 
    'Unknown';

  // Process participants to show both user-based and manual participants
  const interviewers = interview.participants?.filter(p => 
    p.role === 'Interviewer' || p.role === 'Panel Member' || p.role === 'Hiring Manager'
  ) || [];

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let dateLabel = '';
    if (date.toDateString() === today.toDateString()) {
      dateLabel = 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateLabel = 'Tomorrow';
    } else {
      dateLabel = date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
      });
    }
    
    const timeLabel = date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    return `${dateLabel}, ${timeLabel}`;
  };

  const isUpcoming = new Date(interview.scheduledAt) > new Date();
  const isPastDue = new Date(interview.scheduledAt) < new Date() && interview.status === 'Scheduled';

  return (
    <div 
      className={`px-6 py-4 hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-b-0 transition-colors ${
        isPastDue ? 'bg-red-50' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          {/* Candidate Avatar */}
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-100 flex-shrink-0">
            {candidateAvatar ? (
              <img 
                src={candidateAvatar} 
                alt={candidateName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-purple-600 font-medium text-sm">
                {getInitials(candidateName)}
              </span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-gray-900 truncate">
                  {candidateName}
                </h4>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{jobTitle}</span>
                  {jobDepartment && (
                    <>
                      <span>•</span>
                      <span>{jobDepartment}</span>
                    </>
                  )}
                  {showJobInfo && candidateEmail && (
                    <>
                      <span>•</span>
                      <span className="text-blue-600">{candidateEmail}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                {isPastDue && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Overdue
                  </span>
                )}
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                  {interview.status}
                </span>
              </div>
            </div>
            
            {/* Interview Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">
                  {interview.type} Interview • {interview.stage}
                </p>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className={isPastDue ? 'text-red-600 font-medium' : ''}>
                      {formatDateTime(interview.scheduledAt)}
                    </span>
                    <span className="ml-2 text-gray-500">
                      ({interview.durationMinutes}min)
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    {getFormatIcon(interview.mode)}
                    <span className="ml-2 mr-2">
                      {interview.mode}
                    </span>
                    {interview.meetingLink && (
                      <a 
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                  </div>

                  {interview.location && interview.mode === 'In-person' && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{interview.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-xs">Scheduled by {schedulerName}</span>
                  </div>
                </div>
              </div>

              {/* Participants */}
              {interviewers.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Interviewers ({interviewers.length})
                  </p>
                  <div className="space-y-1">
                    {interviewers.slice(0, 3).map((participant, index) => {
                      const participantName = participant.user ? 
                        `${participant.user.firstName} ${participant.user.lastName}`.trim() :
                        participant.name || 'Unknown';
                      
                      return (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          {getParticipantStatusIcon(participant.status)}
                          <span className="ml-2 truncate">
                            {participantName}
                            {participant.email && !participant.user && (
                              <span className="text-gray-400 text-xs ml-1">
                                ({participant.email})
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                    {interviewers.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{interviewers.length - 3} more participants
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notes and Additional Info */}
            <div className="space-y-2">
              {interview.agenda && (
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Agenda: </span>
                  <span className="text-gray-600">{interview.agenda}</span>
                </div>
              )}
              
              {interview.notes && (
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Notes: </span>
                  <span className="text-gray-600 italic">{interview.notes}</span>
                </div>
              )}

              {interview.overallRating && (
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 mr-2">Rating:</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(interview.overallRating!) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">
                      ({interview.overallRating}/5)
                    </span>
                  </div>
                </div>
              )}

              {interview.result && (
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Result: </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    interview.result === 'Pass' ? 'bg-green-100 text-green-800' :
                    interview.result === 'Fail' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {interview.result}
                  </span>
                </div>
              )}

              {interview.nextSteps && (
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Next Steps: </span>
                  <span className="text-gray-600">{interview.nextSteps}</span>
                </div>
              )}

              {interview.cancellationReason && (
                <div className="text-sm">
                  <span className="font-medium text-red-700">Cancellation Reason: </span>
                  <span className="text-red-600">{interview.cancellationReason}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Update Dropdown */}
        {onStatusUpdate && (
          <div className="flex items-center ml-4 flex-shrink-0">
            <div className="relative">
              <select
                value={interview.status}
                onChange={(e) => {
                  e.stopPropagation();
                  onStatusUpdate(interview, e.target.value);
                }}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-8"
                onClick={(e) => e.stopPropagation()}
              >
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Rescheduled">Rescheduled</option>
                <option value="No Show">No Show</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

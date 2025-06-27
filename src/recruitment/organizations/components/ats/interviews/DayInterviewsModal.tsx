import React from 'react';
import { X, Calendar, Clock, MapPin, Video, Phone, Users, User } from 'lucide-react';
import type { Interview } from '../../../../../types/interview.types';

interface DayInterviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  interviews: Interview[];
  onInterviewClick: (interview: Interview) => void;
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

const getFormatIcon = (mode: string) => {
  switch (mode) {
    case 'Video Call': return <Video className="w-4 h-4" />;
    case 'Phone Call': return <Phone className="w-4 h-4" />;
    case 'In-person': return <MapPin className="w-4 h-4" />;
    case 'Hybrid': return <Users className="w-4 h-4" />;
    default: return <Calendar className="w-4 h-4" />;
  }
};

export const DayInterviewsModal: React.FC<DayInterviewsModalProps> = ({
  isOpen,
  onClose,
  date,
  interviews,
  onInterviewClick
}) => {
  if (!isOpen || !date) return null;

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  // Sort interviews by time
  const sortedInterviews = [...interviews].sort((a, b) => 
    new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  const getInitials = (name: string) => {
    if (!name || name.trim() === '') return '?';
    
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Interviews for {formatDate(date)}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {interviews.length} interview{interviews.length !== 1 ? 's' : ''} scheduled
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
            {sortedInterviews.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {sortedInterviews.map((interview) => {
                  const candidateName = interview.jobApplication?.candidate?.fullName || 'Unknown Candidate';
                  const candidateAvatar = interview.jobApplication?.candidate?.avatar;
                  const jobTitle = interview.jobApplication?.job?.title || 'Unknown Position';
                  const jobDepartment = interview.jobApplication?.job?.department;
                  
                  const time = new Date(interview.scheduledAt).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  });

                  const interviewers = interview.participants?.filter(p => 
                    p.role === 'Interviewer' || p.role === 'Panel Member' || p.role === 'Hiring Manager'
                  ) || [];

                  const isPastDue = new Date(interview.scheduledAt) < new Date() && interview.status === 'Scheduled';

                  return (
                    <div
                      key={interview.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        isPastDue ? 'bg-red-50' : ''
                      }`}
                      onClick={() => {
                        onInterviewClick(interview);
                        onClose();
                      }}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Candidate Avatar */}
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100 flex-shrink-0">
                          {candidateAvatar ? (
                            <img 
                              src={candidateAvatar} 
                              alt={candidateName}
                              className="w-10 h-10 rounded-full object-cover"
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
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <div>
                              <p className="text-sm font-medium text-purple-600 mb-1">
                                {interview.type} Interview • {interview.stage}
                              </p>
                              
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                  <span className={isPastDue ? 'text-red-600 font-medium' : ''}>
                                    {time}
                                  </span>
                                  <span className="ml-2 text-gray-500">
                                    ({interview.durationMinutes}min)
                                  </span>
                                </div>
                                
                                <div className="flex items-center">
                                  {getFormatIcon(interview.mode)}
                                  <span className="ml-2">
                                    {interview.mode}
                                  </span>
                                </div>

                                {interview.location && interview.mode === 'In-person' && (
                                  <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                    <span>{interview.location}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Participants */}
                            {interviewers.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                  Interviewers ({interviewers.length})
                                </p>
                                <div className="space-y-1">
                                  {interviewers.slice(0, 2).map((participant, index) => {
                                    const participantName = participant.user ? 
                                      `${participant.user.firstName} ${participant.user.lastName}`.trim() :
                                      participant.name || 'Unknown';
                                    
                                    return (
                                      <div key={index} className="flex items-center text-sm text-gray-600">
                                        <User className="w-3 h-3 mr-2 text-gray-400" />
                                        <span className="truncate">
                                          {participantName}
                                        </span>
                                      </div>
                                    );
                                  })}
                                  {interviewers.length > 2 && (
                                    <div className="text-xs text-gray-500">
                                      +{interviewers.length - 2} more
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Notes */}
                          {interview.agenda && (
                            <div className="mt-2 text-sm">
                              <span className="font-medium text-gray-700">Agenda: </span>
                              <span className="text-gray-600">{interview.agenda}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>No interviews scheduled for this day</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

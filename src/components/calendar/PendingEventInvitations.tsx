import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Check, 
  X,
  Mail,
  Users,
  Building2,
  AlertCircle,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { useMyPendingEventInvitations, useRespondToEventInvitation } from '../../hooks/useCalendarInvitations';
import { useMyPendingInvitations, useAcceptInvitation, useDeclineInvitation } from '../../hooks/useCompany';
import { useMyPendingJobInvitations, useAcceptInvitation as useAcceptJobInvitation, useDeclineInvitation as useDeclineJobInvitation } from '../../hooks/useJobCollaborators';
import type { EventInvitation } from '../../services/calendarApiService';
import type { CompanyMember } from '../../services/companyApiService';
import type { JobCollaborator } from '../../services/jobCollaboratorApiService';

interface PendingInvitationsProps {
  className?: string;
}

export const PendingInvitations: React.FC<PendingInvitationsProps> = ({ 
  className = '' 
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [processingInvitation, setProcessingInvitation] = useState<string | null>(null);

  const { data: eventInvitationsData, isLoading: eventInvitationsLoading, error: eventInvitationsError } = useMyPendingEventInvitations();
  const { data: companyInvitationsData, isLoading: companyInvitationsLoading, error: companyInvitationsError } = useMyPendingInvitations();
  const { data: jobInvitations = [], isLoading: jobInvitationsLoading } = useMyPendingJobInvitations();
  const respondToEventInvitationMutation = useRespondToEventInvitation();
  const acceptCompanyInvitationMutation = useAcceptInvitation();
  const declineCompanyInvitationMutation = useDeclineInvitation();
  const acceptJobInvitationMutation = useAcceptJobInvitation();
  const declineJobInvitationMutation = useDeclineJobInvitation();

  const eventInvitations = eventInvitationsData?.invitations || [];
  const companyInvitations = companyInvitationsData?.invitations || [];
  
  const isLoading = eventInvitationsLoading || companyInvitationsLoading || jobInvitationsLoading;
  const hasError = eventInvitationsError || companyInvitationsError;
  const totalInvitations = eventInvitations.length + companyInvitations.length + jobInvitations.length;

  const handleEventInvitationRespond = async (invitationId: string, response: 'accepted' | 'declined' | 'maybe') => {
    try {
      setErrorMessage(null);
      setProcessingInvitation(`event-${invitationId}-${response}`);
      await respondToEventInvitationMutation.mutateAsync({
        invitationId,
        response: {
          invitationId,
          response
        }
      });
      const responseText = response === 'accepted' ? 'accepted' : response === 'declined' ? 'declined' : 'marked as maybe';
      setSuccessMessage(`Event invitation ${responseText} successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to respond to event invitation:', error);
      const message = error.response?.data?.message || 'Failed to respond to event invitation';
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setProcessingInvitation(null);
    }
  };

  const handleCompanyInvitationAccept = async (invitation: CompanyMember) => {
    try {
      setErrorMessage(null);
      setProcessingInvitation(`company-${invitation.id}`);
      await acceptCompanyInvitationMutation.mutateAsync(invitation.id);
      setSuccessMessage('Company invitation accepted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to accept company invitation:', error);
      const message = error.response?.data?.message || 'Failed to accept company invitation';
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setProcessingInvitation(null);
    }
  };

  const handleCompanyInvitationDecline = async (invitation: CompanyMember) => {
    try {
      setErrorMessage(null);
      setProcessingInvitation(`company-decline-${invitation.id}`);
      await declineCompanyInvitationMutation.mutateAsync(invitation.id);
      setSuccessMessage('Company invitation declined');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to decline company invitation:', error);
      const message = error.response?.data?.message || 'Failed to decline company invitation';
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setProcessingInvitation(null);
    }
  };

  const handleJobInvitationAccept = async (invitation: JobCollaborator) => {
    try {
      setErrorMessage(null);
      setProcessingInvitation(`job-${invitation.id}`);
      await acceptJobInvitationMutation.mutateAsync(invitation.invitationToken!);
      setSuccessMessage(`Job invitation accepted! You can now collaborate on ${invitation.job?.title}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to accept job invitation:', error);
      const message = error.response?.data?.message || 'Failed to accept job invitation';
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setProcessingInvitation(null);
    }
  };

  const handleJobInvitationDecline = async (invitation: JobCollaborator) => {
    try {
      setErrorMessage(null);
      setProcessingInvitation(`job-decline-${invitation.id}`);
      await declineJobInvitationMutation.mutateAsync(invitation.invitationToken!);
      setSuccessMessage('Job invitation declined');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to decline job invitation:', error);
      const message = error.response?.data?.message || 'Failed to decline job invitation';
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setProcessingInvitation(null);
    }
  };

  const formatEventTime = (invitation: EventInvitation) => {
    if (!invitation.event) return '';
    
    const startDate = new Date(invitation.event.startDate);
    const endDate = new Date(invitation.event.endDate);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    let dateStr = '';
    if (startDate.toDateString() === today.toDateString()) {
      dateStr = 'Today';
    } else if (startDate.toDateString() === tomorrow.toDateString()) {
      dateStr = 'Tomorrow';
    } else {
      dateStr = startDate.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        weekday: 'short'
      });
    }

    if (invitation.event.isAllDay) {
      return `${dateStr} (All day)`;
    }

    const startTime = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return `${dateStr} ${startTime} - ${endTime}`;
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      interview: 'bg-purple-500',
      meeting: 'bg-purple-600',
      call: 'bg-purple-400',
      review: 'bg-purple-700',
      deadline: 'bg-red-500',
      follow_up: 'bg-purple-300',
      other: 'bg-gray-500'
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const formatCompanyRole = (role: string) => {
    switch (role) {
      case 'hr_agency_admin':
        return 'HR Agency Admin';
      case 'hr_agency_director':
        return 'HR Agency Director';
      case 'hr_agency_associate':
        return 'HR Agency Associate';
      case 'hr_agency_specialist':
        return 'HR Agency Specialist';
      default:
        return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getCompanyTypeLabel = (type: string) => {
    switch (type) {
      case 'internal_hr':
        return 'Internal HR Team';
      case 'external_hr_agency':
        return 'HR Agency';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Pending Invitations</h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading invitations...</p>
        </div>
      </div>
    );
  }

  // For development: Show empty state if error or no invitations
  // This handles the case where the backend endpoints aren't implemented yet
  if ((hasError && totalInvitations === 0) || totalInvitations === 0) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Pending Invitations</h3>
        </div>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No pending invitations</p>
          <p className="text-sm text-gray-500">You're all caught up! Invitations will appear here when you receive them.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Pending Invitations</h3>
          {totalInvitations > 0 && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
              {totalInvitations}
            </span>
          )}
        </div>
        {totalInvitations > 3 && (
          <Link 
            to="/dashboard/calendar" 
            className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <Check className="w-4 h-4 text-green-500 mr-2" />
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
            <p className="text-red-700 text-sm">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Company Invitations */}
        {companyInvitations.slice(0, Math.max(0, 3 - eventInvitations.length)).map((invitation) => (
          <div
            key={`company-${invitation.id}`}
            className="border border-gray-200 rounded-lg p-3 hover:border-purple-300 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <h4 className="font-medium text-gray-900 truncate text-sm">
                  Join {invitation.company?.name || 'Company'}
                </h4>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white bg-blue-500 flex-shrink-0">
                  Company
                </span>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleCompanyInvitationAccept(invitation)}
                  disabled={processingInvitation === `company-${invitation.id}`}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {processingInvitation === `company-${invitation.id}` ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  ) : (
                    <Check className="w-3 h-3" />
                  )}
                  Accept
                </button>
                <button
                  onClick={() => handleCompanyInvitationDecline(invitation)}
                  disabled={processingInvitation === `company-decline-${invitation.id}`}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {processingInvitation === `company-decline-${invitation.id}` ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                  Decline
                </button>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-1 truncate">
              {formatCompanyRole(invitation.role)}
              {invitation.title && ` • ${invitation.title}`}
            </p>
          </div>
        ))}

        {/* Job Collaborator Invitations */}
        {jobInvitations.slice(0, Math.max(0, 3 - companyInvitations.length)).map((invitation) => (
          <div
            key={`job-${invitation.id}`}
            className="border border-gray-200 rounded-lg p-3 hover:border-purple-300 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Briefcase className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <h4 className="font-medium text-gray-900 truncate text-sm">
                  {invitation.job?.title || 'Job Collaboration'}
                </h4>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white bg-purple-500 flex-shrink-0">
                  Job
                </span>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleJobInvitationAccept(invitation)}
                  disabled={processingInvitation === `job-${invitation.id}`}
                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  {processingInvitation === `job-${invitation.id}` ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  ) : (
                    <Check className="w-3 h-3" />
                  )}
                  Accept
                </button>
                <button
                  onClick={() => handleJobInvitationDecline(invitation)}
                  disabled={processingInvitation === `job-decline-${invitation.id}`}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {processingInvitation === `job-decline-${invitation.id}` ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                  Decline
                </button>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-1 truncate">
              {formatCompanyRole(invitation.role)}
              {invitation.invitedBy && ` • Invited by ${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName}`}
            </p>
          </div>
        ))}

        {/* Event Invitations */}
        {eventInvitations.slice(0, Math.max(0, 3 - companyInvitations.length)).map((invitation) => (
          <div
            key={`event-${invitation.id}`}
            className="border border-gray-200 rounded-lg p-3 hover:border-purple-300 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <h4 className="font-medium text-gray-900 truncate text-sm">
                  {invitation.event?.title || 'Event'}
                </h4>
                {invitation.event && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white flex-shrink-0 ${getEventTypeColor(invitation.event.type)}`}>
                    {invitation.event.type}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleEventInvitationRespond(invitation.id, 'accepted')}
                  disabled={processingInvitation === `event-${invitation.id}-accepted`}
                  className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {processingInvitation === `event-${invitation.id}-accepted` ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  ) : (
                    <Check className="w-3 h-3" />
                  )}
                </button>
                
                <button
                  onClick={() => handleEventInvitationRespond(invitation.id, 'declined')}
                  disabled={processingInvitation === `event-${invitation.id}-declined`}
                  className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {processingInvitation === `event-${invitation.id}-declined` ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-1 truncate">
              {invitation.event && formatEventTime(invitation)}
              {invitation.invitedBy && ` • by ${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName}`}
            </p>
          </div>
        ))}

        {totalInvitations > 3 && (
          <div className="pt-2 border-t border-gray-200">
            <Link 
              to="/invitations" 
              className="block text-center text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              View {totalInvitations - 3} more invitation{totalInvitations - 3 !== 1 ? 's' : ''} →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

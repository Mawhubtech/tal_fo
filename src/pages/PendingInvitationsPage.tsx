import React from 'react';
import { Mail, Building2, Briefcase, Calendar, CheckCircle2, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { CompanyMember } from '../services/companyApiService';
import { useMyPendingInvitations, useAcceptInvitation } from '../hooks/useCompany';
import { useMyPendingJobInvitations, useAcceptInvitation as useAcceptJobInvitation } from '../hooks/useJobCollaborators';
import { useMyPendingEventInvitations, useRespondToEventInvitation } from '../hooks/useCalendarInvitations';
import { toast } from '../components/ToastContainer';
import type { JobCollaborator } from '../services/jobCollaboratorApiService';
import type { EventInvitation } from '../services/calendarApiService';

const PendingInvitationsPage: React.FC = () => {
  const { data: companyInvitationsData, isLoading: companyLoading, refetch: refetchCompany } = useMyPendingInvitations();
  const { data: jobInvitations = [], isLoading: jobLoading, refetch: refetchJob } = useMyPendingJobInvitations();
  const { data: eventInvitationsData, isLoading: eventLoading, refetch: refetchEvents } = useMyPendingEventInvitations();
  
  const acceptCompanyInvitation = useAcceptInvitation();
  const acceptJobInvitation = useAcceptJobInvitation();
  const respondToEventInvitation = useRespondToEventInvitation();

  const companyInvitations = companyInvitationsData?.invitations || [];
  const eventInvitations = eventInvitationsData?.invitations || [];
  const isLoading = companyLoading || jobLoading || eventLoading;

  const totalInvitations = companyInvitations.length + jobInvitations.length + eventInvitations.length;

  // Handlers
  const handleAcceptCompanyInvitation = async (invitation: CompanyMember) => {
    try {
      await acceptCompanyInvitation.mutateAsync(invitation.id);
      toast.success('Invitation Accepted', `Welcome to ${invitation.company.name}!`);
      refetchCompany();
    } catch (error: any) {
      console.error('Failed to accept invitation:', error);
      const errorMessage = error.response?.data?.message || 'Failed to accept invitation';
      toast.error('Accept Failed', errorMessage);
    }
  };

  const handleAcceptJobInvitation = async (invitation: JobCollaborator) => {
    try {
      await acceptJobInvitation.mutateAsync(invitation.invitationToken!);
      toast.success('Job Invitation Accepted', `You can now collaborate on ${invitation.job?.title}!`);
      refetchJob();
    } catch (error: any) {
      console.error('Failed to accept job invitation:', error);
      const errorMessage = error.response?.data?.message || 'Failed to accept invitation';
      toast.error('Accept Failed', errorMessage);
    }
  };

  const handleRespondToEventInvitation = async (invitationId: string, response: 'accepted' | 'declined' | 'maybe') => {
    try {
      await respondToEventInvitation.mutateAsync({
        invitationId,
        response: { invitationId, response }
      });
      toast.success('Response Sent', `Event invitation ${response}`);
      refetchEvents();
    } catch (error: any) {
      console.error('Failed to respond to event invitation:', error);
      const errorMessage = error.response?.data?.message || 'Failed to respond to invitation';
      toast.error('Response Failed', errorMessage);
    }
  };

  // Helper functions
  const formatExpiryDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
        year: startDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
      });
    }

    const timeStr = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    return `${dateStr} at ${timeStr}`;
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'hr_agency_admin':
        return 'HR Agency Admin';
      case 'hr_agency_director':
        return 'HR Agency Director';
      case 'hr_agency_associate':
        return 'HR Agency Associate';
      case 'hr_agency_specialist':
        return 'HR Agency Specialist';
      case 'admin':
        return 'Admin';
      case 'owner':
        return 'Owner';
      case 'viewer':
        return 'Viewer';
      case 'recruiter':
        return 'Recruiter';
      case 'hiring_manager':
        return 'Hiring Manager';
      default:
        return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getCompanyTypeLabel = (type: string) => {
    switch (type) {
      case 'internal_hr_team':
        return 'Internal HR Team';
      case 'external_hr_agency':
        return 'HR Agency';
      default:
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'interview': 'bg-blue-500',
      'meeting': 'bg-green-500',
      'screening': 'bg-purple-500',
      'assessment': 'bg-yellow-500',
      'other': 'bg-gray-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center space-x-3 mb-6">
            <Mail className="h-8 w-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Pending Invitations</h1>
          </div>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-purple-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pending Invitations</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage all your pending invitations in one place
                </p>
              </div>
            </div>
            
            {totalInvitations > 0 && (
              <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-semibold">
                {totalInvitations} Total
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        {totalInvitations > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Company Invitations */}
            <div className="bg-white border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Company</p>
                    <p className="text-2xl font-bold text-gray-900">{companyInvitations.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Invitations */}
            <div className="bg-white border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Job</p>
                    <p className="text-2xl font-bold text-gray-900">{jobInvitations.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Invitations */}
            <div className="bg-white border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Event</p>
                    <p className="text-2xl font-bold text-gray-900">{eventInvitations.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {totalInvitations === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Invitations</h3>
            <p className="text-gray-600 mb-6">
              You're all caught up! Invitations will appear here when you receive them.
            </p>
            <Link to="/dashboard">
              <Button variant="primary"
			  className='bg-purple-600 hover:bg-purple-700 text-white'
			  >
                Go to Dashboard
              </Button>
            </Link>
          </div>
        )}

        {/* Invitations List */}
        {totalInvitations > 0 && (
          <div className="space-y-6">
            {/* Company Invitations Section */}
            {companyInvitations.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                  Company Invitations ({companyInvitations.length})
                </h2>
                <div className="space-y-4">
                  {companyInvitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{invitation.company.name}</h3>
                            <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                              {getCompanyTypeLabel(invitation.company.type)}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-1">
                              <span className="font-medium">Role:</span>
                              <span className="text-blue-600 font-medium">
                                {getRoleDisplayName(invitation.role)}
                              </span>
                            </div>
                            
                            {invitation.title && (
                              <div className="flex items-center space-x-1">
                                <span className="font-medium">Title:</span>
                                <span>{invitation.title}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>Invited {formatExpiryDate(invitation.invitedAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>Expires {formatExpiryDate(invitation.invitationExpiresAt)}</span>
                            </div>
                          </div>

                          {invitation.company.description && (
                            <p className="text-sm text-gray-600 mt-3">{invitation.company.description}</p>
                          )}
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <Button
                            onClick={() => handleAcceptCompanyInvitation(invitation)}
                            disabled={acceptCompanyInvitation.isPending}
                            size="sm"
                            className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            {acceptCompanyInvitation.isPending ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            ) : (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                            <span>Accept</span>
                          </Button>
                          
                          <Button
                           
                            size="sm"
                             className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white"
                          >
                            <XCircle className="h-3 w-3" />
                            <span>Decline</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Job Invitations Section */}
            {jobInvitations.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
                  Job Collaboration Invitations ({jobInvitations.length})
                </h2>
                <div className="space-y-4">
                  {jobInvitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Briefcase className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{invitation.job?.title || 'Job Collaboration'}</h3>
                              <p className="text-sm text-gray-500">
                                Role: <span className="font-medium text-purple-600">{getRoleDisplayName(invitation.role)}</span>
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 space-y-2">
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>Invited {invitation.invitationSentAt ? formatExpiryDate(invitation.invitationSentAt) : 'Recently'}</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {invitation.canViewApplications && (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  View Applications
                                </span>
                              )}
                              {invitation.canMoveCandidates && (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                  Move Candidates
                                </span>
                              )}
                              {invitation.canEditJob && (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                  Edit Job
                                </span>
                              )}
                            </div>
                          </div>

                          {invitation.invitedBy && (
                            <p className="text-sm text-gray-600 mt-3">
                              Invited by {invitation.invitedBy.firstName} {invitation.invitedBy.lastName}
                            </p>
                          )}
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <Button
                            onClick={() => handleAcceptJobInvitation(invitation)}
                            disabled={acceptJobInvitation.isPending}
                            size="sm"
                            className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            {acceptJobInvitation.isPending ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            ) : (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                            <span>Accept</span>
                          </Button>
                          
                          <Button
                          
                            size="sm"
                            className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white"
                          >
                            <XCircle className="h-3 w-3" />
                            <span>Decline</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event Invitations Section */}
            {eventInvitations.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-green-600" />
                  Event Invitations ({eventInvitations.length})
                </h2>
                <div className="space-y-4">
                  {eventInvitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {invitation.event?.title || 'Event'}
                            </h3>
                            {invitation.event && (
                              <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getEventTypeColor(invitation.event.type)}`}>
                                {invitation.event.type}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">
                            Invited by {invitation.invitedBy.firstName} {invitation.invitedBy.lastName}
                          </p>

                          {invitation.event && (
                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4" />
                                <span>{formatEventTime(invitation)}</span>
                              </div>
                              
                              {invitation.event.location && (
                                <div className="flex items-center space-x-2">
                                  <Building2 className="w-4 h-4" />
                                  <span>{invitation.event.location}</span>
                                </div>
                              )}

                              {invitation.event.description && (
                                <p className="text-sm text-gray-600 mt-2">
                                  {invitation.event.description}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <Button
                            onClick={() => handleRespondToEventInvitation(invitation.id, 'accepted')}
                            disabled={respondToEventInvitation.isPending}
                            size="sm"
                            className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Accept</span>
                          </Button>
                          
                          <Button
                            onClick={() => handleRespondToEventInvitation(invitation.id, 'maybe')}
                            disabled={respondToEventInvitation.isPending}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-1 border-yellow-300 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-400"
                          >
                            <Clock className="h-3 w-3" />
                            <span>Maybe</span>
                          </Button>
                          
                          <Button
                            onClick={() => handleRespondToEventInvitation(invitation.id, 'declined')}
                            disabled={respondToEventInvitation.isPending}
                           
                            size="sm"
                             className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white"
                          >
                            <XCircle className="h-3 w-3" />
                            <span>Decline</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingInvitationsPage;

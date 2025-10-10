import React from 'react';
import { Building2, Calendar, CheckCircle2, XCircle, Clock, Briefcase } from 'lucide-react';
import Button from './Button';
import { CompanyMember } from '../services/companyApiService';
import { useMyPendingInvitations, useAcceptInvitation } from '../hooks/useCompany';
import { useMyPendingJobInvitations, useAcceptInvitation as useAcceptJobInvitation } from '../hooks/useJobCollaborators';
import { toast } from './ToastContainer';
import type { JobCollaborator } from '../services/jobCollaboratorApiService';

const PendingInvitations: React.FC = () => {
  const { data: companyInvitationsData, isLoading: companyLoading, refetch: refetchCompany } = useMyPendingInvitations();
  const { data: jobInvitations = [], isLoading: jobLoading, refetch: refetchJob } = useMyPendingJobInvitations();
  const acceptCompanyInvitation = useAcceptInvitation();
  const acceptJobInvitation = useAcceptJobInvitation();

  const companyInvitations = companyInvitationsData?.invitations || [];
  const isLoading = companyLoading || jobLoading;

  const handleAcceptInvitation = async (invitation: CompanyMember) => {
    try {
      await acceptCompanyInvitation.mutateAsync(invitation.id);
      toast.success('Invitation Accepted', `Welcome to ${invitation.company.name}!`);
      refetchCompany(); // Refresh the invitations list
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
      refetchJob(); // Refresh the invitations list
    } catch (error: any) {
      console.error('Failed to accept job invitation:', error);
      const errorMessage = error.response?.data?.message || 'Failed to accept invitation';
      toast.error('Accept Failed', errorMessage);
    }
  };

  const formatExpiryDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
      default:
        return role.replace('_', ' ');
    }
  };

  const getCompanyTypeLabel = (type: string) => {
    switch (type) {
      case 'internal_hr_team':
        return 'Internal HR Team';
      case 'external_hr_agency':
        return 'HR Agency';
      default:
        return type.replace('_', ' ');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Pending Invitations</h2>
        </div>
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const totalInvitations = companyInvitations.length + jobInvitations.length;

  if (totalInvitations === 0) {
    return null; // Don't show the component if there are no pending invitations
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <Building2 className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Pending Invitations</h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
          {totalInvitations}
        </span>
      </div>

      <div className="space-y-4">
        {/* Company Invitations */}
        {companyInvitations.map((invitation) => (
          <div
            key={invitation.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-medium text-gray-900">{invitation.company.name}</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
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
                  <p className="text-sm text-gray-600 mt-2">{invitation.company.description}</p>
                )}
              </div>

              <div className="flex space-x-2 ml-4">
                <Button
                  onClick={() => handleAcceptInvitation(invitation)}
                  disabled={acceptCompanyInvitation.isPending}
                  variant="primary"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  {acceptCompanyInvitation.isPending ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  ) : (
                    <CheckCircle2 className="h-3 w-3" />
                  )}
                  <span>Accept</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                >
                  <XCircle className="h-3 w-3" />
                  <span>Decline</span>
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Job Collaborator Invitations */}
        {jobInvitations.map((invitation) => (
          <div
            key={invitation.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{invitation.job?.title || 'Job Collaboration'}</h3>
                    <p className="text-sm text-gray-500">
                      Role: <span className="font-medium">{getRoleDisplayName(invitation.role)}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-2 space-y-1 text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Invited {invitation.invitationSentAt ? formatExpiryDate(invitation.invitationSentAt) : 'Recently'}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {invitation.canViewApplications && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        View Applications
                      </span>
                    )}
                    {invitation.canMoveCandidates && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Move Candidates
                      </span>
                    )}
                    {invitation.canEditJob && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        Edit Job
                      </span>
                    )}
                  </div>
                </div>

                {invitation.invitedBy && (
                  <p className="text-sm text-gray-600 mt-2">
                    Invited by {invitation.invitedBy.firstName} {invitation.invitedBy.lastName}
                  </p>
                )}
              </div>

              <div className="flex space-x-2 ml-4">
                <Button
                  onClick={() => handleAcceptJobInvitation(invitation)}
                  disabled={acceptJobInvitation.isPending}
                  variant="primary"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  {acceptJobInvitation.isPending ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  ) : (
                    <CheckCircle2 className="h-3 w-3" />
                  )}
                  <span>Accept</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
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
  );
};

export default PendingInvitations;

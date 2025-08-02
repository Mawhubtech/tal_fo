import React from 'react';
import { Building2, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Button from './Button';
import { CompanyMember } from '../services/companyApiService';
import { useMyPendingInvitations, useAcceptInvitation } from '../hooks/useCompany';
import { toast } from './ToastContainer';

const PendingInvitations: React.FC = () => {
  const { data: invitationsData, isLoading, refetch } = useMyPendingInvitations();
  const acceptInvitation = useAcceptInvitation();

  const invitations = invitationsData?.invitations || [];

  const handleAcceptInvitation = async (invitation: CompanyMember) => {
    try {
      await acceptInvitation.mutateAsync(invitation.id);
      toast.success('Invitation Accepted', `Welcome to ${invitation.company.name}!`);
      refetch(); // Refresh the invitations list
    } catch (error: any) {
      console.error('Failed to accept invitation:', error);
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

  if (invitations.length === 0) {
    return null; // Don't show the component if there are no pending invitations
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <Building2 className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Pending Invitations</h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
          {invitations.length}
        </span>
      </div>

      <div className="space-y-4">
        {invitations.map((invitation) => (
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
                  disabled={acceptInvitation.isPending}
                  variant="primary"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  {acceptInvitation.isPending ? (
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

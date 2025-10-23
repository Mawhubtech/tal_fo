import React from 'react';
import { Mail, Building2, Calendar, Check, X, Loader2 } from 'lucide-react';
import { useMyPendingInvitations, useAcceptInvitation } from '../../hooks/useCompany';
import { CompanyMember } from '../../services/companyApiService';
import { toast } from '../ToastContainer';

const PendingInvitations: React.FC = () => {
  const { data: invitationsData, isLoading, error } = useMyPendingInvitations();
  const acceptInvitation = useAcceptInvitation();

  const invitations = invitationsData?.invitations || [];

  const handleAcceptInvitation = async (invitation: CompanyMember) => {
    try {
      await acceptInvitation.mutateAsync(invitation.id);
      toast.success('Invitation Accepted', `Welcome to ${invitation.company?.name}!`);
    } catch (error: any) {
      console.error('Failed to accept invitation:', error);
      const errorMessage = error.response?.data?.message || 'Failed to accept invitation';
      toast.error('Failed to Accept', errorMessage);
    }
  };

  const handleDeclineInvitation = (invitation: CompanyMember) => {
    // TODO: Implement decline functionality
    toast.info('Feature Coming Soon', 'Invitation decline functionality will be available soon.');
  };

  const formatRole = (role: string) => {
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

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading invitations...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-4 text-red-600">
          <X className="h-5 w-5 mr-2" />
          Failed to load invitations
        </div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return null; // Don't show the component if there are no invitations
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <Mail className="h-5 w-5 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">
            Pending Invitations ({invitations.length})
          </h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          You have been invited to join these companies
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {invitations.map((invitation) => (
          <div key={invitation.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {invitation.company?.name || 'Unknown Company'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {invitation.company?.type ? getCompanyTypeLabel(invitation.company.type) : 'Unknown Type'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Role:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {formatRole(invitation.role)}
                    </span>
                  </div>
                  
                  {invitation.title && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Title:</span>
                      <span className="text-sm text-gray-600">{invitation.title}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>Invited on {formatDate(invitation.invitedAt)}</span>
                    <span>•</span>
                    <span>Expires {formatDate(invitation.invitationExpiresAt)}</span>
                  </div>
                </div>

                {invitation.company?.description && (
                  <p className="text-sm text-gray-600 mb-4">
                    {invitation.company.description}
                  </p>
                )}
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <button
                  onClick={() => handleAcceptInvitation(invitation)}
                  disabled={acceptInvitation.isPending}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {acceptInvitation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Accept
                </button>
                
                <button
                  onClick={() => handleDeclineInvitation(invitation)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <X className="h-4 w-4 mr-2" />
                  Decline
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingInvitations;

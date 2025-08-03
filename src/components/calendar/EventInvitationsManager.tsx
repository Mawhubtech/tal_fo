import React, { useState } from 'react';
import { X, Mail, Trash2, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { CalendarEvent, EventInvitation } from '../../services/calendarApiService';
import { useEventInvitations, useCancelEventInvitation, useResendEventInvitation } from '../../hooks/useCalendarInvitations';

interface EventInvitationsManagerProps {
  event: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
}

const EventInvitationsManager: React.FC<EventInvitationsManagerProps> = ({
  event,
  isOpen,
  onClose
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [invitationToCancel, setInvitationToCancel] = useState<EventInvitation | null>(null);
  
  const { data: invitationsData, isLoading, error } = useEventInvitations(event.id);
  const cancelInvitationMutation = useCancelEventInvitation();
  const resendInvitationMutation = useResendEventInvitation();

  const invitations = invitationsData?.invitations || [];

  const handleCancelInvitation = async (invitationId: string) => {
    const invitation = invitations.find(inv => inv.id === invitationId);
    if (invitation) {
      setInvitationToCancel(invitation);
      setShowCancelConfirmation(true);
    }
  };

  const handleConfirmCancelInvitation = async () => {
    if (invitationToCancel) {
      try {
        setErrorMessage(null);
        await cancelInvitationMutation.mutateAsync(invitationToCancel.id);
        setSuccessMessage('Invitation cancelled successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error: any) {
        console.error('Failed to cancel invitation:', error);
        const message = error.response?.data?.message || 'Failed to cancel invitation';
        setErrorMessage(message);
        setTimeout(() => setErrorMessage(null), 5000);
      } finally {
        setShowCancelConfirmation(false);
        setInvitationToCancel(null);
      }
    }
  };

  const handleCancelConfirmation = () => {
    setShowCancelConfirmation(false);
    setInvitationToCancel(null);
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      setErrorMessage(null);
      await resendInvitationMutation.mutateAsync(invitationId);
      setSuccessMessage('Invitation resent successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to resend invitation:', error);
      const message = error.response?.data?.message || 'Failed to resend invitation';
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const getStatusIcon = (status: EventInvitation['status']) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'declined':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'maybe':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: EventInvitation['status']) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'declined':
        return 'Declined';
      case 'maybe':
        return 'Maybe';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: EventInvitation['status']) => {
    switch (status) {
      case 'accepted':
        return 'text-green-600 bg-green-50';
      case 'declined':
        return 'text-red-600 bg-red-50';
      case 'maybe':
        return 'text-yellow-600 bg-yellow-50';
      case 'pending':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Event Participants</h2>
            <p className="text-sm text-gray-600 mt-1">{event.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              <p className="text-green-700 text-sm">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
              <p className="text-red-700 text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading participants...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Failed to load participants</p>
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No invitations sent yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {getStatusIcon(invitation.status)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">
                          {invitation.inviteeName || invitation.inviteeEmail}
                        </p>
                        {invitation.isExternal && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                            External
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{invitation.inviteeEmail}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invitation.status)}`}>
                          {getStatusText(invitation.status)}
                        </span>
                        {invitation.responseDate && (
                          <span className="text-xs text-gray-500">
                            Responded {new Date(invitation.responseDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {invitation.responseMessage && (
                        <p className="text-sm text-gray-600 mt-1 italic">
                          "{invitation.responseMessage}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleResendInvitation(invitation.id)}
                      disabled={resendInvitationMutation.isPending}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Resend Invitation"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCancelInvitation(invitation.id)}
                      disabled={cancelInvitationMutation.isPending}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Cancel Invitation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Participants can change their response at any time from their dashboard or via email links.
            </p>
          </div>
        </div>
      </div>

      {/* Cancel Invitation Confirmation Modal */}
      {showCancelConfirmation && invitationToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10001]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cancel Invitation</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to cancel the invitation for{' '}
                <strong>{invitationToCancel.inviteeName || invitationToCancel.inviteeEmail}</strong>?
              </p>
              <p className="text-sm text-gray-600 mt-2">
                They will no longer receive updates about this event and won't be able to respond to the invitation.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelConfirmation}
                disabled={cancelInvitationMutation.isPending}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md disabled:opacity-50"
              >
                Keep Invitation
              </button>
              <button
                onClick={handleConfirmCancelInvitation}
                disabled={cancelInvitationMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {cancelInvitationMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Cancelling...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Cancel Invitation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventInvitationsManager;

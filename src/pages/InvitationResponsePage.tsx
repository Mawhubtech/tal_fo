import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, XCircle, AlertCircle, Clock, MapPin, ExternalLink } from 'lucide-react';
import { calendarApiService } from '../services/calendarApiService';

const InvitationResponsePage: React.FC = () => {
  const { invitationId } = useParams<{ invitationId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [invitation, setInvitation] = useState<any>(null);
  
  const response = searchParams.get('response') as 'accepted' | 'declined' | 'maybe' | null;

  useEffect(() => {
    if (!invitationId || !response) {
      setError('Invalid invitation link');
      return;
    }

    // Auto-respond if response is provided
    handleResponse();
  }, [invitationId, response]);

  const handleResponse = async () => {
    if (!invitationId || !response) return;

    setLoading(true);
    setError(null);

    try {
      const result = await calendarApiService.respondToEventInvitationByLink(
        invitationId,
        response,
        message
      );
      setInvitation(result.invitation);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to respond to invitation');
    } finally {
      setLoading(false);
    }
  };

  const getResponseIcon = () => {
    switch (response) {
      case 'accepted':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'declined':
        return <XCircle className="w-16 h-16 text-red-500" />;
      case 'maybe':
        return <AlertCircle className="w-16 h-16 text-yellow-500" />;
      default:
        return <Calendar className="w-16 h-16 text-gray-500" />;
    }
  };

  const getResponseText = () => {
    switch (response) {
      case 'accepted':
        return 'You have accepted this invitation';
      case 'declined':
        return 'You have declined this invitation';
      case 'maybe':
        return 'You have responded "Maybe" to this invitation';
      default:
        return 'Invalid response';
    }
  };

  const getResponseColor = () => {
    switch (response) {
      case 'accepted':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'declined':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'maybe':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing your response...</h2>
            <p className="text-gray-600">Please wait while we update your invitation status.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full mx-4">
        <div className="text-center mb-8">
          {getResponseIcon()}
          <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
            Event Invitation Response
          </h1>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <XCircle className="w-6 h-6 text-red-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        ) : success && invitation ? (
          <>
            <div className={`border rounded-lg p-6 mb-6 ${getResponseColor()}`}>
              <h3 className="text-lg font-semibold mb-2">{getResponseText()}</h3>
              <p className="opacity-90">
                Your response has been recorded and the event organizer has been notified.
              </p>
            </div>

            {invitation.event && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{invitation.event.title}</p>
                      {invitation.event.description && (
                        <p className="text-gray-600 text-sm mt-1">{invitation.event.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-gray-900">
                        {new Date(invitation.event.startDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {new Date(invitation.event.startDate).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })} - {new Date(invitation.event.endDate).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                    </div>
                  </div>

                  {invitation.event.location && (
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                      <p className="text-gray-900">{invitation.event.location}</p>
                    </div>
                  )}

                  {invitation.event.meetingLink && (
                    <div className="flex items-center">
                      <ExternalLink className="w-5 h-5 text-gray-400 mr-3" />
                      <a 
                        href={invitation.event.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 hover:underline"
                      >
                        Join Meeting
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> You can change your response at any time by logging into your TAL account 
                and visiting the calendar section.
              </p>
            </div>
          </>
        ) : null}        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Login to TAL
          </button>
          <button
            onClick={() => window.close()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvitationResponsePage;

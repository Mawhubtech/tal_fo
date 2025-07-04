import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Check, X, Mail, Users, AlertCircle, UserPlus, ArrowRight } from 'lucide-react';
import { config } from '../../lib/config';

const AcceptInvitationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'verify' | 'account-info' | 'accept'>('verify');

  const token = searchParams.get('token');
  const teamId = searchParams.get('teamId');

  useEffect(() => {
    if (!token || !teamId) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    verifyInvitation();
  }, [token, teamId]);

  const verifyInvitation = async () => {
    try {
      console.log('Verifying invitation with:', { token, teamId });
      console.log('API URL:', `${config.apiBaseUrl}/hiring-teams/members/verify-access/${token}/${teamId}`);
      
      const response = await fetch(`${config.apiBaseUrl}/hiring-teams/members/verify-access/${token}/${teamId}`);
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success && data.hasAccess) {
        setInvitation(data.data);
        setStep('account-info');
      } else {
        setError(data.message || 'Invalid or expired invitation');
      }
    } catch (err) {
      console.error('Error verifying invitation:', err);
      setError('Failed to verify invitation');
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    if (!token || !teamId) return;

    setAccepting(true);
    try {
      console.log('Accepting invitation with:', { token, teamId });
      console.log('API URL:', `${config.apiBaseUrl}/hiring-teams/members/accept-invitation/${token}/${teamId}`);
      
      const response = await fetch(`${config.apiBaseUrl}/hiring-teams/members/accept-invitation/${token}/${teamId}`, {
        method: 'POST',
      });
      console.log('Accept response status:', response.status);
      
      const data = await response.json();
      console.log('Accept response data:', data);

      if (data.success) {
        // Redirect to success page with token and teamId for external access
        navigate(`/hiring-teams/invitation-accepted?token=${token}&teamId=${teamId}`);
      } else {
        setError(data.message || 'Failed to accept invitation');
      }
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError('Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Step 1: Account Information and Requirements
  if (step === 'account-info') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to TAL!</h1>
            <p className="text-gray-600">
              You've been invited to join the hiring team
            </p>
          </div>

          {invitation && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <Users className="w-5 h-5 text-purple-600 mr-2" />
                <span className="font-semibold text-gray-900">{invitation.team?.name}</span>
              </div>
              <p className="text-sm text-gray-600">
                Role: <span className="font-medium">{invitation.teamRole}</span>
              </p>
              {invitation.externalFirstName && (
                <p className="text-sm text-gray-600">
                  Invited as: <span className="font-medium">
                    {invitation.externalFirstName} {invitation.externalLastName}
                  </span>
                </p>
              )}
            </div>
          )}

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Before you can access the hiring dashboard:</p>
                <ul className="space-y-1 text-xs">
                  <li>• You'll need to create a TAL account (if you don't have one)</li>
                  <li>• Your account will be linked to this hiring team</li>
                  <li>• You'll get access to specific jobs and candidate information</li>
                  <li>• You can participate in the hiring process based on your role</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setStep('accept')}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Continue to Account Setup
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Not Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Accept invitation and account creation
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accept Team Invitation</h1>
          <p className="text-gray-600">
            Ready to join the team and access the hiring dashboard?
          </p>
        </div>

        {invitation && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <Users className="w-5 h-5 text-purple-600 mr-2" />
              <span className="font-semibold text-gray-900">{invitation.team?.name}</span>
            </div>
            <p className="text-sm text-gray-600">
              Role: <span className="font-medium">{invitation.teamRole}</span>
            </p>
          </div>
        )}

        <div className="bg-yellow-50 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">What happens next:</p>
              <ul className="space-y-1 text-xs">
                <li>• If you don't have a TAL account, you'll be redirected to create one</li>
                <li>• Your invitation will be linked to your account</li>
                <li>• You'll get access to the hiring dashboard for your assigned jobs</li>
                <li>• You can start participating in the hiring process immediately</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={acceptInvitation}
            disabled={accepting}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {accepting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4 mr-2" />
                Accept & Create Account
              </>
            )}
          </button>
          
          <button
            onClick={() => setStep('account-info')}
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitationPage;

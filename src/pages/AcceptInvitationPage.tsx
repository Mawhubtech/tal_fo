import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { Loader2, Building2, User, Calendar, CheckCircle2, XCircle, AlertCircle, LogIn } from 'lucide-react';
import { companyApiService } from '../services/companyApiService';
import { useAuthContext } from '../contexts/AuthContext';

interface InvitationDetails {
  id: string;
  company: {
    id: string;
    name: string;
    type: string;
    description?: string;
  };
  role: string;
  title?: string;
  invitedAt: string;
  invitationExpiresAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const AcceptInvitationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const { user, isAuthenticated } = useAuthContext();

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link - missing token');
      setLoading(false);
      return;
    }

    loadInvitationDetails();
  }, [token]);

  const loadInvitationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await companyApiService.getInvitationByToken(token!);
      setInvitation(response.invitation);
    } catch (err: any) {
      console.error('Failed to load invitation details:', err);
      if (err.response?.status === 404) {
        setError('Invitation not found or invalid');
      } else if (err.response?.status === 400) {
        setError('This invitation has expired or is no longer valid');
      } else {
        setError('Failed to load invitation details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!invitation || !token) return;

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      setError('You must be logged in to accept this invitation. Please log in and try again.');
      return;
    }

    // Check if logged in user matches the invited user
    if (user.email !== invitation.user.email) {
      setError(`This invitation is for ${invitation.user.email}. You are logged in as ${user.email}. Please log in with the correct account.`);
      return;
    }

    try {
      setAccepting(true);
      setError(null);

      await companyApiService.acceptInvitationByToken(token);
      setSuccess(true);
      
      // Redirect to company page after a brief delay
      setTimeout(() => {
        navigate(`/companies/${invitation.company.id}`);
      }, 2000);
    } catch (err: any) {
      console.error('Failed to accept invitation:', err);
      if (err.response?.status === 400) {
        const errorMessage = err.response?.data?.message || 'This invitation has expired or is no longer valid';
        setError(errorMessage);
      } else if (err.response?.status === 404) {
        setError('Invitation not found');
      } else {
        setError('Failed to accept invitation. Please try again.');
      }
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = () => {
    navigate('/dashboard');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCompanyTypeDisplay = (type: string) => {
    switch (type) {
      case 'internal_hr':
        return 'Internal HR Team';
      case 'external_hr_agency':
        return 'HR Agency';
      default:
        return type;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full administrative access with ability to manage all company operations, members, and settings';
      case 'director':
        return 'Senior leadership role with extensive permissions and strategic oversight responsibilities';
      case 'associate':
        return 'Mid-level position with significant operational responsibilities and team collaboration';
      case 'specialist':
        return 'Focused expertise role with specific domain responsibilities and project contributions';
      default:
        return 'Company member with assigned responsibilities';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading invitation details...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Invitation</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/dashboard')} className="w-full">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invitation Accepted!</h2>
          <p className="text-gray-600 mb-4">
            Welcome to {invitation?.company.name}! You're being redirected to the company dashboard.
          </p>
          <div className="flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Company Invitation</h1>
          <p className="text-gray-600 mt-2">You've been invited to join a company</p>
        </div>

        {invitation && (
          <div className="bg-white rounded-lg shadow-lg mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {invitation.company.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {getCompanyTypeDisplay(invitation.company.type)}
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              {invitation.company.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">About the Company</h4>
                  <p className="text-gray-600 text-sm">{invitation.company.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Your Role</p>
                      <p className="text-sm text-gray-600 capitalize">{invitation.role}</p>
                      {invitation.title && (
                        <p className="text-xs text-gray-500">{invitation.title}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Invited</p>
                      <p className="text-sm text-gray-600">{formatDate(invitation.invitedAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Expires</p>
                      <p className="text-sm text-gray-600">{formatDate(invitation.invitationExpiresAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Role Responsibilities</h4>
                <p className="text-sm text-blue-800">{getRoleDescription(invitation.role)}</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {!isAuthenticated ? (
                  // User not logged in - show login options
                  <>
                    <Button
                      onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + '?' + searchParams.toString())}`)}
                      variant="primary"
                      size="full"
                      className="flex-1"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Login to Accept
                    </Button>
                    <Button
                      onClick={() => navigate(`/register?redirect=${encodeURIComponent(window.location.pathname + '?' + searchParams.toString())}`)}
                      variant="outline"
                      size="full"
                      className="flex-1"
                    >
                      Create Account
                    </Button>
                  </>
                ) : user?.email !== invitation?.user.email ? (
                  // Wrong user logged in
                  <div className="flex-1">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                      <p className="text-sm text-amber-800">
                        You're logged in as <strong>{user?.email}</strong>, but this invitation is for <strong>{invitation?.user.email}</strong>.
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + '?' + searchParams.toString())}`)}
                      variant="primary"
                      size="full"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Login with Correct Account
                    </Button>
                  </div>
                ) : (
                  // Correct user logged in - show accept/decline buttons
                  <>
                    <Button
                      onClick={handleAcceptInvitation}
                      disabled={accepting}
                      variant="primary"
                      size="full"
                      className="flex-1"
                    >
                      {accepting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Accept Invitation
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleDecline} 
                      size="full"
                      className="flex-1"
                    >
                      Decline
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvitationPage;

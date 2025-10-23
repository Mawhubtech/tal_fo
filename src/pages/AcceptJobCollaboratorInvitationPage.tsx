import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Briefcase, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { jobCollaboratorApiService } from '../services/jobCollaboratorApiService';

const AcceptJobCollaboratorInvitationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);

  useEffect(() => {
    const acceptInvitation = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid invitation link');
        return;
      }

      // If user is not authenticated, redirect to sign in with return URL
      if (!isAuthenticated) {
        const returnUrl = encodeURIComponent(`/accept-invitation/${token}`);
        navigate(`/signin?redirect=${returnUrl}`);
        return;
      }

      try {
        setStatus('loading');
        setMessage('Accepting invitation...');

        const collaborator = await jobCollaboratorApiService.acceptInvitation(token);
        
        setStatus('success');
        setMessage('Invitation accepted successfully! Redirecting to job...');
        setJobId(collaborator.jobId);

        // Redirect to job ATS page after 2 seconds
        setTimeout(() => {
          navigate(`/dashboard/jobs/${collaborator.jobId}/ats`);
        }, 2000);
      } catch (error: any) {
        setStatus('error');
        const errorMessage = error.response?.data?.message || error.message || 'Failed to accept invitation';
        setMessage(errorMessage);
        console.error('Error accepting invitation:', error);
      }
    };

    acceptInvitation();
  }, [token, isAuthenticated, navigate, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <Briefcase className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Job Collaborator Invitation</h1>
        </div>

        {/* Status Content */}
        <div className="text-center">
          {status === 'loading' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
              </div>
              <p className="text-gray-600">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Success!</h2>
                <p className="text-gray-600">{message}</p>
              </div>
              {jobId && (
                <Link
                  to={`/dashboard/jobs/${jobId}/ats`}
                  className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Go to Job
                </Link>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
                <p className="text-gray-600 mb-4">{message}</p>
              </div>
              <div className="space-y-2">
                <Link
                  to="/signin"
                  className="block w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/dashboard/jobs"
                  className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Browse Jobs
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <a href="mailto:support@tal.com" className="text-purple-600 hover:text-purple-700">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AcceptJobCollaboratorInvitationPage;

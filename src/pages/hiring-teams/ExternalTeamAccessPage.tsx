import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Users, Calendar, FileText, MessageSquare, ArrowLeft, AlertCircle, User } from 'lucide-react';
import { config } from '../../lib/config';

interface TeamMember {
  id: string;
  teamId: string;
  memberType: 'external';
  teamRole: string;
  externalEmail: string;
  externalFirstName: string;
  externalLastName: string;
  canViewApplications: boolean;
  canMoveCandidates: boolean;
  canScheduleInterviews: boolean;
  canLeaveFeedback: boolean;
  canMakeDecisions: boolean;
  invitationAccepted: boolean;
  team: {
    id: string;
    name: string;
    description?: string;
  };
}

const ExternalTeamAccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<TeamMember | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');
  const teamId = searchParams.get('teamId');

  useEffect(() => {
    if (!token || !teamId) {
      setError('Invalid access link');
      setLoading(false);
      return;
    }

    verifyAccess();
  }, [token, teamId]);

  const verifyAccess = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/hiring-teams/members/verify-access/${token}/${teamId}`);
      const data = await response.json();

      if (data.success && data.hasAccess) {
        setMember(data.data);
      } else {
        setError('Invalid or expired access token');
      }
    } catch (err) {
      setError('Failed to verify access');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{member.team.name}</h1>
                <p className="text-gray-600">External Team Member Access</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Exit
            </button>
          </div>
        </div>

        {/* Member Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {member.externalFirstName} {member.externalLastName}
              </h3>
              <p className="text-gray-600 text-sm">{member.externalEmail}</p>
              <p className="text-gray-500 text-sm">Role: {member.teamRole}</p>
            </div>
          </div>
          
          {member.team.description && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Team Description</h4>
              <p className="text-gray-600">{member.team.description}</p>
            </div>
          )}
        </div>

        {/* Permissions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`flex items-center space-x-3 p-3 rounded-lg ${
              member.canViewApplications ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-500'
            }`}>
              <FileText className="h-5 w-5" />
              <span>View Applications</span>
              {member.canViewApplications && <span className="ml-auto text-green-600">✓</span>}
            </div>
            <div className={`flex items-center space-x-3 p-3 rounded-lg ${
              member.canScheduleInterviews ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-500'
            }`}>
              <Calendar className="h-5 w-5" />
              <span>Schedule Interviews</span>
              {member.canScheduleInterviews && <span className="ml-auto text-green-600">✓</span>}
            </div>
            <div className={`flex items-center space-x-3 p-3 rounded-lg ${
              member.canLeaveFeedback ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-500'
            }`}>
              <MessageSquare className="h-5 w-5" />
              <span>Leave Feedback</span>
              {member.canLeaveFeedback && <span className="ml-auto text-green-600">✓</span>}
            </div>
            <div className={`flex items-center space-x-3 p-3 rounded-lg ${
              member.canMakeDecisions ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-500'
            }`}>
              <Users className="h-5 w-5" />
              <span>Make Decisions</span>
              {member.canMakeDecisions && <span className="ml-auto text-green-600">✓</span>}
            </div>
          </div>
        </div>

        {/* Coming Soon Features */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Features</h3>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Full Team Dashboard Coming Soon</h4>
              <p className="text-blue-800 text-sm">
                We're working on a complete external member dashboard where you'll be able to:
              </p>
              <ul className="list-disc list-inside text-blue-800 text-sm mt-2 space-y-1">
                <li>View and review job applications</li>
                <li>Schedule and manage interviews</li>
                <li>Collaborate with team members</li>
                <li>Access candidate profiles and feedback</li>
              </ul>
            </div>
            
            <div className="text-center py-8">
              <h4 className="font-medium text-gray-900 mb-2">For Now</h4>
              <p className="text-gray-600 mb-4">
                Please contact your team administrator for access to hiring activities.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/signin')}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Sign In (If you have an account)
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Go to Homepage
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalTeamAccessPage;

import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Users, ArrowRight, UserPlus, LogIn } from 'lucide-react';

const InvitationAcceptedPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const token = searchParams.get('token');
  const teamId = searchParams.get('teamId');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Invitation Accepted!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Welcome to the team! To access the hiring dashboard and start collaborating, you need to set up your TAL account.
        </p>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-semibold text-blue-800">Next Steps</span>
          </div>
          <div className="text-sm text-blue-700 text-left">
            <p className="mb-2">Choose one of the options below:</p>
            <ul className="space-y-1">
              <li>• <strong>Create Account:</strong> If you're new to TAL</li>
              <li>• <strong>Sign In:</strong> If you already have a TAL account</li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate(`/external/register?token=${token}&teamId=${teamId}`)}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create New Account
          </button>
          
          <button
            onClick={() => navigate('/signin')}
            className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In to Existing Account
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            Go to Homepage
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p className="mb-2">After creating your account or signing in:</p>
          <ul className="space-y-1 text-left">
            <li>• Your invitation will be automatically linked to your account</li>
            <li>• You'll get access to the hiring dashboard</li>
            <li>• You can view job applications and participate in hiring</li>
            <li>• Contact your team administrator if you need help</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InvitationAcceptedPage;

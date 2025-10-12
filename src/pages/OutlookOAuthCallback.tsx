import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';

const OutlookOAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');
  const email = searchParams.get('email');
  const error = searchParams.get('error');

  useEffect(() => {
    console.log('OutlookOAuthCallback mounted:', { success, email, error });
    console.log('window.opener:', window.opener);
    console.log('window.location.origin:', window.location.origin);

    // Send message to parent window
    if (window.opener) {
      console.log('window.opener exists, sending message');
      try {
        if (success === 'true' && email) {
          const message = {
            type: 'outlook-oauth-success',
            email: decodeURIComponent(email)
          };
          console.log('Sending success message:', message);
          window.opener.postMessage(message, window.location.origin);
          console.log('Success message sent to opener');
        } else if (error) {
          const message = {
            type: 'outlook-oauth-error',
            message: decodeURIComponent(error)
          };
          console.log('Sending error message:', message);
          window.opener.postMessage(message, window.location.origin);
          console.log('Error message sent to opener');
        }

        // Close window after a short delay
        setTimeout(() => {
          console.log('Closing window');
          window.close();
        }, 2000); // Increased delay to ensure message is sent
      } catch (e) {
        console.error('Error sending message to opener:', e);
        // Still try to close the window
        setTimeout(() => window.close(), 3000);
      }
    } else {
      console.warn('No window.opener found');
      // Close anyway after showing the message
      setTimeout(() => window.close(), 3000);
    }
  }, [success, email, error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {success === 'true' ? (
          <>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Outlook Connected!
            </h2>
            <p className="text-gray-600 mb-4">
              Successfully connected: <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500">
              This window will close automatically...
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Connection Failed
            </h2>
            <p className="text-gray-600 mb-4">
              {error || 'An unknown error occurred'}
            </p>
            <p className="text-sm text-gray-500">
              This window will close automatically...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default OutlookOAuthCallback;

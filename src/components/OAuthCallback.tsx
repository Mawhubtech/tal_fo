import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { useToast } from '../contexts/ToastContext';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      console.log('OAuth Callback - Token:', token ? 'Received' : 'Not found');
      console.log('OAuth Callback - Error:', error);      if (error) {
        console.error('OAuth error:', error);
        addToast({
          type: 'error',
          title: 'Authentication Failed',
          message: 'There was an error during OAuth authentication. Please try again.'
        });
        navigate('/signin?error=oauth_failed', { replace: true });
        return;
      }

      if (token) {
        try {
          console.log('Processing OAuth token...');
          
          // Store the token
          localStorage.setItem('accessToken', token);
          localStorage.setItem('refreshToken', token); // Backend doesn't provide refresh token yet

          // Fetch user profile to validate token and get user data
          console.log('Fetching user profile...');
          const user = await authService.getProfile();
          console.log('User profile fetched:', user);

          // Store user data in query cache
          queryClient.setQueryData(['user'], user);          // Navigate to dashboard after successful authentication
          console.log('Redirecting to dashboard...');
          addToast({
            type: 'success',
            title: 'Welcome!',
            message: 'You have been successfully signed in.'
          });
          navigate('/dashboard', { replace: true });        } catch (error) {
          console.error('Error handling OAuth callback:', error);
          addToast({
            type: 'error',
            title: 'Authentication Error',
            message: 'Failed to complete sign in. Please try again.'
          });
          // Clear invalid token
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/signin?error=oauth_failed', { replace: true });
        }      } else {
        // No token found, redirect to signin
        console.warn('No token found in OAuth callback');
        addToast({
          type: 'error',
          title: 'Authentication Failed',
          message: 'No authentication token received. Please try again.'
        });
        navigate('/signin?error=oauth_failed', { replace: true });
      }
      
      setIsProcessing(false);
    };

    handleOAuthCallback();
  }, [searchParams, navigate, queryClient]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">
          {isProcessing ? 'Completing sign in...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;

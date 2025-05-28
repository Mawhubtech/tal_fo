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
      }      if (token) {
        try {
          console.log('Processing OAuth token...');
          console.log('Token length:', token.length);
          console.log('Token preview:', token.substring(0, 50) + '...');
          
          // Store the token
          localStorage.setItem('accessToken', token);
          localStorage.setItem('refreshToken', token); // Backend doesn't provide refresh token yet
          
          // Add a small delay to ensure token is properly stored
          await new Promise(resolve => setTimeout(resolve, 100));
          
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
          navigate('/dashboard', { replace: true });        } catch (error: any) {
          console.error('Error handling OAuth callback:', error);
          console.error('Error status:', error.response?.status);
          console.error('Error data:', error.response?.data);
          console.error('Error message:', error.message);
          console.error('Current token in localStorage:', localStorage.getItem('accessToken'));
          
          // Check if it's a 401 error specifically
          if (error.response?.status === 401) {
            console.error('401 Unauthorized - Token might be invalid or expired');
            console.error('Token details:', {
              hasToken: !!localStorage.getItem('accessToken'),
              tokenLength: localStorage.getItem('accessToken')?.length,
              tokenPreview: localStorage.getItem('accessToken')?.substring(0, 50)
            });
          }
          
          addToast({
            type: 'error',
            title: 'Authentication Error',
            message: `Failed to complete sign in: ${error.response?.data?.message || error.message}`
          });
          // Clear invalid token
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/signin?error=oauth_failed', { replace: true });
        }} else {
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

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { useToast } from '../contexts/ToastContext';
import { useShowWelcomeToast } from '../hooks/useAuth';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(true);
  const hasProcessedRef = useRef(false);
  const { addToast } = useToast();
  const showWelcomeToast = useShowWelcomeToast();
  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Prevent multiple executions
      if (hasProcessedRef.current) {
        console.log('OAuth callback already processed, skipping duplicate execution...');
        return;
      }

      console.log('First execution of OAuth callback - processing...');
      hasProcessedRef.current = true; // Mark as processed immediately

      const token = searchParams.get('token');
      const error = searchParams.get('error');

      console.log('OAuth Callback - Token:', token ? 'Received' : 'Not found');      console.log('OAuth Callback - Error:', error);      if (error) {
        // hasProcessedRef is already set at the top of the function
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
          // hasProcessedRef is already set at the top of the function
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
          console.log('User profile fetched:', user);          // Store user data in query cache
          queryClient.setQueryData(['user'], user);          // Check for return URL or source parameter
          const returnTo = searchParams.get('returnTo');
          const source = searchParams.get('source');
          
          let redirectUrl = '/dashboard'; // default redirect
          
          // Check if this is a job seeker login via localStorage flag
          // Store the flag value in a variable before removing it
          const jobSeekerAuth = localStorage.getItem('jobSeekerAuth');
          
          console.log('OAuth Callback - Redirect logic:');
          console.log('- returnTo:', returnTo);
          console.log('- source:', source);
          console.log('- jobSeekerAuth flag:', jobSeekerAuth);
          
          if (source === 'job-seeker' || returnTo?.includes('/job-seeker') || jobSeekerAuth === 'true') {
            redirectUrl = '/job-seeker/admin';
            console.log('- Detected job seeker login, redirecting to job seeker admin');
            // Clean up the flag - but store the redirect decision first
            localStorage.removeItem('jobSeekerAuth');
            // Store a different flag to remember we've already processed the job seeker login
            localStorage.setItem('jobSeekerRedirectProcessed', 'true');
          } else if (returnTo) {
            redirectUrl = returnTo;
            console.log('- Using returnTo URL:', returnTo);
          } else {
            // Check if we've already processed a job seeker login
            const jobSeekerRedirectProcessed = localStorage.getItem('jobSeekerRedirectProcessed');
            if (jobSeekerRedirectProcessed === 'true') {
              redirectUrl = '/job-seeker/admin';
              console.log('- Using remembered job seeker redirect');
            } else {
              console.log('- Using default redirect to dashboard');
            }
          }          // Navigate after successful authentication
          console.log('Redirecting to:', redirectUrl);
          // Use the shared welcome toast function
          showWelcomeToast();
          
          // Clean up any redirect flags
          setTimeout(() => {
            localStorage.removeItem('jobSeekerRedirectProcessed');
            console.log('Cleaned up redirect flags');
          }, 1000);
          
          navigate(redirectUrl, { replace: true });} catch (error: any) {
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
          });          // Clear invalid token and any redirect flags
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('jobSeekerAuth');
          localStorage.removeItem('jobSeekerRedirectProcessed');
          navigate('/signin?error=oauth_failed', { replace: true });
        }      } else {
        // No token found, redirect to signin
        console.warn('No token found in OAuth callback');
        addToast({
          type: 'error',
          title: 'Authentication Failed',
          message: 'No authentication token received. Please try again.'
        });
        // Clean up all auth flags
        localStorage.removeItem('jobSeekerAuth');
        localStorage.removeItem('jobSeekerRedirectProcessed');
        navigate('/signin?error=oauth_failed', { replace: true });
      }
      
      setIsProcessing(false);
    };    handleOAuthCallback();
  }, [searchParams, navigate, queryClient, addToast, showWelcomeToast]);
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

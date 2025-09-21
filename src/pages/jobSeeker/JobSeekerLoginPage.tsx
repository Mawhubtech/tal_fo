import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Shield, Users, Mail } from 'lucide-react';
import { useLogin, useJobSeekerGoogleLogin, useJobSeekerLinkedInLogin } from '../../hooks/useAuth';
import { useAuthContext } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getDefaultRedirectPath } from '../../utils/userUtils';

const JobSeekerLoginPage: React.FC = () => {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const { addToast } = useToast();
  
  const loginMutation = useLogin();
  const googleLoginMutation = useJobSeekerGoogleLogin();
  const linkedinLoginMutation = useJobSeekerLinkedInLogin();

  // Get returnTo from either URL params or from the location state (when redirected from the main sign-in page)
  const locationState = location.state as { returnTo?: string | null } | null;
  const returnTo = searchParams.get('returnTo') || locationState?.returnTo || '/job-seeker/admin';

  // Check for OAuth error in URL
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'oauth_failed') {
      addToast({
        type: 'error',
        title: 'Sign In Failed',
        message: 'OAuth authentication failed. Please try again or use email sign in.'
      });
    }
  }, [searchParams, addToast]);

  // Redirect authenticated users to dashboard or specified redirect
  useEffect(() => {
    if (isAuthenticated && !isLoading && user) {
      const redirect = searchParams.get('redirect');
      const defaultPath = getDefaultRedirectPath(user);
      navigate(redirect || defaultPath, { replace: true });
    }
  }, [isAuthenticated, isLoading, user, navigate, searchParams]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleEmailSignIn = () => {
    setIsEmailModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await loginMutation.mutateAsync({ email, password });
      navigate(returnTo);
    } catch (err) {
      // Error handling is managed by the mutation
    }
  };  const handleGoogleLogin = async () => {
    try {
      // Set flag to indicate job seeker login
      localStorage.setItem('jobSeekerAuth', 'true');
      await googleLoginMutation.mutateAsync();
      navigate(returnTo);
    } catch (err) {
      // Error handling is managed by the mutation
      localStorage.removeItem('jobSeekerAuth'); // Clean up on error
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to initiate Google sign in. Please try again.'
      });
    }
  };

  const handleLinkedInLogin = async () => {
    try {
      // Set flag to indicate job seeker login
      localStorage.setItem('jobSeekerAuth', 'true');
      await linkedinLoginMutation.mutateAsync();
      navigate(returnTo);
    } catch (err) {
      // Error handling is managed by the mutation
      localStorage.removeItem('jobSeekerAuth'); // Clean up on error
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to initiate LinkedIn sign in. Please try again.'
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-b from-purple-900 to-purple-800 text-white p-12">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative z-10 max-w-lg">
          <a href="/" className="inline-flex items-center text-sm hover:text-gray-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </a>
          
          <div className="mt-24">
            <div className="flex items-center mb-6">
              <Users className="w-10 h-10 mr-3" />
              <h1 className="text-4xl font-bold">Job Seeker Portal</h1>
            </div>
            <p className="text-xl text-gray-300 mb-8">
              Find your dream job and build your career with top companies
            </p>

            <div className="mt-16">
              <h3 className="text-lg font-semibold mb-6">Designed for Job Seekers</h3>
              
              <div className="space-y-8">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <span className="block text-3xl font-bold mb-1">50K+</span>
                    <span className="text-sm text-gray-400">Active Jobs</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <span className="block text-3xl font-bold mb-1">1000+</span>
                    <span className="text-sm text-gray-400">Companies</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <span className="block text-3xl font-bold mb-1">95%</span>
                    <span className="text-sm text-gray-400">Success rate</span>
                  </div>
                </div>
                
                <div className="border-t border-white/10 pt-8">
                  <p className="text-sm text-gray-400 mb-4">Job Seeker Features</p>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                      <span className="text-sm">AI-powered job matching</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                      <span className="text-sm">Application tracking</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                      <span className="text-sm">Career development tools</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                      <span className="text-sm">Direct employer connections</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <img src="/TALL.png" alt="TalGPT" className="h-12 mr-3" />
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Job Seeker Sign In</h2>
            <p className="text-gray-600 mt-2">Access your job search dashboard</p>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={handleGoogleLogin}
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-5 h-5"
              />
              <span className="text-sm font-medium">Continue with Google</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={handleLinkedInLogin}
            >
              <img
                src="https://www.linkedin.com/favicon.ico"
                alt="LinkedIn"
                className="w-5 h-5"
              />
              <span className="text-sm font-medium">Continue with LinkedIn</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={handleEmailSignIn}
            >
              <Mail className="w-5 h-5" />
              <span className="text-sm font-medium">Continue with Email</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link
                to="/job-seeker/register"
                className="text-purple-600 hover:text-purple-500 font-medium"
              >
                Sign up here
              </Link>
            </p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By proceeding, you agree to our{' '}
              <a href="/terms" className="text-purple-600 hover:text-purple-500">
                Terms of Service
              </a>
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2">
            <img src="/TALL.png" alt="TalGPT" className="h-8 opacity-30" />
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                SOC2 Type II
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                ISO 27001
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Login Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Sign in with Email</h3>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {loginMutation.error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {loginMutation.error instanceof Error ? loginMutation.error.message : 'Login failed'}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-purple-600 hover:text-purple-500"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSeekerLoginPage;

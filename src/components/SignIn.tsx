import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Shield, Search } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getDefaultRedirectPath } from '../utils/userUtils';
import RecruiterLoginForm from './RecruiterLoginForm';

const SignIn: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
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
              <Search className="w-10 h-10 mr-3" />
              <h1 className="text-4xl font-bold">Recruiter Portal</h1>
            </div>
            <p className="text-xl text-gray-300 mb-8">
              Find, engage, and hire the best talent with AI-powered recruiting tools
            </p>

            <div className="mt-16">
              <h3 className="text-lg font-semibold mb-6">Trusted by 25,000+ recruiters and hiring managers</h3>
              
              <div className="space-y-8">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <span className="block text-3xl font-bold mb-1">800M+</span>
                    <span className="text-sm text-gray-400">Global profiles</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <span className="block text-3xl font-bold mb-1">30+</span>
                    <span className="text-sm text-gray-400">Data sources</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <span className="block text-3xl font-bold mb-1">98%</span>
                    <span className="text-sm text-gray-400">Match rate</span>
                  </div>
                </div>
                
                <div className="border-t border-white/10 pt-8">
                  <p className="text-sm text-gray-400 mb-4">Recruiting Features</p>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                      <span className="text-sm">AI-powered candidate sourcing</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                      <span className="text-sm">Smart candidate matching</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                      <span className="text-sm">Recruitment analytics dashboard</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                      <span className="text-sm">LinkedIn & job board integrations</span>
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
              <Search className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          {/* Recruiter Login Form */}
          <RecruiterLoginForm onClose={() => {}} />

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
    </div>
  );
};

export default SignIn;

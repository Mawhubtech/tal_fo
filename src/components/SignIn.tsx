import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Shield } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const SignIn: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const { isAuthenticated, isLoading } = useAuthContext();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );  }

  const handleEmailSignIn = () => {
    setAuthView('login');
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-b from-slate-900 to-slate-800 text-white p-12">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative z-10 max-w-lg">
          <a href="/" className="inline-flex items-center text-sm hover:text-gray-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </a>
          
          <div className="mt-24">
            <h1 className="text-4xl font-bold mb-6">Welcome to TalGPT</h1>
            <p className="text-xl text-gray-300 mb-8">
              Rethink the way you source, engage, and hire talent
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
                  <p className="text-sm text-gray-400 mb-4">Our trusted partners</p>
                  <div className="flex items-center gap-6">
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="h-6 w-6 grayscale opacity-50 hover:opacity-100 transition-opacity" />
                    <img src="https://www.meta.com/favicon.ico" alt="Meta" className="h-6 w-6 grayscale opacity-50 hover:opacity-100 transition-opacity" />
                    <img src="https://www.microsoft.com/favicon.ico" alt="Microsoft" className="h-6 w-6 grayscale opacity-50 hover:opacity-100 transition-opacity" />
                    <img src="https://www.apple.com/favicon.ico" alt="Apple" className="h-6 w-6 grayscale opacity-50 hover:opacity-100 transition-opacity" />
                    <img src="https://www.amazon.com/favicon.ico" alt="Amazon" className="h-6 w-6 grayscale opacity-50 hover:opacity-100 transition-opacity" />
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
            <img src="/tallogo.png" alt="TalGPT" className="h-12 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900">Get started for free</h2>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
            >
              <img
                src="https://www.linkedin.com/favicon.ico"
                alt="LinkedIn"
                className="w-5 h-5"
              />
              <span className="text-sm font-medium">Continue with LinkedIn</span>
            </button>            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={handleEmailSignIn}
            >
              <Mail className="w-5 h-5" />
              <span className="text-sm font-medium">Continue with Email</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By proceeding, you agree to our{' '}
              <a href="/terms" className="text-primary-600 hover:text-primary-500">
                Terms of Service
              </a>
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2">
            <img src="/tallogo.png" alt="TalGPT" className="h-8 opacity-30" />
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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView={authView}
      />
    </div>
  );
};

export default SignIn;
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Users, MapPin, Briefcase, ArrowLeft } from 'lucide-react';
import AuthModal from '../components/AuthModal';
import Button from '../components/Button';

interface LocationState {
  query?: string;
  preloadedResults?: {
    results: any[];
    total: number;
    page: number;
    limit: number;
  };
  fromHeroSearch?: boolean;
}

const PublicSearchResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { query, preloadedResults, fromHeroSearch } = (location.state || {}) as LocationState;

  useEffect(() => {
    // Show auth modal automatically when coming from hero search
    if (fromHeroSearch) {
      setShowAuthModal(true);
    }
  }, [fromHeroSearch]);

  // Redirect to home if no search query
  useEffect(() => {
    if (!query) {
      navigate('/');
    }
  }, [query, navigate]);

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
  };

  const handleSignUpClick = () => {
    // Store the search data in sessionStorage to retrieve after authentication
    sessionStorage.setItem('pendingSearchData', JSON.stringify({
      query,
      filters: { searchText: query },
      searchMode: 'external',
      isGlobalSearch: true,
      isEnhanced: true,
      singleCallOptimized: true,
      preloadedResults
    }));
    setShowAuthModal(true);
  };

  const results = preloadedResults?.results || [];
  const totalCount = preloadedResults?.total || results.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        {/* Blurred Results Preview */}
        <div className="filter blur-sm pointer-events-none select-none">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Search Results for "{query}"
              </h1>
              <p className="text-gray-600">
                {totalCount} {totalCount === 1 ? 'candidate' : 'candidates'} found
              </p>
            </div>

            <div className="space-y-4">
              {results.slice(0, 3).map((result: any, index: number) => {
                const candidate = result.candidate || {};
                return (
                  <div 
                    key={index} 
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {candidate.fullName || 'John Doe'}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {candidate.currentJobTitle || 'Senior Software Engineer'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                          {Math.floor(result.matchScore || 85)}% Match
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{candidate.location || 'New York, NY'}</span>
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{candidate.currentCompany || 'Tech Company Inc.'}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>
                          {candidate.yearsOfExperience || '5+'} years experience
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {candidate.summary || 'Experienced professional with strong background in technology and innovation...'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Overlay with Auth Prompt */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-black/10 to-black/20 pt-20">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-purple-600" />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Sign Up to View Results
            </h2>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              We found <span className="font-semibold text-purple-600">{totalCount} candidates</span> matching your search. 
              Create a free account to view full profiles and connect with top talent.
            </p>

            <div className="space-y-3">
              <Button
                variant="primary"
                size="lg"
                onClick={handleSignUpClick}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Create Free Account
              </Button>
              
              <button
                onClick={() => navigate('/')}
                className="w-full text-sm text-gray-600 hover:text-gray-800 py-2 transition-colors"
              >
                Back to Home
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Already have an account?{' '}
                <button
                  onClick={handleSignUpClick}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={handleAuthModalClose}
          initialView="register"
        />
      )}
    </div>
  );
};

export default PublicSearchResultsPage;

import React from 'react';
import Button from '../../../components/Button';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

const NaturalLanguageSearch: React.FC = () => {
  const { elementRef, isVisible } = useScrollAnimation();

  return (
    <section ref={elementRef} className={`relative overflow-hidden bg-white py-24 transition-all duration-1000 transform ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-left">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Find talent using natural language
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              TAL's AI-powered search understands exactly what you're looking for. 
              <span className="text-purple-600 font-semibold"> Just describe your ideal candidate.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="primary" size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Start Searching
              </Button>
              <Button variant="outline" size="lg" className="border-gray-300 hover:border-purple-500 hover:text-purple-600">
                See Demo
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8">
              {/* User Message */}
              <div className="flex items-start gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                  U
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                    <p className="text-gray-900 font-medium">
                      Find senior engineers with experience building search infrastructure at high-growth B2B companies
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Just now</p>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                  T
                </div>
                <div className="flex-1">
                  <div className="mb-3">
                    <p className="text-gray-900 font-medium mb-3">
                      Perfect! I've created a targeted search for you:
                    </p>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                      <p className="text-sm leading-relaxed">
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg font-medium">Senior Engineer (7+ years)</span>
                        {' '}in{' '}
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-medium">Search Infrastructure</span>
                        {' '}at{' '}
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg font-medium">B2B SaaS Companies</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Just now</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NaturalLanguageSearch;

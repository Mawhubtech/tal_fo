import React from 'react';
import { Github, FileStackIcon as StackIcon, Mail, Phone, MapPin, Search, Database, Users } from 'lucide-react';
import Button from '../../../components/Button';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

const SearchFeaturesBento: React.FC = () => {
  const { elementRef, isVisible } = useScrollAnimation();

  return (
    <section ref={elementRef} className={`relative overflow-hidden bg-white transition-all duration-1000 transform ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Talent Search
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Find the perfect candidates using natural language and comprehensive data analysis across 30+ sources.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Natural Language Search - Large Card (spans 2 columns) */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Find talent using natural language</h3>
              <p className="text-gray-600 mb-8">TAL's AI-powered search understands exactly what you're looking for. <span className="text-purple-600 font-semibold">Just describe your ideal candidate.</span></p>
              
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
              <div className="flex items-start gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white font-bold">
                  T
                </div>
                <div className="flex-1">
                  <div className="mb-3">
                    <p className="text-gray-900 font-medium mb-3">
                      Perfect! I've created a targeted search for you:
                    </p>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
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

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="primary" size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Start Searching
                </Button>
                <Button variant="outline" size="lg" className="!bg-transparent !border-2 !border-gray-300 !text-gray-700 hover:!border-purple-500 hover:!text-purple-600 !bg-none">
                  See Demo
                </Button>
              </div>
            </div>
          </div>

          {/* Data Sources & Results Combined */}
          <div className="space-y-8">
            {/* Data Sources Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Search across 30+ data sources</h3>
                <p className="text-gray-600 text-sm mb-6">TAL analyzes professional profiles, technical websites, published papers, and more in real-time.</p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Github className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">GitHub</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">LinkedIn</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <StackIcon className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">Stack Overflow</span>
                  </div>
                  <div className="text-xs text-purple-600 font-medium text-center pt-2">
                    +27 more sources
                  </div>
                </div>
              </div>
            </div>

            {/* Search Results Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Live Results</h3>
                
                <div className="space-y-4">
                  {[
                    {
                      name: 'Kayla Victoria',
                      role: 'AI/ML Developer',
                      email: 'kayla.victoria@gmail.com',
                      location: 'Atlanta, GA',
                      match: '94%'
                    },
                    {
                      name: 'Liam Thompson',
                      role: 'Senior Full Stack Developer',
                      email: 'liamt@gmail.com',
                      location: 'New York, NY',
                      match: '91%'
                    }
                  ].map((profile, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl border border-gray-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                          {profile.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-900 text-sm">{profile.name}</h4>
                            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                              {profile.match} match
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{profile.role}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {profile.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchFeaturesBento;
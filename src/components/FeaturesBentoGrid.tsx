import React from 'react';
import { Upload, Github, FileStackIcon as StackIcon, Mail, Phone, MapPin, ArrowRight, Sparkles, Search, Database, Zap, Users, MessageSquare, Brain, Globe } from 'lucide-react';
import Button from './Button';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const FeaturesBentoGrid: React.FC = () => {
  const { elementRef, isVisible } = useScrollAnimation();

  return (
    <section ref={elementRef} className={`relative overflow-hidden bg-white py-24 transition-all duration-1000 transform ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            AI-Powered Talent Discovery
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Search, discover, and connect with top talent using advanced AI across multiple data sources
          </p>
        </div>

        {/* Unified Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6 auto-rows-[120px]">
          
          {/* Natural Language Search - Large Feature */}
          <div className="col-span-12 md:col-span-7 row-span-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border border-purple-200 overflow-hidden">
            <div className="p-8 h-full flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Natural Language Search</h3>
                  <p className="text-purple-600 text-sm">Just describe who you're looking for</p>
                </div>
              </div>
              
              {/* Chat Interface */}
              <div className="flex-1 bg-white rounded-2xl border border-purple-200 p-6">
                {/* User Message */}
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                    U
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-gray-900 font-medium">
                        Find senior engineers with experience building search infrastructure at high-growth B2B companies
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Just now</p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-sm font-bold">
                    T
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium mb-3">
                      Perfect! I've created a targeted search for you:
                    </p>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200 mb-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm font-medium">Senior Engineer (7+ years)</span>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium">Search Infrastructure</span>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">B2B SaaS Companies</span>
                      </div>
                    </div>
                    
                    {/* Sample Result */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                          KV
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">Kayla Victoria</h4>
                            <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">94% match</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Senior Search Engineer at Elastic</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>San Francisco, CA</span>
                            <span>8 years experience</span>
                            <span>Available</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-3">Found 847 matching candidates • Just now</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Stats */}
          <div className="col-span-12 md:col-span-5 row-span-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl text-white overflow-hidden">
            <div className="p-6 h-full flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-8 h-8" />
                <h3 className="text-xl font-bold">AI-Powered Matching</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl font-bold">99.7%</div>
                  <div className="text-blue-100 text-sm">Accuracy Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">&lt; 2s</div>
                  <div className="text-blue-100 text-sm">Response Time</div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="col-span-12 md:col-span-5 row-span-2 bg-white rounded-3xl border border-gray-200 overflow-hidden">
            <div className="p-6 h-full">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900">30+ Data Sources</h3>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { name: 'LinkedIn', color: 'bg-blue-500' },
                  { name: 'GitHub', color: 'bg-gray-700' },
                  { name: 'Stack', color: 'bg-orange-500' },
                  { name: 'Papers', color: 'bg-green-500' },
                  { name: 'Blogs', color: 'bg-pink-500' },
                  { name: 'More', color: 'bg-purple-500' },
                ].map((source, index) => (
                  <div key={index} className={`${source.color} rounded-lg p-2 text-white text-center`}>
                    <div className="text-xs font-semibold">{source.name}</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Search across professional networks, code repositories, research papers, and more
              </p>
            </div>
          </div>

          {/* Global Reach */}
          <div className="col-span-12 md:col-span-3 row-span-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl text-white overflow-hidden">
            <div className="p-6 h-full flex flex-col justify-center text-center">
              <Globe className="w-8 h-8 mx-auto mb-3" />
              <div className="text-3xl font-bold mb-2">800M+</div>
              <div className="text-green-100 text-sm mb-4">Professional Profiles</div>
              <div className="text-xl font-bold">150+</div>
              <div className="text-green-100 text-xs">Countries</div>
            </div>
          </div>

          {/* Real-time Search */}
          <div className="col-span-12 md:col-span-4 row-span-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl text-white overflow-hidden">
            <div className="p-6 h-full flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-8 h-8" />
                <h3 className="text-xl font-bold">Real-time Results</h3>
              </div>
              <p className="text-orange-100 mb-4 text-sm">
                Get instant results as you search. Our AI processes millions of profiles in real-time.
              </p>
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-orange-100 text-xs">Available</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">Live</div>
                  <div className="text-orange-100 text-xs">Updates</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="col-span-12 row-span-2 bg-gradient-to-r from-gray-900 to-purple-900 rounded-3xl text-white overflow-hidden">
            <div className="p-8 h-full flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold mb-2">Ready to find your next hire?</h3>
                <p className="text-gray-300 text-lg">
                  Join thousands of companies using TAL to discover and connect with top talent worldwide.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 ml-8">
                <Button variant="primary" size="lg" className="bg-white text-purple-900 hover:bg-gray-100 rounded-full px-8 py-4 font-semibold">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button variant="outline" size="lg" className="!bg-transparent !border-2 !border-white/30 !text-white hover:!border-white hover:!bg-white/10 !bg-none rounded-full px-8 py-4">
                  Book Demo
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesBentoGrid;
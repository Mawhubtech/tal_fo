import React from 'react';
import { Upload, Github, FileStackIcon as StackIcon, Mail, Phone, MapPin } from 'lucide-react';
import Button from '../../../components/Button';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

const DataSourcesSearch: React.FC = () => {
  const { elementRef, isVisible } = useScrollAnimation();

  return (
    <section ref={elementRef} className={`relative overflow-hidden bg-white py-24 transition-all duration-1000 transform ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden order-2 lg:order-1">
            <div className="p-8">
              {/* Search Query */}
              <div className="flex items-start gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                  U
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                    <p className="text-gray-900 font-medium mb-3">
                      Who has experience building search infrastructure using Apache Lucene?
                    </p>
                    <button className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium">
                      <Upload className="w-4 h-4" />
                      Upload job description
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Just now</p>
                </div>
              </div>

              {/* Candidate Results */}
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
                  <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl border border-gray-200 hover:border-purple-200 transition-all duration-200">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                        {profile.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{profile.name}</h3>
                          <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            {profile.match} match
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{profile.role}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {profile.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {profile.location}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          {[Github, StackIcon, Mail, Phone].map((Icon, i) => (
                            <button key={i} className="p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200">
                              <Icon className="w-4 h-4 text-gray-600" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-left order-1 lg:order-2">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Search across 30+ data sources
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              TAL analyzes professional profiles, technical websites, published papers, and more in real-time.
              <span className="text-purple-600 font-semibold"> Get comprehensive candidate insights.</span>
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
        </div>
      </div>
    </section>
  );
};

export default DataSourcesSearch;

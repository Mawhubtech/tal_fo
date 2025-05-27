import React from 'react';
import { Upload, Github, FileStackIcon as StackIcon, Mail, Phone, MapPin } from 'lucide-react';
import Button from './Button';

const DataSourcesSearch: React.FC = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden order-2 lg:order-1">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
                <div>
                  <p className="text-sm text-gray-500">Just now</p>
                  <p className="font-medium">Who has experience building search infrastructure using Apache Lucene?</p>
                  <button className="mt-2 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
                    <Upload className="w-4 h-4" />
                    Upload job description
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    name: 'Kayla Victoria',
                    role: 'AI/ML Developer',
                    email: 'kayla.victoria@gmail.com',
                    location: 'Atlanta, GA',
                    icons: [Github, StackIcon, Mail, Phone]
                  },
                  {
                    name: 'Liam Thompson',
                    role: 'Senior full stack developer',
                    email: 'liamt@gmail.com',
                    location: 'New York, NY',
                    icons: [Github, StackIcon, Mail, Phone]
                  }
                ].map((profile, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                        {profile.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{profile.name}</h3>
                          <div className="flex gap-2">
                            {profile.icons.map((Icon, i) => (
                              <button key={i} className="text-gray-500 hover:text-gray-700">
                                <Icon className="w-4 h-4" />
                              </button>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{profile.role}</p>
                        <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
                          <span>{profile.email}</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {profile.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-left order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Search across dozens of<br />data sources in real-time
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              The best talent is hard to find. TalGPT analyzes professional profiles, technical websites, published papers, and more in real time.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="lg">
                Try for free
              </Button>
              <Button variant="outline" size="lg">
                Request a demo →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DataSourcesSearch;
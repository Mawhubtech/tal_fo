import React from 'react';
import { Search, Download, User, BarChart, Users, Filter, Star, Sparkles } from 'lucide-react';

const DemoPreview: React.FC = () => {
  return (
    <div className="relative mx-auto max-w-5xl overflow-hidden rounded-xl shadow-2xl border border-gray-200 bg-white">
      <div className="absolute top-0 right-0 left-0 h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 max-w-md mx-auto">
          <div className="bg-gray-100 rounded-md px-3 py-1.5 text-sm text-gray-500 flex items-center">
            <Search className="w-4 h-4 mr-2 text-gray-400" />
            <span>Welcome to TalGPT</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-gray-700">
            <Download className="w-5 h-5" />
          </button>
          <button className="text-gray-500 hover:text-gray-700">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="pt-14">
        <div className="grid grid-cols-12 h-[400px]">
          {/* Sidebar */}
          <div className="col-span-3 border-r border-gray-200 bg-gray-50 p-4">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm text-gray-700">New Project</h3>
                <span className="text-xs text-gray-500">⌘N</span>
              </div>
              <div className="bg-primary-50 text-primary-700 border border-primary-200 rounded-md px-3 py-2 text-sm flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                <span>Create new</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 flex items-center">
                <BarChart className="w-4 h-4 mr-2 text-gray-500" />
                <span>Analytics</span>
              </button>
              <button className="w-full text-left px-3 py-2 text-sm rounded-md bg-gray-200 flex items-center">
                <Users className="w-4 h-4 mr-2 text-primary-600" />
                <span className="text-primary-700 font-medium">Candidates</span>
              </button>
              <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-500" />
                <span>Profile</span>
              </button>
            </div>
          </div>
          
          {/* Main content */}
          <div className="col-span-9 bg-white p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-semibold">Welcome to TalGPT</h1>
              <div className="flex space-x-2">
                <button className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                  <Filter className="w-4 h-4 mr-1.5 text-gray-500" />
                  <span>Filters</span>
                </button>
                <button className="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700">
                  <Search className="w-4 h-4 mr-1.5" />
                  <span>Search</span>
                </button>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-amber-400 mr-2" />
                  <span className="text-sm font-medium">Top Matches</span>
                </div>
                <span className="text-xs text-gray-500">548 results</span>
              </div>
              
              <div className="divide-y divide-gray-200">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xs">
                        AI
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium">AI Assistant #{i}</h3>
                        <p className="text-xs text-gray-500">Specialized in data analysis and visualization</p>
                      </div>
                      <div className="ml-auto">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          98% match
                        </span>
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
  );
};

export default DemoPreview;
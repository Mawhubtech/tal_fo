import React from 'react';
import { 
  Target, Search, Filter, Users, Plus, Edit, 
  BarChart3, Download, Upload, Eye, Clock, 
  CheckCircle, AlertCircle, TrendingUp, Calendar
} from 'lucide-react';

export const SourcingProjectsGuide = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Target className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sourcing Projects Guide</h1>
            <p className="text-gray-600">Master candidate sourcing with TAL's project-based approach</p>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">What You'll Learn</h3>
          </div>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Create and configure sourcing projects</li>
            <li>• Set up search parameters and candidate criteria</li>
            <li>• Manage candidate pipelines and stages</li>
            <li>• Track project performance and analytics</li>
            <li>• Collaborate with team members effectively</li>
          </ul>
        </div>
      </div>

      {/* Overview Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            Sourcing Projects in TAL provide a structured approach to candidate sourcing, allowing you to organize 
            your recruitment efforts by role, client, or campaign. Each project acts as a dedicated workspace where 
            you can define search criteria, manage candidate pipelines, and track performance metrics.
          </p>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Key Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Organized candidate sourcing workflows</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Customizable search parameters</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Team collaboration features</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Performance tracking and analytics</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
        
        <div className="space-y-6">
          {/* Step 1 */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <h3 className="text-xl font-semibold text-gray-900">Creating Your First Sourcing Project</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Navigate to the Sourcing section in your dashboard and click "Create New Project" to begin.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Project Configuration Fields:</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 w-24">Name:</span>
                    <span className="text-sm text-gray-600">Clear, descriptive project name</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 w-24">Client:</span>
                    <span className="text-sm text-gray-600">Associated client organization</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 w-24">Role:</span>
                    <span className="text-sm text-gray-600">Position title and department</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 w-24">Timeline:</span>
                    <span className="text-sm text-gray-600">Project start and target completion dates</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 w-24">Team:</span>
                    <span className="text-sm text-gray-600">Assign team members and define roles</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <h3 className="text-xl font-semibold text-gray-900">Defining Search Criteria</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Set up comprehensive search parameters to find the most relevant candidates for your role.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <Search className="w-4 h-4 mr-2" />
                    Search Parameters
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Keywords and skills</li>
                    <li>• Job titles and functions</li>
                    <li>• Industry and company type</li>
                    <li>• Experience level requirements</li>
                    <li>• Location and remote preferences</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    Advanced Filters
                  </h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Salary expectations</li>
                    <li>• Education requirements</li>
                    <li>• Certification preferences</li>
                    <li>• Cultural fit indicators</li>
                    <li>• Availability timeline</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <h3 className="text-xl font-semibold text-gray-900">Setting Up Pipeline Stages</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Configure custom pipeline stages to match your sourcing workflow and client requirements.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Default Pipeline Stages:</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Identified', color: 'bg-gray-100 text-gray-800' },
                    { name: 'Contacted', color: 'bg-blue-100 text-blue-800' },
                    { name: 'Interested', color: 'bg-yellow-100 text-yellow-800' },
                    { name: 'Qualified', color: 'bg-purple-100 text-purple-800' },
                    { name: 'Submitted', color: 'bg-green-100 text-green-800' },
                    { name: 'Interview', color: 'bg-orange-100 text-orange-800' },
                    { name: 'Placed', color: 'bg-emerald-100 text-emerald-800' }
                  ].map((stage, index) => (
                    <span key={index} className={`px-3 py-1 rounded-full text-sm font-medium ${stage.color}`}>
                      {stage.name}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <h4 className="font-semibold text-yellow-900">Pro Tip</h4>
                </div>
                <p className="text-yellow-800 text-sm">
                  Customize pipeline stages based on your client's specific hiring process. This ensures 
                  better alignment and clearer communication throughout the recruitment lifecycle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Advanced Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Collaboration */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Team Collaboration</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Assign team members to projects</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Share candidate profiles and notes</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Real-time activity updates</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Role-based permissions</span>
              </li>
            </ul>
          </div>

          {/* Analytics */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Performance Analytics</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm">Source-to-hire metrics</span>
              </li>
              <li className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm">Pipeline conversion rates</span>
              </li>
              <li className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm">Time-to-fill tracking</span>
              </li>
              <li className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm">Team productivity insights</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices</h2>
        
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">✅ Do's</h3>
            <ul className="text-green-800 space-y-1 text-sm">
              <li>• Define clear project goals and success metrics upfront</li>
              <li>• Regularly update candidate stages and add meaningful notes</li>
              <li>• Use consistent naming conventions for projects</li>
              <li>• Leverage team collaboration features for better outcomes</li>
              <li>• Review analytics regularly to optimize your approach</li>
            </ul>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2">❌ Don'ts</h3>
            <ul className="text-red-800 space-y-1 text-sm">
              <li>• Don't create overly broad search criteria</li>
              <li>• Avoid leaving candidates in limbo without status updates</li>
              <li>• Don't forget to communicate with team members</li>
              <li>• Avoid duplicating efforts across multiple projects</li>
              <li>• Don't neglect to archive completed projects</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Next Steps</h2>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Recommended Learning Path</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">1</div>
                <span className="text-purple-800">Complete the Candidate Management guide</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">2</div>
                <span className="text-purple-800">Learn about Email Sequences for outreach</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">3</div>
                <span className="text-purple-800">Explore Analytics and Reporting features</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">4</div>
                <span className="text-purple-800">Master the Chrome Extension for LinkedIn sourcing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Was this helpful?</span>
            <div className="flex space-x-2">
              <button className="text-green-600 hover:text-green-700">👍</button>
              <button className="text-red-600 hover:text-red-700">👎</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

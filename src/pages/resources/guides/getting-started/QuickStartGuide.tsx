import React from 'react';
import { 
  Rocket, CheckCircle, User, Settings, 
  Briefcase, Users, Chrome, Mail,
  Target, Clock, ArrowRight, Play,
  BookOpen, Lightbulb, Star, Shield
} from 'lucide-react';

export const QuickStartGuide = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <Rocket className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quick Start Guide</h1>
            <p className="text-gray-600">Get up and running with TAL in just 15 minutes</p>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Rocket className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900">What You'll Accomplish</h3>
          </div>
          <ul className="text-green-800 space-y-1 text-sm">
            <li>• Complete your account setup and team configuration</li>
            <li>• Create your first sourcing project and job posting</li>
            <li>• Install and configure the Chrome extension</li>
            <li>• Import your first candidate and send an outreach email</li>
            <li>• Set up your dashboard for daily workflow</li>
          </ul>
          
          <div className="mt-3 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Estimated time: 15 minutes</span>
          </div>
        </div>
      </div>

      {/* Progress Tracker */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Progress</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-gray-900">Setup</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center">2</div>
              <span className="text-sm text-gray-600">Project</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center">3</div>
              <span className="text-sm text-gray-600">Extension</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center">4</div>
              <span className="text-sm text-gray-600">Candidate</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center">5</div>
              <span className="text-sm text-gray-600">Workflow</span>
            </div>
          </div>
        </div>
      </section>

      {/* Step 1: Account Setup */}
      <section className="mb-8">
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Complete Account Setup</h3>
              <p className="text-gray-600">Configure your profile and team settings</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Setup */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Profile Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Complete your personal profile</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Upload a professional photo</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Set your timezone and preferences</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Configure notification settings</span>
                  </div>
                </div>
                <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
                  Update Profile
                </button>
              </div>

              {/* Team Setup */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Team Configuration
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
                    <span className="text-gray-700">Invite team members</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
                    <span className="text-gray-700">Set up roles and permissions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
                    <span className="text-gray-700">Configure team workflows</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
                    <span className="text-gray-700">Set up approval processes</span>
                  </div>
                </div>
                <button className="mt-3 bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition-colors">
                  Manage Team
                </button>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-900">Pro Tip</h4>
              </div>
              <p className="text-yellow-800 text-sm">
                Complete your profile setup first to ensure proper attribution and communication. 
                You can always invite team members later, but having your basic information ready will make collaboration smoother.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Step 2: Create First Project */}
      <section className="mb-8">
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Create Your First Project</h3>
              <p className="text-gray-600">Set up a sourcing project and job posting</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sourcing Project */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Sourcing Project
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-green-800 mb-3">Create a project to organize your recruitment efforts:</p>
                  <div className="space-y-1">
                    <p className="text-green-700">• Project name: "Software Engineer - Frontend"</p>
                    <p className="text-green-700">• Target: 5 qualified candidates</p>
                    <p className="text-green-700">• Timeline: 2 weeks</p>
                    <p className="text-green-700">• Budget: $2,000</p>
                  </div>
                </div>
                <button className="mt-3 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors flex items-center">
                  Create Project <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>

              {/* Job Posting */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Job Posting
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-orange-800 mb-3">Create your first job posting:</p>
                  <div className="space-y-1">
                    <p className="text-orange-700">• Job title and requirements</p>
                    <p className="text-orange-700">• Salary range and benefits</p>
                    <p className="text-orange-700">• Company information</p>
                    <p className="text-orange-700">• Application process</p>
                  </div>
                </div>
                <button className="mt-3 bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700 transition-colors flex items-center">
                  Create Job <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Quick Project Template</h4>
              <div className="text-blue-800 text-sm space-y-1">
                <p><strong>Project Name:</strong> [Role] - [Department] - [Location]</p>
                <p><strong>Description:</strong> Brief overview of the role and team</p>
                <p><strong>Target Candidates:</strong> Number of qualified candidates needed</p>
                <p><strong>Timeline:</strong> Expected completion date</p>
                <p><strong>Budget:</strong> Allocated sourcing budget</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step 3: Install Chrome Extension */}
      <section className="mb-8">
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Install Chrome Extension</h3>
              <p className="text-gray-600">Set up LinkedIn profile extraction</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                <Chrome className="w-4 h-4 mr-2" />
                Extension Setup Steps
              </h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</div>
                  <div>
                    <p className="font-medium text-purple-900">Download Extension</p>
                    <p className="text-sm text-purple-700">Get the TAL Chrome extension from the Chrome Web Store</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</div>
                  <div>
                    <p className="font-medium text-purple-900">Connect Account</p>
                    <p className="text-sm text-purple-700">Authenticate with your TAL credentials</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</div>
                  <div>
                    <p className="font-medium text-purple-900">Test Extraction</p>
                    <p className="text-sm text-purple-700">Try extracting a LinkedIn profile to verify setup</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-3">
                <button className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition-colors">
                  Install Extension
                </button>
                <button className="border border-purple-600 text-purple-600 px-4 py-2 rounded text-sm hover:bg-purple-50 transition-colors">
                  View Guide
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">What You Can Do:</h4>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• Extract complete LinkedIn profiles with one click</li>
                <li>• Import candidate data directly to your projects</li>
                <li>• Access contact information when available</li>
                <li>• Batch process multiple profiles efficiently</li>
                <li>• Maintain compliance with LinkedIn's terms of service</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Step 4: Import First Candidate */}
      <section className="mb-8">
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Import Your First Candidate</h3>
              <p className="text-gray-600">Find, extract, and engage with a potential candidate</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
                <Play className="w-4 h-4 mr-2" />
                Hands-On Exercise
              </h4>
              <div className="space-y-3">
                <p className="text-orange-800 text-sm">
                  Let's walk through the complete process of finding and engaging with a candidate:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="font-medium text-orange-900">Step 1: Find Candidate</h5>
                    <ul className="text-orange-700 text-sm space-y-1">
                      <li>• Search LinkedIn for relevant profiles</li>
                      <li>• Review qualifications and experience</li>
                      <li>• Check if they match your job requirements</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium text-orange-900">Step 2: Extract Profile</h5>
                    <ul className="text-orange-700 text-sm space-y-1">
                      <li>• Click the TAL extension icon</li>
                      <li>• Review extracted information</li>
                      <li>• Select your project destination</li>
                      <li>• Import to TAL database</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Send First Outreach
              </h4>
              <div className="space-y-2">
                <p className="text-green-800 text-sm">
                  After importing, send a personalized outreach email:
                </p>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• Use the built-in email templates</li>
                  <li>• Personalize with candidate's background</li>
                  <li>• Include job opportunity details</li>
                  <li>• Schedule follow-up reminders</li>
                </ul>
                <button className="mt-2 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors">
                  View Email Templates
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step 5: Dashboard Setup */}
      <section className="mb-8">
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">5</div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Optimize Your Dashboard</h3>
              <p className="text-gray-600">Configure your daily workflow and analytics</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-3 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Dashboard Widgets
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-red-800 mb-2">Customize your dashboard view:</p>
                  <div className="space-y-1">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-red-700">Active projects overview</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-red-700">Recent candidate activity</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-red-700">Email campaign metrics</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-red-700">Team performance stats</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Daily Workflow
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-blue-800 mb-2">Recommended daily routine:</p>
                  <div className="space-y-1">
                    <p className="text-blue-700">• Review overnight candidate responses</p>
                    <p className="text-blue-700">• Check project progress and metrics</p>
                    <p className="text-blue-700">• Source 3-5 new candidates per project</p>
                    <p className="text-blue-700">• Send follow-up emails</p>
                    <p className="text-blue-700">• Update candidate statuses</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-900">Congratulations!</h4>
              </div>
              <p className="text-green-800 text-sm mb-3">
                You've completed the quick start setup! You now have a fully functional TAL workspace ready for recruitment activities.
              </p>
              <div className="flex space-x-3">
                <button className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors">
                  Explore Advanced Features
                </button>
                <button className="border border-green-600 text-green-600 px-4 py-2 rounded text-sm hover:bg-green-50 transition-colors">
                  View Tutorial Videos
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">What's Next?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Advanced Sourcing</h3>
            <p className="text-gray-600 text-sm mb-3">
              Learn advanced search techniques and bulk processing methods.
            </p>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
              Learn More →
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Email Automation</h3>
            <p className="text-gray-600 text-sm mb-3">
              Set up automated email sequences for better candidate engagement.
            </p>
            <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
              Learn More →
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Team Collaboration</h3>
            <p className="text-gray-600 text-sm mb-3">
              Collaborate effectively with team members and manage permissions.
            </p>
            <button className="text-green-600 text-sm font-medium hover:text-green-700">
              Learn More →
            </button>
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
            <span className="text-sm text-gray-500">Need help?</span>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

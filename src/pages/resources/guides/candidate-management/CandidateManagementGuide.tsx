import React from 'react';
import { 
  Users, UserPlus, Upload, Download, Edit, Search, 
  Filter, MessageSquare, Calendar, FileText, 
  CheckCircle, AlertCircle, Star, Clock, 
  BarChart3, Eye, Link, Mail, Phone
} from 'lucide-react';

export const CandidateManagementGuide = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Candidate Management Guide</h1>
            <p className="text-gray-600">Complete guide to managing candidate profiles and recruitment pipelines</p>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">What You'll Learn</h3>
          </div>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Import and organize candidate profiles</li>
            <li>• Track candidate interactions and communications</li>
            <li>• Manage recruitment pipelines effectively</li>
            <li>• Schedule interviews and follow-ups</li>
            <li>• Analyze candidate performance data</li>
          </ul>
        </div>
      </div>

      {/* Overview Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            TAL's Candidate Management system provides a comprehensive platform for organizing, tracking, and 
            nurturing candidate relationships throughout the recruitment lifecycle. From initial contact to 
            successful placement, you can manage every aspect of the candidate experience.
          </p>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Core Capabilities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Centralized candidate database</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Automated pipeline management</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Communication tracking</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Interview scheduling</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Document management</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Performance analytics</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Adding Candidates to Your Database</h2>
        
        <div className="space-y-6">
          {/* Method 1: Chrome Extension */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Link className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Chrome Extension Import</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                The fastest way to add candidates is through our Chrome extension for LinkedIn profile extraction.
              </p>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">Steps:</h4>
                <ol className="text-purple-800 space-y-1 text-sm list-decimal list-inside">
                  <li>Navigate to a LinkedIn profile</li>
                  <li>Click the TAL extension icon</li>
                  <li>Review extracted data for accuracy</li>
                  <li>Select the target project or create new</li>
                  <li>Click "Import to TAL" to add the candidate</li>
                </ol>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Pro Tip:</span>
                </div>
                <p className="text-green-800 text-sm mt-1">
                  Use bulk import for multiple profiles by opening them in separate tabs and importing sequentially.
                </p>
              </div>
            </div>
          </div>

          {/* Method 2: Manual Entry */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Manual Candidate Entry</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                For candidates from other sources or referrals, you can manually create comprehensive profiles.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Required Information:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Full name and contact details</li>
                    <li>• Current position and company</li>
                    <li>• Location and availability</li>
                    <li>• Key skills and experience</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Optional Enhancements:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Resume and portfolio uploads</li>
                    <li>• Social media profiles</li>
                    <li>• Salary expectations</li>
                    <li>• Personal notes and tags</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Method 3: Bulk Upload */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Bulk Import from CSV</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Import large numbers of candidates from spreadsheets or other recruitment databases.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">CSV Format Requirements:</h4>
                <div className="text-blue-800 text-sm">
                  <p className="mb-2">Required columns: First Name, Last Name, Email, Phone</p>
                  <p>Optional columns: Company, Position, Location, Skills, LinkedIn URL</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Management */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Candidate Profiles</h2>
        
        <div className="space-y-6">
          {/* Profile Organization */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Edit className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Profile Organization</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Profile Sections:</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">Contact Information</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">Professional Experience</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">Skills & Qualifications</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">Documents & Portfolio</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">Communication History</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">Notes & Tags</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Quick Actions:</h4>
                <div className="space-y-2">
                  <button className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700">
                    <Mail className="w-4 h-4" />
                    <span>Send Email</span>
                  </button>
                  <button className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700">
                    <Calendar className="w-4 h-4" />
                    <span>Schedule Interview</span>
                  </button>
                  <button className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700">
                    <FileText className="w-4 h-4" />
                    <span>Add Note</span>
                  </button>
                  <button className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700">
                    <Star className="w-4 h-4" />
                    <span>Add to Favorites</span>
                  </button>
                  <button className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700">
                    <Download className="w-4 h-4" />
                    <span>Export Profile</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Communication Tracking */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <MessageSquare className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Communication Tracking</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Track all interactions with candidates to maintain context and build stronger relationships.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <Mail className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-blue-900">Email Integration</h4>
                  <p className="text-blue-800 text-sm">Automatic email tracking and templates</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <Phone className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-green-900">Call Logging</h4>
                  <p className="text-green-800 text-sm">Record call outcomes and next steps</p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                  <MessageSquare className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-purple-900">Notes & Updates</h4>
                  <p className="text-purple-800 text-sm">Team-wide notes and status updates</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline Management */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pipeline Management</h2>
        
        <div className="space-y-6">
          {/* Pipeline Stages */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Understanding Pipeline Stages</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Move candidates through structured stages to track progress and maintain visibility into your recruitment funnel.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Standard Pipeline Flow:</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    { name: 'Sourced', color: 'bg-gray-100 text-gray-800', desc: 'Initial candidate identification' },
                    { name: 'Contacted', color: 'bg-blue-100 text-blue-800', desc: 'First outreach completed' },
                    { name: 'Engaged', color: 'bg-yellow-100 text-yellow-800', desc: 'Candidate showed interest' },
                    { name: 'Screening', color: 'bg-orange-100 text-orange-800', desc: 'Initial qualification call' },
                    { name: 'Submitted', color: 'bg-purple-100 text-purple-800', desc: 'Profile sent to client' },
                    { name: 'Interview', color: 'bg-indigo-100 text-indigo-800', desc: 'Client interview scheduled' },
                    { name: 'Offer', color: 'bg-green-100 text-green-800', desc: 'Job offer extended' },
                    { name: 'Placed', color: 'bg-emerald-100 text-emerald-800', desc: 'Successfully hired' }
                  ].map((stage, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${stage.color} mb-1`}>
                        {stage.name}
                      </span>
                      <span className="text-xs text-gray-500 text-center max-w-20">{stage.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stage Management */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Moving Candidates Through Stages</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Manual Updates:</h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Drag and drop between pipeline columns</li>
                  <li>• Bulk stage updates for multiple candidates</li>
                  <li>• Add stage-specific notes and timestamps</li>
                  <li>• Set follow-up reminders and tasks</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Automated Triggers:</h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Email response triggers stage advancement</li>
                  <li>• Calendar integration for interview scheduling</li>
                  <li>• Client feedback integration</li>
                  <li>• Time-based stage progression rules</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filtering */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Advanced Search & Filtering</h2>
        
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Search className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Finding the Right Candidates</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-700">
              Use powerful search and filtering capabilities to quickly locate candidates that match specific criteria.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <Search className="w-4 h-4 mr-2" />
                  Search Options
                </h4>
                <ul className="text-blue-800 space-y-1 text-sm">
                  <li>• Full-text search across all profile fields</li>
                  <li>• Boolean search operators (AND, OR, NOT)</li>
                  <li>• Exact phrase matching with quotes</li>
                  <li>• Wildcard and partial matching</li>
                  <li>• Search within specific projects</li>
                </ul>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter Categories
                </h4>
                <ul className="text-green-800 space-y-1 text-sm">
                  <li>• Location and remote preferences</li>
                  <li>• Experience level and years</li>
                  <li>• Skills and technologies</li>
                  <li>• Industry and company size</li>
                  <li>• Pipeline stage and status</li>
                  <li>• Date added and last activity</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-900">Saved Searches</h4>
              </div>
              <p className="text-yellow-800 text-sm">
                Save frequently used search queries and filters for quick access. Create alerts to be notified 
                when new candidates match your saved criteria.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics & Insights */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics & Performance Insights</h2>
        
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Key Metrics to Track</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">85%</div>
                <div className="text-sm text-blue-800">Response Rate</div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">12 days</div>
                <div className="text-sm text-green-800">Avg. Time to Hire</div>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">67%</div>
                <div className="text-sm text-purple-800">Pipeline Conversion</div>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">156</div>
                <div className="text-sm text-orange-800">Active Candidates</div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">23</div>
                <div className="text-sm text-red-800">Placements This Month</div>
              </div>
              
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-indigo-600 mb-1">92%</div>
                <div className="text-sm text-indigo-800">Client Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices for Candidate Management</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-3">✅ Recommended Practices</h3>
            <ul className="text-green-800 space-y-2 text-sm">
              <li>• Update candidate stages promptly after each interaction</li>
              <li>• Add detailed notes with context and next steps</li>
              <li>• Use consistent tagging for better organization</li>
              <li>• Set up automated reminders for follow-ups</li>
              <li>• Regularly clean and deduplicate your database</li>
              <li>• Maintain candidate privacy and data protection</li>
              <li>• Use templates for consistent communication</li>
            </ul>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-3">❌ Common Mistakes to Avoid</h3>
            <ul className="text-red-800 space-y-2 text-sm">
              <li>• Leaving candidates without status updates</li>
              <li>• Using generic, impersonal communication</li>
              <li>• Failing to track interaction history</li>
              <li>• Not setting clear expectations with candidates</li>
              <li>• Overlooking passive candidates in your database</li>
              <li>• Ignoring candidate feedback and preferences</li>
              <li>• Not utilizing team collaboration features</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Next Steps in Your Learning Journey</h2>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Recommended Next Guides</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">1</div>
                  <span className="text-purple-800">Email Sequences & Outreach</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">2</div>
                  <span className="text-purple-800">Chrome Extension for LinkedIn</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">3</div>
                  <span className="text-purple-800">Interview Scheduling</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">4</div>
                  <span className="text-purple-800">Analytics and Reporting</span>
                </div>
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

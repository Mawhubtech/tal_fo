import React from 'react';
import { 
  Briefcase, Plus, Search, Filter, Edit3, Users, 
  Calendar, MapPin, DollarSign, Clock, 
  CheckCircle, AlertCircle, Eye, Share2,
  Target, TrendingUp, Mail, Settings, Star
} from 'lucide-react';

export const JobManagementGuide = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Briefcase className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Management Guide</h1>
            <p className="text-gray-600">Create, manage, and optimize your job postings and recruitment pipeline</p>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">What You'll Learn</h3>
          </div>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Create and customize job postings with detailed requirements</li>
            <li>• Set up recruitment pipelines and workflow stages</li>
            <li>• Manage applications and candidate matching</li>
            <li>• Track job performance and recruitment metrics</li>
            <li>• Collaborate with team members on hiring decisions</li>
          </ul>
        </div>
      </div>

      {/* Creating Jobs */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Creating Job Postings</h2>
        
        <div className="space-y-6">
          {/* Basic Job Creation */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <h3 className="text-xl font-semibold text-gray-900">Basic Job Information</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Start by creating a comprehensive job posting with all essential details.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Required Fields
                  </h4>
                  <ul className="text-green-800 text-sm space-y-1">
                    <li>• Job title and department</li>
                    <li>• Company and location</li>
                    <li>• Employment type (Full-time, Part-time, Contract)</li>
                    <li>• Job description and responsibilities</li>
                    <li>• Required qualifications and skills</li>
                    <li>• Salary range and benefits</li>
                    <li>• Application deadline</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Optional Enhancements
                  </h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Company culture and values</li>
                    <li>• Career development opportunities</li>
                    <li>• Team structure and reporting</li>
                    <li>• Remote work options</li>
                    <li>• Preferred qualifications</li>
                    <li>• Interview process overview</li>
                    <li>• Custom application questions</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Pro Tip: Writing Effective Job Descriptions
                </h4>
                <p className="text-yellow-800 text-sm">
                  Use clear, inclusive language and focus on outcomes rather than just tasks. 
                  Include 5-7 must-have requirements and 3-5 nice-to-have qualifications. 
                  Be specific about growth opportunities and company culture.
                </p>
              </div>
            </div>
          </div>

          {/* Pipeline Setup */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <h3 className="text-xl font-semibold text-gray-900">Setting Up Recruitment Pipeline</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Configure your recruitment workflow to match your hiring process.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Standard Pipeline Stages:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-100 rounded-lg p-3 text-center">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Eye className="w-4 h-4" />
                    </div>
                    <h5 className="font-medium text-blue-900">Applied</h5>
                    <p className="text-xs text-blue-700">Initial application received</p>
                  </div>
                  
                  <div className="bg-purple-100 rounded-lg p-3 text-center">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Search className="w-4 h-4" />
                    </div>
                    <h5 className="font-medium text-purple-900">Screening</h5>
                    <p className="text-xs text-purple-700">Resume and qualification review</p>
                  </div>
                  
                  <div className="bg-orange-100 rounded-lg p-3 text-center">
                    <div className="w-8 h-8 bg-orange-600 text-white rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <h5 className="font-medium text-orange-900">Interview</h5>
                    <p className="text-xs text-orange-700">Phone/video/in-person interviews</p>
                  </div>
                  
                  <div className="bg-green-100 rounded-lg p-3 text-center">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full mx-auto mb-2 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <h5 className="font-medium text-green-900">Offer</h5>
                    <p className="text-xs text-green-700">Final decision and offer</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Pipeline Customization</h4>
                  <ul className="text-purple-800 text-sm space-y-1">
                    <li>• Add custom stages for your process</li>
                    <li>• Set stage-specific requirements</li>
                    <li>• Configure automatic email triggers</li>
                    <li>• Set up team member assignments</li>
                    <li>• Define approval workflows</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Stage Automation</h4>
                  <ul className="text-green-800 text-sm space-y-1">
                    <li>• Auto-screening based on criteria</li>
                    <li>• Scheduled interview reminders</li>
                    <li>• Rejection email templates</li>
                    <li>• Reference check requests</li>
                    <li>• Offer letter generation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Managing Applications */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Applications</h2>
        
        <div className="space-y-6">
          {/* Application Review */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Application Review Process</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Efficiently review and manage incoming applications with built-in screening tools.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    Smart Filtering
                  </h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Filter by qualifications</li>
                    <li>• Experience level sorting</li>
                    <li>• Location-based filtering</li>
                    <li>• Salary expectation ranges</li>
                    <li>• Application date filters</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Bulk Actions
                  </h4>
                  <ul className="text-green-800 text-sm space-y-1">
                    <li>• Move multiple candidates</li>
                    <li>• Send batch emails</li>
                    <li>• Update statuses in bulk</li>
                    <li>• Schedule group interviews</li>
                    <li>• Export candidate data</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Candidate Scoring
                  </h4>
                  <ul className="text-purple-800 text-sm space-y-1">
                    <li>• Qualification matching</li>
                    <li>• Custom scoring criteria</li>
                    <li>• Team member ratings</li>
                    <li>• Interview feedback</li>
                    <li>• Overall fit assessment</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Interview Management */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Interview Scheduling & Management</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Streamline your interview process with integrated scheduling and feedback collection.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Interview Workflow:</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</div>
                    <div>
                      <p className="font-medium text-gray-900">Schedule Interview</p>
                      <p className="text-sm text-gray-600">Send calendar invites with video links and interview details</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</div>
                    <div>
                      <p className="font-medium text-gray-900">Prepare Interview Kit</p>
                      <p className="text-sm text-gray-600">Access candidate profile, resume, and pre-screening notes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</div>
                    <div>
                      <p className="font-medium text-gray-900">Conduct Interview</p>
                      <p className="text-sm text-gray-600">Use structured interview templates and real-time note-taking</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</div>
                    <div>
                      <p className="font-medium text-gray-900">Submit Feedback</p>
                      <p className="text-sm text-gray-600">Complete evaluation forms and update candidate status</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Performance */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Performance & Analytics</h2>
        
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Key Performance Metrics</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Track your job posting performance and recruitment efficiency with comprehensive analytics.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Eye className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-blue-900 text-sm">Job Views</h4>
                  <p className="text-xs text-blue-700">Total profile visits</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-green-900 text-sm">Applications</h4>
                  <p className="text-xs text-green-700">Qualified candidates</p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-purple-900 text-sm">Time to Fill</h4>
                  <p className="text-xs text-purple-700">Days from post to hire</p>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                  <div className="w-10 h-10 bg-orange-600 text-white rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-orange-900 text-sm">Conversion Rate</h4>
                  <p className="text-xs text-orange-700">Application to hire ratio</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Performance Optimization Tips:</h4>
                <ul className="text-gray-700 space-y-1 text-sm">
                  <li>• Monitor application-to-view ratios to optimize job descriptions</li>
                  <li>• Track source performance to focus on best-performing channels</li>
                  <li>• Analyze time-to-fill metrics to identify process bottlenecks</li>
                  <li>• Compare salary competitiveness with market data</li>
                  <li>• Review candidate feedback to improve job appeal</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Collaboration */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Team Collaboration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Hiring Team Setup</h3>
            </div>
            
            <div className="space-y-3">
              <p className="text-gray-700 text-sm">
                Collaborate effectively with your hiring team throughout the recruitment process.
              </p>
              
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• Assign team members to specific job roles</li>
                <li>• Set permissions for resume access and candidate management</li>
                <li>• Create interview panels with multiple interviewers</li>
                <li>• Enable collaborative feedback and notes</li>
                <li>• Set up approval workflows for hiring decisions</li>
              </ul>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Mail className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Communication Tools</h3>
            </div>
            
            <div className="space-y-3">
              <p className="text-gray-700 text-sm">
                Keep all stakeholders informed with automated notifications and updates.
              </p>
              
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• Automated candidate status updates</li>
                <li>• Interview scheduling notifications</li>
                <li>• Daily/weekly hiring pipeline reports</li>
                <li>• Custom email templates for candidate communication</li>
                <li>• Real-time activity feeds and updates</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Recommended Practices
            </h3>
            <ul className="text-green-800 space-y-1 text-sm">
              <li>• Write clear, inclusive job descriptions</li>
              <li>• Set realistic timelines and expectations</li>
              <li>• Maintain consistent communication with candidates</li>
              <li>• Use structured interview processes</li>
              <li>• Provide timely feedback at each stage</li>
              <li>• Track and analyze recruitment metrics</li>
              <li>• Continuously optimize your process</li>
            </ul>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-3 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Common Pitfalls to Avoid
            </h3>
            <ul className="text-red-800 space-y-1 text-sm">
              <li>• Overly complex or lengthy job descriptions</li>
              <li>• Unrealistic qualification requirements</li>
              <li>• Poor candidate communication</li>
              <li>• Inconsistent interview processes</li>
              <li>• Delayed feedback and decisions</li>
              <li>• Ignoring candidate experience</li>
              <li>• Not tracking recruitment metrics</li>
            </ul>
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

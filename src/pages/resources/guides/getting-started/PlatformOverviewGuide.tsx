import React from 'react';
import { 
  Compass, Users, Briefcase, Search, Mail, 
  BarChart3, Chrome, Settings, Shield, 
  Target, Zap, Database, MessageSquare,
  Calendar, FileText, Building, UserPlus,
  TrendingUp, Filter, Workflow, Clock
} from 'lucide-react';

export const PlatformOverviewGuide = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Compass className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">TAL Platform Overview</h1>
            <p className="text-gray-600">Complete guide to understanding TAL's features and capabilities</p>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Compass className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Platform Capabilities</h3>
          </div>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• End-to-end talent acquisition and recruitment management</li>
            <li>• AI-powered candidate sourcing and matching</li>
            <li>• Automated outreach and engagement workflows</li>
            <li>• Team collaboration and performance analytics</li>
            <li>• Chrome extension for seamless LinkedIn integration</li>
          </ul>
        </div>
      </div>

      {/* Core Modules */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Core Modules</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dashboard */}
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard</h3>
            <p className="text-gray-600 text-sm mb-3">
              Central command center with real-time analytics, project overviews, and performance metrics.
            </p>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>• Project status tracking</li>
              <li>• Candidate pipeline overview</li>
              <li>• Team performance metrics</li>
              <li>• Revenue and cost analytics</li>
            </ul>
          </div>

          {/* Sourcing */}
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sourcing</h3>
            <p className="text-gray-600 text-sm mb-3">
              Advanced candidate sourcing with AI-powered search and Chrome extension integration.
            </p>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>• Project-based sourcing</li>
              <li>• LinkedIn profile extraction</li>
              <li>• Candidate database search</li>
              <li>• Bulk import capabilities</li>
            </ul>
          </div>

          {/* Job Management */}
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Jobs</h3>
            <p className="text-gray-600 text-sm mb-3">
              Complete job posting management with customizable recruitment pipelines.
            </p>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>• Job posting creation</li>
              <li>• Application management</li>
              <li>• Custom pipeline stages</li>
              <li>• Interview scheduling</li>
            </ul>
          </div>

          {/* Candidate Management */}
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Candidates</h3>
            <p className="text-gray-600 text-sm mb-3">
              Comprehensive candidate database with advanced filtering and engagement tracking.
            </p>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>• Candidate profiles</li>
              <li>• Communication history</li>
              <li>• Status tracking</li>
              <li>• Skills and qualification matching</li>
            </ul>
          </div>

          {/* Email Sequences */}
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Sequences</h3>
            <p className="text-gray-600 text-sm mb-3">
              Automated email campaigns with personalization and performance tracking.
            </p>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>• Automated drip campaigns</li>
              <li>• Template management</li>
              <li>• Personalization variables</li>
              <li>• Response tracking</li>
            </ul>
          </div>

          {/* Chrome Extension */}
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Chrome className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chrome Extension</h3>
            <p className="text-gray-600 text-sm mb-3">
              Browser extension for seamless LinkedIn profile extraction and candidate import.
            </p>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>• One-click profile extraction</li>
              <li>• Bulk processing capabilities</li>
              <li>• Direct TAL integration</li>
              <li>• Compliance with LinkedIn ToS</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Workflow Overview */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Typical Workflow</h2>
        
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-2 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Project Setup</h4>
              <p className="text-xs text-gray-600">Define requirements</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full mx-auto mb-2 flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Candidate Sourcing</h4>
              <p className="text-xs text-gray-600">Find qualified talent</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full mx-auto mb-2 flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Outreach</h4>
              <p className="text-xs text-gray-600">Engage candidates</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full mx-auto mb-2 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Interview Process</h4>
              <p className="text-xs text-gray-600">Evaluate candidates</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-red-600 text-white rounded-full mx-auto mb-2 flex items-center justify-center">
                <UserPlus className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Placement</h4>
              <p className="text-xs text-gray-600">Close successful hires</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Recruitment Process:</h4>
              <ol className="text-gray-700 space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">1</span>
                  <span>Create sourcing project with job requirements and target metrics</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">2</span>
                  <span>Source candidates using LinkedIn integration and database search</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">3</span>
                  <span>Launch automated email sequences for candidate engagement</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">4</span>
                  <span>Manage interview scheduling and candidate evaluation</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">5</span>
                  <span>Track placements and measure recruitment success</span>
                </li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Key Benefits:</h4>
              <ul className="text-gray-700 space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>Faster candidate sourcing with automation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>Higher response rates with personalized outreach</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Better team collaboration and visibility</span>
                </li>
                <li className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-purple-500" />
                  <span>Data-driven recruitment decisions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>Reduced time-to-fill metrics</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Features</h2>
        
        <div className="space-y-6">
          {/* AI-Powered Features */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">AI-Powered Capabilities</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">Smart Matching</h4>
                <p className="text-purple-800 text-sm">
                  AI algorithms match candidates to job requirements based on skills, experience, and cultural fit.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Predictive Analytics</h4>
                <p className="text-blue-800 text-sm">
                  Forecast candidate response rates and recruitment timeline based on historical data.
                </p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Auto-Personalization</h4>
                <p className="text-green-800 text-sm">
                  Automatically personalize outreach messages based on candidate profile and job requirements.
                </p>
              </div>
            </div>
          </div>

          {/* Integration Capabilities */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Platform Integrations</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded mx-auto mb-2 flex items-center justify-center">
                  <Chrome className="w-5 h-5 text-blue-600" />
                </div>
                <h5 className="font-medium text-gray-900 text-sm">LinkedIn</h5>
                <p className="text-xs text-gray-600">Profile extraction</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded mx-auto mb-2 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <h5 className="font-medium text-gray-900 text-sm">Email Providers</h5>
                <p className="text-xs text-gray-600">SMTP integration</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded mx-auto mb-2 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <h5 className="font-medium text-gray-900 text-sm">Calendar</h5>
                <p className="text-xs text-gray-600">Interview scheduling</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-orange-100 rounded mx-auto mb-2 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-orange-600" />
                </div>
                <h5 className="font-medium text-gray-900 text-sm">ATS Systems</h5>
                <p className="text-xs text-gray-600">Data synchronization</p>
              </div>
            </div>
          </div>

          {/* Security & Compliance */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Security & Compliance</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Data Security:</h4>
                <ul className="text-gray-700 space-y-1 text-sm">
                  <li>• End-to-end encryption for all data transmission</li>
                  <li>• SOC 2 Type II compliant infrastructure</li>
                  <li>• Regular security audits and penetration testing</li>
                  <li>• Role-based access control and permissions</li>
                  <li>• Automated data backup and disaster recovery</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Compliance Standards:</h4>
                <ul className="text-gray-700 space-y-1 text-sm">
                  <li>• GDPR compliance for EU data protection</li>
                  <li>• CCPA compliance for California privacy rights</li>
                  <li>• LinkedIn Terms of Service adherence</li>
                  <li>• Industry-standard recruitment practices</li>
                  <li>• Candidate consent and data retention policies</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Help */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Getting Help & Support</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Live Chat Support</h3>
            <p className="text-gray-600 text-sm mb-3">
              Get instant help from our support team during business hours.
            </p>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
              Start Chat →
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Knowledge Base</h3>
            <p className="text-gray-600 text-sm mb-3">
              Browse comprehensive guides, tutorials, and FAQ articles.
            </p>
            <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
              Browse Articles →
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Community Forum</h3>
            <p className="text-gray-600 text-sm mb-3">
              Connect with other users and share best practices.
            </p>
            <button className="text-green-600 text-sm font-medium hover:text-green-700">
              Join Community →
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
            <span className="text-sm text-gray-500">Ready to get started?</span>
            <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
              Begin Quick Start
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

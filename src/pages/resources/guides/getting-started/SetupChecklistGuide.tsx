import React, { useState } from 'react';
import { 
  CheckSquare, Square, User, Users, Briefcase, 
  Chrome, Mail, Settings, Shield, Target,
  Calendar, Database, Zap, Bell, Clock,
  CheckCircle, AlertCircle, Star, ArrowRight
} from 'lucide-react';

export const SetupChecklistGuide = () => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const ChecklistItem = ({ id, title, description, isOptional = false }: {
    id: string;
    title: string;
    description: string;
    isOptional?: boolean;
  }) => {
    const isChecked = checkedItems[id];
    
    return (
      <div 
        className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
          isChecked 
            ? 'bg-green-50 border-green-200' 
            : 'bg-white border-gray-200 hover:bg-gray-50'
        }`}
        onClick={() => toggleCheck(id)}
      >
        <div className="flex-shrink-0 mt-0.5">
          {isChecked ? (
            <CheckSquare className="w-5 h-5 text-green-600" />
          ) : (
            <Square className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <div className="flex-1">
          <h4 className={`font-medium ${isChecked ? 'text-green-900' : 'text-gray-900'}`}>
            {title}
            {isOptional && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Optional</span>
            )}
          </h4>
          <p className={`text-sm mt-1 ${isChecked ? 'text-green-700' : 'text-gray-600'}`}>
            {description}
          </p>
        </div>
      </div>
    );
  };

  const totalItems = 20;
  const completedItems = Object.values(checkedItems).filter(Boolean).length;
  const progressPercentage = (completedItems / totalItems) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckSquare className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Setup Checklist</h1>
            <p className="text-gray-600">Complete account setup and configuration guide</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {completedItems} of {totalItems} items completed
          </span>
          <span className="font-semibold text-green-600">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
      </div>

      {/* Account Basics */}
      <section className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Account Basics</h2>
        </div>
        
        <div className="space-y-2">
          <ChecklistItem
            id="profile-info"
            title="Complete Profile Information"
            description="Add your name, photo, job title, and contact information"
          />
          <ChecklistItem
            id="timezone"
            title="Set Timezone and Preferences"
            description="Configure your timezone, date format, and language preferences"
          />
          <ChecklistItem
            id="password"
            title="Set Strong Password"
            description="Use a secure password with at least 12 characters including numbers and symbols"
          />
          <ChecklistItem
            id="two-factor"
            title="Enable Two-Factor Authentication"
            description="Add an extra layer of security to your account with 2FA"
            isOptional
          />
        </div>
      </section>

      {/* Team Setup */}
      <section className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Team Configuration</h2>
        </div>
        
        <div className="space-y-2">
          <ChecklistItem
            id="invite-team"
            title="Invite Team Members"
            description="Send invitations to colleagues who will be using the platform"
            isOptional
          />
          <ChecklistItem
            id="roles-permissions"
            title="Set Up Roles and Permissions"
            description="Define user roles (Admin, Recruiter, Viewer) and assign appropriate permissions"
          />
          <ChecklistItem
            id="team-structure"
            title="Organize Team Structure"
            description="Create departments or groups to organize your team effectively"
            isOptional
          />
        </div>
      </section>

      {/* Project Setup */}
      <section className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Project Configuration</h2>
        </div>
        
        <div className="space-y-2">
          <ChecklistItem
            id="first-project"
            title="Create Your First Sourcing Project"
            description="Set up a project with job requirements, target metrics, and timeline"
          />
          <ChecklistItem
            id="job-posting"
            title="Create Job Posting Template"
            description="Design a reusable job posting template with your company branding"
          />
          <ChecklistItem
            id="pipeline-stages"
            title="Configure Pipeline Stages"
            description="Set up custom recruitment pipeline stages that match your process"
          />
          <ChecklistItem
            id="approval-workflow"
            title="Set Up Approval Workflows"
            description="Define approval processes for candidate progression and hiring decisions"
            isOptional
          />
        </div>
      </section>

      {/* Chrome Extension */}
      <section className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center">
            <Chrome className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Chrome Extension</h2>
        </div>
        
        <div className="space-y-2">
          <ChecklistItem
            id="install-extension"
            title="Install TAL Chrome Extension"
            description="Download and install the extension from Chrome Web Store or TAL dashboard"
          />
          <ChecklistItem
            id="authenticate-extension"
            title="Authenticate Extension"
            description="Connect the extension to your TAL account with proper permissions"
          />
          <ChecklistItem
            id="test-extraction"
            title="Test Profile Extraction"
            description="Try extracting a LinkedIn profile to ensure everything works correctly"
          />
          <ChecklistItem
            id="extension-settings"
            title="Configure Extension Settings"
            description="Set up default project assignments and extraction preferences"
          />
        </div>
      </section>

      {/* Email Configuration */}
      <section className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Email Setup</h2>
        </div>
        
        <div className="space-y-2">
          <ChecklistItem
            id="email-integration"
            title="Connect Email Account"
            description="Integrate your professional email account for sending outreach campaigns"
          />
          <ChecklistItem
            id="email-templates"
            title="Create Email Templates"
            description="Set up templates for different types of candidate outreach and follow-ups"
          />
          <ChecklistItem
            id="email-signature"
            title="Configure Email Signature"
            description="Add your professional signature with contact information and company branding"
          />
          <ChecklistItem
            id="email-scheduling"
            title="Set Email Sending Hours"
            description="Configure optimal sending times for your timezone and target audience"
            isOptional
          />
        </div>
      </section>

      {/* Analytics & Notifications */}
      <section className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Notifications & Analytics</h2>
        </div>
        
        <div className="space-y-2">
          <ChecklistItem
            id="notification-preferences"
            title="Set Notification Preferences"
            description="Configure which events trigger email and in-app notifications"
          />
          <ChecklistItem
            id="dashboard-widgets"
            title="Customize Dashboard Widgets"
            description="Select and arrange dashboard widgets to match your workflow priorities"
          />
          <ChecklistItem
            id="reporting-schedule"
            title="Set Up Automated Reports"
            description="Schedule daily, weekly, or monthly performance reports"
            isOptional
          />
        </div>
      </section>

      {/* Completion Status */}
      <section className="mb-8">
        <div className="border border-gray-200 rounded-lg p-6">
          {completedItems === totalItems ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">🎉 Setup Complete!</h3>
              <p className="text-gray-600 mb-4">
                Congratulations! You've completed all setup tasks. Your TAL workspace is ready for recruitment.
              </p>
              <div className="flex justify-center space-x-4">
                <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors flex items-center">
                  Start Recruiting <ArrowRight className="w-4 h-4 ml-2" />
                </button>
                <button className="border border-green-600 text-green-600 px-6 py-2 rounded hover:bg-green-50 transition-colors">
                  View Advanced Features
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Keep Going!</h3>
              <p className="text-gray-600 mb-4">
                You're {Math.round(progressPercentage)}% complete. Finish the remaining {totalItems - completedItems} items to optimize your TAL experience.
              </p>
              <div className="flex justify-center space-x-4">
                <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors">
                  Continue Setup
                </button>
                <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded hover:bg-blue-50 transition-colors">
                  Save Progress
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Next Steps */}
      {completedItems >= totalItems * 0.8 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Next Steps</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Start Your First Project</h3>
              <p className="text-gray-600 text-sm">
                Create a sourcing project and begin finding qualified candidates.
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Explore Advanced Features</h3>
              <p className="text-gray-600 text-sm">
                Learn about AI matching, analytics, and automation capabilities.
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Invite Your Team</h3>
              <p className="text-gray-600 text-sm">
                Collaborate with colleagues and establish team workflows.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Progress automatically saved • Last updated: {new Date().toLocaleDateString()}
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

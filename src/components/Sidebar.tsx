import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Users, Mail, MessageSquare, 
  Settings, HelpCircle, ChevronDown, Edit, FileText, Send, Users as ContactsIcon, // Added ContactsIcon (alias for Users)
  Briefcase, LayoutGrid, Shield, UserPlus, UserCheck, Building, Target, BarChart3 // Added for Jobs, ATS, and Admin
} from 'lucide-react';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, onToggle }) => {
  const [selectedProject, setSelectedProject] = useState('First Project');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className={`${isExpanded ? 'w-52' : 'w-16'} border-r border-gray-200 flex flex-col transition-all duration-300`}>
      {/* Sidebar toggle and Project Selector */}
      <div className="border-b border-gray-200 relative">
        <div className="flex items-center">
          {/* Sidebar toggle button */}
          <button 
            onClick={onToggle}
            className="p-3 text-gray-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
            title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 -rotate-90" />
            ) : (
              <ChevronDown className="w-5 h-5 rotate-90" />
            )}
          </button>
          
          {/* Project selector - only visible when expanded */}
          {isExpanded && (
            <button 
              className="flex flex-1 items-center justify-between px-2 py-1 text-sm font-medium text-gray-800"
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
            >
              {selectedProject}
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {showProjectDropdown && (
          <div className="absolute top-12 left-0 w-full bg-white border border-gray-200 shadow-md z-10 rounded-md">
            <div className="p-2 hover:bg-gray-50 cursor-pointer text-sm" onClick={() => {
              setSelectedProject('First Project');
              setShowProjectDropdown(false);
            }}>
              First Project
            </div>
            <div className="p-2 hover:bg-gray-50 cursor-pointer text-sm" onClick={() => {
              setSelectedProject('Second Project');
              setShowProjectDropdown(false);
            }}>
              Second Project
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation Menu */}
      <div className="flex-1 pt-2">
        <nav className="space-y-1">
          <a 
            href="#" 
            className={`flex items-center ${isExpanded ? 'px-4' : 'px-0 justify-center'} py-2 text-sm font-medium`}
            title={!isExpanded ? "Projects" : ""}
          >
            <div className={isExpanded ? "mr-3" : ""}>📦</div>
            {isExpanded && "Projects"}
          </a>
            <Link 
            to="/dashboard" 
            className={`flex items-center ${isExpanded ? 'px-4 justify-start' : 'px-0 justify-center'} py-2 text-sm font-medium text-purple-700 bg-purple-50 border-l-4 border-purple-700 hover:bg-purple-100`}
            title={!isExpanded ? "Search" : ""}
          >
            <div className={isExpanded ? "mr-3 text-purple-700" : "text-purple-700"}>
              <Search className="w-4 h-4" />
            </div>
            {isExpanded && (
              <>
                Search
                <button className="ml-auto bg-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                  <Edit className="w-3 h-3 text-purple-700" />
                </button>
              </>
            )}          </Link>
          
          <Link 
            to="/dashboard/resume-processing" 
            className={`flex items-center ${isExpanded ? 'px-4' : 'px-0 justify-center'} py-2 text-sm font-medium text-gray-700 hover:bg-gray-50`}
            title={!isExpanded ? "Resume Processing" : ""}
          >
            <div className={isExpanded ? "mr-3 text-gray-400" : "text-gray-400"}>
              <FileText className="w-4 h-4" />
            </div>
            {isExpanded && "Resume Processing"}
          </Link>
          
          <a 
            href="#" 
            className={`flex items-center ${isExpanded ? 'px-4' : 'px-0 justify-center'} py-2 text-sm font-medium text-gray-700`}
            title={!isExpanded ? "Shortlist" : ""}
          >
            <div className={isExpanded ? "mr-3 text-gray-400" : "text-gray-400"}>
              <Users className="w-4 h-4" />
            </div>
            {isExpanded && "Shortlist"}
          </a>
          
          <Link 
            to="/dashboard/contacts" // Updated link to contacts page
            className={`flex items-center ${isExpanded ? 'px-4' : 'px-0 justify-center'} py-2 text-sm font-medium text-gray-700 hover:bg-gray-50`}
            title={!isExpanded ? "Contacts" : ""}
          >
            <div className={isExpanded ? "mr-3 text-gray-400" : "text-gray-400"}>
              <ContactsIcon className="w-4 h-4" /> {/* Changed icon to ContactsIcon */}
            </div>
            {isExpanded && "Contacts"}
          </Link>
          
          <Link 
            to="/dashboard/sequences" // Updated link
            className={`flex items-center ${isExpanded ? 'px-4' : 'px-0 justify-center'} py-2 text-sm font-medium text-gray-700 hover:bg-gray-50`} // Added hover effect
            title={!isExpanded ? "Sequences" : ""}
          >
            <div className={isExpanded ? "mr-3 text-gray-400" : "text-gray-400"}>
              <Send className="w-4 h-4" /> {/* Changed icon to Send */}
            </div>
            {isExpanded && "Sequences"}
          </Link>
          
          {/* Jobs Section */}
          <div>
            <button 
              onClick={() => toggleSection('jobs')}
              className={`flex items-center w-full ${isExpanded ? 'px-4 justify-between' : 'px-0 justify-center'} py-2 text-sm font-medium text-gray-700 hover:bg-gray-50`}
              title={!isExpanded ? "Jobs" : ""}
            >
              <div className="flex items-center">
                <div className={isExpanded ? "mr-3 text-gray-400" : "text-gray-400"}>
                  <Briefcase className="w-4 h-4" />
                </div>
                {isExpanded && "Jobs"}
              </div>
              {isExpanded && <ChevronDown className={`w-4 h-4 transform transition-transform ${openSections['jobs'] ? 'rotate-180' : ''}`} />}
            </button>
            {openSections['jobs'] && isExpanded && (
              <nav className="pl-8 space-y-1 py-1">
                <Link to="/dashboard/jobs/all" className="flex items-center py-1 text-sm text-gray-600 hover:text-gray-900">All Jobs</Link>
                <Link to="/dashboard/jobs/create" className="flex items-center py-1 text-sm text-gray-600 hover:text-gray-900">Create Job</Link>
                <Link to="/dashboard/jobs/archived" className="flex items-center py-1 text-sm text-gray-600 hover:text-gray-900">Archived Jobs</Link>
              </nav>
            )}
          </div>

          {/* ATS Section */}
          <div>
            <button 
              onClick={() => toggleSection('ats')}
              className={`flex items-center w-full ${isExpanded ? 'px-4 justify-between' : 'px-0 justify-center'} py-2 text-sm font-medium text-gray-700 hover:bg-gray-50`}
              title={!isExpanded ? "ATS" : ""}
            >
              <div className="flex items-center">
                <div className={isExpanded ? "mr-3 text-gray-400" : "text-gray-400"}>
                  <LayoutGrid className="w-4 h-4" />
                </div>
                {isExpanded && "ATS"}
              </div>
              {isExpanded && <ChevronDown className={`w-4 h-4 transform transition-transform ${openSections['ats'] ? 'rotate-180' : ''}`} />}
            </button>
            {openSections['ats'] && isExpanded && (
              <nav className="pl-8 space-y-1 py-1">
                <Link to="/dashboard/ats/pipelines" className="flex items-center py-1 text-sm text-gray-600 hover:text-gray-900">Pipelines</Link>
                <Link to="/dashboard/ats/all-candidates" className="flex items-center py-1 text-sm text-gray-600 hover:text-gray-900">All Candidates</Link>
                <Link to="/dashboard/ats/tasks" className="flex items-center py-1 text-sm text-gray-600 hover:text-gray-900">Tasks</Link>
                <Link to="/dashboard/ats/interviews" className="flex items-center py-1 text-sm text-gray-600 hover:text-gray-900">Interviews</Link>
                <Link to="/dashboard/ats/reports" className="flex items-center py-1 text-sm text-gray-600 hover:text-gray-900">Reports</Link>
              </nav>
            )}          </div>

          {/* Admin Section */}
          <div>
            <button 
              onClick={() => toggleSection('admin')}
              className={`flex items-center w-full ${isExpanded ? 'px-4 justify-between' : 'px-0 justify-center'} py-2 text-sm font-medium text-gray-700 hover:bg-gray-50`}
              title={!isExpanded ? "Admin" : ""}
            >
              <div className="flex items-center">
                <div className={isExpanded ? "mr-3 text-gray-400" : "text-gray-400"}>
                  <Shield className="w-4 h-4" />
                </div>
                {isExpanded && "Admin"}
              </div>
              {isExpanded && <ChevronDown className={`w-4 h-4 transform transition-transform ${openSections['admin'] ? 'rotate-180' : ''}`} />}
            </button>            {openSections['admin'] && isExpanded && (
              <nav className="pl-8 space-y-1 py-1">
                <Link to="/dashboard/admin/user-management" className="flex items-center py-1 text-sm text-gray-600 hover:text-gray-900">
                  <Users className="w-3 h-3 mr-2" />
                  User Management
                </Link>
                <Link to="/dashboard/admin/candidate-profiles" className="flex items-center py-1 text-sm text-gray-600 hover:text-gray-900">
                  <UserPlus className="w-3 h-3 mr-2" />
                  Candidate Profiles
                </Link>
                <Link to="/dashboard/admin/company-management" className="flex items-center py-1 text-sm text-gray-600 hover:text-gray-900">
                  <Building className="w-3 h-3 mr-2" />
                  Company Management
                </Link>
                <Link to="/dashboard/admin/job-board-config" className="flex items-center py-1 text-sm text-gray-600 hover:text-gray-900">
                  <Target className="w-3 h-3 mr-2" />
                  Job Board Config
                </Link>
                <Link to="/dashboard/admin/analytics" className="flex items-center py-1 text-sm text-gray-600 hover:text-gray-900">
                  <BarChart3 className="w-3 h-3 mr-2" />
                  Analytics & Reports
                </Link>
                <Link to="/dashboard/admin/system-settings" className="flex items-center py-1 text-sm text-gray-600 hover:text-gray-900">
                  <Settings className="w-3 h-3 mr-2" />
                  System Settings
                </Link>
              </nav>
            )}
          </div>
          
          {/* <a 
            href="#" 
            className={`flex items-center ${isExpanded ? 'px-4' : 'px-0 justify-center'} py-2 text-sm font-medium text-gray-700`}
            title={!isExpanded ? "Usage" : ""}
          >
            <div className={isExpanded ? "mr-3 text-gray-400" : "text-gray-400"}>
              <BarChart2 className="w-4 h-4" />
            </div>
            {isExpanded && "Usage"}
          </a>
          
          <a 
            href="#" 
            className={`flex items-center ${isExpanded ? 'px-4' : 'px-0 justify-center'} py-2 text-sm font-medium text-gray-700`}
            title={!isExpanded ? "Integrations" : ""}
          >
            <div className={isExpanded ? "mr-3 text-gray-400" : "text-gray-400"}>
              <Settings className="w-4 h-4" />
            </div>
            {isExpanded && "Integrations"}
          </a> */}
        </nav>
      </div>
      
      {/* Resources and settings section */}
      <div className="mt-auto border-t border-gray-200">
        <nav className="space-y-1 p-2">
          <a 
            href="#" 
            className={`flex items-center ${isExpanded ? 'px-4' : 'px-0 justify-center'} py-2 text-sm font-medium text-gray-700`}
            title={!isExpanded ? "Resources" : ""}
          >
            <div className={isExpanded ? "mr-3 text-gray-400" : "text-gray-400"}>
              <HelpCircle className="w-4 h-4" />
            </div>
            {isExpanded && "Resources"}
          </a>
          
          <a 
            href="#" 
            className={`flex items-center ${isExpanded ? 'px-4' : 'px-0 justify-center'} py-2 text-sm font-medium text-gray-700`}
            title={!isExpanded ? "Contact Support" : ""}
          >
            <div className={isExpanded ? "mr-3 text-gray-400" : "text-gray-400"}>
              <MessageSquare className="w-4 h-4" />
            </div>
            {isExpanded && "Contact Support"}
          </a>
          
          <a 
            href="#" 
            className={`flex items-center ${isExpanded ? 'px-4' : 'px-0 justify-center'} py-2 text-sm font-medium text-gray-700`}
            title={!isExpanded ? "Settings" : ""}
          >
            <div className={isExpanded ? "mr-3 text-gray-400" : "text-gray-400"}>
              <Settings className="w-4 h-4" />
            </div>
            {isExpanded && "Settings"}
          </a>
        </nav>
        
        {/* Progress Bar - only show when expanded */}
        {isExpanded && (
          <div className="border-t border-gray-200 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600">Getting Started</span>
              <span className="text-xs font-medium text-gray-600">40%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

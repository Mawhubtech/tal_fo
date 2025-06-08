import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Users, MessageSquare, 
  Settings, HelpCircle, ChevronDown, Send, Users as ContactsIcon, // Added ContactsIcon (alias for Users)
  Briefcase, LayoutGrid, Shield, UserPlus, Building, Target, BarChart3 // Added for Jobs and Admin
} from 'lucide-react';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, onToggle }) => {  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sourcing: false,
    admin: true
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className={`${isExpanded ? 'w-52' : 'w-16'} border-r border-gray-200 flex flex-col transition-all duration-300`}>
      {/* Sidebar toggle */}
      <div className="border-b border-gray-200">
        <button 
          onClick={onToggle}
          className="w-full p-3 text-gray-500 hover:text-purple-700 hover:bg-purple-50 transition-colors flex justify-center"
          title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 -rotate-90" />
          ) : (
            <ChevronDown className="w-5 h-5 rotate-90" />
          )}
        </button>
      </div>
        {/* Navigation Menu */}
      <div className="flex-1 pt-2">
        <nav className="space-y-1">          {/* Dashboard/Overview */}
          <Link 
            to="/dashboard" 
            className={`flex items-center ${isExpanded ? 'px-4 justify-start' : 'px-0 justify-center'} py-2 text-sm font-medium text-gray-700 hover:bg-gray-50`}
            title={!isExpanded ? "Dashboard" : ""}
          >
            <div className={isExpanded ? "mr-3 text-gray-400" : "text-gray-400"}>
              <LayoutGrid className="w-4 h-4" />
            </div>
            {isExpanded && "Dashboard"}
          </Link>          {/* Talent Sourcing Section */}
          <div className="relative group">
            <button 
              onClick={() => isExpanded && toggleSection('sourcing')}
              className={`flex items-center w-full ${isExpanded ? 'px-4 justify-between' : 'px-0 justify-center'} py-2 text-sm font-medium text-gray-700 hover:bg-gray-50`}
              title={!isExpanded ? "Sourcing" : ""}
            >
              <div className="flex items-center">
                <div className={isExpanded ? "mr-3 text-gray-400" : "text-gray-400"}>
                  <Search className="w-4 h-4" />
                </div>
                {isExpanded && "Sourcing"}
              </div>
              {isExpanded && <ChevronDown className={`w-4 h-4 transform transition-transform ${openSections['sourcing'] ? 'rotate-180' : ''}`} />}
            </button>
            
            {/* Expanded menu */}
            {openSections['sourcing'] && isExpanded && (
              <nav className="pl-8 space-y-1 py-1">
                <Link to="/dashboard/search" className="flex items-center py-1 text-sm text-purple-700 bg-purple-50 border-l-4 border-purple-700 hover:text-gray-900">
                  <Search className="w-3 h-3 mr-2" />
                  Search
                </Link>
                <Link to="/dashboard/projects" className="flex items-center py-1 text-sm text-gray-600 hover:text-gray-900">
                  <Target className="w-3 h-3 mr-2" />
                  Projects
                </Link>
                <Link to="/dashboard/shortlist" className="flex items-center py-1 text-sm text-gray-600 hover:text-gray-900">
                  <Users className="w-3 h-3 mr-2" />
                  Shortlist
                </Link>
                <Link to="/dashboard/contacts" className="flex items-center py-1 text-sm text-gray-600 hover:text-gray-900">
                  <ContactsIcon className="w-3 h-3 mr-2" />
                  Contacts
                </Link>
                <Link to="/dashboard/sequences" className="flex items-center py-1 text-sm text-gray-600 hover:text-gray-900">
                  <Send className="w-3 h-3 mr-2" />
                  Sequences
                </Link>
              </nav>
            )}
            
            {/* Collapsed hover menu */}
            {!isExpanded && (
              <div className="absolute left-full top-0 ml-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 mb-2">
                    Sourcing
                  </div>
                  <nav className="space-y-1">
                    <Link to="/dashboard/search" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-md">
                      <Search className="w-4 h-4 mr-3" />
                      Search
                    </Link>
                    <Link to="/dashboard/projects" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                      <Target className="w-4 h-4 mr-3" />
                      Projects
                    </Link>
                    <Link to="/dashboard/shortlist" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                      <Users className="w-4 h-4 mr-3" />
                      Shortlist
                    </Link>
                    <Link to="/dashboard/contacts" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                      <ContactsIcon className="w-4 h-4 mr-3" />
                      Contacts
                    </Link>
                    <Link to="/dashboard/sequences" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                      <Send className="w-4 h-4 mr-3" />
                      Sequences
                    </Link>
                  </nav>
                </div>
              </div>
            )}
          </div>          {/* Jobs Section */}
          <Link 
            to="/dashboard/jobs" 
            className={`flex items-center ${isExpanded ? 'px-4 justify-start' : 'px-0 justify-center'} py-2 text-sm font-medium text-gray-700 hover:bg-gray-50`}
            title={!isExpanded ? "Jobs" : ""}
          >
            <div className={isExpanded ? "mr-3 text-gray-400" : "text-gray-400"}>
              <Briefcase className="w-4 h-4" />
            </div>
            {isExpanded && "Jobs"}
          </Link>          {/* Candidates Section */}          <Link 
            to="/dashboard/candidates" 
            className={`flex items-center ${isExpanded ? 'px-4 justify-start' : 'px-0 justify-center'} py-2 text-sm font-medium text-gray-700 hover:bg-gray-50`}
            title={!isExpanded ? "Candidates" : ""}
          >
            <div className={isExpanded ? "mr-3 text-gray-400" : "text-gray-400"}>
              <UserPlus className="w-4 h-4" />
            </div>
            {isExpanded && "Candidates"}          </Link>
          
          {/* Clients Section */}
          <Link 
            to="/dashboard/clients" 
            className={`flex items-center ${isExpanded ? 'px-4 justify-start' : 'px-0 justify-center'} py-2 text-sm font-medium text-gray-700 hover:bg-gray-50`}
            title={!isExpanded ? "Clients" : ""}
          >
            <div className={isExpanded ? "mr-3 text-gray-400" : "text-gray-400"}>
              <Building className="w-4 h-4" />
            </div>
            {isExpanded && "Clients"}
          </Link>

          {/* Admin Section */}
          <div className="relative group">
            <button 
              onClick={() => isExpanded && toggleSection('admin')}
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
            </button>
            
            {/* Expanded menu */}
            {openSections['admin'] && isExpanded && (
              <nav className="pl-8 space-y-1 py-1">                <Link to="/dashboard/admin" className="flex items-center py-1 text-sm text-gray-600 hover:text-gray-900">
                  <LayoutGrid className="w-3 h-3 mr-2" />
                  Overview
                </Link>
                <div className="border-t border-gray-100 my-1 pt-1">
                  <div className="text-xs text-gray-500 mb-1 font-medium">Management</div>
                  <Link to="/dashboard/admin/users" className="flex items-center py-1 text-sm text-gray-600 hover:text-gray-900">
                    <Users className="w-3 h-3 mr-2" />
                    Users
                  </Link>
                </div>
                <div className="border-t border-gray-100 my-1 pt-1">
                  <div className="text-xs text-gray-500 mb-1 font-medium">System</div>
                  <Link to="/dashboard/admin/job-boards" className="flex items-center py-1 text-sm text-gray-600 hover:text-gray-900">
                    <Target className="w-3 h-3 mr-2" />
                    Job Boards
                  </Link>
                  <Link to="/dashboard/admin/analytics" className="flex items-center py-1 text-sm text-gray-600 hover:text-gray-900">
                    <BarChart3 className="w-3 h-3 mr-2" />
                    Analytics
                  </Link>
                  <Link to="/dashboard/admin/settings" className="flex items-center py-1 text-sm text-gray-600 hover:text-gray-900">
                    <Settings className="w-3 h-3 mr-2" />
                    Settings
                  </Link>
                </div>
              </nav>
            )}
            
            {/* Collapsed hover menu */}
            {!isExpanded && (
              <div className="absolute left-full top-0 ml-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 mb-2">
                    Admin
                  </div>
                  <nav className="space-y-1">                    <Link to="/dashboard/admin" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                      <LayoutGrid className="w-4 h-4 mr-3" />
                      Overview
                    </Link>
                    <div className="border-t border-gray-100 my-2 pt-2">
                      <div className="px-3 py-1 text-xs font-medium text-gray-500">Management</div>
                      <Link to="/dashboard/admin/users" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                        <Users className="w-4 h-4 mr-3" />
                        Users
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 my-2 pt-2">
                      <div className="px-3 py-1 text-xs font-medium text-gray-500">System</div>
                      <Link to="/dashboard/admin/job-boards" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                        <Target className="w-4 h-4 mr-3" />
                        Job Boards
                      </Link>
                      <Link to="/dashboard/admin/analytics" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                        <BarChart3 className="w-4 h-4 mr-3" />
                        Analytics
                      </Link>
                      <Link to="/dashboard/admin/settings" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </Link>
                    </div>
                  </nav>
                </div>
              </div>
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

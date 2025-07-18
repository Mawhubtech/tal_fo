import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  FileText, 
  Search, 
  User, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: 'overview' | 'applications' | 'saved' | 'profile' | 'settings') => void;
  applicationsCount: number;
  savedJobsCount: number;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  applicationsCount,
  savedJobsCount,
  isCollapsed,
  setIsCollapsed
}) => {
  return (
    <div className={`${isCollapsed ? 'w-16' : 'lg:w-64'} flex-shrink-0 transition-all duration-300`}>
      <div className="bg-white rounded-lg shadow p-2">
        {/* Toggle Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group relative"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
            {!isCollapsed && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                Collapse (Ctrl+B)
              </div>
            )}
          </button>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} py-2 text-sm font-medium rounded-lg transition-all duration-300 group relative ${
              activeTab === 'overview'
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            {!isCollapsed && <span className="ml-3">Overview</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                Overview
              </div>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('applications')}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} py-2 text-sm font-medium rounded-lg transition-all duration-300 group relative ${
              activeTab === 'applications'
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="relative">
              <FileText className="h-4 w-4" />
              {isCollapsed && applicationsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {applicationsCount > 9 ? '9+' : applicationsCount}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <>
                <span className="ml-3">My Applications</span>
                {applicationsCount > 0 && (
                  <span className="ml-auto bg-purple-600 text-white text-xs rounded-full px-2 py-1">
                    {applicationsCount}
                  </span>
                )}
              </>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                My Applications
              </div>
            )}
          </button>
          
          <Link
            to="/jobs"
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-300 group relative`}
          >
            <Briefcase className="h-4 w-4" />
            {!isCollapsed && <span className="ml-3">All Jobs</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                All Jobs
              </div>
            )}
          </Link>
          
          <button
            onClick={() => setActiveTab('saved')}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} py-2 text-sm font-medium rounded-lg transition-all duration-300 group relative ${
              activeTab === 'saved'
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="relative">
              <Search className="h-4 w-4" />
              {isCollapsed && savedJobsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {savedJobsCount > 9 ? '9+' : savedJobsCount}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <>
                <span className="ml-3">Saved Jobs</span>
                {savedJobsCount > 0 && (
                  <span className="ml-auto bg-gray-500 text-white text-xs rounded-full px-2 py-1">
                    {savedJobsCount}
                  </span>
                )}
              </>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                Saved Jobs
              </div>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} py-2 text-sm font-medium rounded-lg transition-all duration-300 group relative ${
              activeTab === 'profile'
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User className="h-4 w-4" />
            {!isCollapsed && <span className="ml-3">Profile</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                Profile
              </div>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} py-2 text-sm font-medium rounded-lg transition-all duration-300 group relative ${
              activeTab === 'settings'
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Settings className="h-4 w-4" />
            {!isCollapsed && <span className="ml-3">Settings</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                Settings
              </div>
            )}
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;

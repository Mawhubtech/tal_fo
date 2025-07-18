import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  FileText, 
  Search, 
  User, 
  Settings 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: 'overview' | 'applications' | 'saved' | 'profile' | 'settings') => void;
  applicationsCount: number;
  savedJobsCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  applicationsCount,
  savedJobsCount
}) => {
  return (
    <div className="lg:w-64 flex-shrink-0">
      <nav className="space-y-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
            activeTab === 'overview'
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Briefcase className="h-4 w-4 mr-3" />
          Overview
        </button>
        
        <button
          onClick={() => setActiveTab('applications')}
          className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
            activeTab === 'applications'
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FileText className="h-4 w-4 mr-3" />
          My Applications
          {applicationsCount > 0 && (
            <span className="ml-auto bg-purple-600 text-white text-xs rounded-full px-2 py-1">
              {applicationsCount}
            </span>
          )}
        </button>
        
        <Link
          to="/jobs"
          className="w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100"
        >
          <Briefcase className="h-4 w-4 mr-3" />
          All Jobs
        </Link>
        
        <button
          onClick={() => setActiveTab('saved')}
          className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
            activeTab === 'saved'
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Search className="h-4 w-4 mr-3" />
          Saved Jobs
          {savedJobsCount > 0 && (
            <span className="ml-auto bg-gray-500 text-white text-xs rounded-full px-2 py-1">
              {savedJobsCount}
            </span>
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('profile')}
          className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
            activeTab === 'profile'
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <User className="h-4 w-4 mr-3" />
          Profile
        </button>
        
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
            activeTab === 'settings'
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Settings className="h-4 w-4 mr-3" />
          Settings
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;

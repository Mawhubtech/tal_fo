import React, { useState } from 'react';
import { 
  Search, Users, Mail, MessageSquare, BarChart2, 
  Settings, HelpCircle, ChevronDown, Edit
} from 'lucide-react';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, onToggle }) => {
  const [selectedProject, setSelectedProject] = useState('First Project');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  // Helper function to get role badge color
  const getRoleBadgeColor = (roleName: string) => {
    const roleColors: Record<string, string> = {
      'admin': 'bg-blue-100 text-blue-800',
      'super-admin': 'bg-purple-100 text-purple-800',
      'user': 'bg-green-100 text-green-800',
    };
    
    return roleColors[roleName.toLowerCase()] || 'bg-gray-100 text-gray-800';
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
          
          <div 
            className={`flex items-center ${isExpanded ? 'px-4 justify-start' : 'px-0 justify-center'} py-2 text-sm font-medium text-purple-700 bg-purple-50 border-l-4 border-purple-700`}
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
            )}
          </div>
          
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
          
          <a 
            href="#" 
            className={`flex items-center ${isExpanded ? 'px-4' : 'px-0 justify-center'} py-2 text-sm font-medium text-gray-700`}
            title={!isExpanded ? "Contacts" : ""}
          >
            <div className={isExpanded ? "mr-3 text-gray-400" : "text-gray-400"}>
              <Mail className="w-4 h-4" />
            </div>
            {isExpanded && "Contacts"}
          </a>
          
          <a 
            href="#" 
            className={`flex items-center ${isExpanded ? 'px-4' : 'px-0 justify-center'} py-2 text-sm font-medium text-gray-700`}
            title={!isExpanded ? "Sequences" : ""}
          >
            <div className={isExpanded ? "mr-3 text-gray-400" : "text-gray-400"}>
              <MessageSquare className="w-4 h-4" />
            </div>
            {isExpanded && "Sequences"}
          </a>
          
          <a 
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
          </a>
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

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, Users, MessageSquare, 
  Settings, HelpCircle, ChevronDown, Users as ContactsIcon, // Added ContactsIcon (alias for Users)
  Briefcase, LayoutGrid, Shield, UserPlus, Building, Target, BarChart3, GitBranch, KeyRound, // Added for Jobs and Admin
  Mail, UserCircle, Atom
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { useMyAssignment } from '../hooks/useUserAssignment';
import { usePermissionCheck, SIDEBAR_PERMISSIONS } from '../hooks/usePermissionCheck';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { data: userAssignment } = useMyAssignment();
  const { hasPermission, hasAnyPermission } = usePermissionCheck();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sourcing: false,
    admin: false,
    clientOutreach: false
  });
    // Helper function to check if a route is active
  const isActive = (path: string) => {
    // Special case for dashboard to avoid it being active for all sub-routes
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    // For other routes, check if the pathname is exactly the path or starts with path/
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Handle Jobs navigation based on user role
  const handleJobsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Get user roles
    const userRoles = user?.roles?.map(role => role.name.toLowerCase()) || [];
    
    // Check if user has internal-hr or internal-recruiter role
    const hasInternalRole = userRoles.some(role => 
      role === 'internal-hr' || role === 'internal-recruiter' || role === 'user'
    );
    
    // Check if user has admin role (admin takes precedence)
    const hasAdminRole = userRoles.some(role => 
      role === 'admin' || role === 'super-admin'
    );
    
    if (hasInternalRole && !hasAdminRole && userAssignment) {
      // Navigate directly to their assigned organization
      const organizationId = userAssignment.organizationId || userAssignment.clientId;
      if (organizationId) {
        navigate(`/dashboard/organizations/${organizationId}`);
        return;
      }
    }
    
    // Default behavior - navigate to organizations list
    navigate('/dashboard/organizations');
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
        <nav className="space-y-1">          
          {/* Dashboard/Overview */}
          {hasPermission(SIDEBAR_PERMISSIONS.DASHBOARD_ACCESS) && (
            <Link 
              to="/dashboard" 
              className={`flex items-center ${isExpanded ? 'px-4 justify-start' : 'px-0 justify-center'} py-2 text-sm font-medium ${isActive('/dashboard') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-700 hover:bg-gray-50'}`}
              title={!isExpanded ? "Dashboard" : ""}
            >
              <div className={isExpanded ? "mr-3" : ""} style={{ color: isActive('/dashboard') ? '#7e22ce' : '#9ca3af' }}>
                <LayoutGrid className="w-4 h-4" />
              </div>
              {isExpanded && "Dashboard"}
            </Link>
          )}

		  {/* Talent Sourcing Section */}
          {hasPermission(SIDEBAR_PERMISSIONS.SOURCING_ACCESS) && (
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
                  {hasPermission(SIDEBAR_PERMISSIONS.SOURCING_OVERVIEW) && (
                    <Link to="/dashboard/sourcing/outreach" className={`flex items-center py-1 text-sm ${isActive('/dashboard/sourcing/outreach') && !location.pathname.includes('/dashboard/sourcing/outreach/') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-600 hover:text-gray-900'}`}>
                      <LayoutGrid className="w-3 h-3 mr-2" />
                      Overview
                    </Link>
                  )}
				  
                  {hasPermission(SIDEBAR_PERMISSIONS.SEARCH_CANDIDATES) && (
                    <Link to="/dashboard/sourcing/search" className={`flex items-center py-1 text-sm ${isActive('/dashboard/sourcing/search') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-600 hover:text-gray-900'}`}>
                      <Search className="w-3 h-3 mr-2" />
                      Search
                    </Link>
                  )}
                  
                  {hasPermission(SIDEBAR_PERMISSIONS.OUTREACH_PROSPECTS) && (
                    <Link to="/dashboard/sourcing/outreach/prospects" className={`flex items-center py-1 text-sm ${isActive('/dashboard/sourcing/outreach/prospects') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-600 hover:text-gray-900'}`}>
                      <UserCircle className="w-3 h-3 mr-2" />
                      Prospects
                    </Link>
                  )}
                  
                  {hasPermission(SIDEBAR_PERMISSIONS.OUTREACH_CAMPAIGNS) && (
                    <Link to="/dashboard/sourcing/outreach/campaigns" className={`flex items-center py-1 text-sm ${isActive('/dashboard/sourcing/outreach/campaigns') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-600 hover:text-gray-900'}`}>
                      <Mail className="w-3 h-3 mr-2" />
                      Campaigns
                    </Link>
                  )}
                  
                  {hasPermission(SIDEBAR_PERMISSIONS.OUTREACH_TEMPLATES) && (
                    <Link to="/dashboard/sourcing/outreach/templates" className={`flex items-center py-1 text-sm ${isActive('/dashboard/sourcing/outreach/templates') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-600 hover:text-gray-900'}`}>
                      <MessageSquare className="w-3 h-3 mr-2" />
                      Templates
                    </Link>
                  )}
                  
                  {hasPermission(SIDEBAR_PERMISSIONS.OUTREACH_ANALYTICS) && (
                    <Link to="/dashboard/sourcing/outreach/analytics" className={`flex items-center py-1 text-sm ${isActive('/dashboard/sourcing/outreach/analytics') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-600 hover:text-gray-900'}`}>
                      <BarChart3 className="w-3 h-3 mr-2" />
                      Analytics
                    </Link>
                  )}
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
                      {hasPermission(SIDEBAR_PERMISSIONS.SOURCING_OVERVIEW) && (
                        <Link to="/dashboard/sourcing/outreach" className={`flex items-center px-3 py-2 text-sm rounded-md ${isActive('/dashboard/sourcing/outreach') && !location.pathname.includes('/dashboard/sourcing/outreach/') ? 'text-purple-700 bg-purple-50' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'}`}>
                          <LayoutGrid className="w-4 h-4 mr-3" style={{ color: isActive('/dashboard/sourcing/outreach') && !location.pathname.includes('/dashboard/sourcing/outreach/') ? '#7e22ce' : '' }} />
                          Overview
                        </Link>
                      )}
                      
                      {hasPermission(SIDEBAR_PERMISSIONS.SEARCH_CANDIDATES) && (
                        <Link to="/dashboard/sourcing/search" className={`flex items-center px-3 py-2 text-sm rounded-md ${isActive('/dashboard/sourcing/search') ? 'text-purple-700 bg-purple-50' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'}`}>
                          <Search className="w-4 h-4 mr-3" style={{ color: isActive('/dashboard/sourcing/search') ? '#7e22ce' : '' }} />
                          Search
                        </Link>
                      )}
                      
                      {hasPermission(SIDEBAR_PERMISSIONS.OUTREACH_PROSPECTS) && (
                        <Link to="/dashboard/sourcing/outreach/prospects" className={`flex items-center px-3 py-2 text-sm rounded-md ${isActive('/dashboard/sourcing/outreach/prospects') ? 'text-purple-700 bg-purple-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                          <UserCircle className="w-4 h-4 mr-3" style={{ color: isActive('/dashboard/sourcing/outreach/prospects') ? '#7e22ce' : '' }} />
                          Prospects
                        </Link>
                      )}
                      
                      {hasPermission(SIDEBAR_PERMISSIONS.OUTREACH_CAMPAIGNS) && (
                        <Link to="/dashboard/sourcing/outreach/campaigns" className={`flex items-center px-3 py-2 text-sm rounded-md ${isActive('/dashboard/sourcing/outreach/campaigns') ? 'text-purple-700 bg-purple-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                          <Mail className="w-4 h-4 mr-3" style={{ color: isActive('/dashboard/sourcing/outreach/campaigns') ? '#7e22ce' : '' }} />
                          Campaigns
                        </Link>
                      )}
                      
                      {hasPermission(SIDEBAR_PERMISSIONS.OUTREACH_TEMPLATES) && (
                        <Link to="/dashboard/sourcing/outreach/templates" className={`flex items-center px-3 py-2 text-sm rounded-md ${isActive('/dashboard/sourcing/outreach/templates') ? 'text-purple-700 bg-purple-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                          <MessageSquare className="w-4 h-4 mr-3" style={{ color: isActive('/dashboard/sourcing/outreach/templates') ? '#7e22ce' : '' }} />
                          Templates
                        </Link>
                      )}
                      
                      {hasPermission(SIDEBAR_PERMISSIONS.OUTREACH_ANALYTICS) && (
                        <Link to="/dashboard/sourcing/outreach/analytics" className={`flex items-center px-3 py-2 text-sm rounded-md ${isActive('/dashboard/sourcing/outreach/analytics') ? 'text-purple-700 bg-purple-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                          <BarChart3 className="w-4 h-4 mr-3" style={{ color: isActive('/dashboard/sourcing/outreach/analytics') ? '#7e22ce' : '' }} />
                          Analytics
                        </Link>
                      )}
                    </nav>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Jobs Section */}
          {hasAnyPermission([SIDEBAR_PERMISSIONS.JOBS_ACCESS, SIDEBAR_PERMISSIONS.ORGANIZATIONS_ACCESS]) && (
            <button
              onClick={handleJobsClick}
              className={`flex items-center w-full ${isExpanded ? 'px-4 justify-start' : 'px-0 justify-center'} py-2 text-sm font-medium ${isActive('/dashboard/jobs') || location.pathname.includes('/dashboard/organizations') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-700 hover:bg-gray-50'}`}
              title={!isExpanded ? "Jobs" : ""}
            >
              <div className={isExpanded ? "mr-3" : ""} style={{ color: isActive('/dashboard/jobs') || location.pathname.includes('/dashboard/organizations') ? '#7e22ce' : '#9ca3af' }}>
                <Briefcase className="w-4 h-4" />
              </div>
              {isExpanded && "Jobs"}
            </button>
          )}

          {/* My Jobs Section */}
          {hasPermission(SIDEBAR_PERMISSIONS.MY_JOBS_ACCESS) && (
            <Link 
              to="/dashboard/my-jobs" 
              className={`flex items-center ${isExpanded ? 'px-4 justify-start' : 'px-0 justify-center'} py-2 text-sm font-medium ${isActive('/dashboard/my-jobs') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-700 hover:bg-gray-50'}`}
              title={!isExpanded ? "My Jobs" : ""}
            >
              <div className={isExpanded ? "mr-3" : ""} style={{ color: isActive('/dashboard/my-jobs') ? '#7e22ce' : '#9ca3af' }}>
                <Atom className="w-4 h-4" />
              </div>
              {isExpanded && "My Jobs"}
            </Link>
          )}
          
          {/* Candidates Section */}
          {hasPermission(SIDEBAR_PERMISSIONS.CANDIDATES_ACCESS) && (
            <Link 
              to="/dashboard/candidates" 
              className={`flex items-center ${isExpanded ? 'px-4 justify-start' : 'px-0 justify-center'} py-2 text-sm font-medium ${isActive('/dashboard/candidates') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-700 hover:bg-gray-50'}`}
              title={!isExpanded ? "Candidates" : ""}
            >
              <div className={isExpanded ? "mr-3" : ""} style={{ color: isActive('/dashboard/candidates') ? '#7e22ce' : '#9ca3af' }}>
                <UserPlus className="w-4 h-4" />
              </div>
              {isExpanded && "Candidates"}
            </Link>
          )}
          
          {/* Clients Section */}
          {hasPermission(SIDEBAR_PERMISSIONS.CLIENTS_ACCESS) && (
            <Link 
              to="/dashboard/clients" 
              className={`flex items-center ${isExpanded ? 'px-4 justify-start' : 'px-0 justify-center'} py-2 text-sm font-medium ${isActive('/dashboard/clients') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-700 hover:bg-gray-50'}`}
              title={!isExpanded ? "Clients" : ""}
            >
              <div className={isExpanded ? "mr-3" : ""} style={{ color: isActive('/dashboard/clients') ? '#7e22ce' : '#9ca3af' }}>
                <Building className="w-4 h-4" />
              </div>            
			  {isExpanded && "Clients"}
            </Link>
          )}         
		   {/* Client Outreach Section */}
          {hasPermission(SIDEBAR_PERMISSIONS.CLIENT_OUTREACH_ACCESS) && (
            <div className="relative group">
              <button 
                onClick={() => isExpanded && toggleSection('clientOutreach')}
                className={`flex items-center w-full ${isExpanded ? 'px-4 justify-between' : 'px-0 justify-center'} py-2 text-sm font-medium ${location.pathname.includes('/dashboard/client-outreach') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-700 hover:bg-gray-50'}`}
                title={!isExpanded ? "Client Outreach" : ""}
              >
                <div className="flex items-center">
                  <div className={isExpanded ? "mr-3" : ""} style={{ color: location.pathname.includes('/dashboard/client-outreach') ? '#7e22ce' : '#9ca3af' }}>
                    <Mail className="w-4 h-4" />
                  </div>
                  {isExpanded && "Client Outreach"}
                </div>
                {isExpanded && <ChevronDown className={`w-4 h-4 transform transition-transform ${openSections['clientOutreach'] ? 'rotate-180' : ''}`} />}
              </button>
              
              {/* Expanded menu */}
              {openSections['clientOutreach'] && isExpanded && (
                <nav className="pl-8 space-y-1 py-1">
                  {hasPermission(SIDEBAR_PERMISSIONS.CLIENT_OUTREACH_OVERVIEW) && (
                    <Link to="/dashboard/client-outreach" className={`flex items-center py-1 text-sm ${isActive('/dashboard/client-outreach') && !location.pathname.includes('/dashboard/client-outreach/') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-600 hover:text-gray-900'}`}>
                      <LayoutGrid className="w-3 h-3 mr-2" />
                      Overview
                    </Link>
                  )}
                  
                  {hasPermission(SIDEBAR_PERMISSIONS.CLIENT_OUTREACH_PROSPECTS) && (
                    <Link to="/dashboard/client-outreach/prospects" className={`flex items-center py-1 text-sm ${isActive('/dashboard/client-outreach/prospects') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-600 hover:text-gray-900'}`}>
                      <Building className="w-3 h-3 mr-2" />
                      Prospects
                    </Link>
                  )}
                  
                  {hasPermission(SIDEBAR_PERMISSIONS.CLIENT_OUTREACH_SEARCH) && (
                    <Link to="/dashboard/client-outreach/search" className={`flex items-center py-1 text-sm ${isActive('/dashboard/client-outreach/search') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-600 hover:text-gray-900'}`}>
                      <Search className="w-3 h-3 mr-2" />
                      Search
                    </Link>
                  )}
                  
                  {hasPermission(SIDEBAR_PERMISSIONS.CLIENT_OUTREACH_CAMPAIGNS) && (
                    <Link to="/dashboard/client-outreach/campaigns" className={`flex items-center py-1 text-sm ${isActive('/dashboard/client-outreach/campaigns') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-600 hover:text-gray-900'}`}>
                      <Mail className="w-3 h-3 mr-2" />
                      Campaigns
                    </Link>
                  )}
                  
                  {hasPermission(SIDEBAR_PERMISSIONS.CLIENT_OUTREACH_TEMPLATES) && (
                    <Link to="/dashboard/client-outreach/templates" className={`flex items-center py-1 text-sm ${isActive('/dashboard/client-outreach/templates') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-600 hover:text-gray-900'}`}>
                      <MessageSquare className="w-3 h-3 mr-2" />
                      Templates
                    </Link>
                  )}
                  
                  {hasPermission(SIDEBAR_PERMISSIONS.CLIENT_OUTREACH_ANALYTICS) && (
                    <Link to="/dashboard/client-outreach/analytics" className={`flex items-center py-1 text-sm ${isActive('/dashboard/client-outreach/analytics') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-600 hover:text-gray-900'}`}>
                      <BarChart3 className="w-3 h-3 mr-2" />
                      Analytics
                    </Link>
                  )}
                </nav>
              )}
              
              {/* Collapsed hover menu */}
              {!isExpanded && (
                <div className="absolute left-full top-0 ml-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 mb-2">
                      Client Outreach
                    </div>                  
				    <nav className="space-y-1">
                      {hasPermission(SIDEBAR_PERMISSIONS.CLIENT_OUTREACH_OVERVIEW) && (
                        <Link to="/dashboard/client-outreach" className={`flex items-center px-3 py-2 text-sm rounded-md ${isActive('/dashboard/client-outreach') && !location.pathname.includes('/dashboard/client-outreach/') ? 'text-purple-700 bg-purple-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                          <LayoutGrid className="w-4 h-4 mr-3" style={{ color: isActive('/dashboard/client-outreach') && !location.pathname.includes('/dashboard/client-outreach/') ? '#7e22ce' : '' }} />
                          Overview
                        </Link>
                      )}
                      
                      {hasPermission(SIDEBAR_PERMISSIONS.CLIENT_OUTREACH_PROSPECTS) && (
                        <Link to="/dashboard/client-outreach/prospects" className={`flex items-center px-3 py-2 text-sm rounded-md ${isActive('/dashboard/client-outreach/prospects') ? 'text-purple-700 bg-purple-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                          <Building className="w-4 h-4 mr-3" style={{ color: isActive('/dashboard/client-outreach/prospects') ? '#7e22ce' : '' }} />
                          Prospects
                        </Link>
                      )}
                      
                      {hasPermission(SIDEBAR_PERMISSIONS.CLIENT_OUTREACH_SEARCH) && (
                        <Link to="/dashboard/client-outreach/search" className={`flex items-center px-3 py-2 text-sm rounded-md ${isActive('/dashboard/client-outreach/search') ? 'text-purple-700 bg-purple-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                          <Search className="w-4 h-4 mr-3" style={{ color: isActive('/dashboard/client-outreach/search') ? '#7e22ce' : '' }} />
                          Search
                        </Link>
                      )}
                      
                      {hasPermission(SIDEBAR_PERMISSIONS.CLIENT_OUTREACH_CAMPAIGNS) && (
                        <Link to="/dashboard/client-outreach/campaigns" className={`flex items-center px-3 py-2 text-sm rounded-md ${isActive('/dashboard/client-outreach/campaigns') ? 'text-purple-700 bg-purple-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                          <Mail className="w-4 h-4 mr-3" style={{ color: isActive('/dashboard/client-outreach/campaigns') ? '#7e22ce' : '' }} />
                          Campaigns
                        </Link>
                      )}
                      
                      {hasPermission(SIDEBAR_PERMISSIONS.CLIENT_OUTREACH_TEMPLATES) && (
                        <Link to="/dashboard/client-outreach/templates" className={`flex items-center px-3 py-2 text-sm rounded-md ${isActive('/dashboard/client-outreach/templates') ? 'text-purple-700 bg-purple-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                          <MessageSquare className="w-4 h-4 mr-3" style={{ color: isActive('/dashboard/client-outreach/templates') ? '#7e22ce' : '' }} />
                          Templates
                        </Link>
                      )}
                      
                      {hasPermission(SIDEBAR_PERMISSIONS.CLIENT_OUTREACH_ANALYTICS) && (
                        <Link to="/dashboard/client-outreach/analytics" className={`flex items-center px-3 py-2 text-sm rounded-md ${isActive('/dashboard/client-outreach/analytics') ? 'text-purple-700 bg-purple-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                          <BarChart3 className="w-4 h-4 mr-3" style={{ color: isActive('/dashboard/client-outreach/analytics') ? '#7e22ce' : '' }} />
                          Analytics
                        </Link>
                      )}
                    </nav>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contacts Section */}
          {hasPermission(SIDEBAR_PERMISSIONS.CONTACTS_ACCESS) && (
            <Link 
              to="/dashboard/contacts" 
              className={`flex items-center ${isExpanded ? 'px-4 justify-start' : 'px-0 justify-center'} py-2 text-sm font-medium ${isActive('/dashboard/contacts') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-700 hover:bg-gray-50'}`}
              title={!isExpanded ? "Contacts" : ""}
            >
              <div className={isExpanded ? "mr-3" : ""} style={{ color: isActive('/dashboard/contacts') ? '#7e22ce' : '#9ca3af' }}>
                <ContactsIcon className="w-4 h-4" />
              </div>
              {isExpanded && "Contacts"}
            </Link>
          )}

          {/* Admin Section */}
          {hasPermission(SIDEBAR_PERMISSIONS.ADMIN_ACCESS) && (
            <div className="relative group">           
			   <button 
                onClick={() => isExpanded && toggleSection('admin')}
                className={`flex items-center w-full ${isExpanded ? 'px-4 justify-between' : 'px-0 justify-center'} py-2 text-sm font-medium ${location.pathname.includes('/dashboard/admin') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-700 hover:bg-gray-50'}`}
                title={!isExpanded ? "Admin" : ""}
              >
                <div className="flex items-center">
                  <div className={isExpanded ? "mr-3" : ""} style={{ color: location.pathname.includes('/dashboard/admin') ? '#7e22ce' : '#9ca3af' }}>
                    <Shield className="w-4 h-4" />
                  </div>
                  {isExpanded && "Admin"}
                </div>
                {isExpanded && <ChevronDown className={`w-4 h-4 transform transition-transform ${openSections['admin'] ? 'rotate-180' : ''}`} />}
              </button>
              
              {/* Expanded menu */}
              {openSections['admin'] && isExpanded && (            
				  <nav className="pl-8 space-y-1 py-1">
                  {hasPermission(SIDEBAR_PERMISSIONS.ADMIN_OVERVIEW) && (
                    <Link to="/dashboard/admin" className={`flex items-center py-1 text-sm ${isActive('/dashboard/admin') && !location.pathname.includes('/dashboard/admin/') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-600 hover:text-gray-900'}`}>
                      <LayoutGrid className="w-3 h-3 mr-2" />
                      Overview
                    </Link>
                  )}
                  
                  <div className="border-t border-gray-100 my-1 pt-1">
                    <div className="text-xs text-gray-500 mb-1 font-medium">Management</div>
                    
                    {hasPermission(SIDEBAR_PERMISSIONS.ADMIN_USERS) && (
                      <Link to="/dashboard/admin/users" className={`flex items-center py-1 text-sm ${isActive('/dashboard/admin/users') && !isActive('/dashboard/admin/team-management') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-600 hover:text-gray-900'}`}>
                        <Users className="w-3 h-3 mr-2" />
                        Users
                      </Link>
                    )}
                    
                    {hasPermission(SIDEBAR_PERMISSIONS.ADMIN_ROLES) && (
                      <Link to="/dashboard/admin/roles" className={`flex items-center py-1 text-sm ${isActive('/dashboard/admin/roles') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-600 hover:text-gray-900'}`}>
                        <KeyRound className="w-3 h-3 mr-2" />
                        Roles & Permissions
                      </Link>
                    )}
                    
                    {hasPermission(SIDEBAR_PERMISSIONS.ADMIN_EMAIL_MANAGEMENT) && (
                      <Link to="/dashboard/admin/email-management" className={`flex items-center py-1 text-sm ${isActive('/dashboard/admin/email-management') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-600 hover:text-gray-900'}`}>
                        <Mail className="w-3 h-3 mr-2" />
                        Email Management
                      </Link>
                    )}
                    
                    {hasPermission(SIDEBAR_PERMISSIONS.ADMIN_TEAM_MANAGEMENT) && (
                      <Link to="/dashboard/admin/team-management" className={`flex items-center py-1 text-sm ${isActive('/dashboard/admin/team-management') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-600 hover:text-gray-900'}`}>
                        <Shield className="w-3 h-3 mr-2" />
                        Team Management
                      </Link>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-100 my-1 pt-1">
                    <div className="text-xs text-gray-500 mb-1 font-medium">System</div>
                    
                    {hasPermission(SIDEBAR_PERMISSIONS.ADMIN_PIPELINES) && (
                      <Link to="/dashboard/admin/pipelines" className={`flex items-center py-1 text-sm ${isActive('/dashboard/admin/pipelines') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-600 hover:text-gray-900'}`}>
                        <GitBranch className="w-3 h-3 mr-2" />
                        Pipelines
                      </Link>
                    )}
                    
                    {hasPermission(SIDEBAR_PERMISSIONS.ADMIN_HIRING_TEAMS) && (
                      <Link to="/dashboard/admin/hiring-teams" className={`flex items-center py-1 text-sm ${isActive('/dashboard/admin/hiring-teams') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-600 hover:text-gray-900'}`}>
                        <Users className="w-3 h-3 mr-2" />
                        Hiring Teams
                      </Link>
                    )}
                    
                    <Link to="/dashboard/admin/recruitment-teams" className={`flex items-center py-1 text-sm ${isActive('/dashboard/admin/recruitment-teams') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-600 hover:text-gray-900'}`}>
                      <Users className="w-3 h-3 mr-2" />
                      Recruitment Teams
                    </Link>
                    
                    {hasPermission(SIDEBAR_PERMISSIONS.ADMIN_JOB_BOARDS) && (
                      <Link to="/dashboard/admin/job-boards" className={`flex items-center py-1 text-sm ${isActive('/dashboard/admin/job-boards') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-600 hover:text-gray-900'}`}>
                        <Target className="w-3 h-3 mr-2" />
                        Job Boards
                      </Link>
                    )}
                    
                    {hasPermission(SIDEBAR_PERMISSIONS.ADMIN_ANALYTICS) && (
                      <Link to="/dashboard/admin/analytics" className={`flex items-center py-1 text-sm ${isActive('/dashboard/admin/analytics') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-600 hover:text-gray-900'}`}>
                        <BarChart3 className="w-3 h-3 mr-2" />
                        Analytics
                      </Link>
                    )}
                    
                    {hasPermission(SIDEBAR_PERMISSIONS.ADMIN_SETTINGS) && (
                      <Link to="/dashboard/admin/settings" className={`flex items-center py-1 text-sm ${isActive('/dashboard/admin/settings') ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-700' : 'text-gray-600 hover:text-gray-900'}`}>
                        <Settings className="w-3 h-3 mr-2" />
                        Settings
                      </Link>
                    )}
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
                    <nav className="space-y-1">
                      {hasPermission(SIDEBAR_PERMISSIONS.ADMIN_OVERVIEW) && (
                        <Link to="/dashboard/admin" className={`flex items-center px-3 py-2 text-sm rounded-md ${isActive('/dashboard/admin') && !location.pathname.includes('/dashboard/admin/') ? 'text-purple-700 bg-purple-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                          <LayoutGrid className="w-4 h-4 mr-3" style={{ color: isActive('/dashboard/admin') && !location.pathname.includes('/dashboard/admin/') ? '#7e22ce' : '' }} />
                          Overview
                        </Link>
                      )}
                      
                      <div className="border-t border-gray-100 my-2 pt-2">
                        <div className="px-3 py-1 text-xs font-medium text-gray-500">Management</div>
                        
                        {hasPermission(SIDEBAR_PERMISSIONS.ADMIN_USERS) && (
                          <Link to="/dashboard/admin/users" className={`flex items-center px-3 py-2 text-sm rounded-md ${isActive('/dashboard/admin/users') && !isActive('/dashboard/admin/user-clients') ? 'text-purple-700 bg-purple-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                            <Users className="w-4 h-4 mr-3" style={{ color: isActive('/dashboard/admin/users') && !isActive('/dashboard/admin/user-clients') ? '#7e22ce' : '' }} />
                            Users
                          </Link>
                        )}
                        
                        {hasPermission(SIDEBAR_PERMISSIONS.ADMIN_ROLES) && (
                          <Link to="/dashboard/admin/roles" className={`flex items-center px-3 py-2 text-sm rounded-md ${isActive('/dashboard/admin/roles') ? 'text-purple-700 bg-purple-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                            <KeyRound className="w-4 h-4 mr-3" style={{ color: isActive('/dashboard/admin/roles') ? '#7e22ce' : '' }} />
                            Roles & Permissions
                          </Link>
                        )}
                        
                        {hasPermission(SIDEBAR_PERMISSIONS.ADMIN_EMAIL_MANAGEMENT) && (
                          <Link to="/dashboard/admin/email-management" className={`flex items-center px-3 py-2 text-sm rounded-md ${isActive('/dashboard/admin/email-management') ? 'text-purple-700 bg-purple-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                            <Mail className="w-4 h-4 mr-3" style={{ color: isActive('/dashboard/admin/email-management') ? '#7e22ce' : '' }} />
                            Email Management
                          </Link>
                        )}
                        
                        {hasPermission(SIDEBAR_PERMISSIONS.ADMIN_TEAM_MANAGEMENT) && (
                          <Link to="/dashboard/admin/team-management" className={`flex items-center px-3 py-2 text-sm rounded-md ${isActive('/dashboard/admin/team-management') ? 'text-purple-700 bg-purple-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                            <Shield className="w-4 h-4 mr-3" style={{ color: isActive('/dashboard/admin/team-management') ? '#7e22ce' : '' }} />
                            Team Management
                          </Link>
                        )}
                      </div>
                      
                      <div className="border-t border-gray-100 my-2 pt-2">
                        <div className="px-3 py-1 text-xs font-medium text-gray-500">System</div>
                        
                        {hasPermission(SIDEBAR_PERMISSIONS.ADMIN_PIPELINES) && (
                          <Link to="/dashboard/admin/pipelines" className={`flex items-center px-3 py-2 text-sm rounded-md ${isActive('/dashboard/admin/pipelines') ? 'text-purple-700 bg-purple-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                            <GitBranch className="w-4 h-4 mr-3" style={{ color: isActive('/dashboard/admin/pipelines') ? '#7e22ce' : '' }} />
                            Pipelines
                          </Link>
                        )}
                        
                        {hasPermission(SIDEBAR_PERMISSIONS.ADMIN_HIRING_TEAMS) && (
                          <Link to="/dashboard/admin/hiring-teams" className={`flex items-center px-3 py-2 text-sm rounded-md ${isActive('/dashboard/admin/hiring-teams') ? 'text-purple-700 bg-purple-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                            <Users className="w-4 h-4 mr-3" style={{ color: isActive('/dashboard/admin/hiring-teams') ? '#7e22ce' : '' }} />
                            Hiring Teams
                          </Link>
                        )}
                        
                        <Link to="/dashboard/admin/recruitment-teams" className={`flex items-center px-3 py-2 text-sm rounded-md ${isActive('/dashboard/admin/recruitment-teams') ? 'text-purple-700 bg-purple-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                          <Users className="w-4 h-4 mr-3" style={{ color: isActive('/dashboard/admin/recruitment-teams') ? '#7e22ce' : '' }} />
                          Recruitment Teams
                        </Link>
                        
                        {hasPermission(SIDEBAR_PERMISSIONS.ADMIN_JOB_BOARDS) && (
                          <Link to="/dashboard/admin/job-boards" className={`flex items-center px-3 py-2 text-sm rounded-md ${isActive('/dashboard/admin/job-boards') ? 'text-purple-700 bg-purple-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                            <Target className="w-4 h-4 mr-3" style={{ color: isActive('/dashboard/admin/job-boards') ? '#7e22ce' : '' }} />
                            Job Boards
                          </Link>
                        )}
                        
                        {hasPermission(SIDEBAR_PERMISSIONS.ADMIN_ANALYTICS) && (
                          <Link to="/dashboard/admin/analytics" className={`flex items-center px-3 py-2 text-sm rounded-md ${isActive('/dashboard/admin/analytics') ? 'text-purple-700 bg-purple-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                            <BarChart3 className="w-4 h-4 mr-3" style={{ color: isActive('/dashboard/admin/analytics') ? '#7e22ce' : '' }} />
                            Analytics
                          </Link>
                        )}
                        
                        {hasPermission(SIDEBAR_PERMISSIONS.ADMIN_SETTINGS) && (
                          <Link to="/dashboard/admin/settings" className={`flex items-center px-3 py-2 text-sm rounded-md ${isActive('/dashboard/admin/settings') ? 'text-purple-700 bg-purple-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                            <Settings className="w-4 h-4 mr-3" style={{ color: isActive('/dashboard/admin/settings') ? '#7e22ce' : '' }} />
                            Settings
                          </Link>
                        )}
                      </div>
                    </nav>
                  </div>
                </div>
              )}
            </div>
          )}
          
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

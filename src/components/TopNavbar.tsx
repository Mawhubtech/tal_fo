import React, { useState } from 'react';
import { LogOut, User, Search, Shield, Info, Settings, ChevronDown, Check, Building2, Bell, Calendar, CheckSquare, HelpCircle, UserPlus, Mail, MailCheck, MailX } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { useLogout } from '../hooks/useAuth';
import { AccountSettingsModal } from './AccountSettingsModal';
import { useMyCompanies, useMemberCompanies, useMyPendingInvitations } from '../hooks/useCompany';
import { isSuperAdmin } from '../utils/roleUtils';
import Button from './Button';
import { useMyPendingEventInvitations } from '../hooks/useCalendarInvitations';
import { useMyPendingJobInvitations } from '../hooks/useJobCollaborators';
import { Link } from 'react-router-dom';
import { useEmailService } from '../hooks/useEmailService';
import { useGmailStatus } from '../contexts/GmailStatusContext';

interface TopNavbarProps {
  onNewSearch?: () => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ onNewSearch }) => {
  const { user } = useAuthContext();
  const logout = useLogout();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch user's company data
  const { data: myCompaniesData } = useMyCompanies();
  const { data: memberCompaniesData } = useMemberCompanies();
  const isUserSuperAdmin = isSuperAdmin(user);

  // Get pending invitations for notification count
  const { data: pendingEventInvitationsData } = useMyPendingEventInvitations();
  const { data: pendingCompanyInvitationsData } = useMyPendingInvitations();
  const { data: pendingJobInvitations = [] } = useMyPendingJobInvitations();

  // Get email connection status
  const { emailSettings } = useEmailService(true);
  const { isGmailConnectionExpired } = useGmailStatus();

  // Calculate total pending invitations
  const eventInvitationsCount = pendingEventInvitationsData?.invitations?.length || 0;
  const companyInvitationsCount = pendingCompanyInvitationsData?.invitations?.length || 0;
  const jobInvitationsCount = pendingJobInvitations.length || 0;
  const totalPendingInvitations = eventInvitationsCount + companyInvitationsCount + jobInvitationsCount;

  // Determine primary company (user's main company)
  const myCompanies = myCompaniesData?.companies || [];
  const memberCompanies = memberCompaniesData?.companies || [];
  
  // Get the primary company - prioritize owned companies, then member companies
  const primaryCompany = myCompanies.length > 0 ? myCompanies[0] : 
                        memberCompanies.length > 0 ? memberCompanies[0] : null;
  
  // Get user's role in the primary company
  const getUserCompanyRole = () => {
    if (!primaryCompany) return null;
    
    // If user owns the company
    if (primaryCompany.ownerId === user?.id) {
      return 'Owner';
    }
    
    // If user is a member, find their role
    const membership = primaryCompany.members?.find(member => member.userId === user?.id);
    if (membership) {
      // Format the role name
      return membership.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return null;
  };

  const handleLogout = () => {
    logout.mutate();
  };

  // Helper function to get role badge color
  const getRoleBadgeColor = (roleName: string) => {
    const roleColors: Record<string, string> = {
      'admin': 'bg-blue-100 text-blue-800',
      'super-admin': 'bg-purple-100 text-purple-800',
      'user': 'bg-green-100 text-green-800',
    };
    
    return roleColors[roleName.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  // Helper function to get company logo URL
  const getCompanyLogoUrl = (logoUrl?: string | null) => {
    if (!logoUrl) return null;
    if (logoUrl.startsWith('http')) return logoUrl;
    return `${import.meta.env.VITE_API_URL}${logoUrl}`;
  };
  return (
    <div className="border-b border-gray-200 flex items-center justify-between p-3">
      <div className="flex-1 flex items-center">
        <Link to="/dashboard" className="hover:opacity-80 transition-opacity">
          <span 
            className="text-3xl font-black text-gray-900 hover:text-purple-600 transition-colors duration-200" 
            style={{ fontFamily: 'ROMA, sans-serif' }}
          >
            TAL
          </span>
        </Link>
      </div>
      
      {/* Company Info - Show if user has a company */}
      {primaryCompany && !isUserSuperAdmin && (
        <div className="flex items-center gap-3 mx-4 px-3 py-2 bg-gray-50 rounded-lg border">
          {/* Company Logo */}
          {primaryCompany.logoUrl ? (
            <img 
              src={getCompanyLogoUrl(primaryCompany.logoUrl)} 
              alt={primaryCompany.name}
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
          )}
          
          <div className="text-sm">
            <p className="font-medium text-gray-800 leading-tight">{primaryCompany.name}</p>
            {getUserCompanyRole() && (
              <p className="text-xs text-gray-500">{getUserCompanyRole()}</p>
            )}
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-4">
        {/* Quick Action Icons */}
        <div className="flex items-center gap-2">
          <Link 
            to="/dashboard/calendar"
            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Calendar"
          >
            <Calendar className="w-5 h-5" />
          </Link>
          
          <Link 
            to="/dashboard/tasks"
            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Tasks"
          >
            <CheckSquare className="w-5 h-5" />
          </Link>
          
          <Link 
            to="/dashboard/contact-support?tab=email"
            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Submit Ticket"
          >
            <HelpCircle className="w-5 h-5" />
          </Link>

          {/* Email Connection Status */}
          <Link 
            to="/dashboard/settings/email"
            className={`relative p-2 rounded-lg transition-colors ${
              emailSettings?.isGmailConnected && !isGmailConnectionExpired
                ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                : 'text-red-600 hover:text-red-700 hover:bg-red-50'
            }`}
            title={
              emailSettings?.isGmailConnected && !isGmailConnectionExpired
                ? `Gmail Connected: ${emailSettings.gmailEmail || 'Connected'}`
                : 'Gmail Disconnected - Click to reconnect'
            }
          >
            {emailSettings?.isGmailConnected && !isGmailConnectionExpired ? (
              <MailCheck className="w-5 h-5" />
            ) : (
              <MailX className="w-5 h-5" />
            )}
            {/* Status indicator dot */}
            <span 
              className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-white ${
                emailSettings?.isGmailConnected && !isGmailConnectionExpired
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
            />
          </Link>
        </div>

        {/* Pending Invitations */}
        <Link 
          to="/dashboard/invitations"
          className="relative p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          title="Pending Invitations"
        >
          <UserPlus className="w-5 h-5" />
          {totalPendingInvitations > 0 && (
            <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
              {totalPendingInvitations > 9 ? '9+' : totalPendingInvitations}
            </span>
          )}
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button 
            className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>
          
          {/* Notifications dropdown */}
          {showNotifications && (
            <>
              {/* Backdrop to close dropdown */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-200 shadow-lg z-20 rounded-md">
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Notifications</h3>
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No new notifications</p>
                    <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User profile dropdown */}
        <div className="relative">
          <button 
            className="flex items-center gap-2 text-sm p-1 rounded-md hover:bg-gray-50"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
          >
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={`${user.firstName} ${user.lastName}`}
                className="w-8 h-8 rounded-full object-cover border border-gray-200" 
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
            
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          
          {/* User dropdown menu */}
          {showUserDropdown && (
            <>
              {/* Backdrop to close dropdown */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowUserDropdown(false)}
              />
              <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 shadow-md z-20 rounded-md">
                <div className="p-3 text-sm">
                  <div className="flex items-center gap-3 mb-2 pb-2 border-b border-gray-100">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-12 h-12 rounded-full object-cover" 
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      {user?.provider && user.provider !== 'local' && (
                        <p className="text-xs text-blue-500 mt-0.5">
                          Via {user.provider.charAt(0).toUpperCase() + user.provider.slice(1)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* User roles and status info */}
                  <div className="mb-2 px-1">
                    <div className="bg-gray-50 rounded-md p-2 mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">Status</span>
                        <span className="text-xs font-medium text-green-600">{user?.status}</span>
                      </div>
                      
                      {/* Company Information */}
                      {primaryCompany && (
                        <div className="mb-2 pb-2 border-b border-gray-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">Company</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {primaryCompany.logoUrl ? (
                              <img 
                                src={getCompanyLogoUrl(primaryCompany.logoUrl)} 
                                alt={primaryCompany.name}
                                className="w-5 h-5 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
                                <Building2 className="w-3 h-3 text-blue-600" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-xs font-medium text-gray-800">{primaryCompany.name}</p>
                              {getUserCompanyRole() && (
                                <p className="text-xs text-gray-500">{getUserCompanyRole()}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {user?.roles && user.roles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.roles.map(role => (
                            <span 
                              key={role.id} 
                              className={`text-xs rounded-full px-2 py-0.5 ${getRoleBadgeColor(role.name)}`}
                            >
                              {role.name}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {user?.isEmailVerified && (
                        <div className="flex items-center mt-1 text-xs text-green-700">
                          <Check className="w-3 h-3 mr-1" />
                          Email verified
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-0.5">
                    <button 
                      onClick={() => {
                        setShowAccountSettings(true);
                        setShowUserDropdown(false);
                      }}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Account Settings
                    </button>
                    
                    <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                      <Shield className="w-4 h-4 mr-3" />
                      Privacy Settings
                    </a>
                    
                    <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                      <Info className="w-4 h-4 mr-3" />
                      Help & Support
                    </a>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 p-1">
                  <button 
                    className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
                    onClick={handleLogout}
                    disabled={logout.isPending}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    {logout.isPending ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Account Settings Modal */}
      <AccountSettingsModal 
        isOpen={showAccountSettings}
        onClose={() => setShowAccountSettings(false)}
      />
    </div>
  );
};

export default TopNavbar;

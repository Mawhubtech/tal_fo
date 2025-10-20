import React, { useState } from 'react';
import { LogOut, User, Search, Shield, Info, Settings, ChevronDown, Check, Building2, Bell, Calendar, CheckSquare, HelpCircle, UserPlus, Mail, MailCheck, MailX, X, Briefcase, Users, UserCheck, UserX, Menu, MoreVertical } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { useLogout } from '../hooks/useAuth';
import { AccountSettingsModal } from './AccountSettingsModal';
import { useMyCompanies, useMemberCompanies, useMyPendingInvitations } from '../hooks/useCompany';
import { isSuperAdmin } from '../utils/roleUtils';
import Button from './Button';
import { useMyPendingEventInvitations } from '../hooks/useCalendarInvitations';
import { useMyPendingJobInvitations } from '../hooks/useJobCollaborators';
import { Link, useNavigate } from 'react-router-dom';
import { useEmailService } from '../hooks/useEmailService';
import { useGmailStatus } from '../contexts/GmailStatusContext';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationType } from '../types/notification.types';

// Helper function to format relative time
const formatTimeAgo = (date: Date | string): string => {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
};

// Helper function to get icon for notification type
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.JOB_CREATED:
    case NotificationType.JOB_UPDATED:
    case NotificationType.JOB_DELETED:
    case NotificationType.JOB_STATUS_CHANGED:
      return Briefcase;
    case NotificationType.TEAM_INVITATION_RECEIVED:
      return UserPlus;
    case NotificationType.TEAM_INVITATION_ACCEPTED:
      return UserCheck;
    case NotificationType.TEAM_INVITATION_REJECTED:
      return UserX;
    case NotificationType.TEAM_MEMBER_ADDED:
    case NotificationType.TEAM_MEMBER_REMOVED:
      return Users;
    case NotificationType.EMAIL_RECEIVED:
    case NotificationType.MESSAGE_RECEIVED:
      return Mail;
    case NotificationType.SYSTEM_ANNOUNCEMENT:
      return Info;
    default:
      return Bell;
  }
};

// Helper function to get color for notification type
const getNotificationColor = (type: NotificationType): string => {
  switch (type) {
    case NotificationType.JOB_CREATED:
    case NotificationType.JOB_UPDATED:
      return 'bg-green-100 text-green-600';
    case NotificationType.JOB_DELETED:
      return 'bg-red-100 text-red-600';
    case NotificationType.JOB_STATUS_CHANGED:
      return 'bg-blue-100 text-blue-600';
    case NotificationType.TEAM_INVITATION_RECEIVED:
      return 'bg-purple-100 text-purple-600';
    case NotificationType.TEAM_INVITATION_ACCEPTED:
      return 'bg-green-100 text-green-600';
    case NotificationType.TEAM_INVITATION_REJECTED:
      return 'bg-orange-100 text-orange-600';
    case NotificationType.TEAM_MEMBER_ADDED:
      return 'bg-blue-100 text-blue-600';
    case NotificationType.TEAM_MEMBER_REMOVED:
      return 'bg-gray-100 text-gray-600';
    case NotificationType.EMAIL_RECEIVED:
    case NotificationType.MESSAGE_RECEIVED:
      return 'bg-indigo-100 text-indigo-600';
    case NotificationType.SYSTEM_ANNOUNCEMENT:
      return 'bg-yellow-100 text-yellow-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

interface TopNavbarProps {
  onNewSearch?: () => void;
  onMenuToggle?: () => void;
  showMobileMenu?: boolean;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ onNewSearch, onMenuToggle, showMobileMenu = false }) => {
  const { user } = useAuthContext();
  const logout = useLogout();
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Notification system
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();

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
      <div className="flex-1 flex items-center gap-3">
        {/* Mobile Menu Toggle - Show only on mobile */}
        {showMobileMenu && onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        
        <Link to="/dashboard" className="hover:opacity-80 transition-opacity">
          <span 
            className="text-3xl font-black text-gray-900 hover:text-purple-600 transition-colors duration-200" 
            style={{ fontFamily: 'ROMA, sans-serif' }}
          >
            TAL
          </span>
        </Link>
      </div>
      
      {/* Company Info - Show if user has a company - Hidden on mobile */}
      {primaryCompany && !isUserSuperAdmin && (
        <div className="hidden lg:flex items-center gap-3 mx-4 px-3 py-2 bg-gray-50 rounded-lg border">
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
      
      <div className="flex items-center gap-2 md:gap-4">
        {/* Quick Action Icons - Desktop: Show all, Mobile: Show priority only */}
        <div className="hidden md:flex items-center gap-2">
          <Link 
            to="/calendar"
            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Calendar"
          >
            <Calendar className="w-5 h-5" />
          </Link>
          
          <Link 
            to="/tasks"
            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Tasks"
          >
            <CheckSquare className="w-5 h-5" />
          </Link>
          
          <Link 
            to="/contact-support?tab=email"
            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Submit Ticket"
          >
            <HelpCircle className="w-5 h-5" />
          </Link>

          {/* Email Connection Status */}
          <Link 
            to="/settings/email"
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

        {/* Pending Invitations - Desktop only */}
        <Link 
          to="/invitations"
          className="hidden md:flex relative p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          title="Pending Invitations"
        >
          <UserPlus className="w-5 h-5" />
          {totalPendingInvitations > 0 && (
            <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
              {totalPendingInvitations > 9 ? '9+' : totalPendingInvitations}
            </span>
          )}
        </Link>

        {/* Mobile "More" Menu - Shows on smaller screens */}
        <div className="md:hidden relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="relative p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="More actions"
          >
            <MoreVertical className="w-5 h-5" />
            {/* Badge for pending invitations on mobile */}
            {totalPendingInvitations > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold">
                {totalPendingInvitations > 9 ? '9+' : totalPendingInvitations}
              </span>
            )}
          </button>

          {/* More Menu Dropdown - Fixed positioning to prevent cutoff */}
          {showMoreMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMoreMenu(false)}
              />
              <div className="fixed right-2 top-16 w-64 bg-white border border-gray-200 shadow-lg z-20 rounded-md py-1 max-h-[calc(100vh-5rem)] overflow-y-auto">
                {/* Pending Invitations */}
                <Link
                  to="/invitations"
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                  onClick={() => setShowMoreMenu(false)}
                >
                  <div className="flex items-center gap-3">
                    <UserPlus className="w-4 h-4" />
                    <span>Pending Invitations</span>
                  </div>
                  {totalPendingInvitations > 0 && (
                    <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-0.5 font-semibold">
                      {totalPendingInvitations > 9 ? '9+' : totalPendingInvitations}
                    </span>
                  )}
                </Link>
                
                <Link
                  to="/calendar"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowMoreMenu(false)}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Calendar</span>
                </Link>
                
                <Link
                  to="/tasks"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowMoreMenu(false)}
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Tasks</span>
                </Link>
                
                <Link
                  to="/settings/email"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowMoreMenu(false)}
                >
                  {emailSettings?.isGmailConnected && !isGmailConnectionExpired ? (
                    <>
                      <MailCheck className="w-4 h-4 text-green-600" />
                      <span>Email Connected</span>
                    </>
                  ) : (
                    <>
                      <MailX className="w-4 h-4 text-red-600" />
                      <span>Email Disconnected</span>
                    </>
                  )}
                </Link>
                
                <Link
                  to="/contact-support?tab=email"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowMoreMenu(false)}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Submit Ticket</span>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Notifications - Always visible */}
        <div className="relative">
          <button 
            className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {/* Notifications dropdown */}
          {showNotifications && (
            <>
              {/* Backdrop to close dropdown */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute top-full right-0 mt-1 w-96 bg-white border border-gray-200 shadow-lg z-20 rounded-md max-h-[500px] flex flex-col">
                {/* Header */}
                <div className="p-3 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Notifications {unreadCount > 0 && `(${unreadCount})`}
                  </h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAllAsRead();
                      }}
                      className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notifications list */}
                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No notifications</p>
                      <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notification) => {
                        const Icon = getNotificationIcon(notification.type);
                        const handleClick = () => {
                          if (!notification.read) {
                            markAsRead(notification.id);
                          }
                          
                          // Navigate to actionUrl if present
                          if (notification.actionUrl) {
                            setShowNotifications(false); // Close notifications dropdown
                            navigate(notification.actionUrl);
                          }
                        };

                        return (
                          <div
                            key={notification.id}
                            className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                              !notification.read ? 'bg-purple-50' : ''
                            }`}
                            onClick={handleClick}
                          >
                            <div className="flex gap-3">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                getNotificationColor(notification.type)
                              }`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-sm ${
                                    !notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                                  }`}>
                                    {notification.title}
                                  </p>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      clearNotification(notification.id);
                                    }}
                                    className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-400">
                                    {formatTimeAgo(notification.timestamp)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
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

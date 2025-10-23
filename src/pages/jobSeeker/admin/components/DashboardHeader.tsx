import React from 'react';
import { LogOut, User, Settings, Bell, CheckCircle } from 'lucide-react';
import { useLogout } from '../../../../hooks/useAuth';
import { useAuthContext } from '../../../../contexts/AuthContext';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  showProfileCompletion?: boolean;
  profileCompletionPercentage?: number;
  showNotifications?: boolean;
  notificationCount?: number;
  variant?: 'onboarding' | 'dashboard' | 'minimal';
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title = "TAL Dashboard",
  subtitle,
  showProfileCompletion = false,
  profileCompletionPercentage = 0,
  showNotifications = true,
  notificationCount = 0,
  variant = 'dashboard'
}) => {
  const logout = useLogout();
  const { user } = useAuthContext();

  const handleLogout = () => {
    logout.mutate();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const defaultSubtitle = variant === 'onboarding' 
    ? `Let's set up your profile, ${user?.firstName || 'there'}!`
    : `${getGreeting()}, ${user?.firstName || 'there'}!`;

  const renderOnboardingVariant = () => (
    <div className="mb-8">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600 mt-1">{subtitle || defaultSubtitle}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={logout.isPending}
            className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">
              {logout.isPending ? 'Logging out...' : 'Logout'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderDashboardVariant = () => (
    <div className="mb-8">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-600">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              <p className="text-lg text-gray-600 mt-1">{subtitle || defaultSubtitle}</p>
              {showProfileCompletion && (
                <div className="mt-3 flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 w-64">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        profileCompletionPercentage === 100 
                          ? 'bg-green-500' 
                          : 'bg-purple-600'
                      }`}
                      style={{ width: `${profileCompletionPercentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
                    {profileCompletionPercentage === 100 ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Profile Complete
                      </span>
                    ) : (
                      `${profileCompletionPercentage}% complete`
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {showNotifications && (
              <button className="relative p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="h-6 w-6" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
            )}
            <button className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="h-6 w-6" />
            </button>
            <button
              onClick={handleLogout}
              disabled={logout.isPending}
              className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">
                {logout.isPending ? 'Logging out...' : 'Logout'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMinimalVariant = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between py-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-lg text-gray-600 mt-2">{subtitle}</p>}
        </div>
        <button
          onClick={handleLogout}
          disabled={logout.isPending}
          className="flex items-center space-x-2 px-5 py-3 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">
            {logout.isPending ? 'Logging out...' : 'Logout'}
          </span>
        </button>
      </div>
    </div>
  );

  switch (variant) {
    case 'onboarding':
      return renderOnboardingVariant();
    case 'dashboard':
      return renderDashboardVariant();
    case 'minimal':
      return renderMinimalVariant();
    default:
      return renderDashboardVariant();
  }
};

export default DashboardHeader;

import React, { useState } from 'react';
import { LogOut, User, Search, Shield, Info, Settings, ChevronDown, Check } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { useLogout } from '../hooks/useAuth';
import Button from './Button';

interface TopNavbarProps {
  onNewSearch?: () => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ onNewSearch }) => {
  const { user } = useAuthContext();
  const logout = useLogout();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

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

  return (
    <div className="border-b border-gray-200 flex items-center justify-between p-3">
      <div className="flex-1"></div>
      
      <div className="flex items-center gap-4">
        <Button
          variant="primary"
          size="sm"
          className="bg-purple-700 hover:bg-purple-800 flex items-center gap-1 rounded-md text-sm"
          onClick={onNewSearch}
        >
          <Search className="w-4 h-4" />
          New Search
        </Button>
        
        {/* User profile dropdown */}
        <div className="relative">
          <button 
            className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-md hover:bg-gray-50"
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
            
            <div className="hidden sm:block text-left">
              <p className="font-medium text-gray-800 leading-tight">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          
          {/* User dropdown menu */}
          {showUserDropdown && (
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
                  <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                    <Settings className="w-4 h-4 mr-3" />
                    Account Settings
                  </a>
                  
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
          )}
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;

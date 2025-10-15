import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import { useAuthContext } from '../contexts/AuthContext';
import { isExternalUser } from '../utils/userUtils';

/**
 * MainLayout Component
 * 
 * Provides the main layout structure for authenticated pages.
 * Includes Sidebar and TopNavbar for internal users.
 * For external users, shows a simplified header.
 */
const MainLayout: React.FC = () => {
  const { user } = useAuthContext();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const isExternal = isExternalUser(user);
  
  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const handleNewSearch = () => {
    console.log('New search initiated');
    // This might open a modal or navigate to a different search page/view
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar Component - Hidden for external users */}
      {!isExternal && (
        <Sidebar
          isExpanded={isSidebarExpanded}
          onToggle={toggleSidebar}
        />
      )}

      {/* Main content flex container */}
      <div className="flex-1 flex flex-col">
        {/* TopNavbar Component - Use simpler external navigation for external users */}
        {isExternal ? (
          <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <div className="h-5 w-5 text-white">💼</div>
                  </div>
                  <span className="ml-2 text-xl font-semibold text-gray-900">TAL Hiring</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {user?.firstName} {user?.lastName}
                  </span>
                </div>
              </div>
            </div>
          </nav>
        ) : (
          <TopNavbar onNewSearch={handleNewSearch} />
        )}

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import MobileExperienceBanner from '../components/MobileExperienceBanner';
import { useAuthContext } from '../contexts/AuthContext';
import { isExternalUser } from '../utils/userUtils';

/**
 * MainLayout Component
 * 
 * Provides the main layout structure for authenticated pages.
 * Includes Sidebar and TopNavbar for internal users.
 * For external users, shows a simplified header.
 * On mobile (≤1024px), sidebar is hidden and accessible via burger menu.
 */
const MainLayout: React.FC = () => {
  const { user } = useAuthContext();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Initialize sidebar state based on screen size
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    // On small screens (< 1024px), start collapsed
    return window.innerWidth >= 1024;
  });
  const isExternal = isExternalUser(user);
  
  // Handle window resize to detect mobile/desktop and auto-collapse sidebar
  useEffect(() => {
    const handleResize = () => {
      const isSmallScreen = window.innerWidth < 1024;
      setIsMobile(isSmallScreen);
      
      // Close mobile menu on resize to desktop
      if (!isSmallScreen) {
        setIsMobileMenuOpen(false);
        setIsSidebarExpanded(true);
      } else {
        setIsSidebarExpanded(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsSidebarExpanded(!isSidebarExpanded);
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNewSearch = () => {
    console.log('New search initiated');
    // This might open a modal or navigate to a different search page/view
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Desktop Sidebar - Hidden on mobile and for external users */}
      {!isExternal && !isMobile && (
        <Sidebar
          isExpanded={isSidebarExpanded}
          onToggle={toggleSidebar}
        />
      )}

      {/* Mobile Menu Overlay - Only for internal users on mobile */}
      {!isExternal && isMobile && isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={closeMobileMenu}
          />
          
          {/* Mobile Sidebar - Full width container without borders */}
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl z-50 lg:hidden overflow-y-auto">
            <div className="h-full w-full">
              <Sidebar
                isExpanded={true}
                onToggle={closeMobileMenu}
                isMobile={true}
              />
            </div>
          </div>
        </>
      )}

      {/* Main content flex container */}
      <div className="flex-1 flex flex-col min-w-0">
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
          <TopNavbar 
            onNewSearch={handleNewSearch}
            onMenuToggle={toggleSidebar}
            showMobileMenu={isMobile}
          />
        )}

        {/* Mobile Experience Banner - Shows on screens ≤1000px */}
        <MobileExperienceBanner />

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

import React, { useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext'; // Assuming this provides user and logout logic
import {
  Filter,
  FileText,
  ToggleRight,
  Search,
  Edit, // Added
  Users, // Added
  Mail, // Added
  MessageSquare, // Added (used for Sequences & Contact Support)
  BarChart2, // Added
  Settings, // Added (used for Integrations, Settings, Account Settings)
  HelpCircle, // Added
  User as UserIcon, // Added & aliased to avoid conflict with user variable
  ChevronDown, // Added
  Check, // Added
  Shield, // Added
  Info, // Added
  LogOut, // Added
} from 'lucide-react';
import Button from '../components/Button'; // Assuming this is your custom Button component
import Sidebar from '../components/Sidebar';   // Your Sidebar component
import TopNavbar from '../components/TopNavbar'; // Your TopNavbar component

// Mock functions and objects - replace with your actual implementations
const mockLogout = {
  isPending: false,
  // mutate: () => console.log('Logging out...'), // Example if using react-query
};

const handleLogout = () => {
  console.log('Logout action triggered');
  // Call your actual logout function here, e.g., logout.mutate();
};

const getRoleBadgeColor = (roleName: string) => {
  // Example implementation - customize as needed
  if (roleName === 'Admin') return 'bg-red-100 text-red-700';
  if (roleName === 'Editor') return 'bg-blue-100 text-blue-700';
  return 'bg-gray-100 text-gray-700';
};
// --- End of Mock Data ---

const Dashboard: React.FC = () => {
  const { user } = useAuthContext(); // Assuming user might have: firstName, lastName, email, avatar, provider, roles, status, isEmailVerified
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false); // Added state for dropdown

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const handleNewSearch = () => {
    // You can implement new search functionality here
    console.log('New search initiated');
    // This might open a modal or navigate to a different search page/view
  };

  // This would typically live within your AuthContext or a dedicated auth hook
  const logout = mockLogout; // Using mock for now

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar Component - It should contain its own navigation items */}
      <Sidebar
        isExpanded={isSidebarExpanded}
        onToggle={toggleSidebar}
        user={user} // Pass user if sidebar needs it for progress bar etc.
      />

      {/* Main content flex container */}
      <div className="flex-1 flex flex-col">
        {/* TopNavbar Component - It should contain the search button and user dropdown */}
        <TopNavbar
          user={user}
          showUserDropdown={showUserDropdown}
          setShowUserDropdown={setShowUserDropdown}
          onNewSearchClick={handleNewSearch} // Pass handler if "New Search" is in TopNavbar
          onLogoutClick={handleLogout} // Pass logout handler
          logoutPending={logout.isPending} // Pass logout pending state
          getRoleBadgeColor={getRoleBadgeColor} // Pass utility function
        />

        {/* Main content area */}
        <main className="flex-1 p-4 flex flex-col items-center justify-center overflow-y-auto">
          {/* TAL AI logo and title */}
          <div className="text-center mb-8">
            <img src="/tallogo.png" alt="TAL AI" className="h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">
              TAL AI{' '}
              {user?.firstName
                ? `by ${user.firstName}'s Organization`
                : 'by Your Organization'}
            </h1>
            <p className="text-gray-600 mt-2">
              Find exactly who you're looking for, in seconds.
              <a href="#" className="ml-1 text-purple-600 hover:underline">
                See how it works.
              </a>
            </p>
          </div>

          {/* Search input */}
          <div className="w-full max-w-lg mb-6">
            <div className="bg-purple-50 p-3 rounded-lg flex items-center gap-2 border border-purple-200">
              <Search className="w-5 h-5 text-purple-700" />
              <input
                type="text"
                placeholder="Who are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none flex-1 text-purple-900 placeholder-purple-400"
              />
            </div>

            {/* Search filters display area */}
            {searchQuery && (
              <div className="mt-4 border border-gray-200 bg-white rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <UserIcon className="w-4 h-4 mr-2" /> {/* Use aliased UserIcon */}
                    <span className="font-medium">{searchQuery}</span>
                  </div>
                  <button className="text-xs text-gray-500">
                    Do these filters look good?
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <div className="bg-gray-100 rounded-full px-3 py-1 text-xs flex items-center">
                    <span>Someone globally</span>
                    <span className="text-purple-600 mx-1">+1 more</span>
                    <span>filter</span>
                  </div>
                  <button onClick={() => setSearchQuery('')} className="text-gray-500 text-xs">Clear Filters</button>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="gap-2 text-sm"
              onClick={() => setSearchQuery('Job Description')}
            >
              <FileText className="w-4 h-4" />
              Job Description
            </Button>

            <Button
              variant="outline"
              className="gap-2 text-sm"
              onClick={() => setSearchQuery('Boolean')}
            >
              <ToggleRight className="w-4 h-4" />
              Boolean
            </Button>

            <Button
              variant="outline"
              className="gap-2 text-sm"
              onClick={() => setSearchQuery('Select Manually')}
            >
              <Filter className="w-4 h-4" />
              Select Manually
            </Button>
          </div>

          {/* Trial notice */}
          <div className="mt-auto border border-gray-200 rounded-lg bg-white p-4 flex items-center justify-between w-full max-w-lg">
            <span className="text-sm">You're currently on the free trial</span>
            <Button
              variant="primary"
              size="sm"
              className="bg-purple-700 hover:bg-purple-800 rounded-md text-sm"
            >
              Upgrade Now
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
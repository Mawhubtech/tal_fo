import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom'; // Import Routes and Route
import Sidebar from '../components/Sidebar';   // Your Sidebar component
import TopNavbar from '../components/TopNavbar'; // Your TopNavbar component
import Search from './Search'; // Import the new Search component
import EmailSequencesPage from './EmailSequencesPage'; // Import the new page

// Mock functions and objects - replace with your actual implementations
// --- End of Mock Data ---

const Dashboard: React.FC = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  
  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const handleNewSearch = () => {
    // You can implement new search functionality here
    console.log('New search initiated');
    // This might open a modal or navigate to a different search page/view
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar Component */}
      <Sidebar
        isExpanded={isSidebarExpanded}
        onToggle={toggleSidebar}
      />

      {/* Main content flex container */}
      <div className="flex-1 flex flex-col">
        {/* TopNavbar Component */}
        <TopNavbar
          onNewSearch={handleNewSearch}
        />

        {/* Main content area */}
        <main className="flex-1 p-4 flex flex-col items-center justify-center overflow-y-auto">
          <Routes> {/* Add Routes component here */}
            <Route path="/" element={<Search />} /> {/* Default route */}
            <Route path="sequences" element={<EmailSequencesPage />} /> {/* Route for EmailSequencesPage */}
          </Routes>
          
          {/* Trial notice */}
          <div className="mt-auto border border-gray-200 rounded-lg bg-white p-4 flex items-center justify-between w-full max-w-lg">
            <span className="text-sm">You're currently on the free trial</span>
            <button className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-1 rounded-md text-sm">
              Upgrade Now
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
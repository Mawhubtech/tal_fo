import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import ResumeProcessing from '../components/ResumeProcessing';

const ResumeProcessingPage: React.FC = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  
  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const handleNewSearch = () => {
    console.log('New search initiated');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
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
        <main className="flex-1 p-6 overflow-y-auto">
          <ResumeProcessing />
        </main>
      </div>
    </div>
  );
};

export default ResumeProcessingPage;

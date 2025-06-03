import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom'; // Import Routes and Route
import Sidebar from '../components/Sidebar';   // Your Sidebar component
import TopNavbar from '../components/TopNavbar'; // Your TopNavbar component
import Search from './Search'; // Import the new Search component
import SearchResultsPage from './SearchResults'; // Import the new SearchResults page
import EmailSequencesPage from './EmailSequencesPage'; // Import the new page
import ContactsPage from './ContactsPage'; // Import the new ContactsPage
import ResumeProcessingPage from './ResumeProcessingPage'; // Import ResumeProcessingPage
import AllJobsPage from './AllJobsPage'; // Import AllJobsPage
import CreateJobPage from './CreateJobPage'; // Import CreateJobPage
import ArchivedJobsPage from './ArchivedJobsPage'; // Import ArchivedJobsPage

// ATS Pages
import PipelinesPage from './ats/PipelinesPage'; // Import PipelinesPage
import AllCandidatesPage from './ats/AllCandidatesPage'; // Import AllCandidatesPage
import TasksPage from './ats/TasksPage'; // Import TasksPage
import InterviewsPage from './ats/InterviewsPage'; // Import InterviewsPage
import ReportsPage from './ats/ReportsPage'; // Import ReportsPage

// Admin Pages
import UserManagementPage from './admin/UserManagementPage'; // Import UserManagementPage
import CandidateProfilesPage from './admin/CandidateProfilesPage'; // Import CandidateProfilesPage
import CompanyManagementPage from './admin/CompanyManagementPage'; // Import CompanyManagementPage
import JobBoardConfigPage from './admin/JobBoardConfigPage'; // Import JobBoardConfigPage
import AnalyticsPage from './admin/AnalyticsPage'; // Import AnalyticsPage
import SystemSettingsPage from './admin/SystemSettingsPage'; // Import SystemSettingsPage

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
        />        {/* Main content area */}        <main className="flex-1 p-4 overflow-y-auto"> {/* Removed flex items-center justify-center and added overflow-y-auto if not already present for scrolling */}          <Routes> {/* Add Routes component here */}
            <Route path="/" element={<Search />} /> {/* Default route */}
            <Route path="search-results" element={<SearchResultsPage />} /> {/* Route for SearchResultsPage */}
            <Route path="resume-processing" element={<ResumeProcessingPage />} /> {/* Route for ResumeProcessingPage */}
            <Route path="sequences" element={<EmailSequencesPage />} /> {/* Route for EmailSequencesPage */}
            <Route path="contacts" element={<ContactsPage />} /> {/* Route for ContactsPage */}            {/* Job Pages */}
            <Route path="jobs/all" element={<AllJobsPage />} />
            <Route path="jobs/create" element={<CreateJobPage />} />
            <Route path="jobs/archived" element={<ArchivedJobsPage />} />
              {/* ATS Pages */}
            <Route path="ats/pipelines" element={<PipelinesPage />} />
            <Route path="ats/all-candidates" element={<AllCandidatesPage />} />
            <Route path="ats/tasks" element={<TasksPage />} />
            <Route path="ats/interviews" element={<InterviewsPage />} />
            <Route path="ats/reports" element={<ReportsPage />} />
            
            {/* Admin Pages */}
            <Route path="admin/user-management" element={<UserManagementPage />} />
            <Route path="admin/candidate-profiles" element={<CandidateProfilesPage />} />
            <Route path="admin/company-management" element={<CompanyManagementPage />} />
            <Route path="admin/job-board-config" element={<JobBoardConfigPage />} />
            <Route path="admin/analytics" element={<AnalyticsPage />} />
            <Route path="admin/system-settings" element={<SystemSettingsPage />} /></Routes>

        </main>
      </div>
    </div>
  );
};

export default Dashboard;
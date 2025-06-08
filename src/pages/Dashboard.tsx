import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom'; // Import Routes and Route
import Sidebar from '../components/Sidebar';   // Your Sidebar component
import TopNavbar from '../components/TopNavbar'; // Your TopNavbar component
import DashboardOverview from './DashboardOverview'; // Import the new DashboardOverview component
// Sourcing imports
import { Search, SearchResults, ContactsPage, EmailSequencesPage } from '../sourcing';
import ResumeProcessingPage from './ResumeProcessingPage'; // Import ResumeProcessingPage
// Job Pages - Only keep CreateJobPage for the new flow
import CreateJobPage from '../recruitment/jobs/pages/CreateJobPage'; // Import CreateJobPage

// Organization Pages (New Hierarchical Flow)
import OrganizationsPage from '../recruitment/organizations/pages/OrganizationsPage';
import OrganizationDetailPage from '../recruitment/organizations/pages/OrganizationDetailPage';
import DepartmentsPage from '../recruitment/organizations/pages/DepartmentsPage';
import DepartmentJobsPage from '../recruitment/organizations/pages/DepartmentJobsPage';
import JobATSPage from '../recruitment/organizations/pages/JobATSPage';

// Candidates Page
import CandidatesPage from './CandidatesPage'; // Import the new CandidatesPage

// Admin Pages
import AdminLayout from '../layouts/AdminLayout'; // Import AdminLayout
import AdminOverviewPage from './admin/AdminOverviewPage'; // Import AdminOverviewPage
import UserManagementPage from './admin/UserManagementPage'; // Import UserManagementPage
import CandidateProfilesPage from '../recruitment/candidates/pages/CandidateProfilesPage'; // Import CandidateProfilesPage
import { ClientManagementPage, ClientDetailPage } from './clients'; // Import ClientManagementPage and ClientDetailPage
import JobBoardConfigPage from '../recruitment/jobs/pages/JobBoardConfigPage'; // Import JobBoardConfigPage
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
            <Route path="/" element={<DashboardOverview />} /> {/* Dashboard Overview as default route */}            <Route path="search" element={<Search />} /> {/* Search talents page */}
            <Route path="projects" element={<div className="p-6"><h1 className="text-2xl font-bold">Projects</h1><p>Projects page coming soon...</p></div>} />
            <Route path="shortlist" element={<div className="p-6"><h1 className="text-2xl font-bold">Shortlist</h1><p>Shortlist page coming soon...</p></div>} />
            <Route path="search-results" element={<SearchResults />} /> {/* Route for SearchResults */}
            <Route path="resume-processing" element={<ResumeProcessingPage />} /> {/* Route for ResumeProcessingPage */}            <Route path="sequences" element={<EmailSequencesPage />} /> {/* Route for EmailSequencesPage */}
            <Route path="contacts" element={<ContactsPage />} /> {/* Route for ContactsPage */}            {/* Jobs, Candidates, and Clients standalone routes */}
            <Route path="jobs" element={<OrganizationsPage />} />
            <Route path="candidates" element={<CandidatesPage />} />
            <Route path="clients" element={<ClientManagementPage />} />
            <Route path="clients/:clientId" element={<ClientDetailPage />} />
            
            {/* New Hierarchical Recruitment Flow */}
            <Route path="organizations" element={<OrganizationsPage />} />
            <Route path="organizations/:organizationId" element={<OrganizationDetailPage />} />
            <Route path="organizations/:organizationId/departments" element={<DepartmentsPage />} />
            <Route path="organizations/:organizationId/departments/:departmentId/jobs" element={<DepartmentJobsPage />} />
            <Route path="organizations/:organizationId/departments/:departmentId/jobs/:jobId/ats" element={<JobATSPage />} />
            
            {/* Job Creation - Integrated with hierarchical flow */}
            <Route path="organizations/:organizationId/create-job" element={<CreateJobPage />} />
            <Route path="organizations/:organizationId/departments/:departmentId/create-job" element={<CreateJobPage />} />{/* Admin Pages with Layout */}            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="candidates" element={<CandidateProfilesPage />} />
              <Route path="clients" element={<ClientManagementPage />} />
              <Route path="job-boards" element={<JobBoardConfigPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<SystemSettingsPage />} />
            </Route></Routes>

        </main>
      </div>
    </div>
  );
};

export default Dashboard;
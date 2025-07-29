import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Import Routes and Route
import Sidebar from '../components/Sidebar';   // Your Sidebar component
import TopNavbar from '../components/TopNavbar'; // Your TopNavbar component
import RoutePermissionGuard from '../components/RoutePermissionGuard'; // Route permission guard
import { useAuthContext } from '../contexts/AuthContext';
import { isExternalUser } from '../utils/userUtils';
import DashboardOverview from './DashboardOverview'; // Import the new DashboardOverview component
// Sourcing imports
import { Search, SearchResults } from '../sourcing';
import UnifiedContactsPage from '../sourcing/contacts/pages/UnifiedContactsPage'; // Import UnifiedContactsPage
// Outreach imports
import SequencesPage from './outreach/SequencesPage'; // Import SequencesPage
import { 
  CandidateOutreachOverview, 
  CandidateOutreachProspects, 
  CandidateOutreachCampaigns, 
  CandidateOutreachTemplates, 
  CandidateOutreachAnalytics 
} from '../sourcing/outreach';
// Sourcing Projects imports
import SourcingProjectsPage from './sourcing/SourcingProjectsPage';
import ProjectDetailPage from './sourcing/ProjectDetailPage';
import CreateProjectPage from './sourcing/CreateProjectPage';
import EditProjectPage from './sourcing/EditProjectPage';
import CreateSearchPage from './sourcing/CreateSearchPage';
// Project section pages
import CreateSequencePage from './sourcing/CreateSequencePage';
import SequenceDetailPage from './sourcing/SequenceDetailPage';
import ProjectSearchesPage from './sourcing/ProjectSearchesPage';
import ProjectProspectsPage from './sourcing/ProjectProspectsPage';
import ProjectSequencesPage from './sourcing/ProjectSequencesPage';
import ProjectEmailTemplatesPage from './sourcing/ProjectEmailTemplatesPage';
import ProjectAnalyticsPage from './sourcing/ProjectAnalyticsPage';
import ResumeProcessingPage from './ResumeProcessingPage'; // Import ResumeProcessingPage
// Job Pages - Only keep CreateJobPage for the new flow
import CreateJobPage from '../recruitment/jobs/pages/CreateJobPage'; // Import CreateJobPage
import AllJobsPage from '../recruitment/jobs/pages/AllJobsPage'; // Import AllJobsPage

// Organization Pages (New Hierarchical Flow)
import OrganizationsPage from '../recruitment/organizations/pages/OrganizationsPage';
import OrganizationDetailPage from '../recruitment/organizations/pages/OrganizationDetailPage';
import DepartmentsPage from '../recruitment/organizations/pages/DepartmentsPage';
import DepartmentJobsPage from '../recruitment/organizations/pages/DepartmentJobsPage';
import JobATSPage from '../recruitment/organizations/pages/JobATSPage';
import JobEmailSequencesPage from '../recruitment/organizations/pages/JobEmailSequencesPage';
import JobSequenceDetailPage from '../recruitment/organizations/pages/JobSequenceDetailPage';
import JobSequenceStepsPage from '../recruitment/organizations/pages/JobSequenceStepsPage';
import JobSequenceEnrollmentsPage from '../recruitment/organizations/pages/JobSequenceEnrollmentsPage';
import JobEmailTemplatesPage from '../recruitment/organizations/pages/JobEmailTemplatesPage';
import CreateJobEmailSequencePage from '../recruitment/organizations/pages/CreateJobEmailSequencePage';

// Candidates Page
import CandidatesPage from './candidates'; // Import the new CandidatesPage

// Client Outreach Pages
import ClientOutreachRouter from './client-outreach/ClientOutreachRouter';

// Support Pages
import ResourcesPage from './ResourcesPage';
import ContactSupportPage from './ContactSupportPage';

// Admin Pages
import AdminLayout from '../layouts/AdminLayout'; // Import AdminLayout
import AdminOverviewPage from './admin/AdminOverviewPage'; // Import AdminOverviewPage
import UserManagementPage from './admin/UserManagementPage'; // Import UserManagementPage
import RoleManagementPage from './admin/RoleManagementPage'; // Import RoleManagementPage
import EmailManagementPage from './admin/EmailManagementPage'; // Import EmailManagementPage
import TeamManagementPage from './admin/TeamManagementPage'; // Import TeamManagementPage
import PipelinesPage from './admin/PipelinesPage'; // Import PipelinesPage
import EmailSequencesPage from './admin/EmailSequencesPage'; // Import EmailSequencesPage
import HiringTeamsPage from './admin/HiringTeamsPage'; // Import HiringTeamsPage
import HiringTeamDetailPage from './admin/HiringTeamDetailPage'; // Import HiringTeamDetailPage
import HiringTeamMembersPage from './admin/HiringTeamMembersPage'; // Import HiringTeamMembersPage
import RecruitmentTeamsPage from './recruitment-teams/RecruitmentTeamsPage'; // Import RecruitmentTeamsPage
import RecruitmentTeamDetailPage from './recruitment-teams/RecruitmentTeamDetailPage'; // Import RecruitmentTeamDetailPage
import CandidateProfilesPage from '../recruitment/candidates/pages/CandidateProfilesPage'; // Import CandidateProfilesPage
import { ClientManagementPage, ClientDetailPage, CreateDepartmentPage } from './clients'; // Import ClientManagementPage, ClientDetailPage, and CreateDepartmentPage
import JobBoardConfigPage from './admin/JobBoardConfigPage'; // Import JobBoardConfigPage
import AnalyticsPage from './admin/AnalyticsPage'; // Import AnalyticsPage
import SystemSettingsPage from './admin/SystemSettingsPage'; // Import SystemSettingsPage
import SupportDashboardPage from './admin/SupportDashboardPage'; // Import SupportDashboardPage

// Job Board Pages
import OrganizationJobBoardsPage from '../recruitment/organizations/pages/OrganizationJobBoardsPage';
import RecruiterJobBoardDashboard from './recruiter/RecruiterJobBoardDashboard';

// Mock functions and objects - replace with your actual implementations
// --- End of Mock Data ---

const Dashboard: React.FC = () => {
  const { user } = useAuthContext();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const isExternal = isExternalUser(user);
  
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
          <TopNavbar
            onNewSearch={handleNewSearch}
          />
        )}        {/* Main content area */}        
        <main className="flex-1 p-4 overflow-y-auto"> {/* Removed flex items-center justify-center and added overflow-y-auto if not already present for scrolling */}          
          <Routes> {/* Add Routes component here */}
            <Route path="/" element={
              <RoutePermissionGuard>
                <DashboardOverview />
              </RoutePermissionGuard>
            } /> {/* Dashboard Overview as default route */}            
            
            {/* Sourcing Projects Routes */}
            <Route path="sourcing/projects" element={
              <RoutePermissionGuard>
                <SourcingProjectsPage />
              </RoutePermissionGuard>
            } />
            
            <Route path="sourcing/projects/create" element={
              <RoutePermissionGuard>
                <CreateProjectPage />
              </RoutePermissionGuard>
            } />
            
            <Route path="sourcing/projects/:projectId" element={
              <RoutePermissionGuard>
                <ProjectDetailPage />
              </RoutePermissionGuard>
            } />
            
            <Route path="sourcing/projects/:projectId/edit" element={
              <RoutePermissionGuard>
                <EditProjectPage />
              </RoutePermissionGuard>
            } />
            
            <Route path="sourcing/projects/:projectId/searches/create" element={
              <RoutePermissionGuard>
                <CreateSearchPage />
              </RoutePermissionGuard>
            } />
            
            <Route path="sourcing/projects/:projectId/searches" element={
              <RoutePermissionGuard>
                <ProjectSearchesPage />
              </RoutePermissionGuard>
            } />
            
            <Route path="sourcing/projects/:projectId/search-results" element={
              <RoutePermissionGuard>
                <SearchResults />
              </RoutePermissionGuard>
            } />
            
            <Route path="sourcing/projects/:projectId/prospects" element={
              <RoutePermissionGuard>
                <ProjectProspectsPage />
              </RoutePermissionGuard>
            } />
            
            <Route path="sourcing/projects/:projectId/sequences" element={
              <RoutePermissionGuard>
                <ProjectSequencesPage />
              </RoutePermissionGuard>
            } />
            
            <Route path="sourcing/projects/:projectId/email-templates" element={
              <RoutePermissionGuard>
                <ProjectEmailTemplatesPage />
              </RoutePermissionGuard>
            } />
            
            <Route path="sourcing/projects/:projectId/analytics" element={
              <RoutePermissionGuard>
                <ProjectAnalyticsPage />
              </RoutePermissionGuard>
            } />
            
            <Route path="sourcing/projects/:projectId/searches/:searchId" element={
              <RoutePermissionGuard>
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Search Details</h1>
                  <p>Search details page coming soon...</p>
                </div>
              </RoutePermissionGuard>
            } />
            
            <Route path="sourcing/projects/:projectId/sequences/create" element={
              <RoutePermissionGuard>
                <CreateSequencePage />
              </RoutePermissionGuard>
            } />
            
            <Route path="sourcing/projects/:projectId/sequences/:sequenceId" element={
              <RoutePermissionGuard>
                <SequenceDetailPage />
              </RoutePermissionGuard>
            } />
            
            <Route path="projects" element={
              <RoutePermissionGuard>
                <div className="p-6"><h1 className="text-2xl font-bold">Projects</h1><p>Projects page coming soon...</p></div>
              </RoutePermissionGuard>
            } />
            
            <Route path="shortlist" element={
              <RoutePermissionGuard>
                <div className="p-6"><h1 className="text-2xl font-bold">Shortlist</h1><p>Shortlist page coming soon...</p></div>
              </RoutePermissionGuard>
            } />
            
            <Route path="resume-processing" element={
              <RoutePermissionGuard>
                <ResumeProcessingPage />
              </RoutePermissionGuard>
            } /> {/* Route for ResumeProcessingPage */}            
            
            <Route path="sequences" element={
              <RoutePermissionGuard>
                <SequencesPage />
              </RoutePermissionGuard>
            } /> {/* Route for User Sequences Page */}
            
            <Route path="contacts" element={
              <RoutePermissionGuard>
                <UnifiedContactsPage />
              </RoutePermissionGuard>
            } /> {/* Route for Unified Contact Management */}            
            
            {/* Jobs redirect to organizations - hierarchical approach */}
            <Route path="jobs" element={<Navigate to="/dashboard/organizations" replace />} />
            
            {/* My Jobs - Show AllJobsPage */}
            <Route path="my-jobs" element={
              <RoutePermissionGuard>
                <AllJobsPage />
              </RoutePermissionGuard>
            } />
            
            {/* Candidates and Clients standalone routes */}
            <Route path="candidates" element={
              <RoutePermissionGuard>
                <CandidatesPage />
              </RoutePermissionGuard>
            } />
            
            <Route path="clients" element={
              <RoutePermissionGuard>
                <ClientManagementPage />
              </RoutePermissionGuard>
            } />
            
            <Route path="clients/create-department" element={
              <RoutePermissionGuard>
                <CreateDepartmentPage />
              </RoutePermissionGuard>
            } />
            
            <Route path="clients/:clientId" element={
              <RoutePermissionGuard>
                <ClientDetailPage />
              </RoutePermissionGuard>
            } />
            
            {/* New Hierarchical Recruitment Flow */}
            <Route path="organizations" element={
              <RoutePermissionGuard>
                <OrganizationsPage />
              </RoutePermissionGuard>
            } />
            
            <Route path="organizations/:organizationId" element={
              <RoutePermissionGuard>
                <OrganizationDetailPage />
              </RoutePermissionGuard>
            } />
            
            <Route path="organizations/:organizationId/departments" element={
              <RoutePermissionGuard>
                <DepartmentsPage />
              </RoutePermissionGuard>
            } />
            
            <Route path="organizations/:organizationId/departments/:departmentId/jobs" element={
              <RoutePermissionGuard>
                <DepartmentJobsPage />
              </RoutePermissionGuard>
            } />
            
            <Route path="organizations/:organizationId/departments/:departmentId/jobs/:jobId/ats" element={
              <RoutePermissionGuard>
                <JobATSPage />
              </RoutePermissionGuard>
            } />
            
            <Route path="organizations/:organizationId/departments/:departmentId/jobs/:jobId/email-sequences" element={
              <RoutePermissionGuard>
                <JobEmailSequencesPage />
              </RoutePermissionGuard>
            } />
            
            <Route path="organizations/:organizationId/departments/:departmentId/jobs/:jobId/email-sequences/:sequenceId" element={
              <RoutePermissionGuard>
                <JobSequenceDetailPage />
              </RoutePermissionGuard>
            } />
            
            <Route path="organizations/:organizationId/departments/:departmentId/jobs/:jobId/email-sequences/:sequenceId/steps" element={
              <RoutePermissionGuard>
                <JobSequenceStepsPage />
              </RoutePermissionGuard>
            } />
            
            <Route path="organizations/:organizationId/departments/:departmentId/jobs/:jobId/email-sequences/:sequenceId/enrollments" element={
              <RoutePermissionGuard>
                <JobSequenceEnrollmentsPage />
              </RoutePermissionGuard>
            } />
            
            <Route path="organizations/:organizationId/departments/:departmentId/jobs/:jobId/email-templates" element={
              <RoutePermissionGuard>
                <JobEmailTemplatesPage />
              </RoutePermissionGuard>
            } />
            
            <Route path="organizations/:organizationId/departments/:departmentId/jobs/:jobId/email-sequences/create" element={
              <RoutePermissionGuard>
                <CreateJobEmailSequencePage />
              </RoutePermissionGuard>
            } />
            
            {/* Job Creation - Integrated with hierarchical flow */}
            <Route path="organizations/:organizationId/create-job" element={
              <RoutePermissionGuard>
                <CreateJobPage />
              </RoutePermissionGuard>
            } />
            
            <Route path="organizations/:organizationId/departments/:departmentId/create-job" element={
              <RoutePermissionGuard>
                <CreateJobPage />
              </RoutePermissionGuard>
            } />
            
            {/* Organization-specific hiring teams */}
            <Route path="organizations/:organizationId/hiring-teams" element={
              <RoutePermissionGuard>
                <HiringTeamsPage />
              </RoutePermissionGuard>
            } />

            {/* Job Board Management Routes */}
            <Route path="organizations/:organizationId/job-boards" element={
              <RoutePermissionGuard>
                <OrganizationJobBoardsPage />
              </RoutePermissionGuard>
            } />

            {/* Recruiter Job Board Dashboard */}
            <Route path="job-boards" element={
              <RoutePermissionGuard>
                <RecruiterJobBoardDashboard />
              </RoutePermissionGuard>
            } />

            {/* Candidate Outreach Routes (under sourcing) */}
            <Route path="sourcing/outreach" element={
              <RoutePermissionGuard>
                <CandidateOutreachOverview />
              </RoutePermissionGuard>
            } />
            
            <Route path="sourcing/outreach/prospects" element={
              <RoutePermissionGuard>
                <CandidateOutreachProspects />
              </RoutePermissionGuard>
            } />
            
            <Route path="sourcing/outreach/campaigns" element={
              <RoutePermissionGuard>
                <CandidateOutreachCampaigns />
              </RoutePermissionGuard>
            } />
            
            <Route path="sourcing/sequences" element={
              <RoutePermissionGuard>
                <CandidateOutreachTemplates />
              </RoutePermissionGuard>
            } />
            
            <Route path="sourcing/outreach/analytics" element={
              <RoutePermissionGuard>
                <CandidateOutreachAnalytics />
              </RoutePermissionGuard>
            } />            

            {/* Client Outreach Routes - Project-based structure */}
            <Route path="client-outreach/*" element={
              <RoutePermissionGuard>
                <ClientOutreachRouter />
              </RoutePermissionGuard>
            } />

            {/* Support Routes */}
            <Route path="resources" element={<ResourcesPage />} />
            
            <Route path="contact-support" element={<ContactSupportPage />} />

            {/* Admin Pages with Layout */}
            <Route path="admin" element={
              <RoutePermissionGuard>
                <AdminLayout />
              </RoutePermissionGuard>
            }>
              <Route index element={
                <RoutePermissionGuard>
                  <AdminOverviewPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="users" element={
                <RoutePermissionGuard>
                  <UserManagementPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="roles" element={
                <RoutePermissionGuard>
                  <RoleManagementPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="email-management" element={
                <RoutePermissionGuard>
                  <EmailManagementPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="team-management" element={
                <RoutePermissionGuard>
                  <TeamManagementPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="pipelines" element={
                <RoutePermissionGuard>
                  <PipelinesPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="email-sequences" element={
                <RoutePermissionGuard>
                  <EmailSequencesPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="hiring-teams" element={
                <RoutePermissionGuard>
                  <HiringTeamsPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="hiring-teams/:teamId" element={
                <RoutePermissionGuard>
                  <HiringTeamDetailPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="hiring-teams/:teamId/members" element={
                <RoutePermissionGuard>
                  <HiringTeamMembersPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="recruitment-teams" element={
                <RoutePermissionGuard>
                  <RecruitmentTeamsPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="recruitment-teams/:teamId" element={
                <RoutePermissionGuard>
                  <RecruitmentTeamDetailPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="candidates" element={
                <RoutePermissionGuard>
                  <CandidateProfilesPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="clients" element={
                <RoutePermissionGuard>
                  <ClientManagementPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="clients/create-department" element={
                <RoutePermissionGuard>
                  <CreateDepartmentPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="job-boards" element={
                <RoutePermissionGuard>
                  <JobBoardConfigPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="analytics" element={
                <RoutePermissionGuard>
                  <AnalyticsPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="support" element={
                <RoutePermissionGuard>
                  <SupportDashboardPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="settings" element={
                <RoutePermissionGuard>
                  <SystemSettingsPage />
                </RoutePermissionGuard>
              } />
            </Route>
          </Routes>

        </main>
      </div>
    </div>
  );
};

export default Dashboard;
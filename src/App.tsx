import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { GmailStatusProvider } from './contexts/GmailStatusContext';
import { JobNotificationProvider } from './contexts/JobNotificationContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { JobsWebSocketProvider } from './contexts/JobsWebSocketContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import RoutePermissionGuard from './components/RoutePermissionGuard';
import ExternalUserGuard from './components/ExternalUserGuard';
import SignIn from './components/SignIn';
import OrganizationSignIn from './components/OrganizationSignIn';
import OAuthCallback from './components/OAuthCallback';
import GmailOAuthCallback from './pages/GmailOAuthCallback';
import OutlookOAuthCallback from './pages/OutlookOAuthCallback';
import ResetPasswordPage from './pages/ResetPasswordPage';
import LandingPage from './pages/LandingPage';
import InvitationResponsePage from './pages/InvitationResponsePage';
import JobBoardPage from './pages/jobSeeker/JobBoardPage';
import JobDetailPage from './pages/jobSeeker/JobDetailPage';
import JobSeekerLoginPage from './pages/jobSeeker/JobSeekerLoginPage';
import JobSeekerRegisterPage from './pages/jobSeeker/JobSeekerRegisterPage';
import JobSeekerAdminPage from './pages/jobSeeker/admin/JobSeekerAdminPage';
import RequestDemoPage from './pages/RequestDemoPage';
import AcceptInvitationPage from './pages/hiring-teams/AcceptInvitationPage';
import InvitationAcceptedPage from './pages/hiring-teams/InvitationAcceptedPage';
import CompanyInvitationPage from './pages/AcceptInvitationPage';
import AcceptJobCollaboratorInvitationPage from './pages/AcceptJobCollaboratorInvitationPage';
import ExternalTeamAccessPage from './pages/hiring-teams/ExternalTeamAccessPage';
import ExternalUserLayout from './layouts/ExternalUserLayout';
import ExternalJobsPage from './pages/external/ExternalJobsPage';
import ExternalJobDetailPage from './pages/external/ExternalJobDetailPage';
import ExternalSettingsPage from './pages/external/ExternalSettingsPage';
import ExternalUserRegisterPage from './pages/external/ExternalUserRegisterPage';
import JobEmailSequencesPage from './recruitment/organizations/pages/JobEmailSequencesPage';
import JobSequenceDetailPage from './recruitment/organizations/pages/JobSequenceDetailPage';
import JobSequenceStepsPage from './recruitment/organizations/pages/JobSequenceStepsPage';
import JobSequenceEnrollmentsPage from './recruitment/organizations/pages/JobSequenceEnrollmentsPage';
import JobEmailTemplatesPage from './recruitment/organizations/pages/JobEmailTemplatesPage';
import CreateJobEmailSequencePage from './recruitment/organizations/pages/CreateJobEmailSequencePage';
import EmailSettingsPage from './pages/EmailSettingsPage';
import { QueryProvider } from './providers/QueryProvider';

// Main Layout
import MainLayout from './layouts/MainLayout';

// Internal Pages
import DashboardOverview from './pages/DashboardOverview';
import CalendarPage from './pages/CalendarPage';
import { Search, SearchResults } from './sourcing';
import UnifiedContactsPage from './sourcing/contacts/pages/UnifiedContactsPage';
import SequencesPage from './pages/outreach/SequencesPage';
import { 
  CandidateOutreachOverview, 
  CandidateOutreachProspects, 
  CandidateOutreachCampaigns, 
  CandidateOutreachTemplates, 
  CandidateOutreachAnalytics 
} from './sourcing/outreach';
import SourcingProjectsPage from './pages/sourcing/SourcingProjectsPage';
import ProjectDetailPage from './pages/sourcing/ProjectDetailPage';
import CreateProjectPage from './pages/sourcing/CreateProjectPage';
import CreateSearchPage from './pages/sourcing/CreateSearchPage';
import CreateSequencePage from './pages/sourcing/CreateSequencePage';
import SequenceDetailPage from './pages/sourcing/SequenceDetailPage';
import ProjectSearchesPage from './pages/sourcing/ProjectSearchesPage';
import ProjectProspectsPage from './pages/sourcing/ProjectProspectsPage';
import ProjectSequencesPage from './pages/sourcing/ProjectSequencesPage';
import ProjectEmailTemplatesPage from './pages/sourcing/ProjectEmailTemplatesPage';
import ProjectAnalyticsPage from './pages/sourcing/ProjectAnalyticsPage';
import ResumeProcessingPage from './pages/ResumeProcessingPage';
import CreateJobPage from './recruitment/jobs/pages/CreateJobPage';
import AllJobsPage from './recruitment/jobs/pages/AllJobsPage';
import OrganizationsPage from './recruitment/organizations/pages/OrganizationsPage';
import OrganizationDetailPage from './recruitment/organizations/pages/OrganizationDetailPage';
import DepartmentsPage from './recruitment/organizations/pages/DepartmentsPage';
import DepartmentJobsPage from './recruitment/organizations/pages/DepartmentJobsPage';
import JobATSPage from './recruitment/organizations/pages/JobATSPage';
import CandidatesPage from './pages/candidates';
import CommunicationPage from './pages/CommunicationPage';
import ClientOutreachRouter from './pages/client-outreach/ClientOutreachRouter';
import { ResourcesPage } from './pages/resources';
import ContactSupportPage from './pages/ContactSupportPage';
import TasksPage from './pages/TasksPage';
import PendingInvitationsPage from './pages/PendingInvitationsPage';
import GlobalSearchPage from './pages/GlobalSearchPage';
import GlobalSearchResultsPage from './pages/GlobalSearchResultsPage';
import AdminLayout from './layouts/AdminLayout';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import RoleManagementPage from './pages/admin/RoleManagementPage';
import EmailManagementPage from './pages/admin/EmailManagementPage';
import TeamManagementPage from './pages/admin/TeamManagementPage';
import PipelinesPage from './pages/admin/PipelinesPage';
import EmailSequencesPage from './pages/admin/EmailSequencesPage';
import HiringTeamsPage from './pages/admin/HiringTeamsPage';
import HiringTeamDetailPage from './pages/admin/HiringTeamDetailPage';
import CandidateProfilesPage from './recruitment/candidates/pages/CandidateProfilesPage';
import { ClientManagementPage, ClientDetailPage, CreateDepartmentPage } from './pages/clients';
import JobBoardConfigPage from './pages/admin/JobBoardConfigPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import SystemSettingsPage from './pages/admin/SystemSettingsPage';
import SupportDashboardPage from './pages/admin/SupportDashboardPage';
import { CompanyDetailPage, CompanyManagementRouter } from './pages/companies';
import OrganizationJobBoardsPage from './recruitment/organizations/pages/OrganizationJobBoardsPage';
import RecruiterJobBoardDashboard from './pages/recruiter/RecruiterJobBoardDashboard';

function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ToastProvider>
          <AuthProvider>
            <GmailStatusProvider>
              <NotificationProvider>
                <JobsWebSocketProvider>
                  <JobNotificationProvider enabled={true}>
                    <Router>
                      <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/jobs" element={<JobBoardPage />} />
            <Route path="/careers/jobs/:jobId" element={<JobDetailPage />} />
            <Route
              path="/signin"
              element={<SignIn />}
            />
            <Route
              path="/reset-password"
              element={<ResetPasswordPage />}
            />
            <Route
              path="/organization/signin"
              element={<OrganizationSignIn />}
            />
            {/* Job Seeker Routes */}
            <Route
              path="/job-seeker/login"
              element={<JobSeekerLoginPage />}
            />
            <Route
              path="/job-seeker/register"
              element={<JobSeekerRegisterPage />}
            />
            <Route 
              path="/job-seeker/admin" 
              element={
                <ProtectedRoute>
                  <JobSeekerAdminPage />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/auth/callback"
              element={<OAuthCallback />}
            />
            <Route
              path="/oauth/gmail-callback"
              element={<GmailOAuthCallback />}
            />
            <Route
              path="/email/outlook/callback"
              element={<OutlookOAuthCallback />}
            />
            {/* Main Authenticated Routes with Layout */}
            <Route element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              {/* Dashboard Overview */}
              <Route path="/dashboard" element={
                <RoutePermissionGuard>
                  <DashboardOverview />
                </RoutePermissionGuard>
              } />
              
              {/* Calendar */}
              <Route path="/calendar" element={
                <RoutePermissionGuard>
                  <CalendarPage />
                </RoutePermissionGuard>
              } />
              
              {/* Email Settings */}
              <Route path="/settings/email" element={
                <RoutePermissionGuard>
                  <EmailSettingsPage />
                </RoutePermissionGuard>
              } />
              
              {/* Global Search */}
              <Route path="/search" element={
                <RoutePermissionGuard>
                  <GlobalSearchPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="/search-results" element={
                <RoutePermissionGuard>
                  <GlobalSearchResultsPage />
                </RoutePermissionGuard>
              } />
              
              {/* Sourcing Projects */}
              <Route path="/sourcing/projects" element={
                <RoutePermissionGuard>
                  <SourcingProjectsPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="/sourcing/projects/create" element={
                <RoutePermissionGuard>
                  <CreateProjectPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="/sourcing/projects/:projectId" element={
                <RoutePermissionGuard>
                  <ProjectDetailPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="/sourcing/projects/:projectId/edit" element={
                <RoutePermissionGuard>
                  <CreateProjectPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="/sourcing/projects/:projectId/searches/create" element={
                <RoutePermissionGuard>
                  <CreateSearchPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="/sourcing/projects/:projectId/searches" element={
                <RoutePermissionGuard>
                  <ProjectSearchesPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="/sourcing/projects/:projectId/search-results" element={
                <RoutePermissionGuard>
                  <SearchResults />
                </RoutePermissionGuard>
              } />
              
              <Route path="/sourcing/projects/:projectId/prospects" element={
                <RoutePermissionGuard>
                  <ProjectProspectsPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="/sourcing/projects/:projectId/sequences" element={
                <RoutePermissionGuard>
                  <ProjectSequencesPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="/sourcing/projects/:projectId/email-templates" element={
                <RoutePermissionGuard>
                  <ProjectEmailTemplatesPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="/sourcing/projects/:projectId/analytics" element={
                <RoutePermissionGuard>
                  <ProjectAnalyticsPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="/sourcing/projects/:projectId/sequences/create" element={
                <RoutePermissionGuard>
                  <CreateSequencePage />
                </RoutePermissionGuard>
              } />
              
              <Route path="/sourcing/projects/:projectId/sequences/:sequenceId" element={
                <RoutePermissionGuard>
                  <SequenceDetailPage />
                </RoutePermissionGuard>
              } />
              
              {/* Resume Processing */}
              <Route path="/resume-processing" element={
                <RoutePermissionGuard>
                  <ResumeProcessingPage />
                </RoutePermissionGuard>
              } />
              
              {/* Sequences */}
              <Route path="/sequences" element={
                <RoutePermissionGuard>
                  <SequencesPage />
                </RoutePermissionGuard>
              } />
              
              {/* Contacts */}
              <Route path="/contacts" element={
                <RoutePermissionGuard>
                  <UnifiedContactsPage />
                </RoutePermissionGuard>
              } />
              
              {/* Tasks */}
              <Route path="/tasks" element={
                <RoutePermissionGuard>
                  <TasksPage />
                </RoutePermissionGuard>
              } />
              
              {/* Invitations */}
              <Route path="/invitations" element={
                <RoutePermissionGuard>
                  <PendingInvitationsPage />
                </RoutePermissionGuard>
              } />
              
              {/* Jobs */}
              <Route path="/jobs" element={<Navigate to="/my-jobs" replace />} />
              
              <Route path="/my-jobs" element={
                <RoutePermissionGuard>
                  <AllJobsPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="/jobs/create" element={
                <RoutePermissionGuard>
                  <CreateJobPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="/jobs/:jobSlug" element={
                <RoutePermissionGuard>
                  <JobATSPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="/jobs/:jobId/ats" element={
                <RoutePermissionGuard>
                  <JobATSPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="/jobs/:slug/email-sequences" element={
                <RoutePermissionGuard>
                  <JobEmailSequencesPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="/jobs/:slug/email-sequences/:sequenceId" element={
                <RoutePermissionGuard>
                  <JobSequenceDetailPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="/jobs/:slug/email-sequences/:sequenceId/steps" element={
                <RoutePermissionGuard>
                  <JobSequenceStepsPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="/jobs/:slug/email-sequences/:sequenceId/enrollments" element={
                <RoutePermissionGuard>
                  <JobSequenceEnrollmentsPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="/jobs/:slug/email-templates" element={
                <RoutePermissionGuard>
                  <JobEmailTemplatesPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="/jobs/:slug/email-sequences/create" element={
                <RoutePermissionGuard>
                  <CreateJobEmailSequencePage />
                </RoutePermissionGuard>
              } />
              
              {/* Job Boards */}
              <Route path="/job-boards" element={
                <RoutePermissionGuard>
                  <RecruiterJobBoardDashboard />
                </RoutePermissionGuard>
              } />
              
              {/* Candidates */}
              <Route path="/candidates" element={
                <RoutePermissionGuard>
                  <CandidatesPage />
                </RoutePermissionGuard>
              } />
              
              {/* Communication */}
              <Route path="/communication" element={
                <RoutePermissionGuard>
                  <CommunicationPage />
                </RoutePermissionGuard>
              } />
              
              {/* Clients */}
              <Route path="/clients" element={
                <RoutePermissionGuard>
                  <ClientManagementPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="/clients/create-department" element={
                <RoutePermissionGuard>
                  <CreateDepartmentPage />
                </RoutePermissionGuard>
              } />
              
              <Route path="/clients/:clientId" element={
                <RoutePermissionGuard>
                  <ClientDetailPage />
                </RoutePermissionGuard>
              } />
              
              {/* Sourcing Outreach */}
              <Route path="/sourcing/outreach" element={
                <RoutePermissionGuard>
                  <CandidateOutreachOverview />
                </RoutePermissionGuard>
              } />
              
              <Route path="/sourcing/outreach/prospects" element={
                <RoutePermissionGuard>
                  <CandidateOutreachProspects />
                </RoutePermissionGuard>
              } />
              
              <Route path="/sourcing/outreach/campaigns" element={
                <RoutePermissionGuard>
                  <CandidateOutreachCampaigns />
                </RoutePermissionGuard>
              } />
              
              <Route path="/sourcing/sequences" element={
                <RoutePermissionGuard>
                  <CandidateOutreachTemplates />
                </RoutePermissionGuard>
              } />
              
              <Route path="/sourcing/outreach/analytics" element={
                <RoutePermissionGuard>
                  <CandidateOutreachAnalytics />
                </RoutePermissionGuard>
              } />
              
              {/* Client Outreach */}
              <Route path="/client-outreach/*" element={
                <RoutePermissionGuard>
                  <ClientOutreachRouter />
                </RoutePermissionGuard>
              } />
              
              {/* Support */}
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/contact-support" element={<ContactSupportPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
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
                
                <Route path="companies" element={
                  <RoutePermissionGuard>
                    <CompanyManagementRouter />
                  </RoutePermissionGuard>
                } />
                
                <Route path="companies/:companyId" element={
                  <RoutePermissionGuard>
                    <CompanyDetailPage />
                  </RoutePermissionGuard>
                } />
                
                <Route path="companies/:companyId/hiring-teams/:teamId" element={
                  <RoutePermissionGuard>
                    <HiringTeamDetailPage />
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
            </Route>
            <Route
              path="/request-demo"
              element={<RequestDemoPage />}
            />
            {/* Public Hiring Team Invitation Routes */}
            <Route
              path="/hiring-teams/accept-invitation"
              element={<AcceptInvitationPage />}
            />
            <Route
              path="/hiring-teams/invitation-accepted"
              element={<InvitationAcceptedPage />}
            />
            <Route
              path="/hiring-teams/external-access"
              element={<ExternalTeamAccessPage />}
            />
            {/* Job Collaborator Invitation Route */}
            <Route
              path="/accept-invitation/:token"
              element={<AcceptJobCollaboratorInvitationPage />}
            />
            {/* Company Invitation Route */}
            <Route
              path="/company/invitation"
              element={<CompanyInvitationPage />}
            />
            {/* Calendar Invitation Response Route */}
            <Route
              path="/calendar/invitation/:invitationId/respond"
              element={<InvitationResponsePage />}
            />
            {/* External User Registration (no auth required) */}
            <Route
              path="/external/register"
              element={<ExternalUserRegisterPage />}
            />
            {/* External User Routes */}
            <Route
              path="/external/*"
              element={
                <ExternalUserGuard>
                  <Routes>
                    <Route path="/" element={<ExternalUserLayout />}>
                      <Route index element={<Navigate to="/external/jobs" replace />} />
                      <Route path="jobs" element={<ExternalJobsPage />} />
                      <Route path="jobs/:jobId" element={<ExternalJobDetailPage />} />
                      <Route path="jobs/:jobId/applications" element={<ExternalJobDetailPage />} />
                      <Route path="jobs/:jobId/email-sequences" element={<JobEmailSequencesPage />} />
                      <Route path="jobs/:jobId/email-sequences/:sequenceId" element={<JobSequenceDetailPage />} />
                      <Route path="jobs/:jobId/email-sequences/:sequenceId/steps" element={<JobSequenceStepsPage />} />
                      <Route path="jobs/:jobId/email-sequences/:sequenceId/enrollments" element={<JobSequenceEnrollmentsPage />} />
                      <Route path="jobs/:jobId/email-templates" element={<JobEmailTemplatesPage />} />
                      <Route path="jobs/:jobId/email-sequences/create" element={<CreateJobEmailSequencePage />} />
                      <Route path="settings" element={<ExternalSettingsPage />} />
                    </Route>
                  </Routes>
                </ExternalUserGuard>
              }
            />
            {/* Remove individual /dashboard/resume-processing and /dashboard/sequences routes as they are handled by Dashboard.tsx */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
                  </JobNotificationProvider>
                </JobsWebSocketProvider>
              </NotificationProvider>
            </GmailStatusProvider>
          </AuthProvider>
        </ToastProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;

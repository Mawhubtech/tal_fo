import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { GmailStatusProvider } from './contexts/GmailStatusContext';
import { JobNotificationProvider } from './contexts/JobNotificationContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { JobsWebSocketProvider } from './contexts/JobsWebSocketContext';
import { QueryProvider } from './providers/QueryProvider';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import RoutePermissionGuard from './components/RoutePermissionGuard';
import ExternalUserGuard from './components/ExternalUserGuard';
import SignIn from './components/SignIn';
import OrganizationSignIn from './components/OrganizationSignIn';
import OAuthCallback from './components/OAuthCallback';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load all pages for code-splitting
const GmailOAuthCallback = lazy(() => import('./pages/GmailOAuthCallback'));
const OutlookOAuthCallback = lazy(() => import('./pages/OutlookOAuthCallback'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordWithTokenPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const InvitationResponsePage = lazy(() => import('./pages/InvitationResponsePage'));
const JobBoardPage = lazy(() => import('./pages/jobSeeker/JobBoardPage'));
const JobDetailPage = lazy(() => import('./pages/jobSeeker/JobDetailPage'));
const JobSeekerLoginPage = lazy(() => import('./pages/jobSeeker/JobSeekerLoginPage'));
const JobSeekerRegisterPage = lazy(() => import('./pages/jobSeeker/JobSeekerRegisterPage'));
const JobSeekerAdminPage = lazy(() => import('./pages/jobSeeker/admin/JobSeekerAdminPage'));
const RequestDemoPage = lazy(() => import('./pages/RequestDemoPage'));
const AcceptInvitationPage = lazy(() => import('./pages/hiring-teams/AcceptInvitationPage'));
const InvitationAcceptedPage = lazy(() => import('./pages/hiring-teams/InvitationAcceptedPage'));
const CompanyInvitationPage = lazy(() => import('./pages/AcceptInvitationPage'));
const AcceptJobCollaboratorInvitationPage = lazy(() => import('./pages/AcceptJobCollaboratorInvitationPage'));
const ExternalTeamAccessPage = lazy(() => import('./pages/hiring-teams/ExternalTeamAccessPage'));
const ExternalUserLayout = lazy(() => import('./layouts/ExternalUserLayout'));
const ExternalJobsPage = lazy(() => import('./pages/external/ExternalJobsPage'));
const ExternalJobDetailPage = lazy(() => import('./pages/external/ExternalJobDetailPage'));
const ExternalSettingsPage = lazy(() => import('./pages/external/ExternalSettingsPage'));
const ExternalUserRegisterPage = lazy(() => import('./pages/external/ExternalUserRegisterPage'));
const EmailSettingsPage = lazy(() => import('./pages/EmailSettingsPage'));

// Recruitment pages
const JobEmailSequencesPage = lazy(() => import('./recruitment/organizations/pages/JobEmailSequencesPage'));
const JobSequenceDetailPage = lazy(() => import('./recruitment/organizations/pages/JobSequenceDetailPage'));
const JobSequenceStepsPage = lazy(() => import('./recruitment/organizations/pages/JobSequenceStepsPage'));
const JobSequenceEnrollmentsPage = lazy(() => import('./recruitment/organizations/pages/JobSequenceEnrollmentsPage'));
const JobEmailTemplatesPage = lazy(() => import('./recruitment/organizations/pages/JobEmailTemplatesPage'));
const CreateJobEmailSequencePage = lazy(() => import('./recruitment/organizations/pages/CreateJobEmailSequencePage'));
const MainLayout = lazy(() => import('./layouts/MainLayout'));
const DashboardOverview = lazy(() => import('./pages/DashboardOverview'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));

// Sourcing pages - import Search and SearchResults as regular modules first
import { Search, SearchResults } from './sourcing';
const UnifiedContactsPage = lazy(() => import('./sourcing/contacts/pages/UnifiedContactsPage'));
const SequencesPage = lazy(() => import('./pages/outreach/SequencesPage'));
const CandidateOutreachOverview = lazy(() => import('./sourcing/outreach').then(m => ({ default: m.CandidateOutreachOverview })));
const CandidateOutreachProspects = lazy(() => import('./sourcing/outreach').then(m => ({ default: m.CandidateOutreachProspects })));
const CandidateOutreachCampaigns = lazy(() => import('./sourcing/outreach').then(m => ({ default: m.CandidateOutreachCampaigns })));
const CandidateOutreachTemplates = lazy(() => import('./sourcing/outreach').then(m => ({ default: m.CandidateOutreachTemplates })));
const CandidateOutreachAnalytics = lazy(() => import('./sourcing/outreach').then(m => ({ default: m.CandidateOutreachAnalytics })));
const SourcingProjectsPage = lazy(() => import('./pages/sourcing/SourcingProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/sourcing/ProjectDetailPage'));
const CreateProjectPage = lazy(() => import('./pages/sourcing/CreateProjectPage'));
const CreateSearchPage = lazy(() => import('./pages/sourcing/CreateSearchPage'));
const CreateSequencePage = lazy(() => import('./pages/sourcing/CreateSequencePage'));
const SequenceDetailPage = lazy(() => import('./pages/sourcing/SequenceDetailPage'));
const ProjectSearchesPage = lazy(() => import('./pages/sourcing/ProjectSearchesPage'));
const ProjectProspectsPage = lazy(() => import('./pages/sourcing/ProjectProspectsPage'));
const ProjectSequencesPage = lazy(() => import('./pages/sourcing/ProjectSequencesPage'));
const ProjectEmailTemplatesPage = lazy(() => import('./pages/sourcing/ProjectEmailTemplatesPage'));
const ProjectAnalyticsPage = lazy(() => import('./pages/sourcing/ProjectAnalyticsPage'));

// Main app pages
const ResumeProcessingPage = lazy(() => import('./pages/ResumeProcessingPage'));
const CreateJobPage = lazy(() => import('./recruitment/jobs/pages/CreateJobPage'));
const AllJobsPage = lazy(() => import('./recruitment/jobs/pages/AllJobsPage'));
const OrganizationsPage = lazy(() => import('./recruitment/organizations/pages/OrganizationsPage'));
const OrganizationDetailPage = lazy(() => import('./recruitment/organizations/pages/OrganizationDetailPage'));
const DepartmentsPage = lazy(() => import('./recruitment/organizations/pages/DepartmentsPage'));
const DepartmentJobsPage = lazy(() => import('./recruitment/organizations/pages/DepartmentJobsPage'));
const JobATSPage = lazy(() => import('./recruitment/organizations/pages/JobATSPage'));
const CandidatesPage = lazy(() => import('./pages/candidates'));
const CommunicationPage = lazy(() => import('./pages/CommunicationPage'));
const EmailDetailPage = lazy(() => import('./pages/EmailDetailPage'));
const ClientOutreachRouter = lazy(() => import('./pages/client-outreach/ClientOutreachRouter'));
const ResourcesPage = lazy(() => import('./pages/resources').then(m => ({ default: m.ResourcesPage })));
const ContactSupportPage = lazy(() => import('./pages/ContactSupportPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const PendingInvitationsPage = lazy(() => import('./pages/PendingInvitationsPage'));
const GlobalSearchPage = lazy(() => import('./pages/GlobalSearchPage'));
const GlobalSearchResultsPage = lazy(() => import('./pages/GlobalSearchResultsPage'));
const PublicSearchResultsPage = lazy(() => import('./pages/PublicSearchResultsPage'));

// Admin pages
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminOverviewPage = lazy(() => import('./pages/admin/AdminOverviewPage'));
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'));
const RoleManagementPage = lazy(() => import('./pages/admin/RoleManagementPage'));
const EmailManagementPage = lazy(() => import('./pages/admin/EmailManagementPage'));
const TeamManagementPage = lazy(() => import('./pages/admin/TeamManagementPage'));
const PipelinesPage = lazy(() => import('./pages/admin/PipelinesPage'));
const EmailSequencesPage = lazy(() => import('./pages/admin/EmailSequencesPage'));
const HiringTeamsPage = lazy(() => import('./pages/admin/HiringTeamsPage'));
const HiringTeamDetailPage = lazy(() => import('./pages/admin/HiringTeamDetailPage'));
const CandidateProfilesPage = lazy(() => import('./recruitment/candidates/pages/CandidateProfilesPage'));
const ClientManagementPage = lazy(() => import('./pages/clients').then(m => ({ default: m.ClientManagementPage })));
const ClientDetailPage = lazy(() => import('./pages/clients').then(m => ({ default: m.ClientDetailPage })));
const CreateDepartmentPage = lazy(() => import('./pages/clients').then(m => ({ default: m.CreateDepartmentPage })));
const JobBoardConfigPage = lazy(() => import('./pages/admin/JobBoardConfigPage'));
const AnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage'));
const SystemSettingsPage = lazy(() => import('./pages/admin/SystemSettingsPage'));
const SupportDashboardPage = lazy(() => import('./pages/admin/SupportDashboardPage'));
const CompanyDetailPage = lazy(() => import('./pages/companies').then(m => ({ default: m.CompanyDetailPage })));
const CompanyManagementRouter = lazy(() => import('./pages/companies').then(m => ({ default: m.CompanyManagementRouter })));
const OrganizationJobBoardsPage = lazy(() => import('./recruitment/organizations/pages/OrganizationJobBoardsPage'));
const RecruiterJobBoardDashboard = lazy(() => import('./pages/recruiter/RecruiterJobBoardDashboard'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>
);

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
                    <Suspense fallback={<PageLoader />}>
                      <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            {/* Public Search Results - No Auth Required */}
            <Route path="/public-search-results" element={<PublicSearchResultsPage />} />
            {/* Commented out: Public job board route */}
            {/* <Route path="/jobs" element={<JobBoardPage />} /> */}
            {/* <Route path="/careers/jobs/:jobId" element={<JobDetailPage />} /> */}
            <Route
              path="/signin"
              element={<SignIn />}
            />
            <Route
              path="/register"
              element={<RegisterPage />}
            />
            <Route
              path="/forgot-password"
              element={<ForgotPasswordPage />}
            />
            <Route
              path="/reset-password"
              element={<ResetPasswordWithTokenPage />}
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
            {/* <Route
              path="/job-seeker/register"
              element={<JobSeekerRegisterPage />}
            /> */}
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
              
              {/* Email Detail */}
              <Route path="/communication/email/:emailId" element={
                <RoutePermissionGuard>
                  <EmailDetailPage />
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
            {/* Commented out: Request demo route */}
            {/* <Route
              path="/request-demo"
              element={<RequestDemoPage />}
            /> */}
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
                    </Suspense>
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

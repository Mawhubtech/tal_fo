import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import ExternalUserGuard from './components/ExternalUserGuard';
import SignIn from './components/SignIn';
import OrganizationSignIn from './components/OrganizationSignIn';
import OAuthCallback from './components/OAuthCallback';
import LandingPage from './pages/LandingPage';
import JobBoardPage from './pages/jobSeeker/JobBoardPage';
import JobDetailPage from './pages/jobSeeker/JobDetailPage';
import JobSeekerLoginPage from './pages/jobSeeker/JobSeekerLoginPage';
import JobSeekerRegisterPage from './pages/jobSeeker/JobSeekerRegisterPage';
import JobSeekerAdminPage from './pages/jobSeeker/admin/JobSeekerAdminPage';
import Dashboard from './pages/Dashboard';
import RequestDemoPage from './pages/RequestDemoPage';
import AcceptInvitationPage from './pages/hiring-teams/AcceptInvitationPage';
import InvitationAcceptedPage from './pages/hiring-teams/InvitationAcceptedPage';
import ExternalTeamAccessPage from './pages/hiring-teams/ExternalTeamAccessPage';
import ExternalUserLayout from './layouts/ExternalUserLayout';
import ExternalJobsPage from './pages/external/ExternalJobsPage';
import ExternalJobDetailPage from './pages/external/ExternalJobDetailPage';
import ExternalSettingsPage from './pages/external/ExternalSettingsPage';
import ExternalUserRegisterPage from './pages/external/ExternalUserRegisterPage';
import JobEmailSequencesPage from './recruitment/organizations/pages/JobEmailSequencesPage';
import JobSequenceDetailPage from './recruitment/organizations/pages/JobSequenceDetailPage';
import JobSequenceStepsPage from './recruitment/organizations/pages/JobSequenceStepsPage';
import JobEmailTemplatesPage from './recruitment/organizations/pages/JobEmailTemplatesPage';
import CreateJobEmailSequencePage from './recruitment/organizations/pages/CreateJobEmailSequencePage';
import { QueryProvider } from './providers/QueryProvider';

function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ToastProvider>
          <AuthProvider>        <Router>          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/jobs" element={<JobBoardPage />} />
            <Route path="/jobs/:jobId" element={<JobDetailPage />} />
            <Route
              path="/signin"
              element={<SignIn />}
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
            {/* Updated Dashboard Route to handle nested routes */}
            <Route
              path="/dashboard/*" // Add /* to allow nested routes
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
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
        </AuthProvider>
        </ToastProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
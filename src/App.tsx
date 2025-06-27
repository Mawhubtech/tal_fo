import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import SignIn from './components/SignIn';
import OAuthCallback from './components/OAuthCallback';
import LandingPage from './pages/LandingPage';
import JobBoardPage from './pages/jobSeeker/JobBoardPage';
import JobSeekerLoginPage from './pages/jobSeeker/JobSeekerLoginPage';
import JobSeekerRegisterPage from './pages/jobSeeker/JobSeekerRegisterPage';
import JobSeekerAdminPage from './pages/jobSeeker/admin/JobSeekerAdminPage';
import Dashboard from './pages/Dashboard';
import RequestDemoPage from './pages/RequestDemoPage';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>        <Router>          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/jobs" element={<JobBoardPage />} />
            <Route
              path="/signin"
              element={<SignIn />}
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
            {/* Remove individual /dashboard/resume-processing and /dashboard/sequences routes as they are handled by Dashboard.tsx */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        </AuthProvider>
        </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
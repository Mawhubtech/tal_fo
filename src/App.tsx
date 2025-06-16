import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import SignIn from './components/SignIn';
import OAuthCallback from './components/OAuthCallback';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import RequestDemoPage from './pages/RequestDemoPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/signin"
              element={<SignIn />}
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
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
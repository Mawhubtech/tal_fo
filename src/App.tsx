import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PreviewVideo from './components/PreviewVideo';
import PartnersSlider from './components/PartnersSlider';
import NaturalLanguageSearch from './components/NaturalLanguageSearch'; 
import DataSourcesSearch from './components/DataSourcesSearch';
import ProfileEvaluation from './components/ProfileEvaluation';
import EmailSequences from './components/EmailSequences';
import GlobalReach from './components/GlobalReach';
import TabFeatures from './components/TabFeatures';
import Integrations from './components/Integrations';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import SignIn from './components/SignIn';
import OAuthCallback from './components/OAuthCallback';
import Dashboard from './pages/Dashboard';
import ResumeProcessingPage from './pages/ResumeProcessingPage';
import EmailSequencesPage from './pages/EmailSequencesPage'; // Import EmailSequencesPage

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
          <AuthProvider>
            <Router>
          <Routes>
            <Route path="/" element={
              <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900 font-sans">
                <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
                <Navbar />
                <main className="space-y-16">
                  <Hero />
                  <PartnersSlider />
                  <NaturalLanguageSearch />
                  <DataSourcesSearch />
                  <ProfileEvaluation />
                  <EmailSequences />
                  <GlobalReach />
                  <TabFeatures />
                  <Integrations />
                  <FAQ />
                </main>
                <Footer />              </div>
            } />            <Route
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
            {/* Remove individual /dashboard/resume-processing and /dashboard/sequences routes as they are handled by Dashboard.tsx */}            <Route path="*" element={<Navigate to="/" replace />} />
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
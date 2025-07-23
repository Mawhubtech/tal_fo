import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ClientOutreachProjectsPage from './ClientOutreachProjectsPage';
import CreateProjectPage from './CreateProjectPage';
import ProjectDetailPage from './ProjectDetailPage';
import ProjectSearchesPage from './ProjectSearchesPage';
import CreateSearchPage from './CreateSearchPage';
import ProjectProspectsPage from './ProjectProspectsPage';
import ProjectAnalyticsPage from './ProjectAnalyticsPage';

const ClientOutreachRouter: React.FC = () => {
  return (
    <Routes>
      {/* Main projects list */}
      <Route index element={<ClientOutreachProjectsPage />} />
      <Route path="projects" element={<ClientOutreachProjectsPage />} />
      
      {/* Create new project */}
      <Route path="create" element={<CreateProjectPage />} />
      
      {/* Project detail routes */}
      <Route path="projects/:id" element={<ProjectDetailPage />} />
      <Route path="projects/:id/searches" element={<ProjectSearchesPage />} />
      <Route path="projects/:id/searches/create" element={<CreateSearchPage />} />
      <Route path="projects/:id/prospects" element={<ProjectProspectsPage />} />
      <Route path="projects/:id/analytics" element={<ProjectAnalyticsPage />} />
      
      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/dashboard/client-outreach" replace />} />
    </Routes>
  );
};

export default ClientOutreachRouter;

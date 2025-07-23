import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ClientOutreachProjectsPage from './ClientOutreachProjectsPage';
import CreateProjectPage from './CreateProjectPage';
import ProjectDetailPage from './ProjectDetailPage';
import ProjectSearchesPage from './ProjectSearchesPage';
import ClientSearchPage from './ClientSearchPage';
import SearchResultsPage from './SearchResultsPage';
import SearchResultsListPage from './SearchResultsListPage';
import CompanyDetailPage from './CompanyDetailPage';
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
      <Route path="projects/:id/search" element={<ClientSearchPage />} />
      <Route path="searches/:searchId/results" element={<SearchResultsPage />} />
      <Route path="search-results" element={<SearchResultsListPage />} />
      <Route path="company-detail" element={<CompanyDetailPage />} />
      <Route path="projects/:id/prospects" element={<ProjectProspectsPage />} />
      <Route path="projects/:id/analytics" element={<ProjectAnalyticsPage />} />
      
      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/dashboard/client-outreach" replace />} />
    </Routes>
  );
};

export default ClientOutreachRouter;

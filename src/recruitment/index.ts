// Main recruitment module exports
export { default as JobDescriptionDialog } from './components/JobDescriptionDialog';

// Job pages
export { default as AllJobsPage } from './jobs/pages/AllJobsPage';
export { default as CreateJobPage } from './jobs/pages/CreateJobPage';
export { default as ArchivedJobsPage } from './jobs/pages/ArchivedJobsPage';
export { default as JobBoardConfigPage } from './jobs/pages/JobBoardConfigPage';

// Organization pages (Hierarchical Flow)
export { default as OrganizationsPage } from './organizations/pages/OrganizationsPage';
export { default as DepartmentsPage } from './organizations/pages/DepartmentsPage';
export { default as DepartmentJobsPage } from './organizations/pages/DepartmentJobsPage';
export { default as JobATSPage } from './organizations/pages/JobATSPage';

// ATS functionality now integrated into JobATSPage - legacy pages removed

// Candidate pages
export { default as CandidateProfilesPage } from './candidates/pages/CandidateProfilesPage';

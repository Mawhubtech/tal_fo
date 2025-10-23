// Export all mock data and types
export * from './types';
export { mockCandidatesByJob } from './candidates';
export { mockTasksByJob } from './tasks';
export { mockInterviewsByJob } from './interviews';
export { mockReportsByJob } from './reports';

// Utility function to get mock data key mapping
export const getMockJobKey = (id: string): string => {
  const jobIdMap: Record<string, string> = {
    '1': 'job-101',  // Senior Frontend Developer -> Frontend Engineer mock data
    '2': 'job-201',  // Product Manager -> Product Manager mock data  
    '3': 'job-101',  // UX Designer -> use Frontend Engineer data as fallback
    '4': 'job-101',  // DevOps Engineer -> use Frontend Engineer data as fallback
  };
  return jobIdMap[id] || 'job-101';
};

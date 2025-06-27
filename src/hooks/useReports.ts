import { useQuery } from '@tanstack/react-query';
import { reportsApiService, type JobReport, type JobReportQuery } from '../recruitment/organizations/services/reportsApiService';

export const useJobReport = (jobId: string, query?: JobReportQuery) => {
  return useQuery<JobReport, Error>({
    queryKey: ['jobReport', jobId, query],
    queryFn: () => reportsApiService.getJobReport(jobId, query),
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2,
  });
};

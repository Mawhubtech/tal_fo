import { useQuery } from '@tanstack/react-query';
import { jobApiService } from '../services/jobApiService';

export const useExternalUserJobs = () => {
  return useQuery({
    queryKey: ['external', 'jobs'],
    queryFn: () => jobApiService.getExternalUserJobs(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useExternalJobDetail = (jobId: string) => {
  return useQuery({
    queryKey: ['external', 'jobs', jobId],
    queryFn: () => jobApiService.getExternalJobDetail(jobId),
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

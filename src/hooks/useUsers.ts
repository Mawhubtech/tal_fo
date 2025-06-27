import { useQuery } from '@tanstack/react-query';
import { userApiService, AssignableUser } from '../recruitment/organizations/services/userApiService';

// Hook to get assignable users
export const useAssignableUsers = () => {
  return useQuery<AssignableUser[], Error>({
    queryKey: ['assignable-users'],
    queryFn: userApiService.getAssignableUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

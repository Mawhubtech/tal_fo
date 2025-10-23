import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobBoardApiService, JobBoard, JobBoardConnection, CreateJobBoardConnectionData, UpdateJobBoardConnectionData } from '../services/jobBoardApiService';

// Query keys for React Query
const jobBoardKeys = {
  all: ['jobBoards'] as const,
  connections: (clientId: string) => ['jobBoards', 'connections', clientId] as const,
  available: () => ['jobBoards', 'available'] as const,
  connection: (id: string) => ['jobBoards', 'connection', id] as const,
};

// Hook to get job board connections for a client
export const useJobBoardConnections = (clientId: string) => {
  return useQuery({
    queryKey: jobBoardKeys.connections(clientId),
    queryFn: () => jobBoardApiService.getJobBoardConnections(clientId),
    enabled: !!clientId,
  });
};

// Hook to get all available job boards
export const useAvailableJobBoards = () => {
  return useQuery({
    queryKey: jobBoardKeys.available(),
    queryFn: () => jobBoardApiService.getAvailableJobBoards(),
  });
};

// Hook to get a single job board connection
export const useJobBoardConnection = (id: string) => {
  return useQuery({
    queryKey: jobBoardKeys.connection(id),
    queryFn: () => jobBoardApiService.getJobBoardConnection(id),
    enabled: !!id,
  });
};

// Hook to create a new job board connection
export const useCreateJobBoardConnection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJobBoardConnectionData) => 
      jobBoardApiService.createJobBoardConnection(data),
    onSuccess: (newConnection) => {
      // Invalidate and refetch connections for this client
      queryClient.invalidateQueries({
        queryKey: jobBoardKeys.connections(newConnection.data.clientId)
      });
    },
  });
};

// Hook to update a job board connection
export const useUpdateJobBoardConnection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJobBoardConnectionData }) => 
      jobBoardApiService.updateJobBoardConnection(id, data),
    onSuccess: (updatedConnection) => {
      // Update the specific connection in cache
      queryClient.setQueryData(
        jobBoardKeys.connection(updatedConnection.data.id),
        updatedConnection.data
      );
      
      // Invalidate connections list for this client
      queryClient.invalidateQueries({
        queryKey: jobBoardKeys.connections(updatedConnection.data.clientId)
      });
    },
  });
};

// Hook to delete a job board connection
export const useDeleteJobBoardConnection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => jobBoardApiService.deleteJobBoardConnection(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: jobBoardKeys.connection(deletedId)
      });
      
      // Invalidate all connections (we don't know which client this belonged to)
      queryClient.invalidateQueries({
        queryKey: jobBoardKeys.all
      });
    },
  });
};

// Hook to toggle job board connection status
export const useToggleJobBoardConnection = () => {
  const updateMutation = useUpdateJobBoardConnection();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      updateMutation.mutateAsync({ id, data: { status: isActive ? 'active' : 'inactive' } as UpdateJobBoardConnectionData }),
  });
};
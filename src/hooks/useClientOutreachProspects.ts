import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clientOutreachProjectApiService, {
  ClientProspect,
} from '../services/clientOutreachProjectApiService';
import { toast } from '../components/ToastContainer';

// Query keys
export const clientProspectKeys = {
  all: ['clientProspects'] as const,
  lists: () => [...clientProspectKeys.all, 'list'] as const,
  list: (projectId: string, filters?: Record<string, any>, page?: number, limit?: number) =>
    [...clientProspectKeys.lists(), { projectId, filters, page, limit }] as const,
  details: () => [...clientProspectKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientProspectKeys.details(), id] as const,
};

// Custom hooks
export const useClientOutreachProjectProspects = (
  projectId: string,
  page: number = 1,
  limit: number = 10,
  filters?: Record<string, any>
) => {
  return useQuery({
    queryKey: clientProspectKeys.list(projectId, filters, page, limit),
    queryFn: () => clientOutreachProjectApiService.getProjectProspects(projectId, page, limit, filters),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useClientProspect = (id: string) => {
  return useQuery({
    queryKey: clientProspectKeys.detail(id),
    queryFn: () => clientOutreachProjectApiService.getProspect(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateClientProspect = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClientProspect> }) =>
      clientOutreachProjectApiService.updateProspect(id, data),
    onSuccess: (updatedProspect) => {
      // Update the prospect in the cache
      queryClient.setQueryData(
        clientProspectKeys.detail(updatedProspect.id),
        updatedProspect
      );
      
      // Invalidate prospects list to update any list views
      queryClient.invalidateQueries({ queryKey: clientProspectKeys.lists() });
      
      toast.success('Prospect updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update prospect';
      toast.error(message);
    },
  });
};

export const useDeleteClientProspect = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientOutreachProjectApiService.deleteProspect(id),
    onSuccess: (_, prospectId) => {
      // Remove the prospect from cache
      queryClient.removeQueries({ queryKey: clientProspectKeys.detail(prospectId) });
      
      // Invalidate prospects lists
      queryClient.invalidateQueries({ queryKey: clientProspectKeys.lists() });
      
      toast.success('Prospect deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete prospect';
      toast.error(message);
    },
  });
};

export const useBulkUpdateClientProspects = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ prospectIds, updates }: { prospectIds: string[]; updates: Partial<ClientProspect> }) =>
      clientOutreachProjectApiService.bulkUpdateProspects(prospectIds, updates),
    onSuccess: (updatedProspects) => {
      // Update each prospect in the cache
      updatedProspects.forEach(prospect => {
        queryClient.setQueryData(
          clientProspectKeys.detail(prospect.id),
          prospect
        );
      });
      
      // Invalidate prospects lists
      queryClient.invalidateQueries({ queryKey: clientProspectKeys.lists() });
      
      toast.success(`Successfully updated ${updatedProspects.length} prospects`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update prospects';
      toast.error(message);
    },
  });
};

export const useExportClientProspects = () => {
  return useMutation({
    mutationFn: ({ 
      projectId, 
      format = 'csv', 
      filters 
    }: { 
      projectId: string; 
      format?: 'csv' | 'xlsx'; 
      filters?: Record<string, any> 
    }) =>
      clientOutreachProjectApiService.exportProspects(projectId, format, filters),
    onSuccess: (blob, { format }) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `client-prospects-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Prospects exported successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to export prospects';
      toast.error(message);
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BackupApiService } from '../services/backupApiService';
import { toast } from '../components/ToastContainer';

// Query keys
export const backupKeys = {
  all: ['backups'] as const,
  list: () => [...backupKeys.all, 'list'] as const,
  stats: () => [...backupKeys.all, 'stats'] as const,
};

/**
 * Get list of all backups
 */
export function useBackups() {
  return useQuery({
    queryKey: backupKeys.list(),
    queryFn: BackupApiService.listBackups,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Get backup statistics
 */
export function useBackupStats() {
  return useQuery({
    queryKey: backupKeys.stats(),
    queryFn: BackupApiService.getBackupStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Create a new backup
 */
export function useCreateBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (type: 'manual' | 'scheduled' = 'manual') => 
      BackupApiService.createBackup(type),
    onSuccess: (data) => {
      // Invalidate and refetch backup list
      queryClient.invalidateQueries({ queryKey: backupKeys.list() });
      queryClient.invalidateQueries({ queryKey: backupKeys.stats() });
      
      if (data.success) {
        toast.success('Backup Created', 'Database backup created successfully!');
      } else {
        toast.error('Backup Failed', 'Failed to create backup');
      }
    },
    onError: (error: any) => {
      console.error('Backup creation failed:', error);
      toast.error('Backup Failed', error.response?.data?.message || 'Failed to create backup');
    },
  });
}

/**
 * Delete a backup
 */
export function useDeleteBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (filename: string) => BackupApiService.deleteBackup(filename),
    onSuccess: (data, filename) => {
      // Invalidate and refetch backup list
      queryClient.invalidateQueries({ queryKey: backupKeys.list() });
      queryClient.invalidateQueries({ queryKey: backupKeys.stats() });
      
      if (data.success) {
        toast.success('Backup Deleted', `Backup "${filename}" deleted successfully!`);
      } else {
        toast.error('Delete Failed', 'Failed to delete backup');
      }
    },
    onError: (error: any) => {
      console.error('Backup deletion failed:', error);
      toast.error('Delete Failed', error.response?.data?.message || 'Failed to delete backup');
    },
  });
}

/**
 * Download a backup
 */
export function useDownloadBackup() {
  return useMutation({
    mutationFn: (filename: string) => BackupApiService.downloadBackup(filename),
    onSuccess: (_, filename) => {
      toast.success('Download Started', `Backup "${filename}" download started!`);
    },
    onError: (error: any) => {
      console.error('Backup download failed:', error);
      toast.error('Download Failed', error.response?.data?.message || 'Failed to download backup');
    },
  });
}

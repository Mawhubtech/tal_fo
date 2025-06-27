import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApiService, Task, CreateTaskData, UpdateTaskData, TaskStats } from '../recruitment/organizations/services/taskApiService';

// Query keys
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...taskKeys.lists(), { filters }] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  byJob: (jobId: string) => [...taskKeys.all, 'byJob', jobId] as const,
  stats: (jobId: string) => [...taskKeys.all, 'stats', jobId] as const,
};

// Hooks
export const useTasksByJobId = (jobId: string) => {
  return useQuery({
    queryKey: taskKeys.byJob(jobId),
    queryFn: () => taskApiService.getTasksByJobId(jobId),
    enabled: !!jobId,
  });
};

export const useTaskStats = (jobId: string) => {
  return useQuery({
    queryKey: taskKeys.stats(jobId),
    queryFn: () => taskApiService.getTaskStats(jobId),
    enabled: !!jobId,
  });
};

export const useTask = (taskId: string) => {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => taskApiService.getTaskById(taskId),
    enabled: !!taskId,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskData: CreateTaskData) => taskApiService.createTask(taskData),
    onSuccess: (newTask) => {
      // Invalidate tasks for the job
      queryClient.invalidateQueries({ queryKey: taskKeys.byJob(newTask.jobId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.stats(newTask.jobId) });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, taskData }: { taskId: string; taskData: UpdateTaskData }) => 
      taskApiService.updateTask(taskId, taskData),
    onSuccess: (updatedTask) => {
      // Update the specific task in cache
      queryClient.setQueryData(taskKeys.detail(updatedTask.id), updatedTask);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: taskKeys.byJob(updatedTask.jobId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.stats(updatedTask.jobId) });
    },
  });
};

export const useMarkTaskCompleted = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: string) => taskApiService.markTaskAsCompleted(taskId),
    onSuccess: (updatedTask) => {
      // Update the specific task in cache
      queryClient.setQueryData(taskKeys.detail(updatedTask.id), updatedTask);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: taskKeys.byJob(updatedTask.jobId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.stats(updatedTask.jobId) });
    },
  });
};

export const useAssignTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) => 
      taskApiService.assignTask(taskId, userId),
    onSuccess: (updatedTask) => {
      // Update the specific task in cache
      queryClient.setQueryData(taskKeys.detail(updatedTask.id), updatedTask);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: taskKeys.byJob(updatedTask.jobId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.stats(updatedTask.jobId) });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: string) => taskApiService.deleteTask(taskId),
    onSuccess: (_, taskId) => {
      // Remove the specific task from cache
      queryClient.removeQueries({ queryKey: taskKeys.detail(taskId) });
      
      // Invalidate all task lists to refresh them
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PositionApiService, type Position, type CreatePositionDto, type UpdatePositionDto, type PositionQueryParams } from '../services/positionApiService';

// Query Keys
export const positionKeys = {
  all: ['positions'] as const,
  lists: () => [...positionKeys.all, 'list'] as const,
  list: (params?: PositionQueryParams) => [...positionKeys.lists(), params] as const,
  byClient: (clientId: string) => [...positionKeys.all, 'byClient', clientId] as const,
  byDepartment: (departmentId: string) => [...positionKeys.all, 'byDepartment', departmentId] as const,
  detail: (id: string) => [...positionKeys.all, 'detail', id] as const,
  hierarchy: (clientId: string) => [...positionKeys.all, 'hierarchy', clientId] as const,
  organizationChart: (clientId: string, departmentId?: string) => [
    ...positionKeys.all, 
    'organizationChart', 
    clientId, 
    departmentId
  ] as const,
  subordinates: (positionId: string) => [...positionKeys.all, 'subordinates', positionId] as const,
  availableParents: (clientId: string, positionId?: string) => [
    ...positionKeys.all, 
    'availableParents', 
    clientId, 
    positionId
  ] as const,
  stats: (clientId: string) => [...positionKeys.all, 'stats', clientId] as const,
};

const positionApiService = new PositionApiService();

// Get all positions with filtering
export const usePositions = (params?: PositionQueryParams) => {
  return useQuery({
    queryKey: positionKeys.list(params),
    queryFn: () => positionApiService.getPositions(params),
  });
};

// Get positions by client
export const usePositionsByClient = (clientId: string, params?: Omit<PositionQueryParams, 'clientId'>) => {
  return useQuery({
    queryKey: positionKeys.byClient(clientId),
    queryFn: () => positionApiService.getPositionsByClient(clientId, params),
    enabled: !!clientId,
  });
};

// Get positions by department
export const usePositionsByDepartment = (departmentId: string, params?: Omit<PositionQueryParams, 'departmentId'>) => {
  return useQuery({
    queryKey: positionKeys.byDepartment(departmentId),
    queryFn: () => positionApiService.getPositionsByDepartment(departmentId, params),
    enabled: !!departmentId,
  });
};

// Get single position
export const usePosition = (id: string) => {
  return useQuery({
    queryKey: positionKeys.detail(id),
    queryFn: () => positionApiService.getPosition(id),
    enabled: !!id,
  });
};

// Get position hierarchy for organization chart
export const usePositionHierarchy = (clientId: string) => {
  return useQuery({
    queryKey: positionKeys.hierarchy(clientId),
    queryFn: () => positionApiService.getPositionHierarchy(clientId),
    enabled: !!clientId,
  });
};

// Get organization chart data
export const useOrganizationChart = (clientId: string, departmentId?: string) => {
  return useQuery({
    queryKey: positionKeys.organizationChart(clientId, departmentId),
    queryFn: () => positionApiService.getOrganizationChart(clientId, departmentId),
    enabled: !!clientId,
  });
};

// Get subordinates of a position
export const useSubordinates = (positionId: string) => {
  return useQuery({
    queryKey: positionKeys.subordinates(positionId),
    queryFn: () => positionApiService.getSubordinates(positionId),
    enabled: !!positionId,
  });
};

// Get available parent positions
export const useAvailableParents = (clientId: string, positionId?: string) => {
  return useQuery({
    queryKey: positionKeys.availableParents(clientId, positionId),
    queryFn: () => positionApiService.getAvailableParents(clientId, positionId),
    enabled: !!clientId,
  });
};

// Get organization statistics
export const useOrganizationStats = (clientId: string) => {
  return useQuery({
    queryKey: positionKeys.stats(clientId),
    queryFn: () => positionApiService.getOrganizationStats(clientId),
    enabled: !!clientId,
  });
};

// Create position mutation
export const useCreatePosition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePositionDto) => positionApiService.createPosition(data),
    onSuccess: (newPosition) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: positionKeys.byClient(newPosition.clientId) });
      queryClient.invalidateQueries({ queryKey: positionKeys.hierarchy(newPosition.clientId) });
      queryClient.invalidateQueries({ queryKey: positionKeys.organizationChart(newPosition.clientId) });
      queryClient.invalidateQueries({ queryKey: positionKeys.stats(newPosition.clientId) });
      queryClient.invalidateQueries({ queryKey: positionKeys.lists() });
      
      if (newPosition.departmentId) {
        queryClient.invalidateQueries({ queryKey: positionKeys.byDepartment(newPosition.departmentId) });
        queryClient.invalidateQueries({ queryKey: positionKeys.organizationChart(newPosition.clientId, newPosition.departmentId) });
      }
      
      if (newPosition.parentId) {
        queryClient.invalidateQueries({ queryKey: positionKeys.subordinates(newPosition.parentId) });
      }
    },
  });
};

// Update position mutation
export const useUpdatePosition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePositionDto }) => 
      positionApiService.updatePosition(id, data),
    onSuccess: (updatedPosition) => {
      // Update the position in cache
      queryClient.setQueryData(
        positionKeys.detail(updatedPosition.id),
        updatedPosition
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: positionKeys.byClient(updatedPosition.clientId) });
      queryClient.invalidateQueries({ queryKey: positionKeys.hierarchy(updatedPosition.clientId) });
      queryClient.invalidateQueries({ queryKey: positionKeys.organizationChart(updatedPosition.clientId) });
      queryClient.invalidateQueries({ queryKey: positionKeys.stats(updatedPosition.clientId) });
      queryClient.invalidateQueries({ queryKey: positionKeys.lists() });
      
      if (updatedPosition.departmentId) {
        queryClient.invalidateQueries({ queryKey: positionKeys.byDepartment(updatedPosition.departmentId) });
        queryClient.invalidateQueries({ queryKey: positionKeys.organizationChart(updatedPosition.clientId, updatedPosition.departmentId) });
      }
      
      if (updatedPosition.parentId) {
        queryClient.invalidateQueries({ queryKey: positionKeys.subordinates(updatedPosition.parentId) });
      }
    },
  });
};

// Delete position mutation
export const useDeletePosition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => positionApiService.deletePosition(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: positionKeys.detail(deletedId) });
      queryClient.removeQueries({ queryKey: positionKeys.subordinates(deletedId) });
      
      // Invalidate all related queries since we don't know the client/department context
      queryClient.invalidateQueries({ queryKey: positionKeys.all });
    },
  });
};

// Move position mutation
export const useMovePosition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, newParentId }: { id: string; newParentId?: string }) => 
      positionApiService.movePosition(id, newParentId),
    onSuccess: (movedPosition) => {
      // Update the position in cache
      queryClient.setQueryData(
        positionKeys.detail(movedPosition.id),
        movedPosition
      );
      
      // Invalidate hierarchy and organization chart queries
      queryClient.invalidateQueries({ queryKey: positionKeys.byClient(movedPosition.clientId) });
      queryClient.invalidateQueries({ queryKey: positionKeys.hierarchy(movedPosition.clientId) });
      queryClient.invalidateQueries({ queryKey: positionKeys.organizationChart(movedPosition.clientId) });
      
      if (movedPosition.departmentId) {
        queryClient.invalidateQueries({ queryKey: positionKeys.organizationChart(movedPosition.clientId, movedPosition.departmentId) });
      }
      
      // Invalidate subordinates queries for old and new parents
      if (movedPosition.parentId) {
        queryClient.invalidateQueries({ queryKey: positionKeys.subordinates(movedPosition.parentId) });
      }
    },
  });
};

// Bulk create positions mutation
export const useBulkCreatePositions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ clientId, positions }: { clientId: string; positions: CreatePositionDto[] }) => 
      positionApiService.bulkCreatePositions(clientId, positions),
    onSuccess: (newPositions, { clientId }) => {
      // Invalidate all related queries for the client
      queryClient.invalidateQueries({ queryKey: positionKeys.byClient(clientId) });
      queryClient.invalidateQueries({ queryKey: positionKeys.hierarchy(clientId) });
      queryClient.invalidateQueries({ queryKey: positionKeys.organizationChart(clientId) });
      queryClient.invalidateQueries({ queryKey: positionKeys.stats(clientId) });
      queryClient.invalidateQueries({ queryKey: positionKeys.lists() });
      
      // Invalidate department-specific queries
      const departmentIds = new Set(
        newPositions
          .map(pos => pos.departmentId)
          .filter(Boolean) as string[]
      );
      
      departmentIds.forEach(deptId => {
        queryClient.invalidateQueries({ queryKey: positionKeys.byDepartment(deptId) });
        queryClient.invalidateQueries({ queryKey: positionKeys.organizationChart(clientId, deptId) });
      });
    },
  });
};

// Validate hierarchy query
export const useValidateHierarchy = (clientId: string, positionId?: string, newParentId?: string) => {
  return useQuery({
    queryKey: ['validateHierarchy', clientId, positionId, newParentId],
    queryFn: () => positionApiService.validateHierarchy(clientId, positionId, newParentId),
    enabled: !!clientId && (!!positionId || !!newParentId),
    staleTime: 0, // Always fresh for validation
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractApiService } from '../services/contractApiService';
import type {
  Contract,
  CreateContractDto,
  UpdateContractDto,
  ContractQueryParams,
  ContractsResponse,
  ContractStats,
} from '../types/contract.types';

// Query Keys
export const contractKeys = {
  all: ['contracts'] as const,
  client: (clientId: string) => [...contractKeys.all, 'client', clientId] as const,
  contracts: (clientId: string, params?: ContractQueryParams) => [...contractKeys.client(clientId), 'list', params] as const,
  contract: (clientId: string, contractId: string) => [...contractKeys.client(clientId), 'detail', contractId] as const,
  stats: (clientId: string) => [...contractKeys.client(clientId), 'stats'] as const,
};

// Get contracts for a client
export const useContracts = (clientId: string, params?: ContractQueryParams) => {
  return useQuery({
    queryKey: contractKeys.contracts(clientId, params),
    queryFn: () => contractApiService.getClientContracts(clientId, params),
    enabled: !!clientId,
  });
};

// Get a specific contract
export const useContract = (clientId: string, contractId: string) => {
  return useQuery({
    queryKey: contractKeys.contract(clientId, contractId),
    queryFn: () => contractApiService.getContractById(clientId, contractId),
    enabled: !!clientId && !!contractId,
  });
};

// Get contract stats
export const useContractStats = (clientId: string) => {
  return useQuery({
    queryKey: contractKeys.stats(clientId),
    queryFn: () => contractApiService.getContractStats(clientId),
    enabled: !!clientId,
  });
};

// Create contract mutation
export const useCreateContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, contractData }: { clientId: string; contractData: CreateContractDto }) =>
      contractApiService.createContract(clientId, contractData),
    onSuccess: (data, variables) => {
      // Invalidate and refetch contracts list
      queryClient.invalidateQueries({ queryKey: contractKeys.client(variables.clientId) });
    },
  });
};

// Update contract mutation
export const useUpdateContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      clientId, 
      contractId, 
      contractData 
    }: { 
      clientId: string; 
      contractId: string; 
      contractData: UpdateContractDto; 
    }) => contractApiService.updateContract(clientId, contractId, contractData),
    onSuccess: (data, variables) => {
      // Update the specific contract in cache
      queryClient.setQueryData(
        contractKeys.contract(variables.clientId, variables.contractId),
        data
      );
      // Invalidate contracts list to refresh
      queryClient.invalidateQueries({ queryKey: contractKeys.contracts(variables.clientId) });
      queryClient.invalidateQueries({ queryKey: contractKeys.stats(variables.clientId) });
    },
  });
};

// Delete contract mutation
export const useDeleteContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, contractId }: { clientId: string; contractId: string }) =>
      contractApiService.deleteContract(clientId, contractId),
    onSuccess: (data, variables) => {
      // Remove the contract from cache
      queryClient.removeQueries({ queryKey: contractKeys.contract(variables.clientId, variables.contractId) });
      // Invalidate contracts list to refresh
      queryClient.invalidateQueries({ queryKey: contractKeys.client(variables.clientId) });
    },
  });
};

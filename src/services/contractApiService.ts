import apiClient from './api';
import type {
  Contract,
  CreateContractDto,
  UpdateContractDto,
  ContractQueryParams,
  ContractsResponse,
  ContractStats,
} from '../types/contract.types';

export class ContractApiService {
  private getBasePath(clientId: string) {
    return `/clients/${clientId}/contracts`;
  }

  async getClientContracts(clientId: string, params?: ContractQueryParams): Promise<ContractsResponse> {
    const response = await apiClient.get(this.getBasePath(clientId), { params });
    return response.data;
  }

  async getContractById(clientId: string, contractId: string): Promise<Contract> {
    const response = await apiClient.get(`${this.getBasePath(clientId)}/${contractId}`);
    return response.data;
  }

  async createContract(clientId: string, contractData: CreateContractDto): Promise<Contract> {
    const response = await apiClient.post(this.getBasePath(clientId), contractData);
    return response.data;
  }

  async updateContract(clientId: string, contractId: string, contractData: UpdateContractDto): Promise<Contract> {
    const response = await apiClient.patch(`${this.getBasePath(clientId)}/${contractId}`, contractData);
    return response.data;
  }

  async deleteContract(clientId: string, contractId: string): Promise<void> {
    await apiClient.delete(`${this.getBasePath(clientId)}/${contractId}`);
  }

  async getContractStats(clientId: string): Promise<ContractStats> {
    const response = await apiClient.get(`${this.getBasePath(clientId)}/stats`);
    return response.data;
  }

  async downloadContractPDF(clientId: string, contractId: string): Promise<Blob> {
    const response = await apiClient.get(`${this.getBasePath(clientId)}/${contractId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export const contractApiService = new ContractApiService();

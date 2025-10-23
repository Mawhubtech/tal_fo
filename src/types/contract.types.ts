export enum ContractStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  PENDING = 'pending',
}

export enum ContractType {
  RECRUITMENT_SERVICES = 'recruitment_services',
  CONTINGENCY = 'contingency',
  RETAINED_SEARCH = 'retained_search',
  TEMPORARY_STAFFING = 'temporary_staffing',
  PERMANENT_PLACEMENT = 'permanent_placement',
}

export interface PaymentTerms {
  paymentMethod?: string;
  paymentSchedule?: string;
  invoicingFrequency?: string;
  currency?: string;
  additionalTerms?: string;
}

export interface Deliverable {
  description?: string;
  quantity?: number;
  timeline?: string;
  metrics?: string[];
}

export interface ContactPerson {
  name?: string;
  email?: string;
  phone?: string;
  title?: string;
}

export interface Contract {
  id: string;
  title: string;
  contractType: ContractType;
  status: ContractStatus;
  startDate: string;
  endDate: string;
  contractValue?: number;
  commissionRate?: number;
  description?: string;
  terms?: string;
  paymentTerms?: PaymentTerms;
  deliverables?: Deliverable[];
  contactPerson?: ContactPerson;
  isAutoRenewal: boolean;
  renewalPeriodMonths?: number;
  documentUrl?: string;
  clientId: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  updater?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateContractDto {
  title: string;
  contractType: ContractType;
  status?: ContractStatus;
  startDate: string;
  endDate: string;
  contractValue?: number;
  commissionRate?: number;
  description?: string;
  terms?: string;
  paymentTerms?: PaymentTerms;
  deliverables?: Deliverable[];
  contactPerson?: ContactPerson;
  isAutoRenewal?: boolean;
  renewalPeriodMonths?: number;
  documentUrl?: string;
}

export interface UpdateContractDto extends Partial<CreateContractDto> {}

export interface ContractQueryParams {
  search?: string;
  status?: ContractStatus;
  contractType?: ContractType;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ContractsResponse {
  contracts: Contract[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ContractStats {
  total: number;
  active: number;
  draft: number;
  expired: number;
  terminated: number;
  pending: number;
  totalActiveValue: number;
  totalValue: number;
}

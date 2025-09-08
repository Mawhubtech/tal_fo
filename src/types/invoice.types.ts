export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface BillingAddress {
  name: string;
  company: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode?: string;
}

export interface PaymentTerms {
  paymentMethod: string;
  bankDetails?: BankDetails;
}

export interface PaymentDetails {
  transactionId?: string;
  bankReference?: string;
  checkNumber?: string;
  cardLastFour?: string;
  processingFee?: number;
}

export type InvoiceStatus = 
  | 'draft' 
  | 'sent' 
  | 'viewed' 
  | 'overdue' 
  | 'paid' 
  | 'partially_paid' 
  | 'cancelled';

export type InvoiceType = 
  | 'contract_based' 
  | 'general' 
  | 'recruitment_fee' 
  | 'retainer' 
  | 'consultation';

export type PaymentMethod = 
  | 'cash' 
  | 'bank_transfer' 
  | 'credit_card' 
  | 'debit_card' 
  | 'check' 
  | 'online_payment' 
  | 'cryptocurrency';

export type ReceiptStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  title: string;
  description?: string;
  type: InvoiceType;
  status: InvoiceStatus;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  sentDate?: string;
  viewedDate?: string;
  paidDate?: string;
  lineItems?: LineItem[];
  billingAddress?: BillingAddress;
  paymentTerms?: PaymentTerms;
  notes?: string;
  termsAndConditions?: string;
  documentUrl?: string;
  clientId: string;
  contractId?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  client?: any;
  contract?: any;
  createdBy?: any;
  receipts?: Receipt[];
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: ReceiptStatus;
  paymentDate: string;
  description?: string;
  notes?: string;
  paymentDetails?: PaymentDetails;
  documentUrl?: string;
  invoiceId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  invoice?: Invoice;
  createdBy?: any;
}

export interface CreateInvoiceRequest {
  title: string;
  description?: string;
  type: InvoiceType;
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  discountRate?: number;
  discountAmount?: number;
  totalAmount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  lineItems?: LineItem[];
  billingAddress?: BillingAddress;
  paymentTerms?: PaymentTerms;
  notes?: string;
  termsAndConditions?: string;
  documentUrl?: string;
  contractId?: string;
}

export interface UpdateInvoiceRequest {
  title?: string;
  description?: string;
  type?: InvoiceType;
  status?: InvoiceStatus;
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  discountRate?: number;
  discountAmount?: number;
  totalAmount?: number;
  paidAmount?: number;
  currency?: string;
  issueDate?: string;
  dueDate?: string;
  sentDate?: string;
  viewedDate?: string;
  paidDate?: string;
  lineItems?: LineItem[];
  billingAddress?: BillingAddress;
  paymentTerms?: PaymentTerms;
  notes?: string;
  termsAndConditions?: string;
  documentUrl?: string;
  contractId?: string;
}

export interface CreateReceiptRequest {
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  description?: string;
  notes?: string;
  paymentDetails?: PaymentDetails;
  documentUrl?: string;
  invoiceId: string;
}

export interface UpdateReceiptRequest {
  amount?: number;
  currency?: string;
  paymentMethod?: PaymentMethod;
  status?: ReceiptStatus;
  paymentDate?: string;
  description?: string;
  notes?: string;
  paymentDetails?: PaymentDetails;
  documentUrl?: string;
}

export interface InvoiceStats {
  totalInvoices: number;
  totalAmount: number;
  totalPaid: number;
  totalOutstanding: number;
  statusCounts: Record<InvoiceStatus, number>;
}

export interface PaginatedInvoices {
  data: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedReceipts {
  data: Receipt[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

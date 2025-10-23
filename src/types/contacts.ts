// Enhanced Contact Management Types
export type ContactType = 'candidate' | 'client' | 'both';
export type ContactStatus = 'new' | 'contacted' | 'responded' | 'interested' | 'not_interested' | 'closed' | 'active' | 'inactive';
export type ContactSource = 'linkedin' | 'google' | 'referral' | 'website' | 'job_board' | 'networking' | 'cold_outreach' | 'other';

export interface BaseContact {
  id: string;
  type: ContactType;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedIn?: string;
  website?: string;
  avatar?: string;
  
  // Contact management
  status: ContactStatus;
  source: ContactSource;
  addedDate: Date;
  lastContact?: Date;
  nextFollowUp?: Date;
  tags: string[];
  notes?: string;
  
  // Social profiles
  socialProfiles?: {
    twitter?: string;
    github?: string;
    portfolio?: string;
  };
  
  // Relationship tracking
  relationshipScore?: number; // 1-5 rating
  communicationPreference?: 'email' | 'phone' | 'linkedin' | 'text';
  timezone?: string;
}

export interface CandidateContact extends BaseContact {
  type: 'candidate';
  
  // Professional details
  currentPosition?: string;
  currentCompany?: string;
  experience?: string;
  skills: string[];
  salaryExpectation?: string;
  availability?: string;
  
  // Career details
  education?: {
    institution: string;
    degree: string;
    year?: string;
  }[];
  
  // Candidate-specific outreach
  resumeUrl?: string;
  portfolioUrl?: string;
  referredBy?: string;
  jobsAppliedTo?: string[];
  
  // Preferences
  preferredRoleTypes?: string[];
  workArrangement?: 'remote' | 'hybrid' | 'onsite' | 'flexible';
  relocatable?: boolean;
}

export interface ClientContact extends BaseContact {
  type: 'client';
  
  // Company details
  company: string;
  position: string;
  department?: string;
  companySize?: string;
  industry?: string;
  companyWebsite?: string;
  
  // Decision making
  decisionMaker: boolean;
  decisionMakers?: string[]; // Other decision makers in the company
  
  // Business details
  budget?: string;
  hiringNeeds: string[];
  urgency?: 'low' | 'medium' | 'high';
  currentOpenings?: number;
  hiringTimeline?: string;
  
  // Account management
  accountValue?: number;
  contractType?: 'hourly' | 'project' | 'retainer' | 'placement_fee';
  clientSince?: Date;
  lastProject?: string;
}

export interface HybridContact extends BaseContact {
  type: 'both';
  // This person is both a potential candidate and a client contact
  candidateInfo?: Omit<CandidateContact, 'id' | 'type' | keyof BaseContact>;
  clientInfo?: Omit<ClientContact, 'id' | 'type' | keyof BaseContact>;
}

export type Contact = CandidateContact | ClientContact | HybridContact;

// Outreach campaign related types
export interface OutreachCampaign {
  id: string;
  name: string;
  type: 'candidate' | 'client';
  status: 'draft' | 'active' | 'paused' | 'completed';
  contacts: string[]; // Contact IDs
  template: string;
  sentDate?: Date;
  metrics: {
    sent: number;
    opened: number;
    replied: number;
    interested: number;
  };
}

// Contact interaction tracking
export interface ContactInteraction {
  id: string;
  contactId: string;
  type: 'email' | 'phone' | 'meeting' | 'linkedin' | 'note';
  subject?: string;
  content: string;
  date: Date;
  outcome?: 'positive' | 'neutral' | 'negative';
  nextAction?: string;
  nextActionDate?: Date;
}

// Contact list/filter types
export interface ContactFilters {
  type?: ContactType[];
  status?: ContactStatus[];
  source?: ContactSource[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  location?: string[];
  company?: string[];
  skills?: string[]; // For candidates
  industry?: string[]; // For clients
}

export interface ContactSort {
  field: 'name' | 'addedDate' | 'lastContact' | 'company' | 'status';
  direction: 'asc' | 'desc';
}

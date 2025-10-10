// Types for ATS mock data
export interface Candidate {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  linkedIn?: string;
  location?: string;
  position?: string;
  summary?: string;
  stage: string;
  score: number;
  lastUpdated: string;
  tags: string[];
  source: string;
  appliedDate: string;
  notesData?: any; // CoreSignal enrichment data
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  assignedTo: string;
  candidateId: string;
  candidateName: string;
  type: 'Review' | 'Schedule' | 'Offer' | 'Interview' | 'Follow-up';
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateAvatar: string;
  interviewers: string[];
  interviewType: 'Phone Screen' | 'Technical' | 'Final' | 'Product' | 'Culture Fit';
  date: string;
  duration: number;
  format: 'Video' | 'Phone' | 'In-person';
  location: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  notes: string;
}

export interface ReportMetrics {
  totalCandidates: number;
  activeInPipeline: number;
  hired: number;
  averageTimeToHire: number;
  offerAcceptanceRate: number;
  sourceBreakdown: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
}

export interface ReportData {
  metrics: ReportMetrics;
}



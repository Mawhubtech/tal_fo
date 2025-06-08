import type { ReportData } from './types';

export const mockReportsByJob: Record<string, ReportData> = {
  'job-101': {
    metrics: {
      totalCandidates: 6,
      activeInPipeline: 5,
      hired: 1,
      averageTimeToHire: 28,
      offerAcceptanceRate: 100,
      sourceBreakdown: [
        { source: 'LinkedIn', count: 2, percentage: 33.3 },
        { source: 'Referral', count: 1, percentage: 16.7 },
        { source: 'Indeed', count: 1, percentage: 16.7 },
        { source: 'Career Page', count: 1, percentage: 16.7 },
        { source: 'AngelList', count: 1, percentage: 16.7 }
      ]
    }
  },
  'job-201': {
    metrics: {
      totalCandidates: 2,
      activeInPipeline: 2,
      hired: 0,
      averageTimeToHire: 0,
      offerAcceptanceRate: 0,
      sourceBreakdown: [
        { source: 'Indeed', count: 1, percentage: 50 },
        { source: 'Referral', count: 1, percentage: 50 }
      ]
    }
  }
};

import apiClient from '../../../services/api';

export interface SourceBreakdown {
  source: string;
  count: number;
  percentage: number;
}

export interface StageDistribution {
  stage: string;
  count: number;
  percentage: number;
}

export interface TimeToHireByStage {
  stage: string;
  averageDays: number;
}

export interface ReportMetrics {
  totalCandidates: number;
  activeInPipeline: number;
  hired: number;
  averageTimeToHire: number;
  offerAcceptanceRate: number;
  sourceBreakdown: SourceBreakdown[];
  stageDistribution: StageDistribution[];
  timeToHireByStage: TimeToHireByStage[];
}

export interface JobReport {
  jobId: string;
  jobTitle: string;
  metrics: ReportMetrics;
  generatedAt: string;
}

export interface JobReportQuery {
  startDate?: string;
  endDate?: string;
}

class ReportsApiService {
  async getJobReport(jobId: string, query?: JobReportQuery): Promise<JobReport> {
    const params = new URLSearchParams();
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    
    const url = `/reports/jobs/${jobId}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  }
}

export const reportsApiService = new ReportsApiService();

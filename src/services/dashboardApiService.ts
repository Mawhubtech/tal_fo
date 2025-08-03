import apiClient from './api';
import { candidatesService, CandidateStats } from './candidatesService';
import { jobApiService } from './jobApiService';
import type { JobStats } from './jobApiService';
import { sourcingProjectApiService } from './sourcingProjectApiService';

export interface DashboardStats {
  candidates: CandidateStats;
  jobs: JobStats;
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  sequences: {
    total: number;
    active: number;
    paused: number;
  };
  recent_activity: DashboardActivity[];
}

export interface DashboardActivity {
  id: string;
  type: 'candidate' | 'job' | 'interview' | 'sequence' | 'resume' | 'application';
  action: string;
  details: string;
  time: string;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, any>;
}

export interface DashboardMetrics {
  totalCandidates: number;
  activeJobs: number;
  pendingInterviews: number;
  thisMonthPlacements: number;
  totalProjects: number;
  activeSequences: number;
  organizations: number;
  candidatesThisWeek: number;
}

class DashboardApiService {
  /**
   * Get aggregated dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Make parallel requests to get all stats
      const [candidateStats, jobStats, projectsResponse] = await Promise.allSettled([
        candidatesService.getStats(),
        jobApiService.getJobStats(),
        sourcingProjectApiService.getProjects({ limit: 100, page: 1 }), // Get projects for counting (max limit 100)
      ]);

      // Process candidate stats
      const candidates: CandidateStats = candidateStats.status === 'fulfilled' 
        ? candidateStats.value 
        : { total: 0, active: 0, hired: 0, interviewing: 0, rejected: 0, inactive: 0 };

      // Process job stats
      const jobs: JobStats = jobStats.status === 'fulfilled' 
        ? jobStats.value 
        : { total: 0, published: 0, draft: 0, paused: 0, closed: 0, archived: 0 };

      // Process project stats
      const projectsData = projectsResponse.status === 'fulfilled' ? projectsResponse.value : { projects: [] };
      const projects = {
        total: projectsData.projects?.length || 0,
        active: projectsData.projects?.filter((p: any) => p.status === 'active').length || 0,
        completed: projectsData.projects?.filter((p: any) => p.status === 'completed').length || 0,
      };

      // Calculate sequence stats from projects data
      let totalSequences = 0;
      let activeSequences = 0;
      let pausedSequences = 0;
      
      if (projectsData.projects) {
        for (const project of projectsData.projects) {
          totalSequences += project.totalSequences || 0;
          activeSequences += project.activeSequences || 0;
          pausedSequences += project.completedSequences || 0;
        }
      }
      
      const sequences = {
        total: totalSequences,
        active: activeSequences,
        paused: pausedSequences,
      };

      // Get recent activity
      const recent_activity = await this.getRecentActivity();

      return {
        candidates,
        jobs,
        projects,
        sequences,
        recent_activity,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default stats if there's an error
      return {
        candidates: { total: 0, active: 0, hired: 0, interviewing: 0, rejected: 0, inactive: 0 },
        jobs: { total: 0, published: 0, draft: 0, paused: 0, closed: 0, archived: 0 },
        projects: { total: 0, active: 0, completed: 0 },
        sequences: { total: 0, active: 0, paused: 0 },
        recent_activity: [],
      };
    }
  }

  /**
   * Get recent platform activity
   */
  async getRecentActivity(limit: number = 10): Promise<DashboardActivity[]> {
    // TODO: Implement /dashboard/activity endpoint on backend
    // For now, return mock data until the endpoint is ready
    
    // Temporarily disabled API call to avoid 404 errors
    // try {
    //   const response = await apiClient.get(`/dashboard/activity?limit=${limit}`);
    //   return response.data;
    // } catch (error) {
    //   console.error('Error fetching recent activity:', error);
    
    // Return mock data until endpoint is implemented
    const mockActivities: DashboardActivity[] = [
      {
        id: '1',
        type: 'candidate' as const,
        action: 'New candidate added',
        details: 'John Doe - Software Engineer',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        type: 'job' as const,
        action: 'Job posted',
        details: 'Senior React Developer at TechCorp',
        time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        type: 'interview' as const,
        action: 'Interview scheduled',
        details: 'Jane Smith - Product Manager',
        time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        type: 'sequence' as const,
        action: 'Sequence completed',
        details: 'Backend Engineers outreach campaign',
        time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '5',
        type: 'resume' as const,
        action: 'Resume processed',
        details: '12 new resumes analyzed',
        time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    
    return mockActivities.slice(0, limit);
    
    // }
  }

  /**
   * Transform raw stats into dashboard metrics
   */
  transformToDashboardMetrics(stats: DashboardStats): DashboardMetrics {
    return {
      totalCandidates: stats.candidates.total,
      activeJobs: stats.jobs.published,
      pendingInterviews: stats.candidates.interviewing,
      thisMonthPlacements: stats.candidates.hired,
      totalProjects: stats.projects.total,
      activeSequences: stats.sequences.active,
      organizations: 0, // This would need to be fetched from organization service
      candidatesThisWeek: Math.floor(stats.candidates.total * 0.1), // Mock calculation
    };
  }

  /**
   * Get dashboard metrics directly
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const stats = await this.getDashboardStats();
    return this.transformToDashboardMetrics(stats);
  }

  /**
   * Format time for display
   */
  formatActivityTime(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

export const dashboardApiService = new DashboardApiService();

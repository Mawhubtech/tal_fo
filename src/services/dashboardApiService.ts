import apiClient from './api';
import { candidatesService, CandidateStats } from './candidatesService';
import { jobApiService } from './jobApiService';
import type { JobStats } from './jobApiService';
import { sourcingProjectApiService } from './sourcingProjectApiService';
import { calendarApiService, CalendarEvent } from './calendarApiService';
import { taskApiService, Task } from '../recruitment/organizations/services/taskApiService';

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
    // Return empty array until the endpoint is ready
    
    // try {
    //   const response = await apiClient.get(`/dashboard/activity?limit=${limit}`);
    //   return response.data;
    // } catch (error) {
    //   console.error('Error fetching recent activity:', error);
    //   return [];
    // }
    
    return [];
  }

  /**
   * Get upcoming calendar events for dashboard
   */
  async getUpcomingEvents(limit: number = 5): Promise<CalendarEvent[]> {
    try {
      const events = await calendarApiService.getUpcomingEvents(limit);
      return events;
    } catch (error) {
      console.warn('Failed to fetch calendar events:', error);
      // Return empty array on error
      return [];
    }
  }

  /**
   * Get recent tasks for dashboard
   */
  async getDashboardTasks(limit: number = 5): Promise<Task[]> {
    try {
      const tasks = await taskApiService.getTasks({
        status: 'Pending',
      });
      
      // Sort by due date and priority, then limit
      const sortedTasks = tasks
        .filter(task => task.status === 'Pending' || task.status === 'In Progress')
        .sort((a, b) => {
          // First sort by due date (overdue first, then by date)
          if (a.dueDate && b.dueDate) {
            const aDate = new Date(a.dueDate);
            const bDate = new Date(b.dueDate);
            const now = new Date();
            
            const aOverdue = aDate < now;
            const bOverdue = bDate < now;
            
            if (aOverdue && !bOverdue) return -1;
            if (!aOverdue && bOverdue) return 1;
            
            return aDate.getTime() - bDate.getTime();
          }
          
          if (a.dueDate && !b.dueDate) return -1;
          if (!a.dueDate && b.dueDate) return 1;
          
          // Then sort by priority
          const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
          return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
        })
        .slice(0, limit);
      
      return sortedTasks;
    } catch (error) {
      console.warn('Failed to fetch dashboard tasks:', error);
      // Return mock data on error
      return [
        {
          id: '1',
          title: 'Review candidate portfolio for Senior Developer role',
          description: 'Evaluate technical skills and experience',
          priority: 'High' as const,
          status: 'Pending' as const,
          type: 'Review' as const,
          jobId: 'job-1',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          candidateName: 'John Doe',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Schedule interview with marketing candidate',
          description: 'Coordinate with hiring manager for final round',
          priority: 'Medium' as const,
          status: 'Pending' as const,
          type: 'Schedule' as const,
          jobId: 'job-2',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          candidateName: 'Jane Smith',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Follow up with client about job requirements',
          description: 'Clarify technical requirements and timeline',
          priority: 'Low' as const,
          status: 'In Progress' as const,
          type: 'Follow-up' as const,
          jobId: 'job-3',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '4',
          title: 'Update sourcing project status',
          description: 'Prepare weekly status report',
          priority: 'Medium' as const,
          status: 'Pending' as const,
          type: 'Document' as const,
          jobId: 'job-4',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '5',
          title: 'Send weekly recruitment report',
          description: 'Compile and send status to stakeholders',
          priority: 'High' as const,
          status: 'Pending' as const,
          type: 'Document' as const,
          jobId: 'job-5',
          dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Overdue
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ].slice(0, limit);
    }
  }

  /**
   * Format event date for display
   */
  private formatEventDate(dateString: string): string {
    const eventDate = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (eventDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 7) {
        return eventDate.toLocaleDateString([], { weekday: 'long' });
      } else {
        return eventDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    }
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

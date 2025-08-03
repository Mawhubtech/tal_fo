import apiClient from '../../../services/api';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'High' | 'Medium' | 'Low' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | 'On Hold';
  type: 'General' | 'Reminder' | 'Meeting' | 'Call' | 'Email' | 'Document' | 'Research' | 
        'Review' | 'Schedule' | 'Offer' | 'Interview' | 'Follow-up' | 'Assessment' | 'Reference Check' |
        'Candidate Search' | 'Outreach' | 'Profile Review' | 'Client Meeting' | 'Proposal' | 
        'Contract Review' | 'Admin' | 'Personal' | 'Training';
  category: 'Recruitment' | 'Sourcing' | 'Client Management' | 'Business Development' | 
           'Personal' | 'Admin' | 'Team Management' | 'Outreach' | 'Marketing' | 'General';
  
  // Generic entity linking
  entityType?: 'job' | 'candidate' | 'client' | 'project' | 'sourcing_project' | 'sequence' | 
              'team' | 'user' | 'company' | 'organization' | 'none';
  entityId?: string;
  entityName?: string;
  
  // Legacy job support (optional now)
  jobId?: string;
  
  // Assignee (every task has an assignee, auto-assigned to creator if not specified)
  assignedTo: string;
  candidateId?: string;
  candidateName?: string;
  createdById?: string;
  
  // New fields
  tags?: string[];
  metadata?: Record<string, any>;
  
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  
  // Relations
  assignedUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateTaskData {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: 'High' | 'Medium' | 'Low' | 'Urgent';
  type: 'General' | 'Reminder' | 'Meeting' | 'Call' | 'Email' | 'Document' | 'Research' | 
        'Review' | 'Schedule' | 'Offer' | 'Interview' | 'Follow-up' | 'Assessment' | 'Reference Check' |
        'Candidate Search' | 'Outreach' | 'Profile Review' | 'Client Meeting' | 'Proposal' | 
        'Contract Review' | 'Admin' | 'Personal' | 'Training';
  category?: 'Recruitment' | 'Sourcing' | 'Client Management' | 'Business Development' | 
            'Personal' | 'Admin' | 'Team Management' | 'Outreach' | 'Marketing' | 'General';
  
  // Generic entity linking
  entityType?: 'job' | 'candidate' | 'client' | 'project' | 'sourcing_project' | 'sequence' | 
              'team' | 'user' | 'company' | 'organization' | 'none';
  entityId?: string;
  entityName?: string;
  
  // Legacy job support (optional now)
  jobId?: string;
  
  // Assignee (optional - will auto-assign to creator if not provided)
  assignedTo?: string;
  candidateId?: string;
  candidateName?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: 'High' | 'Medium' | 'Low' | 'Urgent';
  status?: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | 'On Hold';
  type?: 'General' | 'Reminder' | 'Meeting' | 'Call' | 'Email' | 'Document' | 'Research' | 
         'Review' | 'Schedule' | 'Offer' | 'Interview' | 'Follow-up' | 'Assessment' | 'Reference Check' |
         'Candidate Search' | 'Outreach' | 'Profile Review' | 'Client Meeting' | 'Proposal' | 
         'Contract Review' | 'Admin' | 'Personal' | 'Training';
  category?: 'Recruitment' | 'Sourcing' | 'Client Management' | 'Business Development' | 
            'Personal' | 'Admin' | 'Team Management' | 'Outreach' | 'Marketing' | 'General';
  entityType?: 'job' | 'candidate' | 'client' | 'project' | 'sourcing_project' | 'sequence' | 
              'team' | 'user' | 'company' | 'organization' | 'none';
  entityId?: string;
  entityName?: string;
  assignedTo?: string;
  candidateId?: string;
  candidateName?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface TaskQueryParams {
  jobId?: string;
  status?: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | 'On Hold';
  priority?: 'High' | 'Medium' | 'Low' | 'Urgent';
  type?: 'General' | 'Reminder' | 'Meeting' | 'Call' | 'Email' | 'Document' | 'Research' | 
         'Review' | 'Schedule' | 'Offer' | 'Interview' | 'Follow-up' | 'Assessment' | 'Reference Check' |
         'Candidate Search' | 'Outreach' | 'Profile Review' | 'Client Meeting' | 'Proposal' | 
         'Contract Review' | 'Admin' | 'Personal' | 'Training';
  category?: 'Recruitment' | 'Sourcing' | 'Client Management' | 'Business Development' | 
            'Personal' | 'Admin' | 'Team Management' | 'Outreach' | 'Marketing' | 'General';
  entityType?: 'job' | 'candidate' | 'client' | 'project' | 'sourcing_project' | 'sequence' | 
              'team' | 'user' | 'company' | 'organization' | 'none';
  entityId?: string;
  assignedTo?: string;
  candidateId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  tags?: string[];
  search?: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

class TaskApiService {
  private baseUrl = '/tasks';

  async createTask(taskData: CreateTaskData): Promise<Task> {
    const response = await apiClient.post<Task>(this.baseUrl, taskData);
    return response.data;
  }

  async getTasks(params?: TaskQueryParams): Promise<Task[]> {
    const response = await apiClient.get<Task[]>(this.baseUrl, { params });
    return response.data;
  }

  async getTasksByJobId(jobId: string): Promise<Task[]> {
    const response = await apiClient.get<Task[]>(`${this.baseUrl}/job/${jobId}`);
    return response.data;
  }

  async getTaskStats(jobId: string): Promise<TaskStats> {
    const response = await apiClient.get<TaskStats>(`${this.baseUrl}/job/${jobId}/stats`);
    return response.data;
  }

  async getTaskById(taskId: string): Promise<Task> {
    const response = await apiClient.get<Task>(`${this.baseUrl}/${taskId}`);
    return response.data;
  }

  async updateTask(taskId: string, taskData: UpdateTaskData): Promise<Task> {
    const response = await apiClient.patch<Task>(`${this.baseUrl}/${taskId}`, taskData);
    return response.data;
  }

  async markTaskAsCompleted(taskId: string): Promise<Task> {
    const response = await apiClient.patch<Task>(`${this.baseUrl}/${taskId}/complete`);
    return response.data;
  }

  async assignTask(taskId: string, userId: string): Promise<Task> {
    const response = await apiClient.patch<Task>(`${this.baseUrl}/${taskId}/assign/${userId}`);
    return response.data;
  }

  async deleteTask(taskId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${taskId}`);
  }
}

export const taskApiService = new TaskApiService();

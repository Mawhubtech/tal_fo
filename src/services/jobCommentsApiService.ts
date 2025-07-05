import apiClient from './api';
import type { Comment, Reaction } from '../components/CollaborativeSidePanel';

export interface CreateCommentRequest {
  jobId: string;
  content: string;
  parentId?: string;
  taggedCandidateIds?: string[];
}

export interface UpdateCommentRequest {
  content: string;
}

export interface AddReactionRequest {
  emoji: string;
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
}

class JobCommentsApiService {
  private readonly baseUrl = '/job-comments';

  async getJobComments(jobId: string): Promise<Comment[]> {
    const response = await apiClient.get(`${this.baseUrl}/${jobId}`);
    return response.data;
  }

  async createComment(data: CreateCommentRequest): Promise<Comment> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  async updateComment(commentId: string, data: UpdateCommentRequest): Promise<Comment> {
    const response = await apiClient.put(`${this.baseUrl}/${commentId}`, data);
    return response.data;
  }

  async deleteComment(commentId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${commentId}`);
  }

  async addReaction(commentId: string, data: AddReactionRequest): Promise<Reaction> {
    const response = await apiClient.post(`${this.baseUrl}/${commentId}/reactions`, data);
    return response.data;
  }

  async removeReaction(commentId: string, emoji: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${commentId}/reactions/${emoji}`);
  }

  async getCommentReactions(commentId: string): Promise<Reaction[]> {
    const response = await apiClient.get(`${this.baseUrl}/${commentId}/reactions`);
    return response.data;
  }
}

export const jobCommentsApiService = new JobCommentsApiService();

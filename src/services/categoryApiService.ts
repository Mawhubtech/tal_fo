import apiClient from '../lib/api';
import {
  CandidateCategory,
  CreateCandidateCategoryDto,
  UpdateCandidateCategoryDto,
  AssignCandidateCategoriesDto,
  CategoryStats,
} from '../types/candidate.types';

/**
 * API Service for Candidate Category Management
 * Handles all HTTP requests related to candidate categories
 */
class CategoryApiService {
  private baseUrl = '/candidate-categories';

  /**
   * Get all categories
   */
  async getCategories(params?: {
    isActive?: boolean;
    search?: string;
  }): Promise<{ categories: CandidateCategory[] }> {
    const response = await apiClient.get(this.baseUrl, { params });
    return response.data;
  }

  /**
   * Get category statistics
   */
  async getCategoryStats(): Promise<{ stats: CategoryStats[] }> {
    const response = await apiClient.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  /**
   * Get a single category by ID
   */
  async getCategory(id: string): Promise<{ category: CandidateCategory }> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Create a new category (Super Admin only)
   */
  async createCategory(
    data: CreateCandidateCategoryDto
  ): Promise<{ category: CandidateCategory }> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  /**
   * Update a category (Super Admin only)
   */
  async updateCategory(
    id: string,
    data: UpdateCandidateCategoryDto
  ): Promise<{ category: CandidateCategory }> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  /**
   * Delete a category (Super Admin only)
   */
  async deleteCategory(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Assign categories to a candidate
   */
  async assignCategoriesToCandidate(
    candidateId: string,
    data: AssignCandidateCategoriesDto
  ): Promise<{ message: string }> {
    const response = await apiClient.post(
      `${this.baseUrl}/candidates/${candidateId}/assign`,
      data
    );
    return response.data;
  }

  /**
   * Get categories for a specific candidate
   */
  async getCandidateCategories(
    candidateId: string
  ): Promise<{ categories: CandidateCategory[] }> {
    const response = await apiClient.get(
      `${this.baseUrl}/candidates/${candidateId}`
    );
    return response.data;
  }
}

export const categoryApiService = new CategoryApiService();
export default categoryApiService;

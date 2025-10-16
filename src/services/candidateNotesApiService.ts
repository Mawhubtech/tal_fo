import apiClient from '../lib/api';

export interface CandidateNote {
  id: string;
  candidateId: string;
  authorId: string;
  content: string;
  isPrivate: boolean;
  sharedWithTeamId?: string;
  isImportant: boolean;
  jobId?: string; // NEW: Job-specific notes
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  sharedWithTeam?: {
    id: string;
    name: string;
  };
  job?: { // NEW: Job information
    id: string;
    title: string;
    slug: string;
  };
  taggedUsers?: { // NEW: Tagged users
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  }[];
}

export interface CreateCandidateNoteDto {
  candidateId: string;
  content: string;
  isPrivate?: boolean;
  sharedWithTeamId?: string;
  isImportant?: boolean;
  metadata?: any;
  jobId?: string; // NEW: Job-specific notes
  taggedUserIds?: string[]; // NEW: Tagged users
}

export interface UpdateCandidateNoteDto {
  content?: string;
  isPrivate?: boolean;
  sharedWithTeamId?: string;
  isImportant?: boolean;
  metadata?: any;
  jobId?: string; // NEW: Job-specific notes
  taggedUserIds?: string[]; // NEW: Tagged users
}

export interface CandidateNotesQueryDto {
  candidateId?: string;
  authorId?: string;
  isPrivate?: boolean;
  sharedWithTeamId?: string;
  isImportant?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  jobId?: string; // NEW: Filter by job
}

export interface CandidateNotesResponse {
  notes: CandidateNote[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class CandidateNotesApiService {
  private baseUrl = '/candidates';

  /**
   * Create a new note for a candidate
   */
  async createNote(candidateId: string, noteData: CreateCandidateNoteDto): Promise<CandidateNote> {
    const response = await apiClient.post(`${this.baseUrl}/${candidateId}/notes`, noteData);
    return response.data;
  }

  /**
   * Get all notes for a candidate
   */
  async getNotes(candidateId: string, query?: CandidateNotesQueryDto): Promise<CandidateNotesResponse> {
    const params = new URLSearchParams();
    
    if (query?.authorId) params.append('authorId', query.authorId);
    if (query?.isPrivate !== undefined) params.append('isPrivate', query.isPrivate.toString());
    if (query?.sharedWithTeamId) params.append('sharedWithTeamId', query.sharedWithTeamId);
    if (query?.isImportant !== undefined) params.append('isImportant', query.isImportant.toString());
    if (query?.jobId) params.append('jobId', query.jobId); // NEW: Add jobId filter
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder);

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/${candidateId}/notes?${queryString}` : `${this.baseUrl}/${candidateId}/notes`;
    
    const response = await apiClient.get(url);
    return response.data;
  }

  /**
   * Get a specific note by ID
   */
  async getNote(candidateId: string, noteId: string): Promise<CandidateNote> {
    const response = await apiClient.get(`${this.baseUrl}/${candidateId}/notes/${noteId}`);
    return response.data;
  }

  /**
   * Update a note
   */
  async updateNote(candidateId: string, noteId: string, noteData: UpdateCandidateNoteDto): Promise<CandidateNote> {
    const response = await apiClient.patch(`${this.baseUrl}/${candidateId}/notes/${noteId}`, noteData);
    return response.data;
  }

  /**
   * Delete a note
   */
  async deleteNote(candidateId: string, noteId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${candidateId}/notes/${noteId}`);
  }

  /**
   * Get notes for a candidate using their CoreSignal ID
   * Returns empty array if candidate doesn't exist yet
   */
  async getCoreSignalNotes(coreSignalId: string, query?: CandidateNotesQueryDto): Promise<CandidateNotesResponse & { candidateId: string | null }> {
    const params = new URLSearchParams();
    
    if (query?.isPrivate !== undefined) params.append('isPrivate', query.isPrivate.toString());
    if (query?.sharedWithTeamId) params.append('sharedWithTeamId', query.sharedWithTeamId);
    if (query?.isImportant !== undefined) params.append('isImportant', query.isImportant.toString());
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder);

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseUrl}/coresignal/${coreSignalId}/notes?${queryString}` 
      : `${this.baseUrl}/coresignal/${coreSignalId}/notes`;
    
    const response = await apiClient.get(url);
    return response.data;
  }

  /**
   * Create a note for a candidate using their CoreSignal ID
   * Creates the candidate first if they don't exist
   */
  async createCoreSignalNote(
    coreSignalId: string, 
    noteData: Omit<CreateCandidateNoteDto, 'candidateId'> & { candidateData?: any }
  ): Promise<{ note: CandidateNote; candidateId: string }> {
    const response = await apiClient.post(`${this.baseUrl}/coresignal/${coreSignalId}/notes`, noteData);
    return response.data;
  }
}

export const candidateNotesApiService = new CandidateNotesApiService();

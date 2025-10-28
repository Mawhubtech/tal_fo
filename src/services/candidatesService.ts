import apiClient from './api';

// Type definitions based on backend structure
export interface CandidateQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  source?: string;
  location?: string;
  skills?: string[]; // Frontend uses array, gets converted to comma-separated string
  minRating?: number;
  maxRating?: number;
  minExperience?: number;
  maxExperience?: number;
  appliedAfter?: string;
  appliedBefore?: string;
  experienceLevel?: string; // Keep for backward compatibility
  // New comprehensive filters
  education?: string;
  degreeType?: string;
  position?: string;
  company?: string;
  interests?: string[]; // Frontend uses array, gets converted to comma-separated string
  certifications?: string[]; // Frontend uses array, gets converted to comma-separated string
  awards?: string[]; // Frontend uses array, gets converted to comma-separated string
  languages?: string[]; // Frontend uses array, gets converted to comma-separated string
  categoryIds?: string[]; // Category filter for candidates
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  includeJobseekers?: boolean; // Include candidates from jobseeker portal (no company)
}

export interface CandidateStats {
  total: number;
  active: number;
  hired: number;
  interviewing: number;
  rejected: number;
  inactive: number;
}

// Service functions
export const candidatesService = {  // Get candidates with filtering and pagination
  async getCandidates(params: CandidateQueryParams) {
    try {
      console.log('Fetching candidates with params:', params);
      console.log('IMPORTANT: includeJobseekers value being sent:', params.includeJobseekers);
      console.time('API Request Time');
      
      // Transform array fields to comma-separated strings for backend compatibility
      const transformedParams = { ...params };
      
      // Transform skills array
      if (params.skills && Array.isArray(params.skills) && params.skills.length > 0) {
        transformedParams.skills = params.skills.join(',') as any;
      }
      
      // Transform interests array
      if (params.interests && Array.isArray(params.interests) && params.interests.length > 0) {
        transformedParams.interests = params.interests.join(',') as any;
      }
      
      // Transform certifications array
      if (params.certifications && Array.isArray(params.certifications) && params.certifications.length > 0) {
        transformedParams.certifications = params.certifications.join(',') as any;
      }
      
      // Transform awards array
      if (params.awards && Array.isArray(params.awards) && params.awards.length > 0) {
        transformedParams.awards = params.awards.join(',') as any;
      }
      
      // Transform languages array
      if (params.languages && Array.isArray(params.languages) && params.languages.length > 0) {
        transformedParams.languages = params.languages.join(',') as any;
      }

      // Transform categoryIds array
      if (params.categoryIds && Array.isArray(params.categoryIds) && params.categoryIds.length > 0) {
        transformedParams.categoryIds = params.categoryIds.join(',') as any;
      }
      
      console.log('Transformed params for API:', transformedParams);
      
      const response = await apiClient.get('/candidates', { params: transformedParams });
      
      console.timeEnd('API Request Time');
      console.log('API Response Status:', response.status);
      console.log('API Response Headers:', response.headers);
      console.log('API Response Data:', response.data);
        // Create a standardized response object regardless of API format
      let result: {
        items: any[];
        originalResponse: any;
        responseFormat: string;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      } = {
        items: [],
        originalResponse: response.data, // Store the original response for debugging
        responseFormat: 'unknown',
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
      };
      
      // Handle both paginated and non-paginated responses
      if (response.data && typeof response.data === 'object') {
        // If response has candidates array (new API format)
        if (Array.isArray(response.data.candidates)) {
          result = {
            ...result,
            items: response.data.candidates,
            responseFormat: 'candidates_array',
            total: response.data.total || response.data.candidates.length,
            page: response.data.page || 1,
            limit: response.data.limit || 10,
            totalPages: response.data.totalPages || Math.ceil((response.data.total || response.data.candidates.length) / (response.data.limit || 10))
          };
        }
        // If response itself is the array of candidates (old API format)
        else if (Array.isArray(response.data)) {
          result = {
            ...result,
            items: response.data,
            responseFormat: 'direct_array',
            total: response.data.length,
            page: 1,
            limit: response.data.length,
            totalPages: 1
          };
        }
        // Original format with items key
        else if (Array.isArray(response.data.items)) {
          result = {
            ...result,
            items: response.data.items,
            responseFormat: 'items_array',
            total: response.data.total || response.data.items.length,
            page: response.data.page || 1,
            limit: response.data.limit || 10,
            totalPages: response.data.totalPages || Math.ceil((response.data.total || response.data.items.length) / (response.data.limit || 10))
          };
        }
      }
      
      console.log('Processed API response:', result);
      return result;
    } catch (error) {
      console.error('Error fetching candidates:', error);
      throw error;
    }
  },

  // Get a single candidate by ID
  async getCandidate(id: string) {
    const response = await apiClient.get(`/candidates/${id}`);
    return response.data;
  },

  // Get candidate statistics
  async getStats(includeJobseekers?: boolean) {
    const params = includeJobseekers ? { includeJobseekers: 'true' } : {};
    const response = await apiClient.get('/candidates/stats/overview', { params });
    return response.data as CandidateStats;
  },

  // Update candidate status
  async updateStatus(id: string, status: string) {
    const response = await apiClient.patch(`/candidates/${id}/status`, { status });
    return response.data;
  },

  // Update candidate rating
  async updateRating(id: string, rating: number) {
    const response = await apiClient.patch(`/candidates/${id}/rating`, { rating });
    return response.data;
  },

  // Delete a candidate
  async deleteCandidate(id: string) {
    await apiClient.delete(`/candidates/${id}`);
    return true;
  },

  // Process a single CV without creating a candidate
  async processCV(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/candidates/process-cv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Process multiple CVs from a zip file with performance options
  async processBulkCVs(zipFile: File, options?: {
    maxConcurrency?: number;
    batchSize?: number;
    aiProcessingMode?: 'parallel' | 'sequential' | 'batch';
    enableProgressTracking?: boolean;
  }) {
    const formData = new FormData();
    formData.append('zipFile', zipFile);
    
    // Add performance options if provided
    if (options?.maxConcurrency) {
      formData.append('maxConcurrency', options.maxConcurrency.toString());
    }
    if (options?.batchSize) {
      formData.append('batchSize', options.batchSize.toString());
    }
    if (options?.aiProcessingMode) {
      formData.append('aiProcessingMode', options.aiProcessingMode);
    }
    if (options?.enableProgressTracking) {
      formData.append('enableProgressTracking', 'true');
    }
    
    const response = await apiClient.post('/candidates/process-bulk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Check bulk processing progress (for long-running operations)
  async getBulkProcessingProgress(processingId: string) {
    const response = await apiClient.get(`/candidates/bulk-progress/${processingId}`);
    return response.data;
  },

  // Start bulk processing with background processing
  async startBulkProcessing(zipFile: File, options?: {
    maxConcurrency?: number;
    batchSize?: number;
    aiProcessingMode?: 'parallel' | 'sequential' | 'batch';
    notificationEmail?: string;
  }) {
    const formData = new FormData();
    formData.append('zipFile', zipFile);
    
    // Add options
    if (options?.maxConcurrency) {
      formData.append('maxConcurrency', options.maxConcurrency.toString());
    }
    if (options?.batchSize) {
      formData.append('batchSize', options.batchSize.toString());
    }
    if (options?.aiProcessingMode) {
      formData.append('aiProcessingMode', options.aiProcessingMode);
    }
    if (options?.notificationEmail) {
      formData.append('notificationEmail', options.notificationEmail);
    }
    
    const response = await apiClient.post('/candidates/process-bulk-async', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload a CV and create a candidate
  async uploadCV(file: File, candidateId?: string, email?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (candidateId) {
      formData.append('candidateId', candidateId);
    }
    if (email) {
      formData.append('email', email);
    }
    const response = await apiClient.post('/candidates/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Create a candidate from processed CV data
  async createFromProcessed(structuredData: any, documentId?: string, overrideData?: any) {
    const response = await apiClient.post('/candidates/create-from-processed', {
      structuredData,
      documentId,
      overrideData,
    });
    return response.data;  },

  // Process CV and add to job atomically
  async processAndAddToJob(file: File, jobId: string, overrideData?: any) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jobId', jobId);
    if (overrideData) {
      formData.append('overrideData', JSON.stringify(overrideData));
    }
    const response = await apiClient.post('/candidates/process-and-add-to-job', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Create a new candidate manually
  async createCandidate(candidateData: any) {
    // Check if there are files to upload (avatar or documents)
    const hasDocuments = candidateData.documents && candidateData.documents.length > 0;
    const hasAvatar = candidateData.avatarFile;
    
    if (hasDocuments || hasAvatar) {
      return this.createCandidateWithFiles(candidateData);
    }

    // If no files, use regular creation but clean empty avatar
    const { documents, avatarFile, ...cleanData } = candidateData;
    
    // Remove empty avatar field if present
    if (cleanData.personalInfo && cleanData.personalInfo.avatar === '') {
      delete cleanData.personalInfo.avatar;
    }
    
    return this.createCandidateWithoutFiles(cleanData);
  },

  // Helper method for creating candidate without files
  async createCandidateWithoutFiles(candidateData: any) {
    const response = await apiClient.post('/candidates', candidateData);
    return response.data;
  },
  // Create candidate with file uploads (documents and/or avatar)
  async createCandidateWithFiles(candidateData: any) {
    const formData = new FormData();
    
    // Extract files from candidate data
    const { documents, avatarFile, ...candidateDataWithoutFiles } = candidateData;
    
    // Add candidate data as JSON
    formData.append('candidateData', JSON.stringify(candidateDataWithoutFiles));
    
    // Add avatar file if present
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }
    
    // Add each document file if present
    if (documents && documents.length > 0) {
      documents.forEach((doc: any, index: number) => {
        formData.append(`documents`, doc.file);
        formData.append(`documentTypes`, doc.documentType);
        formData.append(`isPrimary`, doc.isPrimary ? 'true' : 'false');
      });
    }    const response = await apiClient.post('/candidates/with-files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },    });
    return response.data;
  },

  // Update an existing candidate
  async updateCandidate(id: string, candidateData: any) {
    // Check if there are files to upload (avatar or documents)
    const hasDocuments = candidateData.documents && candidateData.documents.length > 0;
    const hasAvatar = candidateData.avatarFile;
    
    if (hasDocuments || hasAvatar) {
      return this.updateCandidateWithFiles(id, candidateData);
    }

    // If no files, use regular update but clean empty avatar
    const { documents, avatarFile, ...cleanData } = candidateData;
    
    // Remove empty avatar field if present
    if (cleanData.personalInfo && cleanData.personalInfo.avatar === '') {
      delete cleanData.personalInfo.avatar;
    }
    
    return this.updateCandidateWithoutFiles(id, cleanData);
  },
  // Helper method for updating candidate without files
  async updateCandidateWithoutFiles(id: string, candidateData: any) {
    const response = await apiClient.patch(`/candidates/${id}`, candidateData);
    return response.data;
  },

  // Update candidate with file uploads (documents and/or avatar)
  async updateCandidateWithFiles(id: string, candidateData: any) {
    const formData = new FormData();
    
    // Extract files from candidate data
    const { documents, avatarFile, ...candidateDataWithoutFiles } = candidateData;
    
    // Add candidate data as JSON
    formData.append('candidateData', JSON.stringify(candidateDataWithoutFiles));
    
    // Add avatar file if present
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }
    
    // Add each document file if present
    if (documents && documents.length > 0) {
      documents.forEach((doc: any, index: number) => {
        formData.append(`documents`, doc.file);
        formData.append(`documentTypes`, doc.documentType);
        formData.append(`isPrimary`, doc.isPrimary ? 'true' : 'false');
      });
    }    const response = await apiClient.patch(`/candidates/${id}/with-files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update candidate rating
  async updateCandidateRating(id: string, rating: number) {
    const response = await apiClient.patch(`/candidates/${id}/rating`, { rating });
    return response.data;
  },
};

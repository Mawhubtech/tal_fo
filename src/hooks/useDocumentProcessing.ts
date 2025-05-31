import { useState } from 'react';
import api from '../lib/api';

export interface DocumentProcessingOptions {
  enhanceText?: boolean;
  extractJobDescription?: boolean;
  cleanupText?: boolean;
}

export interface ProcessedDocument {
  text: string;
  metadata: {
    filename: string;
    size: number;
    type: string;
    pages?: number;
    wordCount: number;
  };
  enhancedText?: string;
  structuredData?: {
    jobTitle?: string;
    company?: string;
    location?: string;
    skills?: string[];
    experienceLevel?: string;
    requirements?: string[];
    responsibilities?: string[];
    benefits?: string[];
    workType?: string;
    salaryRange?: string;
  };
}

export const useDocumentProcessing = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProcessedDocument | null>(null);

  const processDocument = async (
    file: File,
    options: DocumentProcessingOptions = {}
  ): Promise<ProcessedDocument | null> => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add processing options
      if (options.enhanceText !== undefined) {
        formData.append('enhanceText', options.enhanceText.toString());
      }
      if (options.extractJobDescription !== undefined) {
        formData.append('extractJobDescription', options.extractJobDescription.toString());
      }
      if (options.cleanupText !== undefined) {
        formData.append('cleanupText', options.cleanupText.toString());
      }      const response = await api.post('/document-processing/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const processedDocument = response.data as ProcessedDocument;
      setData(processedDocument);
      return processedDocument;

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to process document';
      setError(errorMessage);
      console.error('Document processing error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setData(null);
  };

  return {
    processDocument,
    loading,
    error,
    data,
    reset,
  };
};

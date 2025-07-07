import { useState } from 'react';
import { candidatesService } from '../services/candidatesService';

export interface CVProcessingResult {
  message: string;
  metadata: {
    filename: string;
    size: number;
    type: string;
    wordCount: number;
  };
  structuredData: any;
  text?: string;
}

export interface BulkProcessingResult {
  message: string;
  processed: number;
  successful: number;
  failed: number;
  options?: {
    maxConcurrency: number;
    batchSize: number;
  };
  results: Array<{
    filename: string;
    success: boolean;
    error?: string;
    metadata?: any;
    structuredData?: any;
  }>;
}

export interface CreateFromProcessedResult {
  message: string;
  candidate: any;
}

export const useCVProcessing = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);

  // Process a single CV
  const processCV = async (file: File): Promise<CVProcessingResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await candidatesService.processCV(file);
      setData(result);
      setLoading(false);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error processing CV';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };

  // Process multiple CVs from a zip file with performance options
  const processBulkCVs = async (
    zipFile: File,
    options?: {
      maxConcurrency?: number;
      batchSize?: number;
      aiProcessingMode?: 'parallel' | 'sequential' | 'batch';
      enableProgressTracking?: boolean;
    }
  ): Promise<BulkProcessingResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await candidatesService.processBulkCVs(zipFile, options);
      setData(result);
      setLoading(false);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error processing bulk CVs';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };

  // Upload a CV and create a candidate
  const uploadCV = async (file: File, candidateId?: string, email?: string): Promise<any> => {
    setLoading(true);
    setError(null);

    try {
      const result = await candidatesService.uploadCV(file, candidateId, email);
      setData(result);
      setLoading(false);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error uploading CV';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };

  // Create a candidate from processed CV data
  const createFromProcessed = async (
    structuredData: any,
    documentId?: string,
    overrideData?: any
  ): Promise<CreateFromProcessedResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await candidatesService.createFromProcessed(structuredData, documentId, overrideData);
      setData(result);
      setLoading(false);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error creating candidate from processed data';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };

  return {
    processCV,
    processBulkCVs,
    uploadCV,
    createFromProcessed,
    loading,
    error,
    data,
  };
};

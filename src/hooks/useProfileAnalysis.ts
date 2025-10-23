import { useState, useCallback } from 'react';
import { generateProfileAnalysis, type SearchFilters } from '../services/searchService';

interface ProfileAnalysisResult {
  summary: string;
  keyHighlights: string[];
}

interface UseProfileAnalysisResult {
  generateAnalysis: (candidateData: any, searchContext?: { query?: string; filters?: SearchFilters }) => Promise<ProfileAnalysisResult | null>;
  analysisData: ProfileAnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export const useProfileAnalysis = (): UseProfileAnalysisResult => {
  const [analysisData, setAnalysisData] = useState<ProfileAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAnalysis = useCallback(async (candidateData: any, searchContext?: { query?: string; filters?: SearchFilters }): Promise<ProfileAnalysisResult | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await generateProfileAnalysis(candidateData, searchContext);
      setAnalysisData(result);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate profile analysis';
      setError(errorMessage);
      console.error('Profile analysis error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setAnalysisData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    generateAnalysis,
    analysisData,
    isLoading,
    error,
    reset,
  };
};
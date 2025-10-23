import { useState, useCallback } from 'react';
import { aiService } from '../services/aiService';
import { AIQueryRequest, UseAIQueryResult } from '../types/ai';

/**
 * Hook for sending single queries to AI models
 */
export const useAIQuery = (): UseAIQueryResult => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useCallback(async (request: AIQueryRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiService.query(request);
      setData(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while querying AI';
      setError(errorMessage);
      console.error('AI Query Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    query,
    reset,
  };
};

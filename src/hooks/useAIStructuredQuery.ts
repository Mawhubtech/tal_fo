import { useState, useCallback } from 'react';
import { aiService } from '../services/aiService';
import { AIStructuredQueryRequest, UseAIStructuredQueryResult, AIStructuredResponse } from '../types/ai';

/**
 * Hook for sending structured queries to AI models with JSON output
 */
export const useAIStructuredQuery = (): UseAIStructuredQueryResult => {
  const [data, setData] = useState<AIStructuredResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const structuredQuery = useCallback(async (request: AIStructuredQueryRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiService.structuredQuery(request);
      setData(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while querying AI';
      setError(errorMessage);
      console.error('AI Structured Query Error:', err);
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
    structuredQuery,
    reset,
  };
};

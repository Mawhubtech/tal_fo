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
      console.log('Hook - Starting request, current data:', data);
      setLoading(true);
      setError(null);
      
      console.log('Hook - Making AI request:', request);
      const response = await aiService.structuredQuery(request);
      console.log('Hook - Received response:', response);
      
      if (response && response.data) {
        console.log('Hook - Response has data property:', response.data);
        setData(response);
        console.log('Hook - Data set in state, new data should be:', response);
      } else {
        console.error('Hook - Invalid response structure:', response);
        setError('Invalid response from AI service');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while querying AI';
      setError(errorMessage);
      console.error('AI Structured Query Error:', err);
    } finally {
      setLoading(false);
    }
  }, [data]);

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

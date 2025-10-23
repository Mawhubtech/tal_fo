import { useState, useCallback } from 'react';
import { aiService } from '../services/aiService';
import { AIChatRequest, UseAIChatResult } from '../types/ai';

/**
 * Hook for chat conversations with AI models (with history)
 */
export const useAIChat = (): UseAIChatResult => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chat = useCallback(async (request: AIChatRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiService.chat(request);
      setData(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while chatting with AI';
      setError(errorMessage);
      console.error('AI Chat Error:', err);
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
    chat,
    reset,
  };
};

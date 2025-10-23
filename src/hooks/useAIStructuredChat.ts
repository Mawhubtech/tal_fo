import { useState, useCallback } from 'react';
import { aiService } from '../services/aiService';
import { AIStructuredChatRequest, UseAIStructuredChatResult, AIStructuredResponse } from '../types/ai';

/**
 * Hook for structured chat conversations with AI models (with history and JSON output)
 */
export const useAIStructuredChat = (): UseAIStructuredChatResult => {
  const [data, setData] = useState<AIStructuredResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const structuredChat = useCallback(async (request: AIStructuredChatRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiService.structuredChat(request);
      setData(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while chatting with AI';
      setError(errorMessage);
      console.error('AI Structured Chat Error:', err);
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
    structuredChat,
    reset,
  };
};

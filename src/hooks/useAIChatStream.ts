import { useState, useCallback } from 'react';
import { aiService } from '../services/aiService';
import { AIChatStreamRequest, UseAIChatStreamResult } from '../types/ai';

/**
 * Hook for streaming chat conversations with AI models
 */
export const useAIChatStream = (): UseAIChatStreamResult => {
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streamChat = useCallback(async (request: AIChatStreamRequest) => {
    try {
      setLoading(true);
      setIsStreaming(true);
      setError(null);
      setData(''); // Reset data for new stream
      
      const stream = await aiService.streamChat(request);
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          setIsStreaming(false);
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            // Skip keep-alive pings and end signals
            if (data === '[DONE]' || data.trim() === '') {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              // Assuming the response has a content field
              if (parsed.content) {
                setData(prev => prev + parsed.content);
              }
            } catch (parseError) {
              // If it's not JSON, treat as plain text
              setData(prev => prev + data);
            }
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while streaming AI chat';
      setError(errorMessage);
      console.error('AI Chat Stream Error:', err);
      setIsStreaming(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData('');
    setError(null);
    setLoading(false);
    setIsStreaming(false);
  }, []);

  return {
    data,
    loading,
    error,
    isStreaming,
    streamChat,
    reset,
  };
};

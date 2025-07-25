import api from '../lib/api';
import { AIQueryRequest, AIResponse, AIChatRequest, AIChatStreamRequest, AIStructuredQueryRequest, AIStructuredChatRequest, AIStructuredResponse } from '../types/ai';

export const aiService = {
  /**
   * Send a single query to an AI model
   */
  async query(data: AIQueryRequest): Promise<AIResponse> {
    const response = await api.post<AIResponse>('/ai/query', data);
    return response.data;
  },

  /**
   * Continue a conversation with chat history
   */
  async chat(data: AIChatRequest): Promise<AIResponse> {
    const response = await api.post<AIResponse>('/ai/chat', data);
    return response.data;
  },
  /**
   * Stream chat completions using Server-Sent Events
   */
  async streamChat(data: AIChatStreamRequest): Promise<ReadableStream<Uint8Array>> {
    const params = new URLSearchParams();
    params.append('messages', JSON.stringify(data.messages));
    if (data.model) {
      params.append('model', data.model);
    }
    if (data.max_tokens !== undefined) {
      params.append('max_tokens', data.max_tokens.toString());
    }
    if (data.temperature !== undefined) {
      params.append('temperature', data.temperature.toString());
    }

    const response = await fetch(`${api.defaults.baseURL}/ai/chat/stream?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body available for streaming');
    }

    return response.body;
  },

  /**
   * Send a single query with structured JSON output
   */
  async structuredQuery(data: AIStructuredQueryRequest): Promise<AIStructuredResponse> {
    console.log('AI Service - Sending request:', data);
    const response = await api.post<AIStructuredResponse>('/ai/structured-query', data);
    console.log('AI Service - Raw response:', response);
    console.log('AI Service - Response data:', response.data);
    return response.data;
  },

  /**
   * Continue a conversation with structured JSON output
   */
  async structuredChat(data: AIStructuredChatRequest): Promise<AIStructuredResponse> {
    const response = await api.post<AIStructuredResponse>('/ai/structured-chat', data);
    return response.data;
  }
};

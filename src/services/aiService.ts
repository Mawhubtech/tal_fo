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
    const response = await fetch(`${api.defaults.baseURL}/ai/chat/stream`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(data),
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

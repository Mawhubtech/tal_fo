// AI API Types

export interface AIQueryRequest {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

export interface AIResponse {
  content: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIChatRequest {
  messages: ChatMessage[];
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

export interface AIChatStreamRequest {
  messages: ChatMessage[];
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

// Structured API Types
export interface AIStructuredQueryRequest {
  prompt: string;
  schema: Record<string, any>;
  systemPrompt?: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

export interface AIStructuredChatRequest {
  messages: ChatMessage[];
  schema: Record<string, any>;
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

export interface AIStructuredResponse {
  data: Record<string, any>;
}

// Hook return types
export interface UseAIQueryResult {
  data: AIResponse | null;
  loading: boolean;
  error: string | null;
  query: (request: AIQueryRequest) => Promise<void>;
  reset: () => void;
}

export interface UseAIChatResult {
  data: AIResponse | null;
  loading: boolean;
  error: string | null;
  chat: (request: AIChatRequest) => Promise<void>;
  reset: () => void;
}

export interface UseAIChatStreamResult {
  data: string;
  loading: boolean;
  error: string | null;
  isStreaming: boolean;
  streamChat: (request: AIChatStreamRequest) => Promise<void>;
  reset: () => void;
}

export interface UseAIStructuredQueryResult {
  data: AIStructuredResponse | null;
  loading: boolean;
  error: string | null;
  structuredQuery: (request: AIStructuredQueryRequest) => Promise<void>;
  reset: () => void;
}

export interface UseAIStructuredChatResult {
  data: AIStructuredResponse | null;
  loading: boolean;
  error: string | null;
  structuredChat: (request: AIStructuredChatRequest) => Promise<void>;
  reset: () => void;
}

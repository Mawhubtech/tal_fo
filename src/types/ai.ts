// AI API Types

export interface AIQueryRequest {
  prompt: string;
  systemPrompt?: string;
  model?: string;
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
}

export interface AIChatStreamRequest {
  messages: ChatMessage[];
  model?: string;
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

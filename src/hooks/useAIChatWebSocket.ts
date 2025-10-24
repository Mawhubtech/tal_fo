import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface UseAIChatWebSocketResult {
  isConnected: boolean;
  isStreaming: boolean;
  error: string | null;
  sendMessage: (chatId: string, content: string, options?: { max_tokens?: number; temperature?: number }) => void;
  createChat: (options?: { title?: string; systemPrompt?: string; model?: string }) => void;
  getChats: () => void;
  getChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  loadMoreCandidates: (chatId: string, query: string, currentPage: number) => void;
  onMessageReceived: (callback: (data: any) => void) => void;
  onAIChunk: (callback: (data: any) => void) => void;
  onAIComplete: (callback: (data: any) => void) => void;
  onChatCreated: (callback: (data: any) => void) => void;
  onChatsList: (callback: (data: any) => void) => void;
  onChatData: (callback: (data: any) => void) => void;
  onChatDeleted: (callback: (data: any) => void) => void;
  onSearchingCandidates: (callback: (data: any) => void) => void;
  onSearchResults: (callback: (data: any) => void) => void;
  onMatchingJobs: (callback: (data: any) => void) => void;
  onJobMatchResults: (callback: (data: any) => void) => void;
  onError: (callback: (data: any) => void) => void;
}

export const useAIChatWebSocket = (): UseAIChatWebSocketResult => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Event callback refs
  const messageReceivedCallbackRef = useRef<((data: any) => void) | null>(null);
  const aiChunkCallbackRef = useRef<((data: any) => void) | null>(null);
  const aiCompleteCallbackRef = useRef<((data: any) => void) | null>(null);
  const chatCreatedCallbackRef = useRef<((data: any) => void) | null>(null);
  const chatsListCallbackRef = useRef<((data: any) => void) | null>(null);
  const chatDataCallbackRef = useRef<((data: any) => void) | null>(null);
  const chatDeletedCallbackRef = useRef<((data: any) => void) | null>(null);
  const searchingCandidatesCallbackRef = useRef<((data: any) => void) | null>(null);
  const searchResultsCallbackRef = useRef<((data: any) => void) | null>(null);
  const matchingJobsCallbackRef = useRef<((data: any) => void) | null>(null);
  const jobMatchResultsCallbackRef = useRef<((data: any) => void) | null>(null);
  const errorCallbackRef = useRef<((data: any) => void) | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    console.log('🔌 Initializing AI Chat WebSocket connection...');
    console.log('📝 Token available:', !!token);
    
    if (!token) {
      console.error('❌ No authentication token found');
      setError('No authentication token found');
      return;
    }

    // Get base URL from environment or construct it
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const wsURL = baseURL.replace('/api/v1', '');
    
    console.log('🌐 WebSocket URL:', `${wsURL}/ai-chat`);
    console.log('🔑 Using token:', token.substring(0, 20) + '...');

    // Initialize socket connection
    const socket = io(`${wsURL}/ai-chat`, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;
    
    console.log('📡 Socket instance created, waiting for connection...');

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ Connected to AI Chat WebSocket');
      setIsConnected(true);
      setError(null);
    });

    socket.on('connected', (data) => {
      console.log('✅ WebSocket authenticated:', data);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from AI Chat WebSocket');
      setIsConnected(false);
      setIsStreaming(false);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ WebSocket connection error:', err);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error details:', JSON.stringify(err, null, 2));
      setError(err.message);
      setIsConnected(false);
    });

    // Message event handlers
    socket.on('message_received', (data) => {
      console.log('📩 User message received:', data);
      if (messageReceivedCallbackRef.current) {
        messageReceivedCallbackRef.current(data);
      }
    });

    socket.on('ai_response_chunk', (data) => {
      setIsStreaming(true);
      if (aiChunkCallbackRef.current) {
        aiChunkCallbackRef.current(data);
      }
    });

    socket.on('ai_response_complete', (data) => {
      console.log('✅ AI response complete:', data);
      setIsStreaming(false);
      if (aiCompleteCallbackRef.current) {
        aiCompleteCallbackRef.current(data);
      }
    });

    socket.on('chat_created', (data) => {
      console.log('✅ Chat created:', data);
      if (chatCreatedCallbackRef.current) {
        chatCreatedCallbackRef.current(data);
      }
    });

    socket.on('chats_list', (data) => {
      console.log('📋 Chats list received:', data);
      if (chatsListCallbackRef.current) {
        chatsListCallbackRef.current(data);
      }
    });

    socket.on('chat_data', (data) => {
      console.log('📄 Chat data received:', data);
      if (chatDataCallbackRef.current) {
        chatDataCallbackRef.current(data);
      }
    });

    socket.on('chat_deleted', (data) => {
      console.log('🗑️ Chat deleted:', data);
      if (chatDeletedCallbackRef.current) {
        chatDeletedCallbackRef.current(data);
      }
    });

    socket.on('error', (data) => {
      console.error('❌ WebSocket error:', data);
      setError(data.message);
      setIsStreaming(false);
      if (errorCallbackRef.current) {
        errorCallbackRef.current(data);
      }
    });

    // Search event handlers
    socket.on('searching_candidates', (data) => {
      console.log('🔍 Searching candidates:', data);
      setIsStreaming(true); // Show loading state while searching
      if (searchingCandidatesCallbackRef.current) {
        searchingCandidatesCallbackRef.current(data);
      }
    });

    socket.on('search_results', (data) => {
      console.log('✅ Search results received:', data);
      setIsStreaming(false);
      if (searchResultsCallbackRef.current) {
        searchResultsCallbackRef.current(data);
      }
    });

    // Job matching event handlers
    socket.on('matching_jobs', (data) => {
      console.log('🔍 Matching jobs:', data);
      setIsStreaming(true); // Show loading state while matching
      if (matchingJobsCallbackRef.current) {
        matchingJobsCallbackRef.current(data);
      }
    });

    socket.on('job_match_results', (data) => {
      console.log('✅ Job match results received:', data);
      setIsStreaming(false);
      if (jobMatchResultsCallbackRef.current) {
        jobMatchResultsCallbackRef.current(data);
      }
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = useCallback((chatId: string, content: string, options?: { max_tokens?: number; temperature?: number }) => {
    if (!socketRef.current || !isConnected) {
      setError('Not connected to WebSocket');
      return;
    }

    socketRef.current.emit('send_message', {
      chatId,
      content,
      max_tokens: options?.max_tokens,
      temperature: options?.temperature,
    });
  }, [isConnected]);

  const createChat = useCallback((options?: { title?: string; systemPrompt?: string; model?: string }) => {
    if (!socketRef.current || !isConnected) {
      setError('Not connected to WebSocket');
      return;
    }

    socketRef.current.emit('create_chat', options || {});
  }, [isConnected]);

  const getChats = useCallback(() => {
    if (!socketRef.current || !isConnected) {
      setError('Not connected to WebSocket');
      return;
    }

    socketRef.current.emit('get_chats');
  }, [isConnected]);

  const getChat = useCallback((chatId: string) => {
    if (!socketRef.current || !isConnected) {
      setError('Not connected to WebSocket');
      return;
    }

    socketRef.current.emit('get_chat', { chatId });
  }, [isConnected]);

  const deleteChat = useCallback((chatId: string) => {
    if (!socketRef.current || !isConnected) {
      setError('Not connected to WebSocket');
      return;
    }

    socketRef.current.emit('delete_chat', { chatId });
  }, [isConnected]);

  const loadMoreCandidates = useCallback((chatId: string, query: string, currentPage: number) => {
    if (!socketRef.current || !isConnected) {
      setError('Not connected to WebSocket');
      return;
    }

    socketRef.current.emit('load_more_candidates', { chatId, query, currentPage });
  }, [isConnected]);

  // Event callback setters
  const onMessageReceived = useCallback((callback: (data: any) => void) => {
    messageReceivedCallbackRef.current = callback;
  }, []);

  const onAIChunk = useCallback((callback: (data: any) => void) => {
    aiChunkCallbackRef.current = callback;
  }, []);

  const onAIComplete = useCallback((callback: (data: any) => void) => {
    aiCompleteCallbackRef.current = callback;
  }, []);

  const onChatCreated = useCallback((callback: (data: any) => void) => {
    chatCreatedCallbackRef.current = callback;
  }, []);

  const onChatsList = useCallback((callback: (data: any) => void) => {
    chatsListCallbackRef.current = callback;
  }, []);

  const onChatData = useCallback((callback: (data: any) => void) => {
    chatDataCallbackRef.current = callback;
  }, []);

  const onChatDeleted = useCallback((callback: (data: any) => void) => {
    chatDeletedCallbackRef.current = callback;
  }, []);

  const onError = useCallback((callback: (data: any) => void) => {
    errorCallbackRef.current = callback;
  }, []);

  const onSearchingCandidates = useCallback((callback: (data: any) => void) => {
    searchingCandidatesCallbackRef.current = callback;
  }, []);

  const onSearchResults = useCallback((callback: (data: any) => void) => {
    searchResultsCallbackRef.current = callback;
  }, []);

  const onMatchingJobs = useCallback((callback: (data: any) => void) => {
    matchingJobsCallbackRef.current = callback;
  }, []);

  const onJobMatchResults = useCallback((callback: (data: any) => void) => {
    jobMatchResultsCallbackRef.current = callback;
  }, []);

  return {
    isConnected,
    isStreaming,
    error,
    sendMessage,
    createChat,
    getChats,
    getChat,
    deleteChat,
    loadMoreCandidates,
    onMessageReceived,
    onAIChunk,
    onAIComplete,
    onChatCreated,
    onChatsList,
    onChatData,
    onChatDeleted,
    onSearchingCandidates,
    onSearchResults,
    onMatchingJobs,
    onJobMatchResults,
    onError,
  };
};

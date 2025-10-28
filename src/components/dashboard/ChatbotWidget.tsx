import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot,
  Trash2,
  Plus,
  Menu,
  Wifi,
  WifiOff,
  Maximize2,
  Minimize2,
  Loader2,
  Volume2,
  VolumeX
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAIChatWebSocket } from '../../hooks/useAIChatWebSocket';
import { CandidateCard } from '../CandidateCard';
import SourcingProfileSidePanel from '../../sourcing/outreach/components/SourcingProfileSidePanel';
import JobSelectionModal from '../JobSelectionModal';
import { searchApiService } from '../../services/searchApiService';
import { useCreateJobApplication } from '../../hooks/useJobApplications';
import { useShortlistExternalCandidate } from '../../hooks/useShortlistExternal';
import { useAuthContext } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useVoiceChat } from '../../hooks/useVoiceChat';
import { MicrophoneIcon } from '../icons/MicrophoneIcon';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'search_results' | 'load_more_results' | 'job_match_results';
  searchResults?: any[];
  searchQuery?: string; // Store the original search query
  currentPage?: number; // Track current page for pagination
  hasMore?: boolean; // Whether more results are available
  totalResults?: number;
  queryHash?: string; // For cache-based pagination
  matchingId?: string; // For tracking job matching results
  jobMatches?: Array<{
    jobId: string;
    matchScore: number;
    matchReason: string;
    keyMatchPoints: string[];
    job: any;
  }>;
}

interface ChatHistory {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: Date;
}

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your TAL AI assistant. How can I help you today?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  
  // Profile panel state
  const [panelState, setPanelState] = useState<'closed' | 'collapsed' | 'expanded'>('closed');
  const [selectedUserDataForPanel, setSelectedUserDataForPanel] = useState<any>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  
  // Shortlist modal state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedCandidateForShortlist, setSelectedCandidateForShortlist] = useState<any>(null);
  const [isShortlisting, setIsShortlisting] = useState(false);
  
  // Load more state
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Voice/TTS state
  const [isTTSEnabled, setIsTTSEnabled] = useState(true); // Enable TTS by default
  const [isVoiceMode, setIsVoiceMode] = useState(false); // Voice mode - only play TTS when this is on
  const [isTTSLoading, setIsTTSLoading] = useState(false); // Track TTS loading state
  const [pendingAIMessage, setPendingAIMessage] = useState<string | null>(null); // Store AI message until voice starts
  
  // Hooks
  const { user } = useAuthContext();
  const { addToast } = useToast();
  const createJobApplicationMutation = useCreateJobApplication();
  const shortlistExternalMutation = useShortlistExternalCandidate();
  
  // Voice chat hook
  const {
    isRecording,
    isPlaying,
    isSpeaking,
    toggleRecording,
    playAudio,
    stopAudio,
  } = useVoiceChat({
    onTranscript: (text, isFinal) => {
      if (isFinal) {
        // Send the final transcript as a message
        console.log('📝 Final transcript:', text);
      } else {
        // Show interim transcript in UI
        console.log('📝 Interim transcript:', text);
      }
    },
    onAudioData: (audioData) => {
      // Send audio data to backend via WebSocket
      if (activeChatId) {
        console.log('🎤 Sending audio chunk:', audioData.byteLength, 'bytes to chat:', activeChatId);
        sendAudioChunk(activeChatId, audioData);
      } else {
        console.warn('⚠️ No active chat ID, cannot send audio chunk');
      }
    },
    onError: (error) => {
      console.error('Voice chat error:', error);
      addToast({
        type: 'error',
        title: 'Voice Error',
        message: error.message
      });
    },
    onPlaybackStart: () => {
      console.log('🔊 Playback started - showing pending message');
      // When audio starts playing, show the pending AI message
      if (pendingAIMessage) {
        setChatMessages(prev => {
          // Remove loading messages
          let messages = prev.filter(msg => {
            const isLoadingById = loadingMessageIdRef.current && msg.id === loadingMessageIdRef.current;
            const isLoadingByPrefix = msg.id.startsWith('loading-');
            const isLoadingByContent = msg.content === 'Thinking...' || msg.content.includes('Searching') || msg.content.includes('Analyzing');
            return !(isLoadingById || (isLoadingByPrefix && isLoadingByContent));
          });

          const streamingMsg = messages.find(msg => msg.id.startsWith('streaming-'));
          
          if (streamingMsg) {
            // Finalize streaming message
            return messages.map(msg => 
              msg.id === streamingMsg.id
                ? { ...msg, id: `ai-${Date.now()}` }
                : msg
            );
          } else {
            // Add the pending message
            return [...messages, {
              id: `ai-${Date.now()}`,
              content: pendingAIMessage,
              sender: 'ai',
              timestamp: new Date()
            }];
          }
        });
        
        // Clear pending message and loading ref
        setPendingAIMessage(null);
        if (loadingMessageIdRef.current) {
          loadingMessageIdRef.current = null;
        }
      }
    }
  });
  
  // Text-to-Speech function
  /**
   * Strip markdown formatting from text for TTS
   * Converts markdown to plain text so it sounds natural when spoken
   */
  const stripMarkdown = (text: string): string => {
    return text
      // Remove bold/italic (**text**, *text*, __text__, _text_)
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      // Remove headers (# Header)
      .replace(/^#{1,6}\s+/gm, '')
      // Remove links [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove inline code `code`
      .replace(/`([^`]+)`/g, '$1')
      // Remove code blocks ```code```
      .replace(/```[\s\S]*?```/g, '')
      // Remove bullet points (-, *, +)
      .replace(/^[\s]*[-*+]\s+/gm, '')
      // Remove numbered lists (1., 2., etc)
      .replace(/^[\s]*\d+\.\s+/gm, '')
      // Remove horizontal rules (---, ***, ___)
      .replace(/^[\s]*[-*_]{3,}[\s]*$/gm, '')
      // Remove blockquotes (> text)
      .replace(/^>\s+/gm, '')
      // Clean up extra whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const speakText = async (text: string) => {
    // Only play TTS if voice mode is enabled
    if (!isVoiceMode || !text.trim()) {
      return;
    }

    try {
      setIsTTSLoading(true); // Show loading immediately
      console.log('🔊 TTS loading started...');

      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('No auth token for TTS');
        setIsTTSLoading(false);
        return;
      }

      // Strip markdown formatting before sending to TTS
      const plainText = stripMarkdown(text);
      console.log('🔊 Original text length:', text.length);
      console.log('🔊 Plain text length:', plainText.length);

      // Call TTS endpoint
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}/ai/chats/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: plainText,
          voice: 'aura-asteria-en', // Default female voice
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      // Convert response to ArrayBuffer
      const audioData = await response.arrayBuffer();

      console.log(`🔊 Playing TTS audio: ${audioData.byteLength} bytes`);
      setIsTTSLoading(false); // Audio ready, about to play

      // Play audio using voice chat hook (linear16 PCM format at 24kHz)
      await playAudio(audioData, 'linear16', 24000);
      
      console.log('✅ TTS playback completed');
    } catch (error) {
      console.error('❌ TTS error:', error);
      setIsTTSLoading(false);
      // Don't show toast for TTS errors to avoid interrupting the user
    }
  };
  
  // Custom voice recording handler that syncs with WebSocket
  const handleVoiceRecording = () => {
    if (!activeChatId) {
      addToast({
        type: 'error',
        title: 'No Active Chat',
        message: 'Please create or select a chat first'
      });
      return;
    }

    if (!isRecording) {
      // Start recording and WebSocket transcription
      startVoiceTranscription(activeChatId);
      toggleRecording();
    } else {
      // Stop recording and submit transcript
      toggleRecording();
      stopVoiceTranscription(activeChatId, true);
    }
  };
  
  // Track current intent for better loading messages
  const [currentIntent, setCurrentIntent] = useState<string | null>(null);
  const [currentLoadingMessageIndex, setCurrentLoadingMessageIndex] = useState(0);
  
  // Loading messages for different intents
  const loadingMessages = {
    processing: [
      'Processing your request...',
      'Analyzing...',
      'Working on it...'
    ],
    sourcing: [
      'Analyzing your search criteria...',
      'Scanning candidate database...',
      'Matching skills and experience...',
      'Filtering qualified candidates...',
      'Ranking results by relevance...'
    ],
    job_matching: [
      'Analyzing candidate profile...',
      'Scanning available job postings...',
      'Matching skills with requirements...',
      'Evaluating compatibility scores...',
      'Ranking best job matches...'
    ],
    conversation: [
      'Processing your question...',
      'Understanding context...',
      'Analyzing request...',
      'Preparing response...',
      'Thinking...'
    ]
  };
  
  const {
    isConnected,
    isStreaming,
    error: wsError,
    sendMessage,
    createChat,
    getChat,
    getChats,
    loadMoreCandidates,
    onMessageReceived,
    onAIChunk,
    onAIComplete,
    onIntentDetected,
    onChatCreated,
    onChatData,
    onChatsList,
    onSearchingCandidates,
    onSearchResults,
    onMatchingJobs,
    onJobMatchResults,
    onError,
    // Voice methods
    startVoiceTranscription,
    sendAudioChunk,
    stopVoiceTranscription,
    onVoiceTranscript,
    onVoiceTranscriptComplete,
    onVoiceError,
  } = useAIChatWebSocket();
  
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<string>('');
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const pendingMessageRef = useRef<string | null>(null);
  const loadingMessageIdRef = useRef<string | null>(null);

  // Cycle through loading messages when streaming
  useEffect(() => {
    if (!isStreaming || !currentIntent) {
      setCurrentLoadingMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentLoadingMessageIndex((prevIndex) => {
        const messages = loadingMessages[currentIntent as keyof typeof loadingMessages] || loadingMessages.conversation;
        return (prevIndex + 1) % messages.length;
      });
    }, 4000); // Change message every 4 seconds

    return () => clearInterval(interval);
  }, [isStreaming, currentIntent]);

  // Load chat list when connected
  useEffect(() => {
    if (isConnected) {

      getChats();
    }
  }, [isConnected, getChats]);

  // Handle chat list response
  useEffect(() => {
    onChatsList((chats) => {

      
      // Convert backend chat list to frontend format
      const chatHistoriesFromBackend: ChatHistory[] = chats.map((chat: any) => ({
        id: chat.id,
        title: chat.title || 'Untitled Chat',
        messages: [], // Messages will be loaded when chat is selected
        timestamp: new Date(chat.updatedAt || chat.createdAt)
      }));

      setChatHistories(chatHistoriesFromBackend);
      
      // If no active chat and there are chats, select the most recent one
      if (!activeChatId && chatHistoriesFromBackend.length > 0) {
        const mostRecentChat = chatHistoriesFromBackend[0];
        setActiveChatId(mostRecentChat.id);
      }
    });
  }, [onChatsList, activeChatId]);

  // WebSocket event handlers
  useEffect(() => {
    // Handle chat created
    onChatCreated((data) => {

      const newChat: ChatHistory = {
        id: data.chatId,
        title: data.title || 'New Chat',
        messages: [
          {
            id: '1',
            content: 'Hello! I\'m your TAL AI assistant. How can I help you today?',
            sender: 'ai',
            timestamp: new Date(data.createdAt)
          }
        ],
        timestamp: new Date(data.createdAt)
      };
      setChatHistories(prev => [newChat, ...prev]);
      setActiveChatId(data.chatId);
      setChatMessages(newChat.messages);
      setIsCreatingChat(false);
      
      // If there's a pending message, send it now
      if (pendingMessageRef.current) {
        const messageToSend = pendingMessageRef.current;
        pendingMessageRef.current = null;
        
        // Add user message to UI
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          content: messageToSend,
          sender: 'user',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, userMessage]);
        
        // Send via WebSocket
        setTimeout(() => {
          sendMessage(data.chatId, messageToSend, {
            max_tokens: 512,
            temperature: 0.7
          });
        }, 100);
      }
    });
    
  }, [onChatCreated, sendMessage]);

  // WebSocket message event handlers
  useEffect(() => {
    // Handle user message acknowledgment
    onMessageReceived((data) => {

    });

    // Handle AI response chunks - streaming clean tokens from config.writer
    onAIChunk((data) => {
      const token = data.chunk || data.content;
      if (token) {
        setCurrentStreamingMessage(prev => prev + token);
        
        // Update or create streaming message with clean tokens
        setChatMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.sender === 'ai' && lastMessage.id.startsWith('streaming-')) {
            // Update existing streaming message
            return prev.map(msg => 
              msg.id === lastMessage.id 
                ? { ...msg, content: msg.content + token }
                : msg
            );
          } else {
            // Create new streaming message
            return [...prev, {
              id: `streaming-${Date.now()}`,
              content: token,
              sender: 'ai',
              timestamp: new Date()
            }];
          }
        });
      }
    });

    // Handle intent detected - just update the intent for spinner cycling
    onIntentDetected((data) => {
      console.log('🎯 Intent detected (widget):', data);
      
      // Store current intent for cycling spinner messages
      setCurrentIntent(data.intent);
      setCurrentLoadingMessageIndex(0); // Reset to first message
    });

    // Handle AI response completion
    onAIComplete((data) => {
      console.log('🤖 AI response complete:', { 
        fullResponse: data.fullResponse?.substring(0, 100),
        isTTSEnabled,
        hasFullResponse: !!data.fullResponse
      });

      setCurrentStreamingMessage('');
      setCurrentIntent(null); // Clear intent when workflow completes
      
      // If Voice Mode AND TTS is enabled, hold the message and start TTS
      if (isVoiceMode && data.fullResponse) {
        console.log('🔊 Voice Mode enabled - holding message until voice starts...');
        // Store the message to show when voice starts
        setPendingAIMessage(data.fullResponse);
        // Start TTS immediately
        speakText(data.fullResponse).catch(err => {
          console.error('TTS playback error:', err);
          // On error, show the message anyway
          setPendingAIMessage(null);
        });
        // Don't process the message display yet - wait for voice to start
        return;
      } else if (!data.fullResponse) {
        console.warn('⚠️ No fullResponse in AI complete event');
      } else {
        console.log('🔇 Voice Mode disabled, showing message immediately');
      }
      
      // Remove any loading message and finalize streaming message
      setChatMessages(prev => {
        console.log('📋 Current messages before cleanup:', prev.map(m => ({ id: m.id, content: m.content.substring(0, 30) })));
        
        // Remove ALL loading messages
        let messages = prev.filter(msg => {
          const isLoadingById = loadingMessageIdRef.current && msg.id === loadingMessageIdRef.current;
          const isLoadingByPrefix = msg.id.startsWith('loading-');
          const isLoadingByContent = msg.content === 'Thinking...' || msg.content.includes('Searching') || msg.content.includes('Analyzing');
          
          if (isLoadingById || (isLoadingByPrefix && isLoadingByContent)) {

            return false;
          }
          return true;
        });
        
        const streamingMsg = messages.find(msg => msg.id.startsWith('streaming-'));
        
        if (streamingMsg) {
          // Finalize streaming message - just update ID, keep content as-is (already clean)

          return messages.map(msg => 
            msg.id === streamingMsg.id
              ? { ...msg, id: `ai-${Date.now()}` }
              : msg
          );
        } else if (data.fullResponse) {
          // No streaming occurred, add complete response as new message

          return [...messages, {
            id: `ai-${Date.now()}`,
            content: data.fullResponse,
            sender: 'ai',
            timestamp: new Date(data.timestamp || Date.now())
          }];
        }
        
        return messages;
      });
      
      // Clear loading message ref
      if (loadingMessageIdRef.current) {

        loadingMessageIdRef.current = null;
      }
    });

    // Handle errors
    onError((data) => {
      console.error('❌ WebSocket error:', data);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${data.message}`,
        sender: 'ai',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
      setCurrentStreamingMessage('');
      setCurrentIntent(null); // Clear intent on error
    });

    // Handle candidate search initiation
    onSearchingCandidates((data) => {

      // Show searching indicator
      const searchingMessage: ChatMessage = {
        id: `searching-${Date.now()}`,
        content: `Searching for candidates matching: "${data.query}"...`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      };
      setChatMessages(prev => [...prev, searchingMessage]);
    });

    // Handle search results
    onSearchResults((data) => {

      
      setIsLoadingMore(false);
      
      // Check if there's an error
      if (data.error) {
        // Show error message instead of results
        const errorMessage: ChatMessage = {
          id: `search-error-${Date.now()}`,
          content: data.error,
          sender: 'ai',
          timestamp: new Date(),
          type: 'text'
        };
        
        setChatMessages(prev => [
          ...prev.filter(msg => 
            !msg.id.startsWith('searching-') && 
            !msg.id.startsWith('loading-')
          ),
          errorMessage
        ]);
        return;
      }
      
      // Check if this is the first page or load more
      const isFirstPage = data.currentPage === 1;
      
      if (isFirstPage) {
        // Create new results message
        const resultsMessage: ChatMessage = {
          id: `results-${Date.now()}`,
          content: `I found ${data.totalResults || data.results.length} candidate${data.totalResults !== 1 ? 's' : ''} matching your search criteria. Showing ${data.results.length} results.`,
          sender: 'ai',
          timestamp: new Date(),
          type: 'search_results',
          searchResults: data.results,
          searchQuery: data.query,
          currentPage: data.currentPage,
          hasMore: data.hasMore,
          totalResults: data.totalResults,
          queryHash: data.queryHash // Store queryHash for cache-based pagination
        };
        
        // Remove loading messages and add new results in a SINGLE setState call
        // Keep previous search results (different queryHash) for chat history
        setChatMessages(prev => [
          ...prev.filter(msg => 
            !msg.id.startsWith('searching-') && 
            !msg.id.startsWith('loading-')
          ),
          resultsMessage
        ]);
      } else {
        // Append to existing search results
        setChatMessages(prev => 
          prev.map(msg => {
            if (msg.type === 'search_results' && msg.searchQuery === data.query) {
              return {
                ...msg,
                searchResults: [...(msg.searchResults || []), ...data.results],
                currentPage: data.currentPage,
                hasMore: data.hasMore,
                content: `I found ${data.totalResults || 0} candidate${data.totalResults !== 1 ? 's' : ''} matching your search criteria. Showing ${(msg.searchResults?.length || 0) + data.results.length} results.`
              };
            }
            return msg;
          })
        );
      }
    });

    // Handle job matching initiation
    onMatchingJobs((data) => {

      // Show matching indicator
      const matchingMessage: ChatMessage = {
        id: `matching-${Date.now()}`,
        content: `Analyzing ${data.totalJobs || 'available'} jobs to find the best matches for your profile...`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      };
      setChatMessages(prev => [...prev, matchingMessage]);
    });

    // Handle job match results
    onJobMatchResults((data) => {

      
      // Create job match results message
      const matchCount = data.matches?.length || 0;
      
      // Determine the content based on error or results
      let content: string;
      if (data.error) {
        // Show the error message from backend
        content = data.error;
      } else if (matchCount > 0) {
        content = `I found ${matchCount} job${matchCount !== 1 ? 's' : ''} that match the candidate profile! Here are the details with match scores and reasons:`;
      } else {
        content = 'I couldn\'t find any jobs that closely match the candidate profile at the moment. You may want to check back later for new opportunities.';
      }
      
      const resultsMessage: ChatMessage = {
        id: `job-matches-${data.matchingId || Date.now()}`, // Use matchingId for unique ID
        content,
        sender: 'ai',
        timestamp: new Date(),
        type: data.error ? 'text' : 'job_match_results', // Show as text if error
        matchingId: data.matchingId, // Store matchingId for tracking
        jobMatches: data.matches || []
      };
      
      // Remove ONLY the most recent loading/matching message (not all job_match_results)
      // This way each job matching request creates a separate component
      setChatMessages(prev => {
        // Find the index of the last matching/loading message
        let lastMatchingIndex = -1;
        for (let i = prev.length - 1; i >= 0; i--) {
          if (prev[i].id.startsWith('matching-') || 
              (prev[i].id.startsWith('loading-') && prev[i].content.includes('Analyzing'))) {
            lastMatchingIndex = i;
            break;
          }
        }
        
        // Remove only that last matching/loading message, keep all other messages including previous job_match_results
        if (lastMatchingIndex !== -1) {
          return [
            ...prev.slice(0, lastMatchingIndex),
            ...prev.slice(lastMatchingIndex + 1),
            resultsMessage
          ];
        }
        
        // If no matching message found, just append the results
        return [...prev, resultsMessage];
      });
    });

  }, [onMessageReceived, onAIChunk, onAIComplete, onIntentDetected, onError, onSearchingCandidates, onSearchResults, onMatchingJobs, onJobMatchResults, isTTSEnabled, speakText]);

  // Voice event handlers
  useEffect(() => {
    // Handle voice transcripts
    onVoiceTranscript((data) => {
      console.log('📝 Voice transcript received:', data);
      // TODO: Show interim transcript in UI
      // For now, just log it
    });

    // Handle complete transcript
    onVoiceTranscriptComplete((data) => {
      console.log('✅ Voice transcript complete:', data.text);
      console.log('📤 Transcript will be submitted to AI automatically');
      addToast({
        type: 'success',
        title: 'Message Sent',
        message: 'Your voice message has been sent to AI'
      });
    });

    // Handle voice errors
    onVoiceError((data) => {
      console.error('❌ Voice error:', data);
      addToast({
        type: 'error',
        title: 'Voice Error',
        message: data.message || 'An error occurred during voice transcription'
      });
    });
  }, [onVoiceTranscript, onVoiceTranscriptComplete, onVoiceError, addToast]);

  // Load chat history when activeChatId changes
  useEffect(() => {
    if (!activeChatId || !isConnected) {
      return;
    }

    // Clear loading state when switching chats
    setCurrentIntent(null);
    setCurrentLoadingMessageIndex(0);
    
    // Request chat data from backend
    getChat(activeChatId);

    // Handle chat data response
    const unsubscribe = onChatData((chatData) => {

      
      if (chatData.id !== activeChatId) {
        // Ignore if it's for a different chat
        return;
      }

      // Convert backend messages to frontend format
      const loadedMessages: ChatMessage[] = chatData.messages
        .filter((msg: any) => {
          // Filter out system messages
          if (msg.role === 'system') return false;
          
          // Filter out messages that look like enriched prompts (contain structured candidate profile)
          if (msg.content && typeof msg.content === 'string') {
            const hasEnrichedPrompt = msg.content.includes('CANDIDATE PROFILE FROM CACHE') ||
                                     msg.content.includes('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            if (hasEnrichedPrompt) {
              console.warn('Filtered out enriched prompt from chat history:', msg.content.substring(0, 100));
              return false;
            }
          }
          
          return true;
        })
        .map((msg: any, index: number) => {
        // Backend stores messages with metadata field if available
        const metadata = (msg as any).metadata;
        let messageType: ChatMessage['type'] = 'text';
        let content = msg.content;
        let searchResults: any[] | undefined;
        let jobMatches: any[] | undefined;
        let searchQuery: string | undefined;
        let currentPage: number | undefined;
        let hasMore: boolean | undefined;
        let totalResults: number | undefined;
        let queryHash: string | undefined;

        // Check metadata for message type and full data
        if (metadata) {
          if (metadata.type === 'search_results') {
            messageType = 'search_results';
            searchResults = metadata.candidates || []; // Full candidate data from backend
            searchQuery = metadata.query;
            currentPage = metadata.currentPage || 1;
            hasMore = metadata.hasMore || false;
            totalResults = metadata.totalResults;
            queryHash = metadata.queryHash;
            

          } else if (metadata.type === 'job_match_results') {
            messageType = 'job_match_results';
            jobMatches = metadata.matches || []; // Full job match data from backend
            

          } else if (metadata.type === 'conversation') {
            messageType = 'text';
          }
        }

        return {
          id: `history-${index}-${msg.timestamp}`,
          content: content,
          sender: msg.role === 'user' ? 'user' : 'ai',
          timestamp: new Date(msg.timestamp),
          type: messageType,
          searchResults: searchResults,
          searchQuery: searchQuery,
          currentPage: currentPage,
          hasMore: hasMore,
          totalResults: totalResults,
          queryHash: queryHash,
          jobMatches: jobMatches,
        };
      });

      // Update chat messages with loaded history
      setChatMessages(prev => {
        // Check if we only have the loading message or if we have actual messages
        const hasOnlyLoadingMessage = prev.length === 1 && prev[0].id === 'loading-history';
        const hasOnlyWelcomeMessage = prev.length === 1 && prev[0].id === '1';
        
        // Replace if we only have loading/welcome message, otherwise keep existing messages
        if (hasOnlyLoadingMessage || hasOnlyWelcomeMessage || prev.length === 0) {
          return loadedMessages;
        }
        
        // Keep existing messages if user has already started typing/interacting
        return prev;
      });
      

    });

    return () => {
      // Cleanup if needed
    };
  }, [activeChatId, isConnected, getChat, onChatData]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isStreaming]);

  // Save current chat to history when switching or closing
  useEffect(() => {
    if (activeChatId && chatMessages.length > 1) {
      setChatHistories(prev => 
        prev.map(chat => 
          chat.id === activeChatId 
            ? { ...chat, messages: chatMessages }
            : chat
        )
      );
    }
  }, [chatMessages, activeChatId]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isStreaming || !isConnected || isCreatingChat) return;

    const currentInput = chatInput;
    setChatInput('');

    // Check if user is asking about a specific candidate from search results
    const candidateQuestionPatterns = [
      /tell me about\s+(.+)/i,
      /what (?:do you know )?about\s+(.+)/i,
      /who is\s+(.+)/i,
      /tell me more about\s+(.+)/i,
      /(?:give me |show me )?(?:info|information|details) (?:about|on)\s+(.+)/i,
      /can you tell me about\s+(.+)/i,
      /(?:describe|explain)\s+(.+)/i
    ];

    let candidateName: string | null = null;
    for (const pattern of candidateQuestionPatterns) {
      const match = currentInput.match(pattern);
      if (match && match[1]) {
        candidateName = match[1].trim();
        break;
      }
    }

    if (candidateName) {

      
      // Search through all recent search results (both initial and load_more_results)
      const allSearchResults: any[] = [];
      chatMessages.forEach(msg => {
        if ((msg.type === 'search_results' || msg.type === 'load_more_results') && msg.searchResults) {
          allSearchResults.push(...msg.searchResults);
        }
      });

      // Find candidate by name (case-insensitive partial match)
      const foundCandidate = allSearchResults.find(result => 
        result.candidate?.fullName?.toLowerCase().includes(candidateName!.toLowerCase())
      );

      if (foundCandidate) {

        
        // Add user message (original question)
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          content: currentInput,
          sender: 'user',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, userMessage]);

        // Prepare candidate data for AI
        const candidate = foundCandidate.candidate;
        const matchCriteria = foundCandidate.matchCriteria || {};
        
        // Build structured candidate data for AI context
        const candidateContext = {
          fullName: candidate.fullName,
          location: candidate.location,
          email: candidate.email,
          phone: candidate.phone,
          summary: candidate.summary,
          experience: candidate.experience?.map((exp: any) => ({
            title: exp.title,
            company: exp.company,
            startDate: exp.startDate,
            endDate: exp.endDate,
            current: exp.current,
            description: exp.description,
            location: exp.location
          })) || [],
          education: candidate.education?.map((edu: any) => ({
            institution: edu.institution,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy,
            startDate: edu.startDate,
            endDate: edu.endDate
          })) || [],
          skills: candidate.skillMappings?.map((sm: any) => ({
            name: sm.skill?.name,
            level: sm.level,
            yearsOfExperience: sm.yearsOfExperience
          })) || candidate.skills || [],
          certifications: candidate.certifications,
          projects: candidate.projects,
          languages: candidate.languages,
          matchedSkills: matchCriteria.skillMatch || [],
          matchScore: foundCandidate.score
        };

        // Create a concise prompt that won't trigger sourcing detection
        // Use "CANDIDATE_INFO:" prefix to help backend identify this is not a sourcing query
        const enhancedPrompt = `Based on this candidate profile, ${currentInput.toLowerCase().includes('tell me') || currentInput.toLowerCase().includes('about') ? 'provide a comprehensive summary' : currentInput}

CANDIDATE_INFO:
Name: ${candidate.fullName}
Location: ${candidate.location || 'Not specified'}
Summary: ${candidate.summary || 'No summary available'}

Experience: ${candidate.experience?.length || 0} positions
${candidate.experience?.slice(0, 3).map((exp: any, idx: number) => 
  `${idx + 1}. ${exp.title} at ${exp.company} (${exp.current ? 'Current' : exp.endDate ? new Date(exp.endDate).getFullYear() : 'N/A'})`
).join('\n') || 'No experience listed'}

Skills: ${candidateContext.skills.map((s: any) => s.name).join(', ') || 'Not specified'}

Education: ${candidate.education?.[0] ? `${candidate.education[0].degree} from ${candidate.education[0].institution}` : 'Not specified'}

Please provide a natural, conversational summary highlighting their strengths, experience, and fit.`;

        // Send to AI via WebSocket with candidate context
        if (activeChatId) {
          try {
            sendMessage(activeChatId, enhancedPrompt, {
              max_tokens: 1024,
              temperature: 0.7
            });
          } catch (error) {
            console.error('❌ Error sending candidate info to AI:', error);
            const errorMessage: ChatMessage = {
              id: `error-${Date.now()}`,
              content: 'Sorry, I encountered an error while analyzing this candidate. Please try again.',
              sender: 'ai',
              timestamp: new Date()
            };
            setChatMessages(prev => [...prev, errorMessage]);
          }
        }
        return;
      } else {

        
        // Add user message
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          content: currentInput,
          sender: 'user',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, userMessage]);

        // Inform user that candidate wasn't found
        const notFoundMessage: ChatMessage = {
          id: `not-found-${Date.now()}`,
          content: `I couldn't find a candidate named "${candidateName}" in the recent search results. Please make sure you've searched for candidates first, or try asking about a different candidate from the results.`,
          sender: 'ai',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, notFoundMessage]);
        return;
      }
    }

    // Check if user is asking for more candidates
    const isAskingForMore = /\b(more|show more|load more|next|additional|another|more candidates|see more)\b/i.test(currentInput);
    

    
    if (isAskingForMore && activeChatId) {
      // Find the last search results message
      const lastSearchMessage = [...chatMessages].reverse().find(msg => msg.type === 'search_results');
      
      console.log('📋 Last search message:', { 
        hasMessage: !!lastSearchMessage,
        hasMore: lastSearchMessage?.hasMore,
        queryHash: lastSearchMessage?.queryHash,
        currentPage: lastSearchMessage?.currentPage
      });
      
      if (lastSearchMessage && lastSearchMessage.hasMore && lastSearchMessage.queryHash) {

        // User is asking for more candidates from previous search
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          content: currentInput,
          sender: 'user',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, userMessage]);
        
        // Load more candidates from cache
        setIsLoadingMore(true);
        try {
          const nextPage = (lastSearchMessage.currentPage || 1) + 1;
          const response = await searchApiService.loadCandidatesFromCache(
            lastSearchMessage.queryHash,
            nextPage,
            3
          );
          
          // Add the new results as a separate "load_more_results" message
          const loadMoreMessage: ChatMessage = {
            id: `load-more-${Date.now()}`,
            content: `Here are ${response.results.length} more candidate${response.results.length !== 1 ? 's' : ''}.`,
            sender: 'ai',
            timestamp: new Date(),
            type: 'load_more_results',
            searchResults: response.results,
            currentPage: nextPage,
            hasMore: response.page < response.totalPages,
            totalResults: response.total,
            queryHash: lastSearchMessage.queryHash,
            searchQuery: lastSearchMessage.searchQuery
          };
          
          setChatMessages(prev => [...prev, loadMoreMessage]);
          
          // Update the original search message to reflect the new page count
          setChatMessages(prev => 
            prev.map(msg => {
              if (msg.id === lastSearchMessage.id) {
                return {
                  ...msg,
                  currentPage: nextPage,
                  hasMore: response.page < response.totalPages
                };
              }
              return msg;
            })
          );
        } catch (error) {
          console.error('Error loading more candidates:', error);
          const errorMessage: ChatMessage = {
            id: `error-${Date.now()}`,
            content: 'Sorry, I couldn\'t load more candidates. Please try again.',
            sender: 'ai',
            timestamp: new Date()
          };
          setChatMessages(prev => [...prev, errorMessage]);
        } finally {
          setIsLoadingMore(false);
        }
        return;
      } else if (lastSearchMessage && lastSearchMessage.hasMore) {
        // queryHash is missing, inform user
        console.warn('⚠️ No queryHash available for cache-based pagination');
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          content: currentInput,
          sender: 'user',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, userMessage]);
        
        const warningMessage: ChatMessage = {
          id: `warning-${Date.now()}`,
          content: 'I\'m sorry, but I can\'t load more candidates right now. The search session has expired. Please start a new search.',
          sender: 'ai',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, warningMessage]);
        return;
      }
    }


    
    // If no active chat, create one first
    if (!activeChatId) {
      setIsCreatingChat(true);
      
      // Store message to send after chat is created
      pendingMessageRef.current = currentInput;
      
      // Create chat with first message as title
      createChat({
        title: currentInput.slice(0, 30) + (currentInput.length > 30 ? '...' : ''),
        // No system prompt - backend will use default
      });
      
      return;
    }

    // Add user message to UI
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: currentInput,
      sender: 'user',
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);

    // Set initial "processing" intent to show generic loading in spinner
    // This will be updated when intent is received from supervisor
    setCurrentIntent('processing');
    setCurrentLoadingMessageIndex(0);

    // Update chat title if it's still "New Chat"
    if (activeChatId) {
      setChatHistories(prev => 
        prev.map(chat => 
          chat.id === activeChatId && chat.title === 'New Chat'
            ? { ...chat, title: currentInput.slice(0, 30) + (currentInput.length > 30 ? '...' : '') }
            : chat
        )
      );
    }

    try {
      // Send message via WebSocket
      sendMessage(activeChatId, currentInput, {
        max_tokens: 512,
        temperature: 0.7
      });
    } catch (error) {
      console.error('❌ WebSocket Send Error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
        sender: 'ai',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleNewChat = () => {
    // Clear active chat and messages to start fresh
    // New chat will be created when user sends first message
    setActiveChatId(null);
    setCurrentIntent(null); // Clear loading state when starting new chat
    setCurrentLoadingMessageIndex(0); // Reset loading message index
    setChatMessages([
      {
        id: '1',
        content: 'Hello! I\'m your TAL AI assistant. How can I help you today?',
        sender: 'ai',
        timestamp: new Date()
      }
    ]);
  };

  const handleSelectChat = (chatId: string) => {
    // Set active chat - the useEffect will automatically load chat history from backend
    setActiveChatId(chatId);
    
    // Clear current messages and show loading state
    setChatMessages([{
      id: 'loading-history',
      content: 'Loading chat history...',
      sender: 'ai',
      timestamp: new Date()
    }]);
  };

  // Convert candidate data to user data format for profile panel
  const convertCandidateToUserData = (candidateMatch: any) => {
    const candidateData = candidateMatch.candidate || candidateMatch;
    
    // Convert skillMappings to skills array
    const skills = candidateData.skillMappings 
      ? candidateData.skillMappings.map((mapping: any) => ({
          id: mapping.skill?.id || mapping.skillId,
          name: mapping.skill?.name || mapping.name || 'Unknown Skill',
          category: mapping.skill?.category || 'other',
          level: mapping.level || 'intermediate',
          yearsOfExperience: mapping.yearsOfExperience || 0,
          isHighlighted: mapping.isHighlighted || false
        }))
      : (candidateData.skills ? candidateData.skills.map((skill: any) => 
          typeof skill === 'string' ? { name: skill, category: 'other' } : skill
        ) : []);

    // Convert interests to proper format
    const interests = candidateData.interests 
      ? candidateData.interests.map((interest: any) => ({
          id: interest.id || Math.random().toString(),
          name: interest.name || interest,
          category: interest.category || 'personal',
          description: interest.description || null
        }))
      : [];

    // Convert languages to proper format  
    const languages = candidateData.languages 
      ? candidateData.languages.map((lang: any) => ({
          language: lang.language || lang.name || lang,
          proficiency: lang.proficiency || 'unknown'
        }))
      : [];

    // Convert certifications to proper format
    const certifications = candidateData.certifications 
      ? candidateData.certifications.map((cert: any) => ({
          name: cert.name || cert.title || 'Unknown Certification',
          issuer: cert.issuer || cert.organization || 'Unknown Issuer',
          dateIssued: cert.dateIssued || cert.date || cert.startDate || '',
          expirationDate: cert.expirationDate || cert.endDate
        }))
      : [];

    // Convert awards to proper format
    const awards = candidateData.awards 
      ? candidateData.awards.map((award: any) => ({
          name: award.name || award.title || 'Unknown Award',
          issuer: award.issuer || award.organization || 'Unknown Issuer',
          date: award.date || award.dateReceived || '',
          description: award.description || ''
        }))
      : [];

    // Convert references to proper format
    const references = candidateData.references 
      ? candidateData.references.map((ref: any) => ({
          name: ref.name || 'Unknown Reference',
          position: ref.position || ref.title || 'Unknown Position',
          company: ref.company || ref.organization || 'Unknown Company',
          email: ref.email || '',
          phone: ref.phone || '',
          relationship: ref.relationship || 'colleague'
        }))
      : [];

    return {
      personalInfo: {
        fullName: candidateData.fullName || 'Unknown',
        email: typeof candidateData.email === 'boolean' ? '' : (candidateData.email || ''),
        phone: candidateData.phone || '',
        location: typeof candidateData.location === 'boolean' ? 'Location Available' : (candidateData.location || 'Not specified'),
        website: candidateData.website || '',
        linkedIn: candidateData.linkedIn || candidateData.linkedinUrl || '',
        github: candidateData.github || '',
        facebook: candidateData.facebook || candidateData.facebookUrl || candidateData.facebook_url || '',
        twitter: candidateData.twitter || candidateData.twitterUrl || candidateData.twitter_url || '',
        avatar: candidateData.avatar || ''
      },
      summary: candidateData.summary || candidateData.profileSummary || '',
      experience: candidateData.experience || candidateData.workExperience || [],
      education: candidateData.education || [],
      skills: skills,
      projects: candidateData.projects || [],
      certifications: certifications,
      awards: awards,
      interests: interests,
      languages: languages,
      references: references,
      customFields: [],
      coreSignalId: candidateData.coreSignalId || undefined,
      rawCandidateData: candidateMatch,
      ...(candidateData.notesData && { notesData: candidateData.notesData })
    };
  };

  // Handle opening profile panel
  const handleOpenProfilePanel = (candidateMatch: any) => {
    const userData = convertCandidateToUserData(candidateMatch);
    setSelectedUserDataForPanel(userData);
    setSelectedCandidateId(candidateMatch.candidate?.id || null);
    setPanelState('collapsed');
  };

  // Handle shortlist candidate - opens job selection modal
  const handleShortlistCandidate = (candidateMatch: any) => {
    setSelectedCandidateForShortlist(candidateMatch);
    setShowProjectModal(true);
  };

  // Handle job selected from modal
  const handleJobSelected = async (jobId: string) => {
    if (!selectedCandidateForShortlist) {
      addToast({
        type: 'error',
        title: 'No candidate selected',
        message: 'Please select a candidate first'
      });
      throw new Error('No candidate selected');
    }

    try {
      setIsShortlisting(true);

      // AI Chat candidates are ALWAYS from CoreSignal (external source)
      // Extract candidate data from the wrapper object
      const candidate = selectedCandidateForShortlist.candidate || selectedCandidateForShortlist;
      
      // Get the actual coreSignalId - prioritize top-level field from backend
      let actualCoreSignalId = candidate.coreSignalId;
      
      // Parse notes/notesData to get the full CoreSignal data
      let fullCandidateData = { ...candidate };
      if (candidate.notesData) {
        // notesData is already an object
        fullCandidateData = { ...candidate, ...candidate.notesData };
        if (!actualCoreSignalId && candidate.notesData.coreSignalId) {
          actualCoreSignalId = candidate.notesData.coreSignalId;
        }
      } else if (candidate.notes) {
        // notes might be a JSON string
        try {
          const notesData = typeof candidate.notes === 'string' 
            ? JSON.parse(candidate.notes) 
            : candidate.notes;
          fullCandidateData = { ...candidate, ...notesData };
          if (!actualCoreSignalId && notesData.coreSignalId) {
            actualCoreSignalId = notesData.coreSignalId;
          }
        } catch (e) {
          console.warn('Could not parse candidate notes:', e);
        }
      }
      
      // Validate we have a coreSignalId
      if (!actualCoreSignalId) {
        console.error('No coreSignalId found for AI Chat candidate:', candidate);
        throw new Error('Cannot save AI Chat candidate without coreSignalId');
      }
      
      console.log('[ChatbotWidget] Saving AI Chat candidate with coreSignalId:', actualCoreSignalId);
      
      // Step 1: Save external candidate to database first
      const shortlistResult = await shortlistExternalMutation.mutateAsync({
        coreSignalId: actualCoreSignalId,
        candidateData: fullCandidateData,
        createdBy: user?.id || ''
      });

      // Extract candidate ID from result
      const candidateIdForApplication = shortlistResult.candidateId || shortlistResult.existingCandidateId;

      if (!candidateIdForApplication) {
        throw new Error('Failed to get candidate ID from shortlist result');
      }

      if (shortlistResult.success && !shortlistResult.existingCandidateId) {
        addToast({
          type: 'success',
          title: 'Candidate Saved',
          message: shortlistResult.message,
          duration: 2000
        });
      }

      // Step 2: Create job application with the database candidate ID
      await createJobApplicationMutation.mutateAsync({
        jobId: jobId,
        candidateId: candidateIdForApplication,
        status: 'Applied',
        appliedDate: new Date().toISOString(),
      });

      addToast({
        type: 'success',
        title: 'Added to Job',
        message: `${candidate.fullName || 'Candidate'} has been added to the job successfully.`,
        duration: 3000
      });

      setShowProjectModal(false);
      setSelectedCandidateForShortlist(null);
    } catch (error: any) {
      console.error('Error adding candidate to job:', error);
      
      if (error?.response?.status === 409 || error?.message?.includes('already applied')) {
        addToast({
          type: 'info',
          title: 'Already Applied',
          message: `${selectedCandidateForShortlist.candidate?.fullName || 'Candidate'} has already applied to this job.`,
          duration: 3000
        });
      } else {
        addToast({
          type: 'error',
          title: 'Failed to Add to Job',
          message: error instanceof Error ? error.message : 'Failed to add candidate to the job. Please try again.',
          duration: 5000
        });
      }
      throw error;
    } finally {
      setIsShortlisting(false);
    }
  };

  // Handle add to database (without job)
  const handleAddToDatabase = async () => {
    if (!selectedCandidateForShortlist) return;

    try {
      setIsShortlisting(true);

      // AI Chat candidates are ALWAYS from CoreSignal (external source)
      const candidate = selectedCandidateForShortlist.candidate || selectedCandidateForShortlist;
      
      // Get the actual coreSignalId - prioritize top-level field from backend
      let actualCoreSignalId = candidate.coreSignalId;
      
      // Parse notes/notesData to get the full CoreSignal data
      let fullCandidateData = { ...candidate };
      if (candidate.notesData) {
        fullCandidateData = { ...candidate, ...candidate.notesData };
        if (!actualCoreSignalId && candidate.notesData.coreSignalId) {
          actualCoreSignalId = candidate.notesData.coreSignalId;
        }
      } else if (candidate.notes) {
        try {
          const notesData = typeof candidate.notes === 'string' 
            ? JSON.parse(candidate.notes) 
            : candidate.notes;
          fullCandidateData = { ...candidate, ...notesData };
          if (!actualCoreSignalId && notesData.coreSignalId) {
            actualCoreSignalId = notesData.coreSignalId;
          }
        } catch (e) {
          console.warn('Could not parse candidate notes:', e);
        }
      }

      if (!actualCoreSignalId) {
        console.error('No coreSignalId found for AI Chat candidate:', candidate);
        throw new Error('Cannot save AI Chat candidate without coreSignalId');
      }

      console.log('[ChatbotWidget] Adding AI Chat candidate to database with coreSignalId:', actualCoreSignalId);

      const shortlistResult = await shortlistExternalMutation.mutateAsync({
        coreSignalId: actualCoreSignalId,
        candidateData: fullCandidateData,
        createdBy: user?.id || ''
      });

      if (shortlistResult.success) {
        addToast({
          type: 'success',
          title: 'Candidate Added to Database',
          message: shortlistResult.message,
          duration: 3000
        });
      } else if (shortlistResult.existingCandidateId) {
        addToast({
          type: 'info',
          title: 'Candidate Already Exists',
          message: shortlistResult.message || 'This candidate is already in your database',
          duration: 3000
        });
      }
      
      setShowProjectModal(false);
      setSelectedCandidateForShortlist(null);
    } catch (error) {
      console.error('Error adding candidate to database:', error);
      addToast({
        type: 'error',
        title: 'Failed to Add Candidate',
        message: error instanceof Error ? error.message : 'Failed to add candidate to database. Please try again.',
        duration: 7000
      });
    } finally {
      setIsShortlisting(false);
    }
  };

  // Handle panel state changes
  const handlePanelStateChange = (newState: 'closed' | 'collapsed' | 'expanded') => {
    setPanelState(newState);
    if (newState === 'closed') {
      setSelectedUserDataForPanel(null);
      setSelectedCandidateId(null);
    }
  };

  // Handle load more candidates
  const handleLoadMore = (searchQuery: string, currentPage: number) => {
    if (!activeChatId || isLoadingMore) return;
    
    setIsLoadingMore(true);
    loadMoreCandidates(activeChatId, searchQuery, currentPage);
  };

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // TODO: Call WebSocket deleteChat when backend implements it
    // deleteChat(chatId);
    
    setChatHistories(prev => {
      const filtered = prev.filter(chat => chat.id !== chatId);
      
      // If deleting active chat, switch to another or start fresh
      if (chatId === activeChatId) {
        if (filtered.length > 0) {
          setActiveChatId(filtered[0].id);
          setChatMessages(filtered[0].messages);
        } else {
          // Reset to fresh state (no active chat)
          setActiveChatId(null);
          setChatMessages([
            {
              id: '1',
              content: 'Hello! I\'m your TAL AI assistant. How can I help you today?',
              sender: 'ai',
              timestamp: new Date()
            }
          ]);
        }
      }
      
      return filtered;
    });
  };

  const chatContent = (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-all duration-200 hover:scale-110 z-50"
          aria-label="Open chatbot"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bg-white shadow-2xl border border-gray-200 z-50 flex transition-all duration-300 ${
            isMinimized 
              ? 'bottom-6 right-6 w-80 h-16 rounded-lg' 
              : isFullScreen
              ? 'inset-0 w-full h-full rounded-none'
              : 'bottom-6 right-6 w-[90vw] md:w-[85vw] lg:w-[75vw] xl:w-[70vw] h-[80vh] max-w-6xl rounded-lg'
          }`}
        >
          {/* History Sidebar */}
          {!isMinimized && showHistory && (
            <div className="w-64 border-r border-gray-200 flex flex-col bg-gray-50">
              {/* History Header */}
              <div className="p-4 border-b border-gray-200">
                <button
                  onClick={handleNewChat}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">New Chat</span>
                </button>
              </div>

              {/* History List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {chatHistories.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleSelectChat(chat.id)}
                    className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                      chat.id === activeChatId
                        ? 'bg-purple-100 border border-purple-200'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {chat.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {chat.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                        aria-label="Delete chat"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className={`flex items-center justify-between p-4 border-b border-gray-200 bg-purple-600 text-white ${isFullScreen ? '' : 'rounded-t-lg'}`}>
              <div className="flex items-center space-x-3">
                {!isMinimized && (
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="p-1 hover:bg-purple-700 rounded transition-colors"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                )}
                <Bot className="w-5 h-5" />
                <div>
                  <h3 className="text-sm font-semibold flex items-center space-x-2">
                    <span>TAL AI Assistant</span>
                    {isConnected ? (
                      <span title="Connected"><Wifi className="w-3 h-3 text-green-300" /></span>
                    ) : (
                      <span title="Disconnected"><WifiOff className="w-3 h-3 text-red-300" /></span>
                    )}
                  </h3>
                  {!isMinimized && (
                    <p className="text-xs text-purple-100">Ask me anything about TAL Platform</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!isMinimized && (
                  <>
                    {/* Voice Mode Toggle */}
                    <button
                      onClick={() => {
                        setIsVoiceMode(!isVoiceMode);
                        if (!isVoiceMode) {
                          addToast({
                            type: 'success',
                            title: 'Voice Mode Enabled',
                            message: 'AI responses will be spoken aloud'
                          });
                        } else {
                          stopAudio(); // Stop any playing audio
                          setPendingAIMessage(null); // Clear any pending messages
                        }
                      }}
                      className={`p-1 rounded transition-colors ${
                        isVoiceMode 
                          ? 'bg-purple-700 hover:bg-purple-800' 
                          : 'hover:bg-purple-700'
                      }`}
                      title={isVoiceMode ? "Voice Mode: ON (Click to disable)" : "Voice Mode: OFF (Click to enable)"}
                    >
                      {isVoiceMode ? (
                        <Volume2 className="w-5 h-5" />
                      ) : (
                        <VolumeX className="w-5 h-5" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => setIsFullScreen(!isFullScreen)}
                      className="p-1 hover:bg-purple-700 rounded transition-colors"
                      title={isFullScreen ? "Exit fullscreen" : "Fullscreen"}
                    >
                      {isFullScreen ? (
                        <Minimize2 className="w-5 h-5" />
                      ) : (
                        <Maximize2 className="w-5 h-5" />
                      )}
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setIsMinimized(!isMinimized);
                    if (!isMinimized) setIsFullScreen(false); // Exit fullscreen when minimizing
                  }}
                  className="p-1 hover:bg-purple-700 rounded transition-colors"
                  title={isMinimized ? "Maximize" : "Minimize"}
                >
                  <span className="text-lg leading-none">{isMinimized ? '□' : '_'}</span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-purple-700 rounded transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Chat Messages */}
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
                >
                  {chatMessages.map((message) => (
                    <div key={message.id}>
                      {/* Regular text message */}
                      {(!message.type || message.type === 'text') && (
                        <div
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-3 rounded-lg shadow-sm ${
                              message.sender === 'user'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-gray-900 border border-gray-200'
                            }`}
                          >
                            <div className="text-sm">
                              {message.sender === 'ai' ? (
                                <div className="markdown-content">
                                  <ReactMarkdown 
                                    components={{
                                      p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                                      h1: ({children}) => <h1 className="text-base font-bold mb-2">{children}</h1>,
                                      h2: ({children}) => <h2 className="text-sm font-bold mb-2">{children}</h2>,
                                      h3: ({children}) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                                      strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                                      em: ({children}) => <em className="italic">{children}</em>,
                                      code: ({children}) => <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                                      ul: ({children}) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
                                      ol: ({children}) => <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>,
                                      li: ({children}) => <li className="text-sm">{children}</li>,
                                      blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 pl-3 italic text-gray-700 mb-2">{children}</blockquote>,
                                    }}
                                  >
                                    {message.content}
                                  </ReactMarkdown>
                                </div>
                              ) : (
                                <p className="whitespace-pre-wrap">{message.content}</p>
                              )}
                            </div>
                            <p
                              className={`text-xs mt-2 ${
                                message.sender === 'user' ? 'text-purple-200' : 'text-gray-500'
                              }`}
                            >
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Search results display */}
                      {message.type === 'search_results' && message.searchResults && (
                        <div className="mb-4">
                          {/* Results summary */}
                          <div className="flex justify-start mb-2">
                            <div className="bg-white text-gray-900 px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
                              <div className="text-sm">
                                <p className="font-medium text-purple-600">{message.content}</p>
                                <p className="text-xs text-gray-500 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Candidate cards */}
                          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                            <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
                              {message.searchResults.map((candidate, idx) => (
                                <CandidateCard
                                  key={candidate.candidate?.id || idx}
                                  candidate={candidate}
                                  compact={true}
                                  onViewProfile={(cand) => {
                                    handleOpenProfilePanel(cand);
                                  }}
                                  onShortlist={(cand) => {
                                    handleShortlistCandidate(cand);
                                  }}
                                />
                              ))}
                            </div>
                            
                            {/* Show hint if more results available */}
                            {message.hasMore && (
                              <div className="p-3 border-t border-gray-200 bg-purple-50">
                                <p className="text-xs text-purple-700 text-center">
                                  💬 Ask me to "show more candidates" to see additional results
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Load more results display - shown separately */}
                      {message.type === 'load_more_results' && message.searchResults && (
                        <div className="mb-4">
                          {/* Load more summary */}
                          <div className="flex justify-start mb-2">
                            <div className="bg-white text-gray-900 px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
                              <div className="text-sm">
                                <p className="font-medium text-green-600">{message.content}</p>
                                <p className="text-xs text-gray-500 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* New candidate cards with distinct styling */}
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 shadow-sm overflow-hidden">
                            <div className="px-3 py-2 bg-green-100 border-b border-green-200">
                              <p className="text-xs font-semibold text-green-700 flex items-center gap-2">
                                <Plus className="w-3 h-3" />
                                Newly Loaded Candidates
                              </p>
                            </div>
                            <div className="divide-y divide-green-100 max-h-[500px] overflow-y-auto">
                              {message.searchResults.map((candidate, idx) => (
                                <CandidateCard
                                  key={candidate.candidate?.id || idx}
                                  candidate={candidate}
                                  compact={true}
                                  onViewProfile={(cand) => {
                                    handleOpenProfilePanel(cand);
                                  }}
                                  onShortlist={(cand) => {
                                    handleShortlistCandidate(cand);
                                  }}
                                />
                              ))}
                            </div>
                            
                            {/* Show hint if more results available */}
                            {message.hasMore && (
                              <div className="p-3 border-t border-green-200 bg-green-50">
                                <p className="text-xs text-green-700 text-center">
                                  💬 Ask me to "show more candidates" to see additional results
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Job match results display */}
                      {message.type === 'job_match_results' && (
                        <div className="mb-4">
                          {/* Results summary */}
                          <div className="flex justify-start mb-2">
                            <div className="bg-white text-gray-900 px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
                              <div className="text-sm">
                                <p className="font-medium text-blue-600">{message.content}</p>
                                <p className="text-xs text-gray-500 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Job match cards - Ultra compact container */}
                          {message.jobMatches && message.jobMatches.length > 0 && (
                            <div className="bg-white rounded-lg border border-blue-200 shadow-sm overflow-hidden">
                              <div className="divide-y divide-blue-100 max-h-[400px] overflow-y-auto">
                                {message.jobMatches.map((match, idx) => (
                                  <div 
                                    key={match.jobId || idx}
                                    className="p-2 hover:bg-blue-50 transition-colors cursor-pointer"
                                    onClick={() => {

                                      window.open(`/dashboard/jobs/${match.jobId}`, '_blank');
                                    }}
                                  >
                                    {/* Header with Match Score */}
                                    <div className="flex items-start justify-between mb-1">
                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-semibold text-gray-900 truncate">
                                          {match.job?.title || 'Job Title'}
                                        </h4>
                                        <div className="flex flex-wrap gap-1 mt-0.5 text-[10px] text-gray-600">
                                          {match.job?.location && (
                                            <span className="flex items-center gap-0.5">
                                              📍 {match.job.location}
                                            </span>
                                          )}
                                          {match.job?.type && (
                                            <span className="px-1 py-0.5 bg-gray-100 rounded">
                                              {match.job.type}
                                            </span>
                                          )}
                                          {match.job?.experienceLevel && (
                                            <span className="px-1 py-0.5 bg-gray-100 rounded">
                                              {match.job.experienceLevel}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                                        match.matchScore >= 90 ? 'bg-green-100 text-green-700' :
                                        match.matchScore >= 75 ? 'bg-blue-100 text-blue-700' :
                                        'bg-yellow-100 text-yellow-700'
                                      }`}>
                                        {match.matchScore}%
                                      </div>
                                    </div>

                                    {/* Match Reason - Single line */}
                                    <p className="text-[10px] text-gray-600 line-clamp-1 mb-1">
                                      {match.matchReason}
                                    </p>

                                    {/* Key Match Points - Only 2 shown */}
                                    {match.keyMatchPoints && match.keyMatchPoints.length > 0 && (
                                      <div className="mb-1">
                                        <ul className="space-y-0">
                                          {match.keyMatchPoints.slice(0, 2).map((point, pointIdx) => (
                                            <li key={pointIdx} className="flex items-start gap-1 text-[10px] text-gray-600">
                                              <span className="text-green-500 text-[8px] mt-0.5">✓</span>
                                              <span className="line-clamp-1">{point}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {/* Skills - Minimal */}
                                    {match.job?.skills && match.job.skills.length > 0 && (
                                      <div className="flex flex-wrap gap-0.5">
                                        {match.job.skills.slice(0, 3).map((skill: string, skillIdx: number) => (
                                          <span 
                                            key={skillIdx}
                                            className="px-1 py-0.5 text-[9px] bg-blue-50 text-blue-700 rounded"
                                          >
                                            {skill}
                                          </span>
                                        ))}
                                        {match.job.skills.length > 3 && (
                                          <span className="px-1 py-0.5 text-[9px] text-gray-500">
                                            +{match.job.skills.length - 3}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Cycling spinner messages based on current intent */}
                  {currentIntent && !chatMessages.some(msg => msg.id.startsWith('streaming-')) && (
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-900 px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                          <span className="text-sm">
                            {loadingMessages[currentIntent as keyof typeof loadingMessages]?.[currentLoadingMessageIndex] || 'Processing...'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {isLoadingMore && (
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-900 px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                          <span className="text-sm">Loading more candidates...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={chatMessagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className={`border-t border-gray-200 p-4 bg-white ${isFullScreen ? '' : 'rounded-b-lg'}`}>
                  {!isConnected && (
                    <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-center space-x-2">
                      <WifiOff className="w-4 h-4" />
                      <span>Disconnected from server. Reconnecting...</span>
                    </div>
                  )}
                  
                  {/* Voice status indicator */}
                  {(isRecording || isSpeaking || isTTSLoading) && (
                    <div className="mb-2 p-2 bg-purple-50 border border-purple-200 rounded text-sm text-purple-700 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {isRecording && (
                          <>
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span>Listening...</span>
                          </>
                        )}
                        {isTTSLoading && !isRecording && (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Preparing voice...</span>
                          </>
                        )}
                        {isSpeaking && !isRecording && !isTTSLoading && (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>AI is speaking...</span>
                          </>
                        )}
                      </div>
                      
                      {/* Stop button when AI is speaking or loading */}
                      {(isSpeaking || isTTSLoading) && !isRecording && (
                        <button
                          onClick={() => {
                            stopAudio();
                            setIsTTSLoading(false);
                            setPendingAIMessage(null);
                            addToast({
                              type: 'info',
                              title: 'Voice Stopped',
                              message: 'AI voice playback stopped'
                            });
                          }}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors flex items-center space-x-1"
                          title="Stop AI voice"
                        >
                          <X className="w-3 h-3" />
                          <span>Stop</span>
                        </button>
                      )}
                    </div>
                  )}
                  
                  <form onSubmit={handleChatSubmit} className="flex space-x-2">
                    {/* Voice control button */}
                    <button
                      type="button"
                      onClick={handleVoiceRecording}
                      disabled={!isConnected || isSpeaking || !activeChatId}
                      className={`px-3 py-2 rounded-lg transition-all flex items-center justify-center ${
                        isRecording
                          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={isRecording ? 'Stop recording' : 'Start voice chat'}
                    >
                      <MicrophoneIcon isRecording={isRecording} className="w-5 h-5" />
                    </button>
                    
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={isRecording ? "Listening... (or type your message)" : "Type your message..."}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      disabled={isStreaming || !isConnected}
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isStreaming || !isConnected}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {createPortal(chatContent, document.body)}
      
      {/* Job Selection Modal */}
      {createPortal(
        <JobSelectionModal
          isOpen={showProjectModal}
          onClose={() => {
            setShowProjectModal(false);
            setSelectedCandidateForShortlist(null);
          }}
          candidate={selectedCandidateForShortlist?.candidate || selectedCandidateForShortlist}
          onJobSelected={handleJobSelected}
          onAddToDatabase={handleAddToDatabase}
          isLoading={isShortlisting || createJobApplicationMutation.isPending || shortlistExternalMutation.isPending}
        />,
        document.body
      )}
      
      {/* Profile Side Panel */}
      {panelState !== 'closed' && selectedUserDataForPanel && createPortal(
        <SourcingProfileSidePanel
          userData={selectedUserDataForPanel}
          panelState={panelState}
          onStateChange={handlePanelStateChange}
          candidateId={selectedCandidateId || undefined}
          projectId={undefined}
          onShortlist={() => {
            // Get the original candidate data from selectedUserDataForPanel
            const candidateData = selectedUserDataForPanel.rawCandidateData || selectedUserDataForPanel;
            handleShortlistCandidate(candidateData);
          }}
        />,
        document.body
      )}
    </>
  );
};

export default ChatbotWidget;

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
  Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAIChatWebSocket } from '../../hooks/useAIChatWebSocket';
import { CandidateCard } from '../CandidateCard';
import SourcingProfileSidePanel from '../../sourcing/outreach/components/SourcingProfileSidePanel';
import { searchApiService } from '../../services/searchApiService';

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
  
  // Load more state
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Track current intent for better loading messages
  const [currentIntent, setCurrentIntent] = useState<string | null>(null);
  const [currentLoadingMessageIndex, setCurrentLoadingMessageIndex] = useState(0);
  
  // Loading messages for different intents
  const loadingMessages = {
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
  } = useAIChatWebSocket();
  
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<string>('');
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const pendingMessageRef = useRef<string | null>(null);
  const loadingMessageIdRef = useRef<string | null>(null);

  // System prompt for the chatbot
  const SYSTEM_PROMPT = `You are the TAL Platform AI Assistant. TAL (Talent Acquisition Labs) is a comprehensive talent acquisition and recruitment platform designed for organizations, recruiters, and job seekers.

**Platform Overview:**
TAL provides end-to-end recruitment solutions including candidate sourcing, applicant tracking (ATS), job board integrations, recruitment pipeline management, and collaborative hiring workflows.

**Key Features & Modules:**
• **Recruitment Management**: Create and manage job postings, track candidates through customizable pipelines, and collaborate with hiring teams
• **Multi-Platform Job Board Integration**: Automatically post jobs to LinkedIn, Indeed, Glassdoor, and other job boards with analytics tracking
• **Candidate Sourcing**: Advanced candidate search with AI-powered matching, LinkedIn profile extraction via Chrome extension
• **Applicant Tracking System (ATS)**: Complete pipeline management with stages, tasks, interviews, and team collaboration
• **Client & Organization Management**: Multi-tenant system supporting internal teams, external clients, and recruitment agencies
• **Email Automation**: Candidate outreach sequences, automated communications, and follow-up campaigns
• **Analytics & Reporting**: Performance metrics, response rates, hiring analytics, and recruitment KPIs
• **Document Processing**: AI-powered resume parsing and candidate profile extraction
• **Role-Based Permissions**: Granular access control for different user types (recruiters, hiring managers, admins)

**User Types:**
• Job Seekers: Browse jobs, apply, manage profiles, track applications
• Internal HR: Full recruitment features for organization's internal hiring
• External HR/Recruiters: Client management plus recruitment tools
• Hiring Team Members: Participate in hiring decisions and candidate evaluation
• Admins: System configuration and user management

**Common Support Topics:**
1. **Account & Access**: Login issues, password resets, permission problems, team invitations
2. **Job Management**: Creating jobs, publishing to job boards, managing applications, pipeline setup
3. **Candidate Management**: Adding candidates, profile management, pipeline movement, communication
4. **Job Board Integration**: Connecting external job boards (LinkedIn, Indeed, Glassdoor), posting issues, analytics
5. **Team Collaboration**: Hiring team setup, task management, comment system, interview scheduling
6. **Technical Issues**: Browser compatibility, upload problems, sync issues, performance
7. **Billing & Organizations**: Account setup, user limits, feature access, subscription questions

**IMPORTANT RESTRICTIONS & GUIDELINES:**
• **ONLY answer questions related to TAL Platform** - Do NOT provide assistance with other recruitment tools, platforms, or general HR/recruitment advice unrelated to TAL
• **Stay in scope** - If asked about competitors, other ATS systems, or non-TAL tools, politely redirect to TAL-specific help
• **Technical limitations** - For complex technical issues, account access problems, billing questions, or system bugs, direct users to contact support
• **No personal advice** - Do not provide legal, HR policy, or personal career advice - focus only on how to use TAL Platform features
• **Unknown features** - If asked about TAL features you're unsure about, admit uncertainty and suggest contacting support rather than guessing
• **Professional tone** - Keep responses helpful, concise, and focused on TAL Platform functionality

**Response Format:**
When helping users, be specific about TAL's features and provide actionable solutions. If asked about topics outside TAL Platform scope or if you encounter complex technical issues, direct them to contact support for detailed assistance.`;

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

    // Handle intent detected (no loading message, just track intent for spinner)
    onIntentDetected((data) => {
      console.log('🎯 Intent detected (widget):', data);
      
      // Store current intent for cycling spinner messages
      setCurrentIntent(data.intent);
      setCurrentLoadingMessageIndex(0); // Reset to first message
    });

    // Handle AI response completion
    onAIComplete((data) => {


      setCurrentStreamingMessage('');
      setCurrentIntent(null); // Clear intent when workflow completes
      
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
      const resultsMessage: ChatMessage = {
        id: `job-matches-${data.matchingId || Date.now()}`, // Use matchingId for unique ID
        content: matchCount > 0 
          ? `I found ${matchCount} job${matchCount !== 1 ? 's' : ''} that match the candidate profile! Here are the details with match scores and reasons:`
          : 'I couldn\'t find any jobs that closely match the candidate profile at the moment. You may want to check back later for new opportunities.',
        sender: 'ai',
        timestamp: new Date(),
        type: 'job_match_results',
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

  }, [onMessageReceived, onAIChunk, onAIComplete, onIntentDetected, onError, onSearchingCandidates, onSearchResults, onMatchingJobs, onJobMatchResults]);

  // Load chat history when activeChatId changes
  useEffect(() => {
    if (!activeChatId || !isConnected) {
      return;
    }


    
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
        .filter((msg: any) => msg.role !== 'system') // Filter out system messages
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
      // Only update if we don't already have local messages (to preserve user's message before backend saves it)
      setChatMessages(prev => {
        // If we already have messages locally, keep them (don't overwrite with incomplete backend history)
        if (prev.length > 0) {

          return prev;
        }
        // Otherwise, load from backend
        return loadedMessages;
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
        systemPrompt: SYSTEM_PROMPT,
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

                                    // TODO: Implement shortlist functionality
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

                                    // TODO: Implement shortlist functionality
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
                  {isStreaming && !chatMessages.some(msg => msg.id.startsWith('streaming-')) && currentIntent && (
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
                  <form onSubmit={handleChatSubmit} className="flex space-x-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type your message..."
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
      {/* Profile Side Panel */}
      {panelState !== 'closed' && selectedUserDataForPanel && createPortal(
        <SourcingProfileSidePanel
          userData={selectedUserDataForPanel}
          panelState={panelState}
          onStateChange={handlePanelStateChange}
          candidateId={selectedCandidateId || undefined}
          projectId={undefined}
          onShortlist={() => {

            // TODO: Implement shortlist functionality
          }}
        />,
        document.body
      )}
    </>
  );
};

export default ChatbotWidget;

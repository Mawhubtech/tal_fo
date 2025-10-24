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
  Minimize2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAIChatWebSocket } from '../../hooks/useAIChatWebSocket';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
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
  
  const {
    isConnected,
    isStreaming,
    error: wsError,
    sendMessage,
    createChat,
    onMessageReceived,
    onAIChunk,
    onAIComplete,
    onChatCreated,
    onError,
  } = useAIChatWebSocket();
  
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<string>('');
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const pendingMessageRef = useRef<string | null>(null);

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

  // WebSocket event handlers
  useEffect(() => {
    // Handle chat created
    onChatCreated((data) => {
      console.log('✅ Chat created:', data);
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
      console.log('✅ Message received by server:', data);
    });

    // Handle AI response chunks
    onAIChunk((data) => {
      if (data.content) {
        setCurrentStreamingMessage(prev => prev + data.content);
        
        // Update or create streaming message
        setChatMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.sender === 'ai' && lastMessage.id.startsWith('streaming-')) {
            return prev.map(msg => 
              msg.id === lastMessage.id 
                ? { ...msg, content: msg.content + data.content }
                : msg
            );
          } else {
            return [...prev, {
              id: `streaming-${Date.now()}`,
              content: data.content,
              sender: 'ai',
              timestamp: new Date()
            }];
          }
        });
      }
    });

    // Handle AI response completion
    onAIComplete((data) => {
      console.log('✅ AI response complete:', data);
      setCurrentStreamingMessage('');
      
      // Update the streaming message with final ID
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id.startsWith('streaming-') 
            ? { ...msg, id: `ai-${Date.now()}` }
            : msg
        )
      );
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
  }, [onMessageReceived, onAIChunk, onAIComplete, onError]);

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
    const selectedChat = chatHistories.find(chat => chat.id === chatId);
    if (selectedChat) {
      setActiveChatId(chatId);
      setChatMessages(selectedChat.messages);
    }
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
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
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
                  ))}
                  {isStreaming && (
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-900 px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                          <span className="text-sm">AI is responding...</span>
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

  return createPortal(chatContent, document.body);
};

export default ChatbotWidget;

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { 
  MessageSquare, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Users,
  Zap,
  Shield,
  Bot,
  FileText,
  Ticket,
  X,
  User
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAIChatStream } from '../hooks/ai';
import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '../services/api';

// Types
interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface SupportMessage {
  id: string;
  content: string;
  sender: 'user' | 'admin' | 'system' | 'ai';
  isInternal: boolean;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ContactSupportPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab = (tabParam === 'email' || tabParam === 'tickets') ? tabParam : 'chat';
  
  const [activeTab, setActiveTab] = useState<'chat' | 'email' | 'tickets'>(initialTab);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<SupportMessage[]>([]);
  const [newReply, setNewReply] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    priority: 'medium',
    category: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // AI Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your TAL AI support assistant. How can I help you today?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const { data: aiStreamData, loading: aiLoading, isStreaming, streamChat, reset: resetAIChat } = useAIChatStream();
  
  // Ref for auto-scrolling chat messages
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // Handle AI streaming response
  useEffect(() => {
    console.log('🔄 AI streaming state changed:', { 
      hasData: !!aiStreamData, 
      dataLength: aiStreamData?.length, 
      isStreaming,
      aiLoading 
    });

    if (aiStreamData && isStreaming) {
      // Update the last AI message with streaming content
      setChatMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.sender === 'ai' && lastMessage.id.startsWith('streaming-')) {
          // Update existing streaming message
          console.log('📝 Updating existing streaming message');
          return prev.map(msg => 
            msg.id === lastMessage.id 
              ? { ...msg, content: aiStreamData }
              : msg
          );
        } else {
          // Create new streaming message
          console.log('✨ Creating new streaming message');
          return [...prev, {
            id: `streaming-${Date.now()}`,
            content: aiStreamData,
            sender: 'ai',
            timestamp: new Date()
          }];
        }
      });
    }
  }, [aiStreamData, isStreaming]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, aiLoading, isStreaming]);

  // Handle ESC key and body scroll for modal
  useEffect(() => {
    if (selectedTicket) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Handle ESC key
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setSelectedTicket(null);
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        // Restore body scroll
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedTicket]);

  // Support ticket mutations
  const createTicketMutation = useMutation({
    mutationFn: (ticketData: any) => apiClient.post('/support/tickets', ticketData),
    onSuccess: () => {
      setIsSubmitted(true);
      refetchTickets();
    }
  });

  // Add message mutation
  const addMessageMutation = useMutation({
    mutationFn: ({ ticketId, content }: { ticketId: string; content: string }) => 
      apiClient.post(`/support/tickets/${ticketId}/messages`, { 
        content,
        sender: 'user' // Customer messages are always from 'user'
      }),
    onSuccess: () => {
      setNewReply('');
      if (selectedTicket) {
        loadTicketMessages(selectedTicket.id);
      }
    }
  });

  // Fetch user's support tickets
  const { data: ticketsData, refetch: refetchTickets, isLoading: ticketsLoading, error: ticketsError } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: () => apiClient.get('/support/tickets'),
  });

  const handleModalOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setSelectedTicket(null);
    }
  };

  // Function to load messages for a specific ticket
  const loadTicketMessages = async (ticketId: string) => {
    setIsLoadingMessages(true);
    try {
      const response = await apiClient.get(`/support/tickets/${ticketId}/messages`);
      console.log('Messages response:', response.data); // Debug log
      // The API returns messages as a direct array, not wrapped in data property
      setTicketMessages(response.data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      setTicketMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Open ticket conversation
  const openTicketConversation = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    loadTicketMessages(ticket.id);
  };

  // Close ticket conversation
  const closeTicketConversation = () => {
    setSelectedTicket(null);
    setTicketMessages([]);
    setNewReply('');
  };

  // Handle reply submission
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || !selectedTicket) return;
    
    try {
      await addMessageMutation.mutateAsync({ 
        ticketId: selectedTicket.id, 
        content: newReply 
      });
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const supportCategories = [
    { value: 'technical', label: 'Technical Issue', icon: <AlertCircle className="w-5 h-5" /> },
    { value: 'account', label: 'Account & Billing', icon: <Users className="w-5 h-5" /> },
    { value: 'feature', label: 'Feature Request', icon: <Zap className="w-5 h-5" /> },
    { value: 'security', label: 'Security Concern', icon: <Shield className="w-5 h-5" /> },
    { value: 'general', label: 'General Question', icon: <HelpCircle className="w-5 h-5" /> }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low - General inquiry', color: 'text-green-600' },
    { value: 'medium', label: 'Medium - Standard support', color: 'text-yellow-600' },
    { value: 'high', label: 'High - Business impact', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent - System down', color: 'text-red-600' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setFormData(prev => ({
      ...prev,
      category
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Send the form data directly as it now only contains the fields the backend expects
      await createTicketMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Failed to create support ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || aiLoading || isStreaming) return;

    console.log('🚀 Starting AI chat submission...', { chatInput });

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: chatInput,
      sender: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');

    try {
      console.log('📤 Sending streaming request with messages:', {
        messageCount: chatMessages.length + 1,
        currentInput
      });

      await streamChat({
        messages: [
          {
            role: 'system',
            content: `You are the TAL Platform AI Support Assistant. TAL (Talent Acquisition Labs) is a comprehensive talent acquisition and recruitment platform designed for organizations, recruiters, and job seekers.

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

**Helpful Resources:**
• Platform accessible at talplatform.ai
• Chrome extension available for LinkedIn profile extraction
• Email support: info@talplatform.ai
• Response time: 4-24 hours

**IMPORTANT RESTRICTIONS & GUIDELINES:**
• **ONLY answer questions related to TAL Platform** - Do NOT provide assistance with other recruitment tools, platforms, or general HR/recruitment advice unrelated to TAL
• **Stay in scope** - If asked about competitors, other ATS systems, or non-TAL tools, politely redirect to TAL-specific help
• **Technical limitations** - For complex technical issues, account access problems, billing questions, or system bugs, direct users to submit a support ticket
• **No personal advice** - Do not provide legal, HR policy, or personal career advice - focus only on how to use TAL Platform features
• **Unknown features** - If asked about TAL features you're unsure about, admit uncertainty and suggest contacting support rather than guessing
• **No AI model details** - Do not discuss your AI model, training, or technical implementation details
• **Professional tone** - Keep responses helpful, concise, and focused on TAL Platform functionality

**Response Format:**
When helping users, be specific about TAL's features and provide actionable solutions. If asked about topics outside TAL Platform scope or if you encounter complex technical issues, direct them to submit a support ticket for detailed assistance.

**Example Redirects:**
- "I can only help with TAL Platform features. For questions about [other topic], please contact our support team."
- "That sounds like a technical issue that requires account-level access. Please submit a support ticket for personalized assistance."
- "I'm designed specifically to help with TAL Platform. For general recruitment advice, consider consulting with HR professionals."`
          },
          ...chatMessages.map(msg => ({
            role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.content
          })),
          {
            role: 'user',
            content: currentInput
          }
        ],
        max_tokens: 256 // Limit response length for concise answers
      });

      console.log('✅ AI streaming request completed successfully');
    } catch (error) {
      console.error('❌ AI Chat Stream Error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I\'m having trouble connecting right now. Please try submitting a support ticket for assistance.',
        sender: 'ai',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700';
      case 'waiting_for_customer': return 'bg-orange-100 text-orange-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'urgent': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isSubmitted) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">
              Support Request Submitted
            </h2>
            <p className="text-green-700 mb-6">
              Thank you for contacting us! We've received your support request and will get back to you at <strong>info@talplatform.ai</strong> shortly.
            </p>
            <div className="bg-white rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Expected Response:</span>
                <span className="font-medium">Within 4-24 hours</span>
              </div>
            </div>
            <button 
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  subject: '',
                  priority: 'medium',
                  category: '',
                  description: ''
                });
                setSelectedCategory('');
              }}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium mr-4"
            >
              Submit Another Request
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              View My Tickets
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modal content for Portal rendering
  const modalContent = selectedTicket && (
    <div className="fixed top-0 right-0 bottom-0 left-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]" onClick={handleModalOverlayClick}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Ticket #{selectedTicket.ticketNumber}
              </h3>
              <p className="text-gray-600 mt-1">{selectedTicket.subject}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                  {selectedTicket.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(selectedTicket.createdAt).toLocaleDateString()} at {new Date(selectedTicket.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedTicket(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Original Ticket Description */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <User className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">
                  Original Request
                </h4>
                <div className="mt-2 text-sm text-blue-700">
                  <p className="whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          {isLoadingMessages ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            ticketMessages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md p-3 rounded-lg ${
                  message.sender === 'user' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0">
                      {message.sender === 'user' ? (
                        <User className="w-4 h-4 mt-0.5" />
                      ) : (
                        <MessageSquare className="w-4 h-4 mt-0.5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-purple-200' : 'text-gray-500'
                      }`}>
                        {new Date(message.createdAt).toLocaleDateString()} at {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reply Form - Only show if ticket is not closed/resolved */}
        {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
          <div className="border-t border-gray-200 p-4 flex-shrink-0">
            <form onSubmit={handleReplySubmit} className="flex space-x-3">
              <input
                type="text"
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Type your reply..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                disabled={!newReply.trim() || addMessageMutation.isPending}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {addMessageMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Closed/Resolved notice */}
        {(selectedTicket.status === 'closed' || selectedTicket.status === 'resolved') && (
          <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
            <div className="flex items-center justify-center text-gray-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">
                This ticket has been {selectedTicket.status}. Contact support to reopen if needed.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Support</h1>
        <p className="text-lg text-gray-600 mb-8">
          Get help from our AI assistant, submit a support ticket, or contact us directly at{' '}
          <a href="mailto:info@talplatform.ai" className="text-purple-600 hover:text-purple-700">
            info@talplatform.ai
          </a>
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'chat'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Bot className="w-4 h-4 inline mr-2" />
            AI Chat
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'email'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Mail className="w-4 h-4 inline mr-2" />
            Submit Ticket
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'tickets'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Ticket className="w-4 h-4 inline mr-2" />
            My Tickets
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'chat' && (
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            {/* Chat Header */}
            <div className="bg-purple-600 text-white p-4 rounded-t-lg">
              <div className="flex items-center">
                <Bot className="w-6 h-6 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold">AI Support Assistant</h3>
                  <p className="text-purple-100 text-sm">Get instant help with your questions</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-[600px] overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-2xl px-4 py-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="text-sm">
                      {message.sender === 'ai' ? (
                        <div className="markdown-content">
                          <ReactMarkdown 
                            components={{
                              p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                              h1: ({children}) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                              h2: ({children}) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                              h3: ({children}) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                              strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                              em: ({children}) => <em className="italic">{children}</em>,
                              code: ({children}) => <code className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
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
              {(aiLoading || isStreaming) && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                      <span className="text-sm">AI is {isStreaming ? 'responding' : 'thinking'}...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Scroll anchor for auto-scroll */}
              <div ref={chatMessagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleChatSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  disabled={aiLoading || isStreaming}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || aiLoading || isStreaming}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'email' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Mail className="w-6 h-6 text-purple-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Submit Support Ticket</h3>
                <p className="text-gray-600 text-sm">
                  Describe your issue and we'll get back to you at info@talplatform.ai
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Issue Category *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {supportCategories.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => handleCategorySelect(category.value)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedCategory === category.value
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {category.icon}
                        <span className="font-medium text-sm">{category.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level *
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  >
                    {priorityLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  placeholder="Please provide as much detail as possible about your issue..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedCategory}
                  className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    <>
                      <Send className="w-4 h-4 inline mr-2" />
                      Submit Ticket
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="w-6 h-6 text-purple-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">My Support Tickets</h3>
                    <p className="text-gray-600 text-sm">Track the status of your support requests</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('email')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  New Ticket
                </button>
              </div>
            </div>

            <div className="p-6">
              {ticketsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading tickets...</p>
                </div>
              ) : ticketsError ? (
                <div className="text-center py-12">
                  <div className="text-red-600 mb-4">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                    <p>Error loading tickets</p>
                    <p className="text-sm text-gray-600">{ticketsError.message}</p>
                  </div>
                  <button
                    onClick={() => refetchTickets()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : ticketsData?.data?.tickets?.length > 0 ? (
                <div className="space-y-4">
                  {ticketsData.data.tickets.map((ticket: SupportTicket) => (
                    <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-medium text-gray-900">{ticket.subject}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                              {ticket.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority.toUpperCase()} PRIORITY
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{ticket.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Ticket #{ticket.ticketNumber}</span>
                            <span>Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
                            <span>Category: {ticket.category}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openTicketConversation(ticket)}
                            className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4 inline mr-1" />
                            View Conversation
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Support Tickets</h3>
                  <p className="text-gray-600 mb-6">You haven't submitted any support tickets yet.</p>
                  <button
                    onClick={() => setActiveTab('email')}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Submit Your First Ticket
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ticket Conversation Modal */}
      

      {/* Contact Information */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Direct Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Email Support</h4>
                <p className="text-gray-600 text-sm">
                  Send us an email at{' '}
                  <a href="mailto:info@talplatform.ai" className="text-purple-600 hover:text-purple-700">
                    info@talplatform.ai
                  </a>
                </p>
                <p className="text-gray-500 text-xs mt-1">Response within 4-24 hours</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Support Hours</h4>
                <p className="text-gray-600 text-sm">Monday - Friday, 9AM - 6PM EST</p>
                <p className="text-gray-500 text-xs mt-1">AI chat available 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      {/* Render modal using Portal to document.body for full screen coverage */}
      {modalContent && createPortal(modalContent, document.body)}
    </>
  );
};

export default ContactSupportPage;

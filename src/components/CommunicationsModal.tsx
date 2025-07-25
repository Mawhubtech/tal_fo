import React, { useState, useEffect } from 'react';
import { X, Mail, MessageSquare, Send, Plus, Calendar, User, Loader2, Edit2, Trash2 } from 'lucide-react';
import { 
  useCompanyNotes, 
  useCreateCompanyNote, 
  useDeleteCompanyNote,
  useUpdateCompanyNote,
  useCompanyEmailHistory, 
  useSendCompanyEmail 
} from '../hooks/useCommunications';
import { useAIStructuredQuery } from '../hooks/useAIStructuredQuery';
import AIContentDialog from './AIContentDialog';
import ConfirmationModal from './ConfirmationModal';

interface EmailHistory {
  id: string;
  subject: string;
  recipients: string[];
  cc?: string[];
  bcc?: string[];
  fromEmail: string;
  fromName: string;
  sentAt: string;
  body: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'rejected';
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Note {
  id: string;
  content: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CompanyResult {
  id: number;
  name: string;
  domain?: string;
  industry?: string;
}

interface CommunicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyResult;
  projectId?: string;
}

const CommunicationsModal: React.FC<CommunicationsModalProps> = ({
  isOpen,
  onClose,
  company,
  projectId
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'compose' | 'notes'>('history');
  const [showAddNote, setShowAddNote] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailCc, setEmailCc] = useState('');
  const [emailBcc, setEmailBcc] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  // API hooks - always called regardless of isOpen
  const { data: notes = [], isLoading: notesLoading } = useCompanyNotes(
    company.id.toString(), 
    projectId || '', 
    false // includePrivate
  );
  
  const { data: emailHistory = [], isLoading: emailsLoading } = useCompanyEmailHistory(
    company.id.toString(), 
    projectId || ''
  );

  const createNoteMutation = useCreateCompanyNote();
  const updateNoteMutation = useUpdateCompanyNote();
  const deleteNoteMutation = useDeleteCompanyNote();
  const sendEmailMutation = useSendCompanyEmail();
  const aiStructuredQuery = useAIStructuredQuery();

  // Watch for AI response and update form fields
  useEffect(() => {
    if (aiStructuredQuery.data?.data) {
      const responseData = aiStructuredQuery.data.data;
      
      if (responseData && typeof responseData === 'object') {
        if ('subject' in responseData && typeof responseData.subject === 'string') {
          setEmailSubject(responseData.subject);
        }
        
        if ('content' in responseData && typeof responseData.content === 'string') {
          setEmailContent(responseData.content);
        }
      }
      
      setShowAIDialog(false);
    }
    
    // Also handle errors
    if (aiStructuredQuery.error) {
      console.error('AI error occurred:', aiStructuredQuery.error);
      setShowAIDialog(false);
    }
  }, [aiStructuredQuery.data, aiStructuredQuery.loading, aiStructuredQuery.error]);

  // Reset form state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('history');
      setShowAddNote(false);
      setEmailTo('');
      setEmailCc('');
      setEmailBcc('');
      setEmailSubject('');
      setEmailContent('');
      setNoteContent('');
      setShowAIDialog(false);
      setEditingNoteId(null);
      setEditingNoteContent('');
      setShowDeleteConfirmation(false);
      setNoteToDelete(null);
    }
  }, [isOpen]);

  // Initialize email form when opening compose tab
  const initializeEmailForm = () => {
    if (emailTo === '') {
      setEmailTo(`contact@${company.domain || 'company.com'}`);
    }
  };

  const parseEmailList = (emailString: string): string[] => {
    return emailString
      .split(/[,;]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);
  };

  const handleOpenAIDialog = () => {
    setShowAIDialog(true);
  };

  const handleAIGenerate = async (context: string) => {
    try {
      // Generate both subject and content together
      const schema = {
        type: 'object',
        properties: {
          subject: {
            type: 'string',
            description: 'A professional email subject line'
          },
          content: {
            type: 'string',
            description: 'Professional email body content'
          }
        },
        required: ['subject', 'content']
      };

      // Reset any previous data
      aiStructuredQuery.reset();

      await aiStructuredQuery.structuredQuery({
        prompt: `Generate a professional email for reaching out to ${company.name}. Context: ${context}. Create both an engaging subject line and professional email body content. The email should be professional, engaging, and include a clear call-to-action. Keep it concise but informative.`,
        schema,
        systemPrompt: 'You are a professional business communication expert. Generate both subject lines and email content that are personalized, value-focused, and include appropriate business etiquette.',
        temperature: 0.7
      });

      // The useEffect will handle updating the form fields when data is received

    } catch (error) {
      console.error('Failed to generate AI content:', error);
      setShowAIDialog(false);
    }
  };

  const handleSendEmail = async () => {
    if (!projectId || !emailSubject.trim() || !emailContent.trim() || !emailTo.trim()) return;
    
    try {
      const recipients = parseEmailList(emailTo);
      const ccRecipients = emailCc.trim() ? parseEmailList(emailCc) : [];
      const bccRecipients = emailBcc.trim() ? parseEmailList(emailBcc) : [];
      
      await sendEmailMutation.mutateAsync({
        companyId: company.id.toString(),
        projectId,
        data: {
          companyName: company.name,
          recipients,
          cc: ccRecipients,
          bcc: bccRecipients,
          subject: emailSubject,
          body: emailContent,
        }
      });
      
      // Clear form
      setEmailTo('');
      setEmailCc('');
      setEmailBcc('');
      setEmailSubject('');
      setEmailContent('');
      
      // Switch to history tab to show the sent email
      setActiveTab('history');
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  const handleAddNote = async () => {
    if (!projectId || !noteContent.trim()) return;
    
    try {
      await createNoteMutation.mutateAsync({
        companyId: company.id.toString(),
        projectId,
        data: {
          companyName: company.name,
          content: noteContent,
          isPrivate: false,
        }
      });
      
      setShowAddNote(false);
      setNoteContent('');
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleEditNote = (noteId: string, currentContent: string) => {
    setEditingNoteId(noteId);
    setEditingNoteContent(currentContent);
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!projectId || !editingNoteContent.trim()) return;
    
    try {
      await updateNoteMutation.mutateAsync({
        noteId,
        data: {
          content: editingNoteContent,
        }
      });
      
      setEditingNoteId(null);
      setEditingNoteContent('');
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    setNoteToDelete(noteId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteNote = async () => {
    if (!projectId || !noteToDelete) return;
    
    try {
      await deleteNoteMutation.mutateAsync({
        companyId: company.id.toString(),
        projectId,
        noteId: noteToDelete,
      });
      
      setNoteToDelete(null);
      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingNoteContent('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Conditional rendering instead of early return
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Communications</h2>
              <p className="text-sm text-gray-500">{company.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Mail className="w-4 h-4 inline-block mr-2" />
            Email History
          </button>
          <button
            onClick={() => {
              setActiveTab('compose');
              initializeEmailForm();
            }}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'compose'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Send className="w-4 h-4 inline-block mr-2" />
            Compose Email
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'notes'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline-block mr-2" />
            Notes
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'history' && (
            <div className="space-y-4">
              {/* Email History - No Send Email Button */}
              <div className="space-y-3">
                {emailsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    <span className="ml-2 text-gray-600">Loading emails...</span>
                  </div>
                ) : emailHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No email communications yet</p>
                    <p className="text-sm">Use the "Compose Email" tab to start the conversation</p>
                  </div>
                ) : (
                  emailHistory.map((email) => (
                    <div
                      key={email.id}
                      className="bg-white rounded-lg border p-4 border-l-4 border-l-purple-500"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{email.subject}</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>From: {email.fromName} ({email.fromEmail})</p>
                            <p>To: {email.recipients.join(', ')}</p>
                            {email.cc && email.cc.length > 0 && (
                              <p>CC: {email.cc.join(', ')}</p>
                            )}
                            {email.bcc && email.bcc.length > 0 && (
                              <p>BCC: {email.bcc.join(', ')}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            email.status === 'sent' ? 'bg-green-100 text-green-800' :
                            email.status === 'failed' ? 'bg-red-100 text-red-800' :
                            email.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {email.status}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(email.sentAt)}</p>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{email.body}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'compose' && (
            <div className="space-y-4">
              {/* Compose Email Form - Always visible when tab is active */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Compose Email</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To *</label>
                    <input
                      type="text"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="recipient@example.com, another@example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas or semicolons</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CC</label>
                    <input
                      type="text"
                      value={emailCc}
                      onChange={(e) => setEmailCc(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="cc@example.com (optional)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">BCC</label>
                    <input
                      type="text"
                      value={emailBcc}
                      onChange={(e) => setEmailBcc(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="bcc@example.com (optional)"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">Subject *</label>
                    </div>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter email subject"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">Message *</label>
                      <button
                        type="button"
                        onClick={handleOpenAIDialog}
                        disabled={aiStructuredQuery.loading}
                        className="text-xs text-purple-600 hover:text-purple-800 transition-colors disabled:opacity-50 flex items-center"
                      >
                        {aiStructuredQuery.loading ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          '✨ Generate Email'
                        )}
                      </button>
                    </div>
                    <textarea
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your message"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEmailTo('');
                        setEmailCc('');
                        setEmailBcc('');
                        setEmailSubject('');
                        setEmailContent('');
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleSendEmail}
                      disabled={sendEmailMutation.isPending || !emailSubject.trim() || !emailContent.trim() || !emailTo.trim()}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {sendEmailMutation.isPending && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      Send Email
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Add Note Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAddNote(true)}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Note
                </button>
              </div>

              {/* Add Note Form */}
              {showAddNote && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Add Note</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                      <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your note about this organization"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowAddNote(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddNote}
                        disabled={createNoteMutation.isPending || !noteContent.trim()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {createNoteMutation.isPending && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        Add Note
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes List */}
              <div className="space-y-3">
                {notesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    <span className="ml-2 text-gray-600">Loading notes...</span>
                  </div>
                ) : notes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No notes yet</p>
                    <p className="text-sm">Add your first note about this organization</p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="bg-white rounded-lg border p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">
                            {note.author.firstName} {note.author.lastName}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {formatDate(note.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditNote(note.id, note.content)}
                              className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                              title="Edit note"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              disabled={deleteNoteMutation.isPending}
                              className="text-gray-400 hover:text-red-600 transition-colors p-1 disabled:opacity-50"
                              title="Delete note"
                            >
                              {deleteNoteMutation.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {editingNoteId === note.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={editingNoteContent}
                            onChange={(e) => setEditingNoteContent(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Edit your note"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdateNote(note.id)}
                              disabled={updateNoteMutation.isPending || !editingNoteContent.trim()}
                              className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                              {updateNoteMutation.isPending && (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              )}
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Content Generation Dialog */}
      <AIContentDialog
        isOpen={showAIDialog}
        onClose={() => setShowAIDialog(false)}
        onGenerate={handleAIGenerate}
        type="email"
        isGenerating={aiStructuredQuery.loading}
        companyName={company.name}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setNoteToDelete(null);
        }}
        onConfirm={confirmDeleteNote}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default CommunicationsModal;

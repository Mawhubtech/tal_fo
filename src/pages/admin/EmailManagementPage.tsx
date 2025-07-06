import React, { useState } from 'react';
import { Mail, Plus, Settings, Send, Trash2, Edit, Copy, AlertCircle, CheckCircle, Eye, MoreVertical, ExternalLink, RefreshCw, Download, X, TestTube, Power, Star } from 'lucide-react';
import { 
  useEmailTemplates, 
  useEmailProviders, 
  useDeleteEmailTemplate, 
  useDuplicateEmailTemplate,
  useDeleteEmailProvider,
  useSetDefaultEmailProvider,
  useToggleActiveEmailProvider,
  useTemplatePreview,
  useSendEmail,
  type EmailTemplate,
  type EmailProvider 
} from '../../hooks/useEmailManagement';
import { useEmailService } from '../../hooks/useEmailService';
import { useToast } from '../../contexts/ToastContext';
import EmailTemplateForm from '../../components/EmailTemplateForm';
import EmailProviderForm from '../../components/EmailProviderForm';
import PresetTemplatesDialog from '../../components/PresetTemplatesDialog';
import ConfirmationModal from '../../components/ConfirmationModal';

const EmailManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'templates' | 'providers'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedProviderType, setSelectedProviderType] = useState<'gmail' | 'outlook' | 'smtp'>('smtp');
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [isPresetDialogOpen, setIsPresetDialogOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'raw' | 'rendered'>('rendered');
  const [isTestEmailModalOpen, setIsTestEmailModalOpen] = useState(false);
  const [testEmailProvider, setTestEmailProvider] = useState<EmailProvider | null>(null);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  
  // Confirmation modal states
  const [isDeleteTemplateModalOpen, setIsDeleteTemplateModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [isDeleteProviderModalOpen, setIsDeleteProviderModalOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<string | null>(null);

  const { addToast } = useToast();

  // API hooks
  const { data: templatesData, isLoading: isLoadingTemplates, error: templatesError } = useEmailTemplates();
  const { data: providersData, isLoading: isLoadingProviders, error: providersError } = useEmailProviders();
  const {
    emailSettings,
    connectGmail,
    isConnectingGmail,
    disconnectGmail,
    isDisconnectingGmail,
    refetchSettings
  } = useEmailService();
  
  // Ensure data is always an array
  const templates = Array.isArray(templatesData) ? templatesData : 
                   templatesData?.templates && Array.isArray(templatesData.templates) ? templatesData.templates : [];
  
  const providers = Array.isArray(providersData) ? providersData : 
                   providersData?.providers && Array.isArray(providersData.providers) ? providersData.providers : [];

  const deleteTemplateMutation = useDeleteEmailTemplate();
  const duplicateTemplateMutation = useDuplicateEmailTemplate();
  const deleteProviderMutation = useDeleteEmailProvider();
  const setDefaultProviderMutation = useSetDefaultEmailProvider();
  const toggleActiveProviderMutation = useToggleActiveEmailProvider();
  const templatePreviewMutation = useTemplatePreview();
  const sendEmailMutation = useSendEmail();

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setIsTemplateModalOpen(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsTemplateModalOpen(true);
  };

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    try {
      await duplicateTemplateMutation.mutateAsync({ 
        id: template.id, 
        name: `${template.name} (Copy)` 
      });
      addToast({ type: 'success', title: 'Template duplicated successfully' });
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to duplicate template' });
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplateToDelete(templateId);
    setIsDeleteTemplateModalOpen(true);
  };

  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;
    
    try {
      await deleteTemplateMutation.mutateAsync(templateToDelete);
      addToast({ type: 'success', title: 'Template deleted successfully' });
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to delete template' });
    } finally {
      setTemplateToDelete(null);
    }
  };

  const handlePreviewTemplate = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setPreviewMode('rendered'); // Default to rendered view
    setIsPreviewModalOpen(true);
  };

  // Function to render template with sample data
  const renderTemplateWithSampleData = (template: EmailTemplate) => {
    const sampleData: Record<string, string> = {
      // Common variables
      candidateName: 'John Smith',
      recipientName: 'John Smith',
      position: 'Senior Software Engineer',
      company: 'TechCorp Inc.',
      senderName: 'Sarah Johnson',
      senderTitle: 'Talent Acquisition Manager',
      
      // Interview specific
      interviewDate: 'March 15, 2025',
      interviewTime: '2:00 PM EST',
      duration: '45 minutes',
      location: 'Conference Room A / Virtual (Teams link will be provided)',
      interviewType: 'Technical Interview',
      contactPhone: '+1 (555) 123-4567',
      
      // Client specific
      clientName: 'Michael Davis',
      clientCompany: 'Innovation Labs',
      services: 'talent acquisition and recruitment solutions',
      valueProposition: 'achieve their hiring goals efficiently',
      contactInfo: 'sarah.johnson@techcorp.com | +1 (555) 123-4567',
      
      // Offer specific
      salary: '$120,000 - $140,000 annually',
      benefits: 'Health insurance, 401k matching, unlimited PTO',
      startDate: 'April 1, 2025',
      manager: 'David Wilson, Engineering Manager',
      department: 'Software Engineering',
      responseDeadline: 'March 20, 2025',
      
      // Team specific
      teamName: 'Engineering Recruitment Team',
      teamLead: 'Sarah Johnson',
      inviterName: 'Sarah Johnson',
      inviterEmail: 'sarah.johnson@techcorp.com',
      inviteeName: 'John Smith',
      expirationDays: '7',
      
      // General
      subject: template.subject,
      email: 'john.smith@email.com',
      phone: '+1 (555) 987-6543'
    };

    let renderedSubject = template.subject;
    let renderedBody = template.body || template.content || '';

    // Simple template rendering - replace {{variable}} with sample data
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      renderedSubject = renderedSubject.replace(regex, value);
      renderedBody = renderedBody.replace(regex, value);
    });

    // Handle basic conditionals (simplified)
    renderedBody = renderedBody.replace(/\{\{#if\s+\w+\}\}[\s\S]*?\{\{\/if\}\}/g, '');
    renderedBody = renderedBody.replace(/\{\{#each\s+\w+\}\}[\s\S]*?\{\{\/each\}\}/g, '');

    return { renderedSubject, renderedBody };
  };

  const handleConnectProvider = (type: 'gmail' | 'outlook' | 'smtp') => {
    setSelectedProvider(null);
    setSelectedProviderType(type);
    setIsProviderModalOpen(true);
  };

  const handleSetDefaultProvider = async (providerId: string) => {
    try {
      await setDefaultProviderMutation.mutateAsync(providerId);
      addToast({ type: 'success', title: 'Default provider updated' });
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to update default provider' });
    }
  };

  const handleToggleActiveProvider = async (providerId: string) => {
    try {
      await toggleActiveProviderMutation.mutateAsync(providerId);
      addToast({ type: 'success', title: 'Provider status updated' });
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to update provider status' });
    }
  };

  const handleDeleteProvider = (providerId: string) => {
    setProviderToDelete(providerId);
    setIsDeleteProviderModalOpen(true);
  };

  const confirmDeleteProvider = async () => {
    if (!providerToDelete) return;
    
    try {
      await deleteProviderMutation.mutateAsync(providerToDelete);
      addToast({ type: 'success', title: 'Provider disconnected successfully' });
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to disconnect provider' });
    } finally {
      setProviderToDelete(null);
    }
  };

  const handleEditProvider = (provider: EmailProvider) => {
    setSelectedProvider(provider);
    setSelectedProviderType(provider.type);
    setIsProviderModalOpen(true);
  };

  const handleTestProvider = (provider: EmailProvider) => {
    setTestEmailProvider(provider);
    setTestEmailAddress('');
    setIsTestEmailModalOpen(true);
  };

  const handleSendTestEmail = async () => {
    if (!testEmailProvider || !testEmailAddress.trim()) {
      addToast({ type: 'error', title: 'Please enter a valid email address' });
      return;
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
        <h2 style="color: #6366f1;">Test Email Successful!</h2>
        <p>This is a test email sent from the TAL platform to verify your email provider configuration.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #374151;">Provider Details:</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${testEmailProvider.name}</p>
          <p style="margin: 5px 0;"><strong>Type:</strong> ${testEmailProvider.type}</p>
          <p style="margin: 5px 0;"><strong>From Email:</strong> ${testEmailProvider.fromEmail || 'Not configured'}</p>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          If you received this email, your email provider is working correctly.
        </p>
      </div>
    `;

    const plainTextContent = `
Test Email Successful!

This is a test email sent from the TAL platform to verify your email provider configuration.

Provider Details:
- Name: ${testEmailProvider.name}
- Type: ${testEmailProvider.type}
- From Email: ${testEmailProvider.fromEmail || 'Not configured'}

If you received this email, your email provider is working correctly.
    `.trim();

    try {
      await sendEmailMutation.mutateAsync({
        providerId: testEmailProvider.id,
        to: [testEmailAddress],
        subject: 'Test Email from TAL Platform',
        content: htmlContent, // This will be used for htmlBody
        plainText: plainTextContent, // This will be used for body
      });
      
      addToast({ 
        type: 'success', 
        title: 'Test email sent successfully',
        message: `Test email sent to ${testEmailAddress}`
      });
      setIsTestEmailModalOpen(false);
      setTestEmailAddress('');
    } catch (error) {
      addToast({ 
        type: 'error', 
        title: 'Failed to send test email',
        message: 'Please check your provider configuration'
      });
    }
  };

  const handleConnectGmail = async () => {
    try {
      const result = await connectGmail();
      if (result.authUrl) {
        // Open OAuth flow in new window
        const oauthWindow = window.open(result.authUrl, 'gmail-oauth', 'width=500,height=600');
        
        // Listen for messages from the OAuth window
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'GMAIL_OAUTH_SUCCESS') {
            // OAuth successful, refetch settings
            refetchSettings().then(() => {
              addToast({ type: 'success', title: 'Gmail Connected', message: 'Your Gmail account has been connected successfully.' });
            });
            oauthWindow?.close();
            window.removeEventListener('message', handleMessage);
          } else if (event.data.type === 'GMAIL_OAUTH_ERROR') {
            addToast({ type: 'error', title: 'Connection Failed', message: 'Failed to connect Gmail. Please try again.' });
            oauthWindow?.close();
            window.removeEventListener('message', handleMessage);
          }
        };
        
        window.addEventListener('message', handleMessage);
        
        // Fallback: Check if window is closed manually
        const checkWindowClosed = setInterval(() => {
          if (!oauthWindow || oauthWindow.closed) {
            clearInterval(checkWindowClosed);
            window.removeEventListener('message', handleMessage);
            // Only refetch if we haven't received a message yet
            setTimeout(() => {
              refetchSettings().catch(() => {
                // Silently ignore refetch errors
              });
            }, 1000);
          }
        }, 1000);
        
        // Cleanup after 5 minutes
        setTimeout(() => {
          clearInterval(checkWindowClosed);
          window.removeEventListener('message', handleMessage);
          if (oauthWindow && !oauthWindow.closed) {
            oauthWindow.close();
            addToast({ type: 'error', title: 'Timeout', message: 'Gmail connection timed out. Please try again.' });
          }
        }, 300000);
      }
    } catch (error) {
      console.error('Failed to connect Gmail:', error);
      addToast({ type: 'error', title: 'Connection Failed', message: 'Failed to connect Gmail. Please try again.' });
    }
  };

  const handleDisconnectGmail = async () => {
    try {
      await disconnectGmail();
      // Refetch settings to update the UI
      await refetchSettings();
      addToast({ type: 'success', title: 'Gmail Disconnected', message: 'Your Gmail account has been disconnected.' });
    } catch (error) {
      console.error('Failed to disconnect Gmail:', error);
      addToast({ type: 'error', title: 'Disconnection Failed', message: 'Failed to disconnect Gmail. Please try again.' });
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      candidate_outreach: 'bg-blue-100 text-blue-800',
      client_outreach: 'bg-green-100 text-green-800',
      interview_invite: 'bg-purple-100 text-purple-800',
      interview_reminder: 'bg-yellow-100 text-yellow-800',
      rejection: 'bg-red-100 text-red-800',
      offer: 'bg-emerald-100 text-emerald-800',
      follow_up: 'bg-gray-100 text-gray-800',
      custom: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type as keyof typeof colors] || colors.custom;
  };

  const getScopeColor = (scope: string) => {
    const colors = {
      organization: 'bg-violet-100 text-violet-800',
      team: 'bg-cyan-100 text-cyan-800',
      personal: 'bg-orange-100 text-orange-800'
    };
    return colors[scope as keyof typeof colors] || colors.personal;
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'gmail':
        return (
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-red-600" />
          </div>
        );
      case 'outlook':
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
        );
      case 'smtp':
      default:
        return (
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-gray-600" />
          </div>
        );
    }
  };

  const isLoading = isLoadingTemplates || isLoadingProviders;
  const hasError = templatesError || providersError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading email management data...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading email management data</h3>
          <p className="text-gray-600 mb-4">
            {templatesError?.message || providersError?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Management</h1>
          <p className="text-gray-600 mt-1">Manage email templates and providers for your organization</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Mail className="w-4 h-4 inline mr-2" />
            Email Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab('providers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'providers'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Email Providers ({providers.length})
          </button>
        </nav>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Email Templates</h2>
              <p className="text-sm text-gray-600">Create and manage reusable email templates</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsPresetDialogOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Download className="w-4 h-4 mr-2" />
                Create Presets
              </button>
              <button
                onClick={handleCreateTemplate}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </button>
            </div>
          </div>

          {templates.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No email templates</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first email template or use preset templates</p>
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => setIsPresetDialogOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Create Presets
                </button>
                <button
                  onClick={handleCreateTemplate}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {templates.map((template) => (
                  <li key={template.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {template.name}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                    {template.subject}
                                </p>
                                {template.description && (
                                    <p className="text-xs text-gray-400 mt-1 truncate">
                                    {template.description}
                                    </p>
                                )}
                            </div>
                            <div className="flex space-x-2 ml-4 flex-shrink-0">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                                    {template.type.replace(/_/g, ' ')}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScopeColor(template.scope)}`}>
                                    {template.scope}
                                </span>
                                {template.isDefault && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Default
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                            <span>Used {template.usageCount} times</span>
                            {template.createdBy && (
                                <span>Created by {template.createdBy.firstName} {template.createdBy.lastName}</span>
                            )}
                            <span>Updated {new Date(template.updatedAt).toLocaleDateString()}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                template.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {template.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={() => handlePreviewTemplate(template)}
                          className="p-2 text-gray-400 hover:text-blue-500"
                          title="Preview template"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditTemplate(template)}
                          className="p-2 text-gray-400 hover:text-gray-500"
                          title="Edit template"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateTemplate(template)}
                          className="p-2 text-gray-400 hover:text-gray-500"
                          title="Duplicate template"
                          disabled={duplicateTemplateMutation.isPending}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="p-2 text-gray-400 hover:text-red-500"
                          title="Delete template"
                          disabled={deleteTemplateMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Providers Tab */}
      {activeTab === 'providers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Email Providers</h2>
              <p className="text-sm text-gray-600">Connect and manage email services for sending emails</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleConnectProvider('gmail')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Connect Gmail
              </button>
              <button
                onClick={() => handleConnectProvider('outlook')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Connect Outlook
              </button>
              <button
                onClick={() => handleConnectProvider('smtp')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Configure SMTP
              </button>
            </div>
          </div>

          {providers.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No email providers</h3>
              <p className="text-gray-600 mb-4">Connect an email service to start sending emails</p>
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => handleConnectProvider('gmail')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                >
                  Connect Gmail
                </button>
                <button
                  onClick={() => handleConnectProvider('outlook')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Connect Outlook
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {providers.map((provider) => (
                  <li key={provider.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                            {getProviderIcon(provider.type)}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {provider.name}
                                    </p>
                                    {provider.isDefault && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Default
                                        </span>
                                    )}
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        provider.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {provider.status === 'active' ? 'Active' : 'Inactive'}
                                    </span>
                                    {provider.type === 'gmail' && (
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            emailSettings?.isGmailConnected ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                                        }`}>
                                            OAuth: {emailSettings?.isGmailConnected ? 'Connected' : 'Disconnected'}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 truncate">
                                    {provider.fromEmail && (
                                        <span className="font-medium">{provider.fromEmail}</span>
                                    )}
                                    {provider.fromName && (
                                        <span className="ml-2">({provider.fromName})</span>
                                    )}
                                </p>
                                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
                                    <div className="flex justify-between">
                                        <span>Sent:</span>
                                        <span className="font-medium">{provider.emailsSentCount || 0}</span>
                                    </div>
                                     <div className="flex justify-between">
                                        <span>Daily Usage:</span>
                                        <span className="font-medium">{provider.dailyUsage || 0} / {provider.dailyLimit || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Failed:</span>
                                        <span className="font-medium text-red-600">{provider.emailsFailedCount || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Created:</span>
                                        <span>{new Date(provider.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="ml-4 flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
                            {/* Toggle Active/Inactive */}
                            <button
                                onClick={() => handleToggleActiveProvider(provider.id)}
                                disabled={toggleActiveProviderMutation.isPending}
                                className={`p-2 ${
                                    provider.status === 'active' 
                                        ? 'text-green-600 hover:text-green-700' 
                                        : 'text-gray-400 hover:text-green-500'
                                }`}
                                title={provider.status === 'active' ? 'Deactivate Provider' : 'Activate Provider'}
                            >
                                <Power className="w-4 h-4" />
                            </button>

                            {/* Toggle Default */}
                            <button
                                onClick={() => handleSetDefaultProvider(provider.id)}
                                disabled={setDefaultProviderMutation.isPending || provider.isDefault}
                                className={`p-2 ${
                                    provider.isDefault 
                                        ? 'text-yellow-500 cursor-not-allowed' 
                                        : 'text-gray-400 hover:text-yellow-500'
                                }`}
                                title={provider.isDefault ? 'Already Default' : 'Set as Default'}
                            >
                                <Star className={provider.isDefault ? 'w-4 h-4 fill-current' : 'w-4 h-4'} />
                            </button>

                            {provider.type === 'gmail' && !emailSettings?.isGmailConnected && (
                                <button 
                                    onClick={handleConnectGmail} 
                                    className="text-xs inline-flex items-center px-2.5 py-1.5 border border-transparent font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Reconnect
                                </button>
                            )}
                            
                            <button
                                onClick={() => handleEditProvider(provider)}
                                className="p-2 text-gray-400 hover:text-blue-500"
                                title="View/Edit Provider"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                            
                            <button
                                onClick={() => handleTestProvider(provider)}
                                className="p-2 text-gray-400 hover:text-green-500"
                                title="Test Email Sending"
                            >
                                <TestTube className="w-4 h-4" />
                            </button>
                            
                            <button
                                onClick={() => handleDeleteProvider(provider.id)}
                                disabled={deleteProviderMutation.isPending}
                                className="p-2 text-gray-400 hover:text-red-500"
                                title="Delete Provider"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Modals and Dialogs */}
      {isTemplateModalOpen && (
        <EmailTemplateForm
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          template={selectedTemplate}
        />
      )}
      
      {isProviderModalOpen && (
        <EmailProviderForm
          isOpen={isProviderModalOpen}
          onClose={() => setIsProviderModalOpen(false)}
          provider={selectedProvider}
          type={selectedProviderType}
        />
      )}

      {isPresetDialogOpen && (
          <PresetTemplatesDialog
              isOpen={isPresetDialogOpen}
              onClose={() => setIsPresetDialogOpen(false)}
              onSuccess={() => {
                setIsPresetDialogOpen(false);
                // Refetch templates after successful preset creation
                // The React Query hook should automatically refetch
              }}
          />
      )}

      {isPreviewModalOpen && previewTemplate && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-30" aria-hidden="true">
              <div className="fixed inset-0 z-40 w-screen overflow-y-auto">
                  <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                      <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl">
                          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                              <div className="flex items-start justify-between">
                                  <div>
                                      <h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
                                          Preview: {previewTemplate.name}
                                      </h3>
                                      <p className="text-sm text-gray-500 mt-1">Subject: {renderTemplateWithSampleData(previewTemplate).renderedSubject}</p>
                                  </div>
                                  <button
                                      type="button"
                                      className="ml-4 rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                      onClick={() => setIsPreviewModalOpen(false)}
                                  >
                                      <span className="sr-only">Close</span>
                                      <X className="h-6 w-6" aria-hidden="true" />
                                  </button>
                              </div>
                              <div className="mt-4 border-b border-gray-200">
                                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                                  <button onClick={() => setPreviewMode('rendered')} className={`${previewMode === 'rendered' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium`}>
                                    Rendered Preview
                                  </button>
                                  <button onClick={() => setPreviewMode('raw')} className={`${previewMode === 'raw' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium`}>
                                    Raw HTML
                                  </button>
                                </nav>
                              </div>
                              <div className="mt-5">
                                {previewMode === 'rendered' ? (
                                  <div className="prose max-w-none rounded-md border border-gray-200 p-4" dangerouslySetInnerHTML={{ __html: renderTemplateWithSampleData(previewTemplate).renderedBody }} />
                                ) : (
                                  <pre className="p-4 bg-gray-800 text-white rounded-md text-xs overflow-x-auto">
                                    <code>{previewTemplate.body || previewTemplate.content}</code>
                                  </pre>
                                )}
                              </div>
                          </div>
                          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                              <button
                                  type="button"
                                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                  onClick={() => setIsPreviewModalOpen(false)}
                              >
                                  Close
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Test Email Modal */}
      {isTestEmailModalOpen && testEmailProvider && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-30" aria-hidden="true">
              <div className="fixed inset-0 z-40 w-screen overflow-y-auto">
                  <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                      <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
                          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                              <div className="flex items-start justify-between">
                                  <div className="flex items-center">
                                      <div className="flex-shrink-0">
                                          <TestTube className="h-6 w-6 text-green-600" />
                                      </div>
                                      <div className="ml-3">
                                          <h3 className="text-lg font-semibold leading-6 text-gray-900">
                                              Test Email Provider
                                          </h3>
                                          <p className="text-sm text-gray-500 mt-1">
                                              Send a test email using: {testEmailProvider.name}
                                          </p>
                                      </div>
                                  </div>
                                  <button
                                      type="button"
                                      className="ml-4 rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                      onClick={() => setIsTestEmailModalOpen(false)}
                                  >
                                      <span className="sr-only">Close</span>
                                      <X className="h-6 w-6" aria-hidden="true" />
                                  </button>
                              </div>
                              
                              <div className="mt-5">
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                      <div className="flex items-center">
                                          <div className="flex-shrink-0">
                                              {getProviderIcon(testEmailProvider.type)}
                                          </div>
                                          <div className="ml-3">
                                              <p className="text-sm font-medium text-gray-900">
                                                  {testEmailProvider.name}
                                              </p>
                                              <p className="text-sm text-gray-500">
                                                  Type: {testEmailProvider.type} | From: {testEmailProvider.fromEmail || 'Not configured'}
                                              </p>
                                          </div>
                                      </div>
                                  </div>
                                  
                                  <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Test Email Address *
                                      </label>
                                      <input
                                          type="email"
                                          value={testEmailAddress}
                                          onChange={(e) => setTestEmailAddress(e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                          placeholder="Enter email address to test"
                                          required
                                      />
                                      <p className="text-xs text-gray-500 mt-1">
                                          A test email will be sent to this address to verify the provider configuration.
                                      </p>
                                  </div>
                              </div>
                          </div>
                          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                              <button
                                  type="button"
                                  onClick={handleSendTestEmail}
                                  disabled={sendEmailMutation.isPending || !testEmailAddress.trim()}
                                  className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                  {sendEmailMutation.isPending ? (
                                      <>
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                          Sending...
                                      </>
                                  ) : (
                                      <>
                                          <Send className="w-4 h-4 mr-2" />
                                          Send Test Email
                                      </>
                                  )}
                              </button>
                              <button
                                  type="button"
                                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                  onClick={() => setIsTestEmailModalOpen(false)}
                              >
                                  Cancel
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Delete Template Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteTemplateModalOpen}
        onClose={() => {
          setIsDeleteTemplateModalOpen(false);
          setTemplateToDelete(null);
        }}
        onConfirm={confirmDeleteTemplate}
        title="Delete Email Template"
        message="Are you sure you want to delete this email template? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Delete Provider Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteProviderModalOpen}
        onClose={() => {
          setIsDeleteProviderModalOpen(false);
          setProviderToDelete(null);
        }}
        onConfirm={confirmDeleteProvider}
        title="Disconnect Email Provider"
        message="Are you sure you want to disconnect this email provider? This action cannot be undone and may affect email sending capabilities."
        confirmText="Disconnect"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default EmailManagementPage;
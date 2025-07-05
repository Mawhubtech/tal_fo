import React, { useState } from 'react';
import { Mail, Plus, Settings, Send, Trash2, Edit, Copy, TestTube, AlertCircle, CheckCircle, Eye, MoreVertical } from 'lucide-react';
import { 
  useEmailTemplates, 
  useEmailProviders, 
  useDeleteEmailTemplate, 
  useDuplicateEmailTemplate,
  useDeleteEmailProvider,
  useTestEmailProvider,
  useSetDefaultEmailProvider,
  useGmailIntegration,
  useMigrateGmailIntegration,
  type EmailTemplate,
  type EmailProvider 
} from '../../hooks/useEmailManagement';
import { useToast } from '../../contexts/ToastContext';

const EmailManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'templates' | 'providers'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);

  const { addToast } = useToast();

  // API hooks
  const { data: templates = [], isLoading: isLoadingTemplates, error: templatesError } = useEmailTemplates();
  const { data: providers = [], isLoading: isLoadingProviders, error: providersError } = useEmailProviders();
  const { data: gmailIntegration, isLoading: isLoadingGmail, error: gmailError } = useGmailIntegration();
  
  const deleteTemplateMutation = useDeleteEmailTemplate();
  const duplicateTemplateMutation = useDuplicateEmailTemplate();
  const deleteProviderMutation = useDeleteEmailProvider();
  const testProviderMutation = useTestEmailProvider();
  const setDefaultProviderMutation = useSetDefaultEmailProvider();
  const migrateGmailMutation = useMigrateGmailIntegration();

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

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplateMutation.mutateAsync(templateId);
        addToast({ type: 'success', title: 'Template deleted successfully' });
      } catch (error) {
        addToast({ type: 'error', title: 'Failed to delete template' });
      }
    }
  };

  const handleConnectProvider = (type: 'gmail' | 'outlook' | 'smtp') => {
    setSelectedProvider(null);
    setIsProviderModalOpen(true);
    // TODO: Implement OAuth flow or SMTP configuration based on type
  };

  const handleTestProvider = async (provider: EmailProvider) => {
    try {
      await testProviderMutation.mutateAsync(provider.id);
      addToast({ type: 'success', title: 'Provider connection test successful' });
    } catch (error) {
      addToast({ type: 'error', title: 'Provider connection test failed' });
    }
  };

  const handleSetDefaultProvider = async (providerId: string) => {
    try {
      await setDefaultProviderMutation.mutateAsync(providerId);
      addToast({ type: 'success', title: 'Default provider updated' });
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to update default provider' });
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    if (window.confirm('Are you sure you want to disconnect this email provider?')) {
      try {
        await deleteProviderMutation.mutateAsync(providerId);
        addToast({ type: 'success', title: 'Provider disconnected successfully' });
      } catch (error) {
        addToast({ type: 'error', title: 'Failed to disconnect provider' });
      }
    }
  };

  const handleMigrateGmail = async () => {
    try {
      await migrateGmailMutation.mutateAsync();
      addToast({ type: 'success', title: 'Gmail integration migrated successfully' });
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to migrate Gmail integration' });
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

      {/* Show Gmail migration notice if available */}
      {gmailIntegration?.isConnected && providers.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Mail className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">Existing Gmail Connection Found</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>We found an existing Gmail connection for <strong>{gmailIntegration.email}</strong> from your account settings.</p>
                <p className="mt-2">You can migrate this connection to the new email management system to take advantage of advanced features like templates, multiple providers, and detailed analytics.</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleMigrateGmail}
                  disabled={migrateGmailMutation.isPending}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                >
                  {migrateGmailMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Migrating...
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
                      Migrate Gmail Connection
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <button
              onClick={handleCreateTemplate}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </button>
          </div>

          {templates.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No email templates</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first email template</p>
              <button
                onClick={handleCreateTemplate}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </button>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <p className="p-4 text-gray-600">Templates will be displayed here once implemented.</p>
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
              <p className="p-4 text-gray-600">Providers will be displayed here once implemented.</p>
            </div>
          )}
        </div>
      )}

      {/* Template Modal Placeholder */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedTemplate ? 'Edit Template' : 'Create Template'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Template editing form will be implemented here.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provider Modal Placeholder */}
      {isProviderModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Connect Email Provider
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Provider connection form will be implemented here.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsProviderModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsProviderModalOpen(false)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailManagementPage;

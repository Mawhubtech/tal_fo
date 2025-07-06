import React, { useState, useEffect } from 'react';
import { X, Save, Eye, Code, Eye as EyeIcon, Sparkles, Users, Building2, Plus, Minus } from 'lucide-react';
import { useCreateEmailTemplate, useUpdateEmailTemplate, useGenerateAiTemplateContent, type EmailTemplate, type CreateTemplateData } from '../hooks/useEmailManagement';
import { useHiringTeams } from '../hooks/useHiringTeam';
import { useOrganizations } from '../hooks/useOrganizations';
import { useToast } from '../contexts/ToastContext';
import RichTextEditor from './RichTextEditor';
import TemplateVariablesHelper from './TemplateVariablesHelper';

interface EmailTemplateFormProps {
  template?: EmailTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EmailTemplateForm: React.FC<EmailTemplateFormProps> = ({
  template,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<CreateTemplateData>({
    name: '',
    subject: '',
    content: '',
    type: 'custom',
    category: 'general',
    scope: 'personal',
    isShared: false,
    description: '',
    teamIds: [],
    organizationIds: []
  });
  const [showPreview, setShowPreview] = useState(false);
  const [editorMode, setEditorMode] = useState<'rich' | 'html'>('rich');
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [aiInstructions, setAiInstructions] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { addToast } = useToast();
  const createMutation = useCreateEmailTemplate();
  const updateMutation = useUpdateEmailTemplate();
  const generateAiMutation = useGenerateAiTemplateContent();
  
  // Fetch teams and organizations for sharing
  const { data: teams = [] } = useHiringTeams();
  const { data: organizations = [] } = useOrganizations();

  // Add custom CSS for email preview
  const emailPreviewStyles = `
    .email-preview h1 { font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #1f2937; }
    .email-preview h2 { font-size: 20px; font-weight: bold; margin-bottom: 14px; color: #374151; }
    .email-preview h3 { font-size: 18px; font-weight: bold; margin-bottom: 12px; color: #4b5563; }
    .email-preview p { margin-bottom: 12px; }
    .email-preview ul, .email-preview ol { margin-bottom: 12px; padding-left: 20px; }
    .email-preview li { margin-bottom: 4px; }
    .email-preview a { color: #3b82f6; text-decoration: underline; }
    .email-preview strong { font-weight: bold; }
    .email-preview em { font-style: italic; }
    .email-preview table { border-collapse: collapse; width: 100%; }
    .email-preview td, .email-preview th { padding: 8px; text-align: left; }
  `;

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        subject: template.subject,
        content: template.content,
        type: template.type,
        category: template.category,
        scope: template.scope,
        isShared: template.isShared,
        description: template.description,
        teamIds: template.teamIds || [],
        organizationIds: template.organizationIds || []
      });
    } else {
      setFormData({
        name: '',
        subject: '',
        content: '',
        type: 'custom',
        category: 'general',
        scope: 'personal',
        isShared: false,
        description: '',
        teamIds: [],
        organizationIds: []
      });
    }
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (template) {
        await updateMutation.mutateAsync({ 
          id: template.id, 
          ...formData 
        });
        addToast({ type: 'success', title: 'Template updated successfully' });
      } else {
        await createMutation.mutateAsync(formData);
        addToast({ type: 'success', title: 'Template created successfully' });
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      addToast({ 
        type: 'error', 
        title: template ? 'Failed to update template' : 'Failed to create template'
      });
    }
  };

  const handleGenerateWithAi = () => {
    if (!formData.type || !formData.category) {
      addToast({ 
        type: 'info', 
        title: 'Please select template type and category first',
        message: 'Template type and category are required for AI generation.'
      });
      return;
    }

    // Check if content already exists and show confirmation dialog
    if (formData.subject.trim() || formData.content.trim()) {
      setShowConfirmDialog(true);
    } else {
      // No existing content, proceed directly
      setShowAiDialog(true);
    }
  };

  const handleConfirmReplace = () => {
    setShowConfirmDialog(false);
    setShowAiDialog(true);
  };

  const handleCancelReplace = () => {
    setShowConfirmDialog(false);
  };

  const handleAiGeneration = async () => {
    try {
      const result = await generateAiMutation.mutateAsync({
        type: formData.type,
        category: formData.category,
        instructions: aiInstructions.trim() || undefined
      });
      
      // Use a functional update to ensure we don't lose the subject
      setFormData(prevFormData => {
        const newFormData = {
          ...prevFormData,
          subject: result.subject || '',
          content: result.body || result.content || ''
        };
        
        return newFormData;
      });
      
      addToast({ 
        type: 'success', 
        title: 'AI content generated successfully',
        message: 'Subject and content have been generated based on your template type and category.'
      });
      
      setShowAiDialog(false);
      setAiInstructions('');
    } catch (error) {
      addToast({ 
        type: 'error', 
        title: 'Failed to generate AI content',
        message: 'Please try again or create the content manually.'
      });
    }
  };

  const templateTypes = [
    { value: 'interview_invitation', label: 'Interview Invitation' },
    { value: 'interview_reminder', label: 'Interview Reminder' },
    { value: 'interview_reschedule', label: 'Interview Reschedule' },
    { value: 'interview_cancellation', label: 'Interview Cancellation' },
    { value: 'feedback_request', label: 'Feedback Request' },
    { value: 'offer_letter', label: 'Offer Letter' },
    { value: 'rejection_letter', label: 'Rejection Letter' },
    { value: 'welcome_email', label: 'Welcome Email' },
    { value: 'follow_up', label: 'Follow Up' },
    { value: 'candidate_outreach', label: 'Candidate Outreach' },
    { value: 'client_outreach', label: 'Client Outreach' },
    { value: 'team_invitation', label: 'Team Invitation' },
    { value: 'custom', label: 'Custom' }
  ] as const;

  const templateCategories = [
    { value: 'recruitment', label: 'Recruitment' },
    { value: 'interviews', label: 'Interviews' },
    { value: 'client_communication', label: 'Client Communication' },
    { value: 'team_management', label: 'Team Management' },
    { value: 'general', label: 'General' }
  ] as const;

  const templateScopes = [
    { value: 'personal', label: 'Personal', description: 'Only available to you' },
    { value: 'team', label: 'Team', description: 'Available to your team' },
    { value: 'organization', label: 'Organization', description: 'Available to your organization' }
  ] as const;

  // Helper functions for team and organization management
  const handleAddTeam = (teamId: string) => {
    if (!formData.teamIds?.includes(teamId)) {
      setFormData(prev => ({
        ...prev,
        teamIds: [...(prev.teamIds || []), teamId]
      }));
    }
  };

  const handleRemoveTeam = (teamId: string) => {
    setFormData(prev => ({
      ...prev,
      teamIds: prev.teamIds?.filter(id => id !== teamId) || []
    }));
  };

  const handleAddOrganization = (orgId: string) => {
    if (!formData.organizationIds?.includes(orgId)) {
      setFormData(prev => ({
        ...prev,
        organizationIds: [...(prev.organizationIds || []), orgId]
      }));
    }
  };

  const handleRemoveOrganization = (orgId: string) => {
    setFormData(prev => ({
      ...prev,
      organizationIds: prev.organizationIds?.filter(id => id !== orgId) || []
    }));
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{emailPreviewStyles}</style>
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header - Fixed at top */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-medium text-gray-900">
            {template ? 'Edit Email Template' : 'Create Email Template'}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Form Section */}
          <div className={`${showPreview ? 'w-1/2 border-r border-gray-200' : 'w-full'} flex flex-col overflow-hidden`}>
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Template Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., Interview Invitation Template"
                    required
                  />
                </div>

              {/* Template Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                >
                  {templateTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Template Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                >
                  {templateCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Template Scope */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Scope
                </label>
                <div className="space-y-2">
                  {templateScopes.map((scope) => (
                    <div key={scope.value} className="flex items-center">
                      <input
                        type="radio"
                        id={scope.value}
                        name="scope"
                        value={scope.value}
                        checked={formData.scope === scope.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, scope: e.target.value as any }))}
                        className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300"
                      />
                      <label htmlFor={scope.value} className="ml-3 block text-sm">
                        <span className="font-medium text-gray-700">{scope.label}</span>
                        <span className="text-gray-500 ml-2">{scope.description}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Brief description of this template's purpose..."
                />
              </div>

              {/* Share with Teams */}
              {(formData.scope === 'team' || formData.scope === 'organization') && (
                <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h4 className="text-sm font-medium text-gray-900">Share with Teams</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">
                      Select teams that can access this template:
                    </label>
                    
                    {/* Selected Teams */}
                    {formData.teamIds && formData.teamIds.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.teamIds.map(teamId => {
                          const team = teams.find(t => t.id === teamId);
                          return team ? (
                            <span
                              key={teamId}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                            >
                              {team.name}
                              <button
                                type="button"
                                onClick={() => handleRemoveTeam(teamId)}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                    
                    {/* Team Selection */}
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddTeam(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      defaultValue=""
                    >
                      <option value="">Select a team to add...</option>
                      {teams
                        .filter(team => !formData.teamIds?.includes(team.id))
                        .map(team => (
                          <option key={team.id} value={team.id}>
                            {team.name} {team.organizations?.[0]?.name && `(${team.organizations[0].name})`}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Share with Organizations/Clients */}
              {formData.scope === 'organization' && (
                <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-green-600" />
                    <h4 className="text-sm font-medium text-gray-900">Share with Organizations</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">
                      Select client organizations that can access this template:
                    </label>
                    
                    {/* Selected Organizations */}
                    {formData.organizationIds && formData.organizationIds.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.organizationIds.map(orgId => {
                          const org = organizations.find(o => o.id === orgId);
                          return org ? (
                            <span
                              key={orgId}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                            >
                              {org.name}
                              <button
                                type="button"
                                onClick={() => handleRemoveOrganization(orgId)}
                                className="ml-2 text-green-600 hover:text-green-800"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                    
                    {/* Organization Selection */}
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddOrganization(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      defaultValue=""
                    >
                      <option value="">Select an organization to add...</option>
                      {organizations
                        .filter(org => !formData.organizationIds?.includes(org.id))
                        .map(org => (
                          <option key={org.id} value={org.id}>
                            {org.name} ({org.industry || 'Unknown Industry'})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Generate with AI Button */}
              <div className="border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
                      <h4 className="text-sm font-medium text-gray-900">
                        AI Content Generation
                      </h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      Generate professional subject line and HTML content based on your selected type and category
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                        {formData.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {formData.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateWithAi}
                    disabled={generateAiMutation.isPending || !formData.type || !formData.category}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {generateAiMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate with AI
                      </>
                    )}
                  </button>
                </div>
                {generateAiMutation.isPending && (
                  <div className="mt-3 p-3 bg-white bg-opacity-50 rounded border border-purple-200">
                    <div className="flex items-center text-xs text-purple-700">
                      <div className="animate-pulse mr-2 w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="font-medium">Generating AI content...</span>
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                      Creating professional content for {formData.type.replace('_', ' ')} in {formData.category} category
                    </div>
                  </div>
                )}
                {!formData.type || !formData.category ? (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                    ⚠️ Please select both template type and category to enable AI generation
                  </div>
                ) : null}
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Subject *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., Interview Invitation for [Position] Role"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Content *
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditorMode('rich')}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                        editorMode === 'rich'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      <EyeIcon className="w-3 h-3 inline mr-1" />
                      Rich Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorMode('html')}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                        editorMode === 'html'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      <Code className="w-3 h-3 inline mr-1" />
                      HTML Code
                    </button>
                  </div>
                </div>
                
                {editorMode === 'rich' ? (
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                    placeholder="Compose your email content here..."
                    height="400px"
                  />
                ) : (
                  <div>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      rows={16}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                      placeholder="Enter HTML content here..."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Direct HTML editing. Use Handlebars syntax for variables: {'{{candidateName}}'}, {'{{position}}'}, {'{{company}}'}, etc.
                    </p>
                  </div>
                )}
              </div>

              {/* Template Variables Helper */}
              <div className="mt-4">
                <TemplateVariablesHelper />
              </div>

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isShared"
                    checked={formData.isShared}
                    onChange={(e) => setFormData(prev => ({ ...prev, isShared: e.target.checked }))}
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                  />
                  <label htmlFor="isShared" className="ml-2 block text-sm text-gray-700">
                    Share with team/organization based on scope
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {template ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {template ? 'Update Template' : 'Create Template'}
                    </>
                  )}
                </button>
              </div>
            </form>
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="w-1/2 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto bg-gray-50">
                <div className="p-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Email Preview</h4>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="border-b border-gray-200 pb-3 mb-4">
                      <p className="text-sm text-gray-600">
                        <strong>Subject:</strong> {formData.subject || 'No subject'}
                      </p>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      {/* Render HTML content safely */}
                      <div 
                        className="text-sm text-gray-900 email-preview"
                        dangerouslySetInnerHTML={{ 
                          __html: formData.content || '<p style="color: #6b7280; font-style: italic;">Email content will appear here...</p>' 
                        }}
                        style={{
                          fontFamily: 'Arial, sans-serif',
                          lineHeight: '1.6',
                          color: '#333'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Confirmation Dialog for Replacing Existing Content */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Replace Existing Content?
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    You already have content in the subject or content fields. Generating new AI content will replace your existing work.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelReplace}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReplace}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Yes, Replace Content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Instructions Dialog */}
      {showAiDialog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">
                    AI Content Generation
                  </h3>
                </div>
                <button
                  onClick={() => setShowAiDialog(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="mb-4">
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-2">
                    {formData.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {formData.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  The AI will generate a professional email template based on your selected type and category. 
                  You can provide additional instructions to customize the content.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Instructions (Optional)
                </label>
                <textarea
                  value={aiInstructions}
                  onChange={(e) => setAiInstructions(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm"
                  placeholder="e.g., Include specific company benefits, mention remote work options, use a formal tone, include specific requirements..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provide any specific requirements, tone, or content you'd like the AI to include in the template.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAiDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAiGeneration}
                disabled={generateAiMutation.isPending}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {generateAiMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Template
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmailTemplateForm;

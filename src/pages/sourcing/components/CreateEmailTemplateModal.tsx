import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Lightbulb, Eye, Wand2 } from 'lucide-react';
import { useCreateEmailTemplate, useUpdateEmailTemplate } from '../../../hooks/useEmailManagement';

interface CreateEmailTemplateModalProps {
  projectId: string;
  template?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateEmailTemplateModal: React.FC<CreateEmailTemplateModalProps> = ({
  projectId,
  template,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    description: '',
    type: 'candidate_outreach' as any,
    category: 'outreach' as any,
    scope: 'personal' as const,
    variables: [] as string[],
  });
  const [newVariable, setNewVariable] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiInstructions, setAiInstructions] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const createMutation = useCreateEmailTemplate();
  const updateMutation = useUpdateEmailTemplate();

  const isEditing = !!template;

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        subject: template.subject || '',
        content: template.content || template.body || '',
        description: template.description || '',
        type: template.type || 'candidate_outreach',
        category: template.category || 'sourcing',
        scope: template.scope || 'personal',
        variables: template.variables || [],
      });
    }
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: template.id,
          ...formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const addVariable = () => {
    if (newVariable && !formData.variables.includes(newVariable)) {
      setFormData({
        ...formData,
        variables: [...formData.variables, newVariable],
      });
      setNewVariable('');
    }
  };

  const removeVariable = (variable: string) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter(v => v !== variable),
    });
  };

  const generateAIContent = async () => {
    setIsGeneratingAI(true);
    try {
      // TODO: Implement AI content generation
      // const response = await generateAiContent(formData.type, formData.category, aiInstructions);
      // setFormData({
      //   ...formData,
      //   subject: response.subject,
      //   content: response.body,
      // });
      
      // Mock AI generation for now
      setTimeout(() => {
        setFormData({
          ...formData,
          subject: `AI Generated: ${formData.type.replace('_', ' ')} Template`,
          content: `Hello {{candidate_name}},\n\nI hope this email finds you well...\n\nBest regards,\n{{recruiter_name}}`,
        });
        setIsGeneratingAI(false);
      }, 2000);
    } catch (error) {
      console.error('Error generating AI content:', error);
      setIsGeneratingAI(false);
    }
  };

  const typeOptions = [
    { value: 'candidate_outreach', label: 'Candidate Outreach' },
    { value: 'follow_up', label: 'Follow Up' },
    { value: 'interview_invite', label: 'Interview Invitation' },
    { value: 'interview_reminder', label: 'Interview Reminder' },
    { value: 'rejection', label: 'Rejection' },
    { value: 'offer', label: 'Offer' },
    { value: 'custom', label: 'Custom' },
  ];

  const categoryOptions = [
    { value: 'outreach', label: 'Outreach' },
    { value: 'interview', label: 'Interview' },
    { value: 'hiring', label: 'Hiring' },
    { value: 'general', label: 'General' },
    { value: 'recruitment', label: 'Recruitment' },
  ];

  const scopeOptions = [
    { value: 'personal', label: 'Personal (Only Me)' },
    { value: 'team', label: 'Team' },
    { value: 'organization', label: 'Organization' },
  ];

  const commonVariables = [
    'candidate_name', 'recruiter_name', 'company_name', 'position_title',
    'salary_range', 'location', 'benefits', 'interview_date', 'interview_time',
    'experience_years', 'skills', 'current_company'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Edit Email Template' : 'Create Email Template'}
              </h2>
              <p className="text-gray-600 mt-1">
                {isEditing ? 'Update your email template' : 'Create a new reusable email template'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Preview"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Senior Developer Outreach"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {typeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scope *
                  </label>
                  <select
                    required
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {scopeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Brief description of when to use this template"
                />
              </div>

              {/* AI Generation */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Wand2 className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-purple-900 mb-2">AI Content Generation</h4>
                    <textarea
                      rows={2}
                      value={aiInstructions}
                      onChange={(e) => setAiInstructions(e.target.value)}
                      placeholder="Optional: Provide specific instructions for AI content generation..."
                      className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                    <button
                      type="button"
                      onClick={generateAIContent}
                      disabled={isGeneratingAI}
                      className="mt-2 px-3 py-1 bg-purple-600 text-white hover:bg-purple-700 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingAI ? 'Generating...' : 'Generate AI Content'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Subject Line */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Line *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Exciting {{position_title}} opportunity at {{company_name}}"
                />
              </div>

              {/* Email Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Content *
                </label>
                {previewMode ? (
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[200px]">
                    <div className="text-sm text-gray-600 mb-2">Preview:</div>
                    <div className="whitespace-pre-wrap font-mono text-sm">
                      {formData.content || 'No content to preview'}
                    </div>
                  </div>
                ) : (
                  <textarea
                    required
                    rows={12}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                    placeholder="Hi {{candidate_name}},&#10;&#10;I hope this email finds you well...&#10;&#10;Best regards,&#10;{{recruiter_name}}"
                  />
                )}
              </div>

              {/* Variables */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Variables
                </label>
                <div className="space-y-4">
                  {/* Add Variable */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newVariable}
                      onChange={(e) => setNewVariable(e.target.value)}
                      placeholder="Enter variable name (e.g., candidate_name)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVariable())}
                    />
                    <button
                      type="button"
                      onClick={addVariable}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Common Variables */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Quick add common variables:</p>
                    <div className="flex flex-wrap gap-1">
                      {commonVariables.map(variable => (
                        <button
                          key={variable}
                          type="button"
                          onClick={() => {
                            if (!formData.variables.includes(variable)) {
                              setFormData({
                                ...formData,
                                variables: [...formData.variables, variable],
                              });
                            }
                          }}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded"
                        >
                          + {variable}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Current Variables */}
                  {formData.variables.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Current Variables:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.variables.map(variable => (
                          <span
                            key={variable}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
                          >
                            {`{{${variable}}}`}
                            <button
                              type="button"
                              onClick={() => removeVariable(variable)}
                              className="text-purple-500 hover:text-purple-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Template Tips</h4>
                    <ul className="text-sm text-blue-700 mt-1 space-y-1">
                      <li>• Use variables like {'{candidate_name}'} to personalize emails</li>
                      <li>• Keep subject lines under 50 characters for better open rates</li>
                      <li>• Include a clear call-to-action in your email content</li>
                      <li>• Test your templates with different variable values before using</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {createMutation.isPending || updateMutation.isPending 
                ? 'Saving...' 
                : isEditing ? 'Update Template' : 'Create Template'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Plus, Mail, Target, Clock, Settings, ChevronRight, Edit, Trash2, Eye, X, Type, Code } from 'lucide-react';

interface CreateStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stepData: any) => void;
  templates: any[];
  editingStep?: any;
}

interface StepTemplate {
  id: string;
  name: string;
  type: string;
  subject?: string;
  content: string;
  variables: string[];
}

export const CreateStepModal: React.FC<CreateStepModalProps> = ({
  isOpen,
  onClose,
  onSave,
  templates,
  editingStep,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'template' | 'timing' | 'conditions'>('basic');
  const [formData, setFormData] = useState({
    name: editingStep?.name || '',
    type: editingStep?.type || 'email',
    templateId: editingStep?.templateId || '',
    customSubject: editingStep?.subject || '',
    customContent: editingStep?.content || '',
    htmlContent: editingStep?.htmlContent || '',
    isHtmlContent: editingStep?.isHtmlContent || false,
    useTemplate: editingStep?.templateId ? true : false,
    delayDays: editingStep?.config?.delayDays || 0,
    delayHours: editingStep?.config?.delayHours || 0,
    delayMinutes: editingStep?.config?.delayMinutes || 0,
    trackOpens: editingStep?.config?.emailSettings?.trackOpens || true,
    trackClicks: editingStep?.config?.emailSettings?.trackClicks || true,
    conditions: editingStep?.config?.conditions || [],
  });

  const [selectedTemplate, setSelectedTemplate] = useState<StepTemplate | null>(null);
  const [previewMode, setPreviewMode] = useState<'subject' | 'content'>('content');

  // React Quill configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'align', 'link'
  ];

  // Mock templates for demo
  const stepTemplates: StepTemplate[] = [
    {
      id: 'template-1',
      name: 'Software Engineer Initial Outreach',
      type: 'email',
      subject: 'Exciting {{role}} opportunity at {{company}}',
      content: `Hi {{firstName}},

I hope this message finds you well. I came across your profile and was impressed by your experience with {{skills}}.

We have an exciting {{role}} opportunity at {{company}} that I think would be a great fit for your background. The role involves:

• {{responsibility1}}
• {{responsibility2}}
• {{responsibility3}}

Would you be interested in learning more about this opportunity?

Best regards,
{{recruiterName}}`,
      variables: ['firstName', 'role', 'company', 'skills', 'responsibility1', 'responsibility2', 'responsibility3', 'recruiterName'],
    },
    {
      id: 'template-2',
      name: 'Follow-up Template',
      type: 'email',
      subject: 'Following up on {{role}} opportunity',
      content: `Hi {{firstName}},

I wanted to follow up on my previous message about the {{role}} position at {{company}}.

I understand you're likely busy, but I believe this opportunity could be a great next step in your career. Here are some additional details that might interest you:

• {{benefit1}}
• {{benefit2}}
• {{benefit3}}

Would you have 15 minutes this week for a brief call to discuss?

Best regards,
{{recruiterName}}`,
      variables: ['firstName', 'role', 'company', 'benefit1', 'benefit2', 'benefit3', 'recruiterName'],
    },
  ];

  const stepTypes = [
    { value: 'email', label: 'Email', icon: Mail, description: 'Send an email to the prospect' },
    { value: 'linkedin_message', label: 'LinkedIn Message', icon: Target, description: 'Send a LinkedIn message' },
    { value: 'linkedin_connection', label: 'LinkedIn Connection', icon: Target, description: 'Send a LinkedIn connection request' },
    { value: 'wait', label: 'Wait', icon: Clock, description: 'Wait for a specified period' },
  ];

  React.useEffect(() => {
    if (formData.templateId) {
      const template = stepTemplates.find(t => t.id === formData.templateId);
      setSelectedTemplate(template || null);
    } else {
      setSelectedTemplate(null);
    }
  }, [formData.templateId]);

  const handleSave = () => {
    const stepData = {
      name: formData.name,
      type: formData.type,
      subject: formData.useTemplate ? selectedTemplate?.subject : formData.customSubject,
      content: formData.useTemplate ? selectedTemplate?.content : formData.customContent,
      htmlContent: formData.isHtmlContent ? formData.htmlContent : undefined,
      isHtmlContent: formData.isHtmlContent,
      config: {
        delayDays: formData.delayDays,
        delayHours: formData.delayHours,
        delayMinutes: formData.delayMinutes,
        emailSettings: formData.type === 'email' ? {
          trackOpens: formData.trackOpens,
          trackClicks: formData.trackClicks,
        } : undefined,
        conditions: formData.conditions,
      },
    };

    onSave(stepData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingStep ? 'Edit Step' : 'Create New Step'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 flex-shrink-0">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'basic', label: 'Basic Info', icon: Settings },
              { id: 'template', label: 'Content & Template', icon: Mail },
              { id: 'timing', label: 'Timing & Delays', icon: Clock },
              { id: 'conditions', label: 'Conditions', icon: Target },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Step Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Initial Outreach, Follow-up"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Step Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stepTypes.map((type) => (
                      <div
                        key={type.value}
                        className={`relative rounded-lg border p-4 cursor-pointer hover:bg-gray-50 ${
                          formData.type === type.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-300'
                        }`}
                        onClick={() => setFormData({ ...formData, type: type.value })}
                      >
                        <div className="flex items-start space-x-3">
                          <type.icon className={`w-5 h-5 mt-0.5 ${
                            formData.type === type.value ? 'text-purple-600' : 'text-gray-500'
                          }`} />
                          <div>
                            <h3 className={`font-medium ${
                              formData.type === type.value ? 'text-purple-900' : 'text-gray-900'
                            }`}>
                              {type.label}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                          </div>
                        </div>
                        {formData.type === type.value && (
                          <div className="absolute top-2 right-2">
                            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Template Tab */}
            {activeTab === 'template' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Source
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={formData.useTemplate}
                        onChange={() => setFormData({ ...formData, useTemplate: true })}
                        className="mr-3 text-purple-600"
                      />
                      <span>Use existing template</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!formData.useTemplate}
                        onChange={() => setFormData({ ...formData, useTemplate: false })}
                        className="mr-3 text-purple-600"
                      />
                      <span>Create custom content</span>
                    </label>
                  </div>
                </div>

                {formData.useTemplate ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Template
                      </label>
                      <select
                        value={formData.templateId}
                        onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Choose a template...</option>
                        {stepTemplates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedTemplate && (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Template Preview</h4>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setPreviewMode('subject')}
                              className={`px-3 py-1 text-sm rounded ${
                                previewMode === 'subject'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              Subject
                            </button>
                            <button
                              onClick={() => setPreviewMode('content')}
                              className={`px-3 py-1 text-sm rounded ${
                                previewMode === 'content'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              Content
                            </button>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded border">
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                            {previewMode === 'subject' ? selectedTemplate.subject : selectedTemplate.content}
                          </pre>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Variables: {selectedTemplate.variables.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.type === 'email' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subject Line
                        </label>
                        <input
                          type="text"
                          value={formData.customSubject}
                          onChange={(e) => setFormData({ ...formData, customSubject: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter email subject..."
                        />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Content
                        </label>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isHtmlContent: false })}
                            className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                              !formData.isHtmlContent
                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <Type className="w-3 h-3" />
                            <span>Text</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isHtmlContent: true })}
                            className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                              formData.isHtmlContent
                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <Code className="w-3 h-3" />
                            <span>HTML</span>
                          </button>
                        </div>
                      </div>
                      
                      {formData.isHtmlContent ? (
                        <div className="border border-gray-300 rounded-lg">
                          <ReactQuill
                            value={formData.htmlContent}
                            onChange={(value) => setFormData({ ...formData, htmlContent: value })}
                            modules={quillModules}
                            formats={quillFormats}
                            placeholder="Enter your message content with rich formatting..."
                            style={{ minHeight: '200px' }}
                          />
                        </div>
                      ) : (
                        <textarea
                          value={formData.customContent}
                          onChange={(e) => setFormData({ ...formData, customContent: e.target.value })}
                          rows={8}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter your message content..."
                        />
                      )}
                      
                      {formData.isHtmlContent && (
                        <p className="mt-2 text-xs text-gray-500">
                          HTML emails will be sent with rich formatting. You can use variables like {'{firstName}'} and {'{company}'} in your content.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Timing Tab */}
            {activeTab === 'timing' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Delay before executing this step
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Days</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.delayDays}
                        onChange={(e) => setFormData({ ...formData, delayDays: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Hours</label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={formData.delayHours}
                        onChange={(e) => setFormData({ ...formData, delayHours: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Minutes</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={formData.delayMinutes}
                        onChange={(e) => setFormData({ ...formData, delayMinutes: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Total delay: {formData.delayDays > 0 && `${formData.delayDays} days `}
                    {formData.delayHours > 0 && `${formData.delayHours} hours `}
                    {formData.delayMinutes > 0 && `${formData.delayMinutes} minutes`}
                    {formData.delayDays === 0 && formData.delayHours === 0 && formData.delayMinutes === 0 && 'Execute immediately'}
                  </p>
                </div>

                {formData.type === 'email' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Email Tracking</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.trackOpens}
                          onChange={(e) => setFormData({ ...formData, trackOpens: e.target.checked })}
                          className="mr-3 text-purple-600"
                        />
                        <span>Track email opens</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.trackClicks}
                          onChange={(e) => setFormData({ ...formData, trackClicks: e.target.checked })}
                          className="mr-3 text-purple-600"
                        />
                        <span>Track link clicks</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Conditions Tab */}
            {activeTab === 'conditions' && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Conditional Logic</h3>
                  <p className="text-gray-600 mb-4">
                    Set conditions that must be met before this step executes.
                  </p>
                  <p className="text-sm text-gray-500">
                    This feature will be available in a future update.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.name.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingStep ? 'Update Step' : 'Create Step'}
          </button>
        </div>
      </div>
    </div>
  );
};

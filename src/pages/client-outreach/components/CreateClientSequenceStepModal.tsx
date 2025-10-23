import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  X, 
  Mail, 
  MessageSquare, 
  Phone, 
  Clock, 
  CheckSquare, 
  Settings, 
  Calendar,
  Users,
  Type,
  Code,
  Save,
  AlertCircle
} from 'lucide-react';
import { CreateClientSequenceStepDto } from '../../../hooks/useClientOutreachSequences';
import { useClientOutreachTemplates } from '../../../hooks/useEmailManagement';

interface CreateClientSequenceStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stepData: CreateClientSequenceStepDto) => void;
  templates?: any[];
  editingStep?: any;
  sequenceId: string;
  nextStepOrder: number;
}

interface StepTemplate {
  id: string;
  name: string;
  type: string;
  subject?: string;
  content: string;
  variables: string[];
}

const CreateClientSequenceStepModal: React.FC<CreateClientSequenceStepModalProps> = ({
  isOpen,
  onClose,
  onSave,
  templates = [],
  editingStep,
  sequenceId,
  nextStepOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'timing' | 'settings'>('basic');
  const [formData, setFormData] = useState({
    stepOrder: editingStep?.stepOrder || nextStepOrder,
    name: editingStep?.name || '',
    type: editingStep?.type || 'email',
    subject: editingStep?.subject || '',
    content: editingStep?.content || '',
    htmlContent: editingStep?.htmlContent || '',
    isHtmlContent: editingStep?.isHtmlContent || false,
    templateId: editingStep?.templateId || '',
    useTemplate: editingStep?.templateId ? true : false,
    // Timing settings
    delayDays: editingStep?.config?.delayDays || 0,
    delayHours: editingStep?.config?.delayHours || 0,
    delayMinutes: editingStep?.config?.delayMinutes || 0,
    sendTime: editingStep?.config?.sendTime || '',
    timezone: editingStep?.config?.timezone || '',
    // Email settings
    trackOpens: editingStep?.config?.emailSettings?.trackOpens !== false,
    trackClicks: editingStep?.config?.emailSettings?.trackClicks !== false,
    includeSignature: editingStep?.config?.emailSettings?.includeSignature !== false,
    priority: editingStep?.config?.emailSettings?.priority || 'normal',
    // LinkedIn settings
    personalNote: editingStep?.config?.linkedinSettings?.personalNote || false,
    connectionMessage: editingStep?.config?.linkedinSettings?.connectionMessage || '',
    messageType: editingStep?.config?.linkedinSettings?.messageType || 'message',
    // Phone settings
    maxAttempts: editingStep?.config?.phoneSettings?.maxAttempts || 3,
    timeBetweenAttempts: editingStep?.config?.phoneSettings?.timeBetweenAttempts || 24,
    leaveVoicemail: editingStep?.config?.phoneSettings?.leaveVoicemail !== false,
    voicemailScript: editingStep?.config?.phoneSettings?.voicemailScript || '',
    callObjective: editingStep?.config?.phoneSettings?.callObjective || '',
    // Task settings
    taskType: editingStep?.config?.taskSettings?.taskType || 'follow_up',
    estimatedDuration: editingStep?.config?.taskSettings?.estimatedDuration || 15,
    description: editingStep?.config?.taskSettings?.description || '',
    // Meeting settings
    duration: editingStep?.config?.meetingSettings?.duration || 30,
    meetingType: editingStep?.config?.meetingSettings?.meetingType || 'discovery',
    agenda: editingStep?.config?.meetingSettings?.agenda || '',
    isVirtual: editingStep?.config?.meetingSettings?.isVirtual !== false,
    meetingLink: editingStep?.config?.meetingSettings?.meetingLink || '',
  });

  const [selectedTemplate, setSelectedTemplate] = useState<StepTemplate | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch preset templates for client communication
  const { data: clientTemplates, isLoading: templatesLoading } = useClientOutreachTemplates({
    category: 'client_communication',
    type: 'client_outreach'
  });

  // Step types for client outreach
  const stepTypes = [
    { 
      value: 'email', 
      label: 'Email', 
      icon: Mail, 
      description: 'Send an automated email to prospects',
      color: 'text-purple-600'
    },
    { 
      value: 'linkedin_message', 
      label: 'LinkedIn Message', 
      icon: MessageSquare, 
      description: 'Send a LinkedIn direct message',
      color: 'text-blue-600'
    },
    { 
      value: 'linkedin_connection', 
      label: 'LinkedIn Connection', 
      icon: Users, 
      description: 'Send a LinkedIn connection request',
      color: 'text-blue-600'
    },
    { 
      value: 'phone_call', 
      label: 'Phone Call', 
      icon: Phone, 
      description: 'Schedule a phone call with the prospect',
      color: 'text-green-600'
    },
    { 
      value: 'meeting_request', 
      label: 'Meeting Request', 
      icon: Calendar, 
      description: 'Request a meeting with the prospect',
      color: 'text-orange-600'
    },
    { 
      value: 'task', 
      label: 'Task', 
      icon: CheckSquare, 
      description: 'Create a manual task for the sales team',
      color: 'text-yellow-600'
    },
    { 
      value: 'wait', 
      label: 'Wait', 
      icon: Clock, 
      description: 'Wait for a specified period before next step',
      color: 'text-gray-600'
    },
  ];

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

  // Transform database templates to match StepTemplate interface
  const stepTemplates: StepTemplate[] = useMemo(() => {
    // Handle the API response structure - templates are in clientTemplates.templates
    const templates = clientTemplates?.templates || [];
    
    return templates.map((template: any) => {
      const processedTemplate = {
        id: template.id, // Real database UUID
        name: template.name,
        type: 'email', // Database templates are primarily email templates
        subject: template.subject || '',
        content: template.content || template.body || '', // Use 'content' field (mapped from body)
        variables: template.variables || [],
      };
      
      return processedTemplate;
    });
  }, [clientTemplates]);

  // Initialize selectedTemplate when templates load or when editing an existing step
  useEffect(() => {
    if (editingStep?.templateId && stepTemplates.length > 0) {
      // Only run this for editing existing steps, not during template selection
      const template = stepTemplates.find(t => t.id === editingStep.templateId || t.name === editingStep.templateId);
      if (template) {
        setSelectedTemplate(template);
      }
    }
  }, [stepTemplates, editingStep?.templateId]);

  // Handle template selection changes
  const handleTemplateChange = (templateId: string) => {
    if (templateId) {
      const template = stepTemplates.find(t => t.id === templateId || t.name === templateId);
      
      if (template) {
        // Update form data and template in a single batch
        setFormData(prev => ({
          ...prev,
          templateId: templateId,
          useTemplate: true, // Ensure useTemplate is set to true when selecting a template
          subject: template.subject || '',
          content: template.content || '',
        }));
        setSelectedTemplate(template);
      } else {
        setFormData(prev => ({ ...prev, templateId: templateId, useTemplate: true }));
      }
    } else {
      setFormData(prev => ({ 
        ...prev, 
        templateId: '',
        useTemplate: false, // Set to false when clearing template
        subject: '',
        content: ''
      }));
      setSelectedTemplate(null);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Step name is required';
    }

    if (formData.type === 'email' && !formData.subject.trim()) {
      newErrors.subject = 'Email subject is required';
    }

    if ((formData.type === 'email' || formData.type === 'linkedin_message') && !formData.content.trim()) {
      newErrors.content = 'Message content is required';
    }

    if (formData.type === 'linkedin_connection' && !formData.connectionMessage.trim()) {
      newErrors.connectionMessage = 'Connection message is required';
    }

    if (formData.type === 'phone_call' && !formData.callObjective.trim()) {
      newErrors.callObjective = 'Call objective is required';
    }

    if (formData.type === 'meeting_request' && !formData.agenda.trim()) {
      newErrors.agenda = 'Meeting agenda is required';
    }

    if (formData.type === 'task' && !formData.description.trim()) {
      newErrors.description = 'Task description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const stepData: CreateClientSequenceStepDto = {
      stepOrder: formData.stepOrder,
      name: formData.name.trim(),
      type: formData.type as any,
      subject: formData.subject.trim() || undefined,
      content: formData.content.trim() || undefined,
      htmlContent: formData.isHtmlContent ? formData.htmlContent : undefined,
      isHtmlContent: formData.isHtmlContent,
      templateId: formData.templateId || undefined,
      config: {
        delayDays: formData.delayDays,
        delayHours: formData.delayHours,
        delayMinutes: formData.delayMinutes,
        sendTime: formData.sendTime || undefined,
        timezone: formData.timezone || undefined,
        emailSettings: formData.type === 'email' ? {
          trackOpens: formData.trackOpens,
          trackClicks: formData.trackClicks,
          includeSignature: formData.includeSignature,
          priority: formData.priority as any,
        } : undefined,
        linkedinSettings: (formData.type === 'linkedin_message' || formData.type === 'linkedin_connection') ? {
          personalNote: formData.personalNote,
          connectionMessage: formData.connectionMessage,
          messageType: formData.messageType as any,
        } : undefined,
        phoneSettings: formData.type === 'phone_call' ? {
          maxAttempts: formData.maxAttempts,
          timeBetweenAttempts: formData.timeBetweenAttempts,
          leaveVoicemail: formData.leaveVoicemail,
          voicemailScript: formData.voicemailScript,
          callObjective: formData.callObjective,
        } : undefined,
        taskSettings: formData.type === 'task' ? {
          taskType: formData.taskType as any,
          estimatedDuration: formData.estimatedDuration,
          description: formData.description,
        } : undefined,
        meetingSettings: formData.type === 'meeting_request' ? {
          duration: formData.duration,
          meetingType: formData.meetingType as any,
          agenda: formData.agenda,
          isVirtual: formData.isVirtual,
          meetingLink: formData.meetingLink,
        } : undefined,
      },
    };

    onSave(stepData);
  };

  if (!isOpen) return null;

  // Complete modal using createPortal and Tailwind classes
  const modal = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editingStep ? 'Edit Step' : 'Create New Step'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Step {formData.stepOrder} - Configure your campaign step
            </p>
          </div>
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
              { id: 'content', label: 'Content', icon: Mail },
              { id: 'timing', label: 'Timing', icon: Clock },
              { id: 'settings', label: 'Settings', icon: Settings },
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Step Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Initial Outreach, Follow-up Call"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Step Order
                    </label>
                    <input
                      type="number"
                      value={formData.stepOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, stepOrder: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Step Type *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stepTypes.map((type) => (
                      <div
                        key={type.value}
                        className={`relative rounded-lg border p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          formData.type === type.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-300'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                      >
                        <div className="flex flex-col items-center text-center space-y-2">
                          <type.icon className={`w-6 h-6 ${
                            formData.type === type.value ? 'text-purple-600' : type.color
                          }`} />
                          <div>
                            <h3 className={`font-medium text-sm ${
                              formData.type === type.value ? 'text-purple-900' : 'text-gray-900'
                            }`}>
                              {type.label}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">{type.description}</p>
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

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                {(formData.type === 'email' || formData.type === 'linkedin_message') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content Source
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={formData.useTemplate}
                            onChange={() => setFormData(prev => ({ ...prev, useTemplate: true }))}
                            className="mr-3 text-purple-600"
                          />
                          <span>Use existing template</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={!formData.useTemplate}
                            onChange={() => setFormData(prev => ({ ...prev, useTemplate: false }))}
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
                            onChange={(e) => handleTemplateChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                            disabled={templatesLoading}
                          >
                            <option value="">
                              {templatesLoading ? 'Loading templates...' : 'Choose a template...'}
                            </option>
                            {!templatesLoading && stepTemplates.map((template) => (
                              <option key={template.id} value={template.id}>
                                {template.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Template Variables Info */}
                        {selectedTemplate && selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">Available Variables</h4>
                            <div className="flex flex-wrap gap-1">
                              {selectedTemplate.variables.map((variable, index) => (
                                <span 
                                  key={index}
                                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                                >
                                  {`{{${variable}}}`}
                                </span>
                              ))}
                            </div>
                            <p className="text-xs text-blue-700 mt-2">
                              Use these variables in your subject and content for personalization.
                            </p>
                          </div>
                        )}

                        {/* Template Content Editor */}
                        {formData.useTemplate && (
                          <div className="space-y-4">
                            {formData.type === 'email' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Email Subject *
                                </label>
                                <input
                                  type="text"
                                  value={formData.subject}
                                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errors.subject ? 'border-red-300' : 'border-gray-300'
                                  }`}
                                  placeholder="e.g., Partnership opportunity with {{companyName}}"
                                />
                                {errors.subject && (
                                  <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                                )}
                              </div>
                            )}

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Message Content *
                              </label>
                              <div className="border border-gray-300 rounded-lg">
                                <ReactQuill
                                  value={formData.content}
                                  onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                                  modules={quillModules}
                                  formats={quillFormats}
                                  style={{ minHeight: '200px' }}
                                />
                              </div>
                              {errors.content && (
                                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {formData.type === 'email' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Subject *
                            </label>
                            <input
                              type="text"
                              value={formData.subject}
                              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                errors.subject ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="e.g., Partnership opportunity with {{companyName}}"
                            />
                            {errors.subject && (
                              <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                            )}
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Message Content *
                          </label>
                          <div className="border border-gray-300 rounded-lg">
                            <ReactQuill
                              value={formData.content}
                              onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                              modules={quillModules}
                              formats={quillFormats}
                              style={{ minHeight: '200px' }}
                            />
                          </div>
                          {errors.content && (
                            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}

                {formData.type === 'linkedin_connection' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Connection Message *
                    </label>
                    <textarea
                      value={formData.connectionMessage}
                      onChange={(e) => setFormData(prev => ({ ...prev, connectionMessage: e.target.value }))}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.connectionMessage ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Hi [Name], I'd like to connect to discuss potential collaboration..."
                    />
                    {errors.connectionMessage && (
                      <p className="mt-1 text-sm text-red-600">{errors.connectionMessage}</p>
                    )}
                  </div>
                )}

                {formData.type === 'phone_call' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Call Objective *
                    </label>
                    <textarea
                      value={formData.callObjective}
                      onChange={(e) => setFormData({ ...formData, callObjective: e.target.value })}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.callObjective ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Discuss partnership opportunities and understand their current challenges..."
                    />
                    {errors.callObjective && (
                      <p className="mt-1 text-sm text-red-600">{errors.callObjective}</p>
                    )}
                  </div>
                )}

                {formData.type === 'meeting_request' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting Agenda *
                    </label>
                    <textarea
                      value={formData.agenda}
                      onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.agenda ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="1. Introduction and company overview
2. Discussion of current challenges
3. Proposal presentation
4. Next steps"
                    />
                    {errors.agenda && (
                      <p className="mt-1 text-sm text-red-600">{errors.agenda}</p>
                    )}
                  </div>
                )}

                {formData.type === 'task' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Task Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Research the company's recent news and prepare personalized talking points..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Timing Tab */}
            {activeTab === 'timing' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Execution Timing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delay Days
                      </label>
                      <input
                        type="number"
                        value={formData.delayDays}
                        onChange={(e) => setFormData({ ...formData, delayDays: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delay Hours
                      </label>
                      <input
                        type="number"
                        value={formData.delayHours}
                        onChange={(e) => setFormData({ ...formData, delayHours: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                        min="0"
                        max="23"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delay Minutes
                      </label>
                      <input
                        type="number"
                        value={formData.delayMinutes}
                        onChange={(e) => setFormData({ ...formData, delayMinutes: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                        min="0"
                        max="59"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Total delay: {formData.delayDays} days, {formData.delayHours} hours, {formData.delayMinutes} minutes
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Send Time (Optional)
                    </label>
                    <input
                      type="time"
                      value={formData.sendTime}
                      onChange={(e) => setFormData({ ...formData, sendTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      If specified, the step will execute at this time
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone (Optional)
                    </label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    >
                      <option value="">Use sequence default</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Asia/Dubai">Dubai</option>
                      <option value="Asia/Riyadh">Riyadh</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {formData.type === 'email' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Email Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.trackOpens}
                            onChange={(e) => setFormData({ ...formData, trackOpens: e.target.checked })}
                            className="mr-2 text-purple-600"
                          />
                          <span className="text-sm">Track email opens</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.trackClicks}
                            onChange={(e) => setFormData({ ...formData, trackClicks: e.target.checked })}
                            className="mr-2 text-purple-600"
                          />
                          <span className="text-sm">Track link clicks</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.includeSignature}
                            onChange={(e) => setFormData({ ...formData, includeSignature: e.target.checked })}
                            className="mr-2 text-purple-600"
                          />
                          <span className="text-sm">Include signature</span>
                        </label>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Priority
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                        >
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {(formData.type === 'linkedin_message' || formData.type === 'linkedin_connection') && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">LinkedIn Settings</h3>
                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.personalNote}
                          onChange={(e) => setFormData({ ...formData, personalNote: e.target.checked })}
                          className="mr-2 text-purple-600"
                        />
                        <span className="text-sm">Include personal note</span>
                      </label>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message Type
                        </label>
                        <select
                          value={formData.messageType}
                          onChange={(e) => setFormData({ ...formData, messageType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                        >
                          <option value="connection">Connection Request</option>
                          <option value="message">Direct Message</option>
                          <option value="inmessage">InMessage</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {formData.type === 'phone_call' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Phone Call Settings</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Attempts
                          </label>
                          <input
                            type="number"
                            value={formData.maxAttempts}
                            onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) || 1 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                            min="1"
                            max="10"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Time Between Attempts (hours)
                          </label>
                          <input
                            type="number"
                            value={formData.timeBetweenAttempts}
                            onChange={(e) => setFormData({ ...formData, timeBetweenAttempts: parseInt(e.target.value) || 1 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                            min="1"
                          />
                        </div>
                      </div>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.leaveVoicemail}
                          onChange={(e) => setFormData({ ...formData, leaveVoicemail: e.target.checked })}
                          className="mr-2 text-purple-600"
                        />
                        <span className="text-sm">Leave voicemail if no answer</span>
                      </label>
                      
                      {formData.leaveVoicemail && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Voicemail Script
                          </label>
                          <textarea
                            value={formData.voicemailScript}
                            onChange={(e) => setFormData({ ...formData, voicemailScript: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                            placeholder="Hi [Name], this is [Your Name] from [Company]..."
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {formData.type === 'meeting_request' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Meeting Settings</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Duration (minutes)
                          </label>
                          <select
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                          >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={45}>45 minutes</option>
                            <option value={60}>60 minutes</option>
                            <option value={90}>90 minutes</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Meeting Type
                          </label>
                          <select
                            value={formData.meetingType}
                            onChange={(e) => setFormData({ ...formData, meetingType: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                          >
                            <option value="discovery">Discovery Call</option>
                            <option value="demo">Product Demo</option>
                            <option value="proposal">Proposal Presentation</option>
                            <option value="follow_up">Follow-up Meeting</option>
                            <option value="closing">Closing Meeting</option>
                          </select>
                        </div>
                      </div>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isVirtual}
                          onChange={(e) => setFormData({ ...formData, isVirtual: e.target.checked })}
                          className="mr-2 text-purple-600"
                        />
                        <span className="text-sm">Virtual meeting</span>
                      </label>
                      
                      {formData.isVirtual && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Meeting Link
                          </label>
                          <input
                            type="url"
                            value={formData.meetingLink}
                            onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                            placeholder="https://zoom.us/j/..."
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {formData.type === 'task' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Task Settings</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Task Type
                          </label>
                          <select
                            value={formData.taskType}
                            onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                          >
                            <option value="call">Call</option>
                            <option value="email">Email</option>
                            <option value="research">Research</option>
                            <option value="meeting">Meeting</option>
                            <option value="follow_up">Follow-up</option>
                            <option value="proposal">Proposal</option>
                            <option value="demo">Demo</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estimated Duration (minutes)
                          </label>
                          <input
                            type="number"
                            value={formData.estimatedDuration}
                            onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 15 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                            min="5"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {Object.keys(errors).length > 0 && (
                <div className="flex items-center text-red-600">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Please fix the errors above before saving
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={Object.keys(errors).length > 0}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingStep ? 'Update Step' : 'Create Step'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default CreateClientSequenceStepModal;

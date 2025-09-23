import React, { useState, useEffect } from 'react';
import { X, Eye, Code, Copy, Send, Edit } from 'lucide-react';

interface EmailPreviewModalProps {
  template: {
    id: string;
    name: string;
    subject?: string;
    content?: string;
    body?: string;
    type: string;
    category: string;
    variables?: string[];
    usageCount?: number;
    createdBy?: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  };
  onClose: () => void;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  template,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<'preview' | 'raw'>('preview');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  // Body scroll prevention and ESC key handler
  useEffect(() => {
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    // ESC key handler
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Overlay click handler
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Mock variable values for preview
  const mockVariables: Record<string, string> = {
    candidate_name: 'John Doe',
    recruiter_name: 'Sarah Johnson',
    company_name: 'TechCorp Inc.',
    position_title: 'Senior Software Engineer',
    salary_range: '$120,000 - $150,000',
    location: 'San Francisco, CA',
    benefits: 'Health insurance, 401k, stock options',
    interview_date: 'January 25, 2024',
    interview_time: '2:00 PM PST',
    experience_years: '5+',
    skills: 'React, Node.js, TypeScript',
    current_company: 'StartupXYZ',
    relevant_experience: 'full-stack development',
    role_description: 'Lead frontend development for our platform',
    compensation_range: '$120k - $150k plus equity',
    recruiter_title: 'Senior Technical Recruiter',
    recruiter_email: 'sarah@techcorp.com',
    recruiter_phone: '+1 (555) 123-4567',
  };

  const renderContent = (content: string) => {
    let rendered = content;
    
    // Use provided variable values or fall back to mock values
    template.variables?.forEach(variable => {
      const value = variableValues[variable] || mockVariables[variable] || `[${variable}]`;
      const regex = new RegExp(`{{\\s*${variable}\\s*}}`, 'g');
      rendered = rendered.replace(regex, value);
    });
    
    return rendered;
  };

  const handleCopyContent = () => {
    const content = template.content || template.body || '';
    navigator.clipboard.writeText(content);
  };

  const handleCopyRendered = () => {
    const content = template.content || template.body || '';
    const rendered = renderContent(content);
    navigator.clipboard.writeText(rendered);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'candidate_outreach': return 'bg-blue-100 text-blue-700';
      case 'follow_up': return 'bg-green-100 text-green-700';
      case 'interview_invite': return 'bg-purple-100 text-purple-700';
      case 'rejection': return 'bg-red-100 text-red-700';
      case 'offer': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleOverlayClick}>
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold text-gray-900">{template.name}</h2>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(template.type)}`}>
                  {template.type.replace('_', ' ')}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                  {template.category}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Used {template.usageCount || 0} times</span>
                {template.createdBy && (
                  <span>Created by {template.createdBy.firstName} {template.createdBy.lastName}</span>
                )}
                <span>Created {formatDate(template.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1 text-sm rounded ${
                    viewMode === 'preview'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Eye className="w-4 h-4 mr-1 inline" />
                  Preview
                </button>
                <button
                  onClick={() => setViewMode('raw')}
                  className={`px-3 py-1 text-sm rounded ${
                    viewMode === 'raw'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Code className="w-4 h-4 mr-1 inline" />
                  Raw
                </button>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Variables Panel */}
          {template.variables && template.variables.length > 0 && (
            <div className="w-80 border-r border-gray-200 p-6 bg-gray-50 overflow-y-auto">
              <h3 className="font-medium text-gray-900 mb-4">Template Variables</h3>
              <div className="space-y-3">
                {template.variables.map(variable => (
                  <div key={variable}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {variable.replace('_', ' ')}
                    </label>
                    <input
                      type="text"
                      value={variableValues[variable] || mockVariables[variable] || ''}
                      onChange={(e) => setVariableValues({
                        ...variableValues,
                        [variable]: e.target.value
                      })}
                      placeholder={`{{${variable}}}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Preview values are auto-populated. Edit them to see how your template will look with different data.
                </p>
              </div>
            </div>
          )}

          {/* Content Panel */}
          <div className="flex-1 flex flex-col">
            {/* Subject Preview */}
            {template.subject && (
              <div className="p-6 border-b border-gray-200 bg-blue-50">
                <label className="block text-sm font-medium text-blue-900 mb-2">Subject Line</label>
                <div className="bg-white border border-blue-200 rounded-lg p-3">
                  <p className="text-gray-900">
                    {viewMode === 'preview' ? renderContent(template.subject) : template.subject}
                  </p>
                </div>
              </div>
            )}

            {/* Email Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-900">Email Content</label>
                <div className="flex gap-2">
                  <button
                    onClick={viewMode === 'preview' ? handleCopyRendered : handleCopyContent}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1"
                  >
                    <Copy className="w-4 h-4" />
                    Copy {viewMode === 'preview' ? 'Rendered' : 'Raw'}
                  </button>
                  <button className="px-3 py-1 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded flex items-center gap-1">
                    <Edit className="w-4 h-4" />
                    Edit Template
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {viewMode === 'preview' ? (
                  <div className="p-6 bg-white min-h-[400px]">
                    <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                      {renderContent(template.content || template.body || '')}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-gray-50 min-h-[400px]">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                      {template.content || template.body || ''}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {template.variables && template.variables.length > 0 && (
                    <span>{template.variables.length} variables will be replaced when sending</span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg">
                    Test Send
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Use in Campaign
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

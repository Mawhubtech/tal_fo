import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Copy, Eye, Mail, MessageSquare, Tag } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  type: 'email' | 'linkedin' | 'sms';
  category: 'initial_outreach' | 'follow_up' | 'interview_invitation' | 'rejection' | 'offer';
  subject?: string;
  content: string;
  variables: string[];
  usage: number;
  lastUsed?: Date;
  createdAt: Date;
  isActive: boolean;
}

const CandidateOutreachTemplates: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Mock data for templates
  const templates: Template[] = [
    {
      id: '1',
      name: 'Senior Developer Initial Outreach',
      type: 'email',
      category: 'initial_outreach',
      subject: 'Exciting Senior Developer Opportunity at {{company_name}}',
      content: `Hi {{candidate_name}},

I hope this email finds you well. I came across your profile and was impressed by your experience with {{primary_skill}} and your work at {{current_company}}.

We have an exciting opportunity for a Senior Developer role at {{company_name}} that I believe would be a great fit for your background. The position offers:

• Competitive salary range: {{salary_range}}
• {{benefits}}
• Opportunity to work with cutting-edge technologies
• Remote work flexibility

Would you be interested in learning more about this opportunity? I'd love to schedule a brief 15-minute call to discuss the details.

Best regards,
{{recruiter_name}}
{{company_name}}`,
      variables: ['candidate_name', 'primary_skill', 'current_company', 'company_name', 'salary_range', 'benefits', 'recruiter_name'],
      usage: 45,
      lastUsed: new Date('2024-01-20'),
      createdAt: new Date('2024-01-01'),
      isActive: true
    },
    {
      id: '2',
      name: 'LinkedIn Follow-up Message',
      type: 'linkedin',
      category: 'follow_up',
      content: `Hi {{candidate_name}},

I reached out earlier about the {{position_title}} role at {{company_name}}. I wanted to follow up to see if you had a chance to consider the opportunity.

The team is looking to move quickly on this position, and I believe your experience with {{relevant_experience}} makes you an ideal candidate.

Would you be available for a quick call this week to discuss?

Best,
{{recruiter_name}}`,
      variables: ['candidate_name', 'position_title', 'company_name', 'relevant_experience', 'recruiter_name'],
      usage: 32,
      lastUsed: new Date('2024-01-18'),
      createdAt: new Date('2024-01-05'),
      isActive: true
    },
    {
      id: '3',
      name: 'Interview Invitation Email',
      type: 'email',
      category: 'interview_invitation',
      subject: 'Interview Invitation - {{position_title}} at {{company_name}}',
      content: `Dear {{candidate_name}},

Thank you for your interest in the {{position_title}} position at {{company_name}}. We were impressed with your background and would like to invite you for an interview.

Interview Details:
• Date: {{interview_date}}
• Time: {{interview_time}}
• Duration: {{interview_duration}}
• Format: {{interview_format}}
• Interviewer(s): {{interviewer_names}}

{{interview_instructions}}

Please confirm your availability by replying to this email. If you have any questions or need to reschedule, please don't hesitate to reach out.

We look forward to speaking with you!

Best regards,
{{recruiter_name}}
{{company_name}}`,
      variables: ['candidate_name', 'position_title', 'company_name', 'interview_date', 'interview_time', 'interview_duration', 'interview_format', 'interviewer_names', 'interview_instructions', 'recruiter_name'],
      usage: 28,
      lastUsed: new Date('2024-01-19'),
      createdAt: new Date('2024-01-10'),
      isActive: true
    },
    {
      id: '4',
      name: 'Polite Rejection Follow-up',
      type: 'email',
      category: 'follow_up',
      subject: 'Thank you for your time - Future opportunities',
      content: `Hi {{candidate_name}},

Thank you for taking the time to learn about the {{position_title}} opportunity at {{company_name}}.

I completely understand that the timing or fit may not be right for you at the moment. I wanted to keep the door open for future opportunities that might be a better match.

I'll keep your profile in our talent pipeline and reach out when we have positions that align better with your interests and career goals.

Feel free to reach out if your situation changes or if you'd like to discuss other opportunities.

Best regards,
{{recruiter_name}}
{{company_name}}`,
      variables: ['candidate_name', 'position_title', 'company_name', 'recruiter_name'],
      usage: 15,
      lastUsed: new Date('2024-01-15'),
      createdAt: new Date('2024-01-08'),
      isActive: true
    }
  ];

  const categories = [
    { key: '', label: 'All Categories' },
    { key: 'initial_outreach', label: 'Initial Outreach' },
    { key: 'follow_up', label: 'Follow Up' },
    { key: 'interview_invitation', label: 'Interview Invitation' },
    { key: 'rejection', label: 'Rejection' },
    { key: 'offer', label: 'Offer' }
  ];

  const types = [
    { key: '', label: 'All Types' },
    { key: 'email', label: 'Email' },
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'sms', label: 'SMS' }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    const matchesType = !selectedType || template.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType && template.isActive;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'linkedin': return <MessageSquare className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'initial_outreach': return 'bg-blue-100 text-blue-700';
      case 'follow_up': return 'bg-yellow-100 text-yellow-700';
      case 'interview_invitation': return 'bg-green-100 text-green-700';
      case 'rejection': return 'bg-red-100 text-red-700';
      case 'offer': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const TemplateCard: React.FC<{ template: Template }> = ({ template }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className="text-purple-600">
              {getTypeIcon(template.type)}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(template.category)}`}>
              {template.category.replace('_', ' ').toUpperCase()}
            </span>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 uppercase">
              {template.type}
            </span>
          </div>
          {template.subject && (
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Subject:</span> {template.subject}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setSelectedTemplate(template)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Copy">
            <Copy className="w-4 h-4" />
          </button>
          <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg" title="Edit">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 line-clamp-3">
          {template.content.substring(0, 150)}...
        </p>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span>Used {template.usage} times</span>
          {template.lastUsed && (
            <span>Last used {template.lastUsed.toLocaleDateString()}</span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <Tag className="w-4 h-4" />
          <span>{template.variables.length} variables</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidate Outreach Templates</h1>
          <p className="text-gray-600 mt-1">Create and manage reusable templates for candidate outreach</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create Template</span>
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.key} value={category.key}>{category.label}</option>
            ))}
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {types.map(type => (
              <option key={type.key} value={type.key}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedTemplate.name}</h2>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(selectedTemplate.category)}`}>
                      {selectedTemplate.category.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 uppercase">
                      {selectedTemplate.type}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              {selectedTemplate.subject && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <code className="text-sm">{selectedTemplate.subject}</code>
                  </div>
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Content</label>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <pre className="text-sm whitespace-pre-wrap font-mono">{selectedTemplate.content}</pre>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Variables ({selectedTemplate.variables.length})</label>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.variables.map((variable, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-mono">
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
                Use Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateOutreachTemplates;

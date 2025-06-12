import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Copy, Eye, Mail, MessageSquare, Tag } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  type: 'email' | 'linkedin' | 'sms';
  category: 'introduction' | 'follow_up' | 'proposal' | 'meeting_request' | 'partnership';
  subject?: string;
  content: string;
  variables: string[];
  usage: number;
  lastUsed?: Date;
  createdAt: Date;
  isActive: boolean;
}

const ClientOutreachTemplates: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Mock data for templates
  const templates: Template[] = [
    {
      id: '1',
      name: 'Enterprise Partnership Introduction',
      type: 'email',
      category: 'introduction',
      subject: 'Strategic Partnership Opportunity for {{company_name}}',
      content: `Dear {{contact_name}},

I hope this email finds you well. I'm reaching out from {{our_company}} because I believe there's a strong strategic partnership opportunity between our organizations.

{{our_company}} specializes in providing top-tier talent solutions for {{target_industry}} companies. I've been following {{company_name}}'s growth and am impressed by your recent {{recent_achievement}}.

I'd love to explore how we can support your hiring initiatives, particularly for:
• {{primary_hiring_need}}
• {{secondary_hiring_need}}
• Executive search and leadership positions

Our approach includes:
- Dedicated talent acquisition specialists
- 90-day placement guarantee
- Competitive pricing structure starting at {{pricing_range}}

Would you be available for a brief 20-minute call this week to discuss how we can accelerate your hiring goals?

Best regards,
{{sender_name}}
{{title}}
{{our_company}}
{{phone}} | {{email}}`,
      variables: ['contact_name', 'company_name', 'our_company', 'target_industry', 'recent_achievement', 'primary_hiring_need', 'secondary_hiring_need', 'pricing_range', 'sender_name', 'title', 'phone', 'email'],
      usage: 32,
      lastUsed: new Date('2024-01-20'),
      createdAt: new Date('2024-01-01'),
      isActive: true
    },
    {
      id: '2',
      name: 'LinkedIn Connection Request',
      type: 'linkedin',
      category: 'introduction',
      content: `Hi {{contact_name}},

I'd like to connect with you as I believe {{our_company}} could be a valuable partner for {{company_name}}'s talent acquisition needs.

We specialize in {{specialization}} and have helped companies like {{similar_company}} scale their teams effectively.

Would love to explore potential synergies!

Best,
{{sender_name}}`,
      variables: ['contact_name', 'our_company', 'company_name', 'specialization', 'similar_company', 'sender_name'],
      usage: 28,
      lastUsed: new Date('2024-01-18'),
      createdAt: new Date('2024-01-05'),
      isActive: true
    },
    {
      id: '3',
      name: 'Follow-up Meeting Request',
      type: 'email',
      category: 'follow_up',
      subject: 'Following up - Partnership discussion for {{company_name}}',
      content: `Hi {{contact_name}},

I wanted to follow up on my previous email regarding a potential partnership between {{our_company}} and {{company_name}}.

I understand that hiring priorities can shift quickly, especially in the {{industry}} sector. I'd love to schedule a brief call to understand your current talent needs and share how we've helped similar companies like {{case_study_company}} achieve {{specific_result}}.

I have availability:
• {{time_option_1}}
• {{time_option_2}}
• {{time_option_3}}

Alternatively, feel free to suggest a time that works better for you.

Looking forward to connecting!

Best regards,
{{sender_name}}
{{our_company}}`,
      variables: ['contact_name', 'our_company', 'company_name', 'industry', 'case_study_company', 'specific_result', 'time_option_1', 'time_option_2', 'time_option_3', 'sender_name'],
      usage: 24,
      lastUsed: new Date('2024-01-19'),
      createdAt: new Date('2024-01-08'),
      isActive: true
    },
    {
      id: '4',
      name: 'Service Proposal Template',
      type: 'email',
      category: 'proposal',
      subject: 'Talent Acquisition Proposal for {{company_name}}',
      content: `Dear {{contact_name}},

Thank you for your interest in partnering with {{our_company}} for your talent acquisition needs. Based on our discussion, I've prepared a customized proposal for {{company_name}}.

**Your Hiring Challenges:**
- {{challenge_1}}
- {{challenge_2}}
- {{challenge_3}}

**Our Proposed Solution:**
We recommend our {{service_package}} which includes:
- Dedicated recruiter assigned to your account
- {{sla_timeframe}} candidate delivery SLA
- {{guarantee_period}} replacement guarantee
- Access to our talent database of {{database_size}} professionals

**Investment:**
- {{pricing_structure}}
- {{payment_terms}}

**Next Steps:**
I'd love to schedule a call to review this proposal in detail and answer any questions you may have.

Please let me know your availability for next week.

Best regards,
{{sender_name}}
{{title}}
{{our_company}}`,
      variables: ['contact_name', 'our_company', 'company_name', 'challenge_1', 'challenge_2', 'challenge_3', 'service_package', 'sla_timeframe', 'guarantee_period', 'database_size', 'pricing_structure', 'payment_terms', 'sender_name', 'title'],
      usage: 18,
      lastUsed: new Date('2024-01-15'),
      createdAt: new Date('2024-01-12'),
      isActive: true
    }
  ];

  const categories = [
    { key: '', label: 'All Categories' },
    { key: 'introduction', label: 'Introduction' },
    { key: 'follow_up', label: 'Follow Up' },
    { key: 'proposal', label: 'Proposal' },
    { key: 'meeting_request', label: 'Meeting Request' },
    { key: 'partnership', label: 'Partnership' }
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
      case 'introduction': return 'bg-blue-100 text-blue-700';
      case 'follow_up': return 'bg-yellow-100 text-yellow-700';
      case 'proposal': return 'bg-green-100 text-green-700';
      case 'meeting_request': return 'bg-purple-100 text-purple-700';
      case 'partnership': return 'bg-indigo-100 text-indigo-700';
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
          <h1 className="text-3xl font-bold text-gray-900">Client Outreach Templates</h1>
          <p className="text-gray-600 mt-1">Create and manage reusable templates for client outreach</p>
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

export default ClientOutreachTemplates;

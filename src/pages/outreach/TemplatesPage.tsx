import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, Filter, MoreVertical, Mail, Copy, 
  Edit, Trash2, Eye, MessageSquare, Send,
  Home, ChevronRight, Calendar, Clock, Tag,
  FileText, Star, Heart
} from 'lucide-react';

// Types
interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'initial' | 'follow_up' | 'cold_outreach' | 'warm_intro' | 'thank_you';
  category: string;
  tags: string[];
  usage: number;
  responseRate: number;
  createdDate: string;
  lastUsed?: string;
  isFavorite: boolean;
  variables: string[];
}

const TemplatesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data - replace with real data from your API
  const templates: Template[] = [
    {
      id: '1',
      name: 'Software Engineer Introduction',
      subject: 'Exciting React opportunity at {{company_name}}',
      content: `Hi {{first_name}},

I hope this message finds you well. I came across your profile and was impressed by your experience with React and Node.js.

We have an exciting opportunity for a Senior Software Engineer at {{company_name}} that I think would be a great fit for your background. The role involves:

• Building scalable React applications
• Working with modern JavaScript frameworks
• Collaborating with a talented team of engineers

Would you be interested in learning more about this opportunity? I'd love to schedule a brief call to discuss the details.

Best regards,
{{sender_name}}`,
      type: 'cold_outreach',
      category: 'Engineering',
      tags: ['React', 'Node.js', 'Senior', 'Remote'],
      usage: 45,
      responseRate: 18.5,
      createdDate: '2024-01-15',
      lastUsed: '2024-01-20',
      isFavorite: true,
      variables: ['first_name', 'company_name', 'sender_name']
    },
    {
      id: '2',
      name: 'Product Manager Follow-up',
      subject: 'Following up on PM opportunity',
      content: `Hi {{first_name}},

I wanted to follow up on my previous message about the Product Manager role at {{company_name}}.

I understand you're likely busy, but I believe this opportunity could be a great next step in your career. The team is doing innovative work in the {{industry}} space and they're looking for someone with your experience in {{specialization}}.

Would you have 15 minutes this week for a quick call to discuss?

Best,
{{sender_name}}`,
      type: 'follow_up',
      category: 'Product',
      tags: ['Product Manager', 'Follow-up', 'B2B'],
      usage: 32,
      responseRate: 24.8,
      createdDate: '2024-01-12',
      lastUsed: '2024-01-19',
      isFavorite: false,
      variables: ['first_name', 'company_name', 'industry', 'specialization', 'sender_name']
    },
    {
      id: '3',
      name: 'UX Designer Warm Introduction',
      subject: '{{referrer_name}} suggested I reach out',
      content: `Hi {{first_name}},

{{referrer_name}} mentioned that you might be interested in exploring new UX design opportunities. I specialize in placing designers at innovative startups and established companies.

I have a particularly exciting role at {{company_name}} that focuses on {{project_type}}. Given your background in {{design_specialty}}, I think this could be a perfect match.

Would you be open to a brief conversation this week?

Best regards,
{{sender_name}}

P.S. {{referrer_name}} speaks very highly of your work!`,
      type: 'warm_intro',
      category: 'Design',
      tags: ['UX', 'Design', 'Warm intro', 'Referral'],
      usage: 28,
      responseRate: 42.1,
      createdDate: '2024-01-10',
      lastUsed: '2024-01-18',
      isFavorite: true,
      variables: ['first_name', 'referrer_name', 'company_name', 'project_type', 'design_specialty', 'sender_name']
    },
    {
      id: '4',
      name: 'Data Scientist Initial Outreach',
      subject: 'ML opportunity at fast-growing startup',
      content: `Hi {{first_name}},

Your work on {{recent_project}} caught my attention. The way you approached {{problem_solved}} shows exactly the kind of innovative thinking we're looking for.

I'm working with {{company_name}}, a fast-growing startup in the {{industry}} space. They're building an AI-powered platform and need a talented Data Scientist like yourself.

Key highlights:
• Work with cutting-edge ML technologies
• {{company_size}} person team, backed by top VCs
• Competitive salary + significant equity
• Remote-first culture

Interested in learning more?

Best,
{{sender_name}}`,
      type: 'cold_outreach',
      category: 'Data Science',
      tags: ['ML', 'AI', 'Data Science', 'Startup'],
      usage: 19,
      responseRate: 31.6,
      createdDate: '2024-01-08',
      lastUsed: '2024-01-17',
      isFavorite: false,
      variables: ['first_name', 'recent_project', 'problem_solved', 'company_name', 'industry', 'company_size', 'sender_name']
    },
    {
      id: '5',
      name: 'Thank You After Interview',
      subject: 'Thank you for your time today',
      content: `Hi {{first_name}},

Thank you for taking the time to speak with me about the {{position}} role at {{company_name}}. I really enjoyed our conversation and learning more about your background and career goals.

As discussed, I'll be sharing your profile with the hiring team, and you can expect to hear from {{next_contact}} within the next {{timeframe}}.

In the meantime, if you have any questions about the role or the company, please don't hesitate to reach out.

Looking forward to the next steps!

Best regards,
{{sender_name}}`,
      type: 'thank_you',
      category: 'General',
      tags: ['Thank you', 'Interview', 'Follow-up'],
      usage: 67,
      responseRate: 0, // Thank you emails don't typically expect responses
      createdDate: '2024-01-05',
      lastUsed: '2024-01-20',
      isFavorite: false,
      variables: ['first_name', 'position', 'company_name', 'next_contact', 'timeframe', 'sender_name']
    }
  ];

  const typeConfig = {
    initial: { label: 'Initial Outreach', color: 'bg-blue-100 text-blue-800' },
    follow_up: { label: 'Follow-up', color: 'bg-yellow-100 text-yellow-800' },
    cold_outreach: { label: 'Cold Outreach', color: 'bg-purple-100 text-purple-800' },
    warm_intro: { label: 'Warm Introduction', color: 'bg-green-100 text-green-800' },
    thank_you: { label: 'Thank You', color: 'bg-gray-100 text-gray-800' }
  };

  const categories = ['All', 'Engineering', 'Product', 'Design', 'Data Science', 'Sales', 'Marketing', 'General'];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedFilter === 'all' || template.type === selectedFilter;
    const matchesCategory = selectedCategory === 'all' || template.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const TemplateCard: React.FC<{ template: Template }> = ({ template }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
              {template.isFavorite && (
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              )}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig[template.type].color}`}>
                {typeConfig[template.type].label}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Subject: <span className="font-medium">{template.subject}</span></p>
            <div className="flex flex-wrap gap-1 mb-3">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700">
                {template.category}
              </span>
              {template.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1 ml-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded">
              <Edit className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Template Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{template.usage}</div>
            <div className="text-xs text-gray-600">Times Used</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {template.responseRate > 0 ? `${template.responseRate}%` : 'N/A'}
            </div>
            <div className="text-xs text-gray-600">Response Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{template.variables.length}</div>
            <div className="text-xs text-gray-600">Variables</div>
          </div>
        </div>

        {/* Template Preview */}
        {isExpanded && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2">Template Content:</h4>
            <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-white p-3 rounded border">
              {template.content}
            </div>
            {template.variables.length > 0 && (
              <div className="mt-3">
                <h5 className="text-xs font-medium text-gray-700 mb-1">Variables:</h5>
                <div className="flex flex-wrap gap-1">
                  {template.variables.map((variable, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Template Details */}
        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>Created:</span>
            <span>{new Date(template.createdDate).toLocaleDateString()}</span>
          </div>
          {template.lastUsed && (
            <div className="flex items-center justify-between">
              <span>Last Used:</span>
              <span>{new Date(template.lastUsed).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
          <button className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium">
            <Send className="w-4 h-4" />
            Use Template
          </button>
          <button className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
            <Copy className="w-4 h-4" />
            Duplicate
          </button>
          <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium">
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium">
            {template.isFavorite ? (
              <Heart className="w-4 h-4 text-red-500 fill-current" />
            ) : (
              <Heart className="w-4 h-4" />
            )}
            {template.isFavorite ? 'Unfavorite' : 'Favorite'}
          </button>
        </div>
      </div>
    );
  };

  const stats = {
    totalTemplates: templates.length,
    favoriteTemplates: templates.filter(t => t.isFavorite).length,
    totalUsage: templates.reduce((sum, t) => sum + t.usage, 0),
    avgResponseRate: templates.filter(t => t.responseRate > 0).length > 0 
      ? templates.filter(t => t.responseRate > 0).reduce((sum, t) => sum + t.responseRate, 0) / templates.filter(t => t.responseRate > 0).length 
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link to="/dashboard" className="flex items-center hover:text-gray-700">
          <Home className="w-4 h-4 mr-1" />
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link to="/dashboard/outreach" className="hover:text-gray-700">
          Outreach
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900 font-medium">Templates</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-600 mt-1">Create and manage reusable email templates for your outreach campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-gray-900">{stats.totalTemplates}</div>
          <div className="text-sm text-gray-600">Total Templates</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">{stats.favoriteTemplates}</div>
          <div className="text-sm text-gray-600">Favorites</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{stats.totalUsage}</div>
          <div className="text-sm text-gray-600">Total Usage</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{stats.avgResponseRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Avg Response Rate</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full"
          />
        </div>
        <select 
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="initial">Initial Outreach</option>
          <option value="follow_up">Follow-up</option>
          <option value="cold_outreach">Cold Outreach</option>
          <option value="warm_intro">Warm Introduction</option>
          <option value="thank_you">Thank You</option>
        </select>
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          {categories.map(category => (
            <option key={category} value={category.toLowerCase()}>
              {category} {category !== 'All' ? 'Templates' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTemplates.map(template => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedFilter !== 'all' || selectedCategory !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first email template'
            }
          </p>
          <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </button>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;

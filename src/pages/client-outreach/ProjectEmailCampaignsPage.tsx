import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Mail,
  Settings,
  BarChart3,
  MessageSquare,
  Search
} from 'lucide-react';
import { useProjects } from '../../hooks/useClientOutreach';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ClientEmailCampaigns, ClientEmailCampaignsSequences } from './components';

const ProjectEmailCampaignsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: projects = [], isLoading } = useProjects();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'analytics'>('campaigns');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const project = projects.find(p => p.id.toString() === id);

  // Mock data for templates - replace with actual API calls
  const emailTemplates = [
    {
      id: '1',
      name: 'Client Introduction Email',
      type: 'client_outreach',
      category: 'initial_outreach',
      subject: 'Partnership Opportunity with {{company_name}}',
      content: 'Hello {{client_name}}, I hope this email finds you well...',
      variables: ['client_name', 'company_name', 'service_type'],
      usage: 45,
      lastUsed: new Date('2025-01-20'),
      createdAt: new Date('2025-01-01'),
      isActive: true
    }
  ];

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return emailTemplates.filter(template => {
      const matchesSearch = !searchTerm || 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.subject?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || template.category === selectedCategory;
      const matchesType = !selectedType || template.type === selectedType;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [emailTemplates, searchTerm, selectedCategory, selectedType]);

  // Calculate analytics - simplified for templates only
  const calculateAnalytics = useMemo(() => {
    // Mock analytics data - in real implementation, this would come from API
    const totalCampaigns = 0;
    const activeCampaigns = 0;
    const pausedCampaigns = 0;
    const totalRecipients = 0;
    const avgOpenRate = 0;
    const avgReplyRate = 0;

    return {
      totalCampaigns,
      activeCampaigns,
      pausedCampaigns,
      totalRecipients,
      avgOpenRate,
      avgReplyRate,
      totalTemplates: filteredTemplates.length
    };
  }, [filteredTemplates]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
          <Link
            to="/dashboard/client-outreach/projects"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const categories = [
    { key: '', label: 'All Categories' },
    { key: 'initial_outreach', label: 'Initial Outreach' },
    { key: 'follow_up', label: 'Follow Up' },
    { key: 'nurture', label: 'Nurture' },
    { key: 'promotional', label: 'Promotional' },
    { key: 'client_communication', label: 'Client Communication' },
  ];

  const types = [
    { key: '', label: 'All Types' },
    { key: 'client_outreach', label: 'Client Outreach' },
    { key: 'follow_up', label: 'Follow Up' },
    { key: 'promotional', label: 'Promotional' },
    { key: 'nurture', label: 'Nurture' },
    { key: 'custom', label: 'Custom' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to={`/dashboard/client-outreach/projects/${project.id}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Project
          </Link>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name} - Email Communications</h1>
            <p className="text-gray-600 mt-1">Manage campaigns, templates, and automated email communications</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Setup Default Campaigns Button - will be handled in campaigns component */}
            <button
              onClick={() => setShowSettings(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
            <button
              onClick={() => setShowCreateTemplate(true)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { key: 'campaigns', label: 'Campaigns', icon: Mail, count: 0 },
            { key: 'templates', label: 'Templates', icon: MessageSquare, count: filteredTemplates.length },
            { key: 'analytics', label: 'Analytics', icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`${
                activeTab === tab.key
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  activeTab === tab.key ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-lg shadow">
          <ClientEmailCampaignsSequences projectId={id!} />
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div>
          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category.key} value={category.key}>{category.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
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
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Mail className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
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
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {template.content.substring(0, 150)}...
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <span>Used {template.usage} times</span>
                    {template.lastUsed && (
                      <span>Last used {template.lastUsed.toLocaleDateString()}</span>
                    )}
                  </div>
                  <span>{template.variables.length} variables</span>
                </div>

                <div className="flex justify-end space-x-2">
                  <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg" title="Preview">
                    Preview
                  </button>
                  <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Use">
                    Use
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg" title="Edit">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600 mb-4">Create your first email template to get started</p>
              <button
                onClick={() => setShowCreateTemplate(true)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </button>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Key Metrics Overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Communication Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Total Campaigns</p>
                    <p className="text-2xl font-bold text-purple-900">{calculateAnalytics.totalCampaigns}</p>
                  </div>
                  <Mail className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Active Campaigns</p>
                    <p className="text-2xl font-bold text-green-900">{calculateAnalytics.activeCampaigns}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Avg. Open Rate</p>
                    <p className="text-2xl font-bold text-purple-900">{calculateAnalytics.avgOpenRate.toFixed(1)}%</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">Avg. Reply Rate</p>
                    <p className="text-2xl font-bold text-orange-900">{calculateAnalytics.avgReplyRate.toFixed(1)}%</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Performance */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
              <p className="text-gray-600 mb-4">Create email campaigns to view comprehensive analytics</p>
              <Link
                to={`/dashboard/client-outreach/projects/${id}/campaigns/create`}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Campaign
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectEmailCampaignsPage;

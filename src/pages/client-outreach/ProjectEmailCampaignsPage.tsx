import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Mail,
  Settings,
  BarChart3,
  MessageSquare,
  Search,
  Zap
} from 'lucide-react';
import { useProjects } from '../../hooks/useClientOutreach';
import { 
  useClientProjectSequences,
  useClientSequenceAnalytics,
  useClientEmailTemplates,
  useClientSourcingTemplates,
  useSetupDefaultClientSequences,
  clientSequenceQueryKeys
} from '../../hooks/useClientOutreachSequences';
import { toast } from '../../components/ToastContainer';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ClientEmailCampaigns, ClientEmailCampaignsSequences, CreateCampaignModal } from './components';

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
  const [isSettingUpSequences, setIsSettingUpSequences] = useState(false);
  const [setupDefaultConfirmation, setSetupDefaultConfirmation] = useState(false);
  
  const project = projects.find(p => p.id.toString() === id);

  // Data fetching
  const { data: emailSequencesData, isLoading: sequencesLoading } = useClientProjectSequences(id!, !!id && !!project);
  const { data: sequenceAnalytics, isLoading: analyticsLoading } = useClientSequenceAnalytics(id!, !!id && !!project);
  const { data: templatesData, isLoading: templatesLoading } = useClientEmailTemplates({
    category: 'client_communication',
    type: selectedType || undefined,
  });
  const { data: clientTemplates, isLoading: clientTemplatesLoading } = useClientSourcingTemplates();
  const setupDefaultSequencesMutation = useSetupDefaultClientSequences();
  const queryClient = useQueryClient();

  // Handlers
  const handleSetupDefaultSequences = async () => {
    if (!project?.pipelineId) {
      toast.error('Pipeline Required', 'This project needs a pipeline to setup default sequences. Please assign a pipeline first.');
      return;
    }

    if (emailSequencesData && emailSequencesData.length > 0) {
      toast.error('Sequences Already Exist', 'This project already has email sequences. Default sequences can only be created for projects without existing sequences.');
      return;
    }

    setSetupDefaultConfirmation(true);
  };

  const confirmSetupDefaultSequences = async () => {
    try {
      setIsSettingUpSequences(true);
      const result = await setupDefaultSequencesMutation.mutateAsync(id!);
      
      // Invalidate sequences queries to refresh the data
      queryClient.invalidateQueries({ 
        queryKey: clientSequenceQueryKeys.byProject(id!) 
      });
      
      toast.success('Default Sequences Created!', result.message);
    } catch (error: any) {
      console.error('Error setting up default sequences:', error);
      toast.error('Setup Failed', error.response?.data?.message || error.message || 'Failed to setup default sequences');
    } finally {
      setIsSettingUpSequences(false);
      setSetupDefaultConfirmation(false);
    }
  };

  const cancelSetupDefaultSequences = () => {
    setSetupDefaultConfirmation(false);
  };

  // Filter templates - combine both API sources
  const filteredTemplates = useMemo(() => {
    const templatesArray = templatesData?.templates || [];
    const clientArray = Array.isArray(clientTemplates) ? clientTemplates : [];
    
    // Combine and deduplicate templates by ID
    const templateMap = new Map();
    [...templatesArray, ...clientArray].forEach(template => {
      if (template.id) {
        templateMap.set(template.id, template);
      }
    });
    const allTemplates = Array.from(templateMap.values());
    
    return allTemplates.filter(template => {
      const matchesSearch = !searchTerm || 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.subject?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || template.category === selectedCategory;
      const matchesType = !selectedType || template.type === selectedType;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [templatesData?.templates, clientTemplates, searchTerm, selectedCategory, selectedType]);

  // Calculate analytics - use real data from API
  const calculateAnalytics = useMemo(() => {
    const templateData = {
      totalTemplates: filteredTemplates.length,
      templatesByCategory: {} as Record<string, number>,
      templatesByType: {} as Record<string, number>,
      recentTemplates: filteredTemplates
        .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
        .slice(0, 5)
    };

    // Calculate template breakdowns
    filteredTemplates.forEach(template => {
      if (template.category) {
        templateData.templatesByCategory[template.category] = (templateData.templatesByCategory[template.category] || 0) + 1;
      }
      if (template.type) {
        templateData.templatesByType[template.type] = (templateData.templatesByType[template.type] || 0) + 1;
      }
    });

    // Use sequence analytics if available, otherwise return defaults
    if (!emailSequencesData || emailSequencesData.length === 0) {
      return {
        ...templateData,
        totalCampaigns: 0,
        activeCampaigns: 0,
        pausedCampaigns: 0,
        totalRecipients: 0,
        avgOpenRate: 0,
        avgReplyRate: 0
      };
    }

    // Calculate campaign metrics from sequences
    const totalCampaigns = emailSequencesData.length;
    const activeCampaigns = emailSequencesData.filter(seq => seq.status === 'active').length;
    const pausedCampaigns = emailSequencesData.filter(seq => seq.status === 'paused').length;
    
    // Aggregate metrics
    let totalRecipients = 0;
    let totalOpens = 0;
    let totalSent = 0;
    let totalReplies = 0;

    emailSequencesData.forEach(sequence => {
      const metrics = sequence.metrics || {};
      totalRecipients += metrics.totalRecipients || 0;
      totalSent += metrics.totalSent || 0;
      totalOpens += metrics.totalOpens || 0;
      totalReplies += metrics.totalResponses || 0;
    });

    const avgOpenRate = totalSent > 0 ? (totalOpens / totalSent) * 100 : 0;
    const avgReplyRate = totalSent > 0 ? (totalReplies / totalSent) * 100 : 0;

    return {
      ...templateData,
      totalCampaigns,
      activeCampaigns,
      pausedCampaigns,
      totalRecipients,
      avgOpenRate: Math.round(avgOpenRate * 10) / 10,
      avgReplyRate: Math.round(avgReplyRate * 10) / 10
    };
  }, [emailSequencesData, filteredTemplates]);

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
            {/* Setup Default Campaigns Button - only show if no sequences exist */}
            {(!emailSequencesData || emailSequencesData.length === 0) && project?.pipelineId && (
              <button
                onClick={handleSetupDefaultSequences}
                disabled={isSettingUpSequences}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-4 h-4 mr-2" />
                {isSettingUpSequences ? 'Setting up...' : 'Setup Default Sequences'}
              </button>
            )}
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
            { key: 'campaigns', label: 'Campaigns', icon: Mail, count: emailSequencesData?.length || 0 },
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
          <ClientEmailCampaignsSequences 
            projectId={id!} 
            sequences={emailSequencesData || []}
            isLoading={sequencesLoading}
          />
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
          {templatesLoading || clientTemplatesLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
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
                          {template.category?.replace('_', ' ')?.toUpperCase() || 'GENERAL'}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 uppercase">
                          {template.type || 'EMAIL'}
                        </span>
                      </div>
                      {template.subject && (
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Subject:</span> {template.subject}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                        {template.content?.substring(0, 150) || template.body?.substring(0, 150) || 'No content available'}...
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span>Used {template.usageCount || template.usage || 0} times</span>
                      {template.updatedAt && (
                        <span>Updated {new Date(template.updatedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    <span>{template.variables?.length || 0} variables</span>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowPreview(true);
                      }}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg" 
                      title="Preview"
                    >
                      Preview
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Use">
                      Use
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowCreateTemplate(true);
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg" 
                      title="Edit"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredTemplates.length === 0 && !templatesLoading && !clientTemplatesLoading && (
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
      
      {/* Setup Default Sequences Confirmation Modal */}
      <ConfirmationModal
        isOpen={setupDefaultConfirmation}
        onClose={cancelSetupDefaultSequences}
        onConfirm={confirmSetupDefaultSequences}
        title="Setup Default Sequences"
        message="This will create default email sequences with multiple steps and templates for client outreach:

• Initial Outreach Sequence (3 steps)
• Follow-up Sequence (2 steps) 
• Nurture Sequence (2 steps)

These sequences will help you systematically engage with potential clients and include professional HTML email templates."
        confirmText="Create Default Sequences"
        cancelText="Cancel"
        type="primary"
      />
    </div>
  );
};

export default ProjectEmailCampaignsPage;

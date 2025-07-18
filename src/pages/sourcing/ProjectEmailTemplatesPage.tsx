import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Search, Filter, Mail, 
  Eye, Edit, Copy, Trash2, MessageSquare, Clock,
  Users, Target, Settings, BarChart3,
  Calendar, CheckCircle, AlertCircle, Tag,
  Zap
} from 'lucide-react';
import { useProject } from '../../hooks/useSourcingProjects';
import { useEmailTemplates, useSourcingTemplates } from '../../hooks/useEmailManagement';
import { 
  useProjectSequences,
  useSequenceAnalytics,
  useSequenceEnrollments
} from '../../hooks/useSourcingSequences';
import { useSetupDefaultSequences } from '../../hooks/useSourcingProjects';
import { toast } from '../../components/ToastContainer';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useQueryClient } from '@tanstack/react-query';
import { sequenceQueryKeys } from '../../hooks/useSourcingSequences';
import { 
  EmailTemplateCard,
  ProjectEmailSettings,
  CreateEmailTemplateModal,
  CreateSequenceModal,
  EmailPreviewModal,
  ProjectSequencesPage,
  CreateStepModal
} from './components';

const ProjectEmailTemplatesPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState<'templates' | 'sequences' | 'analytics'>('sequences');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isSettingUpSequences, setIsSettingUpSequences] = useState(false);
  const [setupDefaultConfirmation, setSetupDefaultConfirmation] = useState(false);

  // Data fetching
  const { data: project, isLoading: projectLoading, error: projectError } = useProject(projectId!);
  const { data: templatesData, isLoading: templatesLoading } = useEmailTemplates({
    category: 'sourcing',
    type: selectedType || undefined,
  });
  const { data: sourcingTemplates, isLoading: sourcingLoading } = useSourcingTemplates();
  
  // Email sequences (campaigns) and analytics
  const { data: emailSequencesData, isLoading: sequencesLoading } = useProjectSequences(projectId!);
  const { data: sequenceAnalytics, isLoading: analyticsLoading } = useSequenceAnalytics(projectId!);
  const setupDefaultSequencesMutation = useSetupDefaultSequences();
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
      const result = await setupDefaultSequencesMutation.mutateAsync(projectId!);
      
      // Invalidate sequences queries to refresh the data
      queryClient.invalidateQueries({ 
        queryKey: sequenceQueryKeys.byProject(projectId!) 
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

  // Filter templates - must be before any conditional returns
  const filteredTemplates = useMemo(() => {
    const templatesArray = templatesData?.templates || [];
    const sourcingArray = Array.isArray(sourcingTemplates) ? sourcingTemplates : [];
    
    // Combine and deduplicate templates by ID
    const templateMap = new Map();
    [...templatesArray, ...sourcingArray].forEach(template => {
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
  }, [templatesData?.templates, sourcingTemplates, searchTerm, selectedCategory, selectedType]);

  // Calculate comprehensive analytics from sequences and templates
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

    if (!emailSequencesData || emailSequencesData.length === 0) {
      return {
        ...templateData,
        totalSequences: 0,
        activeSequences: 0,
        pausedSequences: 0,
        completedSequences: 0,
        draftSequences: 0,
        totalSteps: 0,
        avgStepsPerSequence: 0,
        sequenceBreakdown: [],
        typeBreakdown: [],
        statusBreakdown: [],
        triggerBreakdown: [],
        recentActivity: [],
        topPerformers: []
      };
    }

    // Aggregate data from all sequences
    let totalSteps = 0;
    const sequenceBreakdown: any[] = [];
    const typeBreakdown: Record<string, number> = {};
    const statusBreakdown: Record<string, number> = {};
    const triggerBreakdown: Record<string, number> = {};

    emailSequencesData.forEach(sequence => {
      const steps = sequence.steps || [];
      totalSteps += steps.length;

      // Sequence breakdown
      sequenceBreakdown.push({
        id: sequence.id,
        name: sequence.name,
        type: sequence.type,
        status: sequence.status,
        trigger: sequence.trigger,
        steps: steps.length,
        emailSteps: steps.filter(step => step.type === 'email').length,
        linkedinSteps: steps.filter(step => step.type === 'linkedin_message' || step.type === 'linkedin_connection').length,
        callSteps: steps.filter(step => step.type === 'phone_call').length,
        createdAt: sequence.createdAt,
        updatedAt: sequence.updatedAt
      });

      // Type breakdown
      typeBreakdown[sequence.type] = (typeBreakdown[sequence.type] || 0) + 1;
      
      // Status breakdown
      statusBreakdown[sequence.status] = (statusBreakdown[sequence.status] || 0) + 1;
      
      // Trigger breakdown
      triggerBreakdown[sequence.trigger] = (triggerBreakdown[sequence.trigger] || 0) + 1;
    });

    // Recent activity (last 7 sequences by updated date)
    const recentActivity = [...sequenceBreakdown]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 7);

    // Top performers (sequences with most steps and recent activity)
    const topPerformers = [...sequenceBreakdown]
      .sort((a, b) => {
        const aScore = a.steps * 2 + (a.status === 'active' ? 10 : 0);
        const bScore = b.steps * 2 + (b.status === 'active' ? 10 : 0);
        return bScore - aScore;
      })
      .slice(0, 5);

    return {
      ...templateData,
      totalSequences: emailSequencesData.length,
      activeSequences: emailSequencesData.filter(seq => seq.status === 'active').length,
      pausedSequences: emailSequencesData.filter(seq => seq.status === 'paused').length,
      completedSequences: emailSequencesData.filter(seq => seq.status === 'completed').length,
      draftSequences: emailSequencesData.filter(seq => seq.status === 'draft').length,
      totalSteps,
      avgStepsPerSequence: emailSequencesData.length > 0 ? Math.round((totalSteps / emailSequencesData.length) * 10) / 10 : 0,
      sequenceBreakdown,
      typeBreakdown: Object.entries(typeBreakdown).map(([type, count]) => ({ type, count })),
      statusBreakdown: Object.entries(statusBreakdown).map(([status, count]) => ({ status, count })),
      triggerBreakdown: Object.entries(triggerBreakdown).map(([trigger, count]) => ({ trigger, count })),
      recentActivity,
      topPerformers
    };
  }, [emailSequencesData, filteredTemplates]);

  // Transform email sequences to campaign format
  const emailCampaigns = emailSequencesData?.map(sequence => ({
    id: sequence.id,
    name: sequence.name,
    status: sequence.status === 'active' ? 'active' as const : 'paused' as const,
    template: sequence.config?.template?.name || 'No template',
    recipients: sequence.metrics?.totalRecipients || 0,
    sent: sequence.metrics?.totalSent || 0,
    opened: sequence.metrics?.totalOpens || 0,
    replied: sequence.metrics?.totalResponses || 0,
    clicked: sequence.metrics?.totalClicks || 0,
    scheduled: new Date(sequence.createdAt),
    lastActivity: sequence.updatedAt ? new Date(sequence.updatedAt) : null,
    stages: [], // Email sequences don't have stage info, will need to get from candidates
  })) || [];

  // Loading and error states
  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
          <Link
            to="/dashboard/sourcing/projects"
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
    { key: 'sourcing', label: 'Sourcing' },
    { key: 'recruitment', label: 'Recruitment' },
    { key: 'interviews', label: 'Interviews' },
    { key: 'client_communication', label: 'Client Communication' },
    { key: 'team_management', label: 'Team Management' },
    { key: 'general', label: 'General' },
  ];

  const types = [
    { key: '', label: 'All Types' },
    { key: 'candidate_outreach', label: 'Candidate Outreach' },
    { key: 'client_outreach', label: 'Client Outreach' },
    { key: 'follow_up', label: 'Follow Up' },
    { key: 'interview_invitation', label: 'Interview Invitation' },
    { key: 'interview_reminder', label: 'Interview Reminder' },
    { key: 'interview_reschedule', label: 'Interview Reschedule' },
    { key: 'interview_cancellation', label: 'Interview Cancellation' },
    { key: 'feedback_request', label: 'Feedback Request' },
    { key: 'offer_letter', label: 'Offer Letter' },
    { key: 'rejection_letter', label: 'Rejection Letter' },
    { key: 'welcome_email', label: 'Welcome Email' },
    { key: 'team_invitation', label: 'Team Invitation' },
    { key: 'networking', label: 'Networking' },
    { key: 'referral_request', label: 'Referral Request' },
    { key: 'event_invitation', label: 'Event Invitation' },
    { key: 'custom', label: 'Custom' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to={`/dashboard/sourcing/projects/${project.id}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Project
          </Link>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name} - Email Communications</h1>
            <p className="text-gray-600 mt-1">Manage templates, campaigns, and automated email communications</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Setup Default Sequences Button - only show if no sequences exist */}
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
			  { key: 'sequences', label: 'Sequences', icon: Settings, count: emailSequencesData?.length || 0 },
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
          {templatesLoading || sourcingLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(template => (
                <EmailTemplateCard
                  key={template.id}
                  template={template}
                  onPreview={() => {
                    setSelectedTemplate(template);
                    setShowPreview(true);
                  }}
                  onEdit={() => {
                    setSelectedTemplate(template);
                    setShowCreateTemplate(true);
                  }}
                  onDelete={() => {
                    // Handle delete
                  }}
                  onUse={() => {
                    // Handle use in campaign
                  }}
                />
              ))}
            </div>
          )}

          {filteredTemplates.length === 0 && !templatesLoading && !sourcingLoading && (
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

      {/* Sequences Tab */}
      {activeTab === 'sequences' && (
        <ProjectSequencesPage
          projectId={projectId!}
          project={project}
        />
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div>
          {sequencesLoading || analyticsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Key Metrics Overview */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Communication Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600">Email Templates</p>
                        <p className="text-2xl font-bold text-purple-700">{calculateAnalytics.totalTemplates}</p>
                      </div>
                      <div className="p-3 bg-purple-200 rounded-full">
                        <MessageSquare className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Total Sequences</p>
                        <p className="text-2xl font-bold text-blue-700">{calculateAnalytics.totalSequences}</p>
                      </div>
                      <div className="p-3 bg-blue-200 rounded-full">
                        <Settings className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">Active Sequences</p>
                        <p className="text-2xl font-bold text-green-700">{calculateAnalytics.activeSequences}</p>
                      </div>
                      <div className="p-3 bg-green-200 rounded-full">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-600">Total Steps</p>
                        <p className="text-2xl font-bold text-orange-700">{calculateAnalytics.totalSteps}</p>
                      </div>
                      <div className="p-3 bg-orange-200 rounded-full">
                        <Target className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Analytics */}
              {calculateAnalytics.totalTemplates > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Templates by Type</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.entries(calculateAnalytics.templatesByType).map(([type, count]) => {
                      const percentage = calculateAnalytics.totalTemplates > 0 
                        ? (count / calculateAnalytics.totalTemplates) * 100 
                        : 0;
                      
                      return (
                        <div key={type} className="bg-purple-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-purple-700 mb-1">{count}</div>
                          <div className="text-sm text-purple-600 capitalize mb-1">
                            {type.replace('_', ' ')}
                          </div>
                          <div className="text-xs text-purple-500">{Math.round(percentage)}% of total</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent Templates */}
              {calculateAnalytics.recentTemplates.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recently Updated Templates</h3>
                  <div className="space-y-3">
                    {calculateAnalytics.recentTemplates.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{template.name}</h4>
                          <p className="text-sm text-gray-600">
                            {template.category} • {template.type?.replace('_', ' ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-purple-600">
                            {new Date(template.updatedAt || template.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {template.subject || 'No subject'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sequence Status Distribution</h3>
                  <div className="space-y-4">
                    {calculateAnalytics.statusBreakdown.map((item) => {
                      const percentage = calculateAnalytics.totalSequences > 0 
                        ? (item.count / calculateAnalytics.totalSequences) * 100 
                        : 0;
                      const statusColors: Record<string, string> = {
                        active: 'bg-green-500',
                        paused: 'bg-yellow-500',
                        completed: 'bg-blue-500',
                        draft: 'bg-gray-500'
                      };
                      
                      return (
                        <div key={item.status} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${statusColors[item.status] || 'bg-purple-500'}`}></div>
                            <span className="text-sm font-medium text-gray-700 capitalize">{item.status}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{item.count}</span>
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${statusColors[item.status] || 'bg-purple-500'}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 w-10 text-right">{Math.round(percentage)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sequence Types</h3>
                  <div className="space-y-4">
                    {calculateAnalytics.typeBreakdown.map((item) => {
                      const percentage = calculateAnalytics.totalSequences > 0 
                        ? (item.count / calculateAnalytics.totalSequences) * 100 
                        : 0;
                      
                      return (
                        <div key={item.type} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {item.type.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{item.count}</span>
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-purple-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 w-10 text-right">{Math.round(percentage)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Trigger Analysis */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sequence Triggers</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {calculateAnalytics.triggerBreakdown.map((item) => {
                    const percentage = calculateAnalytics.totalSequences > 0 
                      ? (item.count / calculateAnalytics.totalSequences) * 100 
                      : 0;
                    const triggerIcons: Record<string, any> = {
                      manual: Users,
                      automatic: Zap,
                      pipeline_stage: Target
                    };
                    const TriggerIcon = triggerIcons[item.trigger] || Settings;
                    
                    return (
                      <div key={item.trigger} className="bg-purple-50 rounded-lg p-4 text-center">
                        <div className="flex justify-center mb-2">
                          <TriggerIcon className="w-8 h-8 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-purple-700 mb-1">{item.count}</div>
                        <div className="text-sm text-purple-600 capitalize mb-1">
                          {item.trigger.replace('_', ' ')}
                        </div>
                        <div className="text-xs text-purple-500">{Math.round(percentage)}% of total</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Performing Sequences */}
              {calculateAnalytics.topPerformers.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Sequences</h3>
                  <div className="space-y-3">
                    {calculateAnalytics.topPerformers.map((sequence, index) => (
                      <div key={sequence.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                            <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{sequence.name}</h4>
                            <p className="text-sm text-gray-600">
                              {sequence.type.replace('_', ' ')} • {sequence.status}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-purple-600">
                            {sequence.steps} steps
                          </div>
                          <div className="text-xs text-gray-500">
                            {sequence.emailSteps} email • {sequence.linkedinSteps} linkedin • {sequence.callSteps} calls
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              {calculateAnalytics.recentActivity.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sequence Activity</h3>
                  <div className="space-y-3">
                    {calculateAnalytics.recentActivity.map((sequence) => (
                      <div key={sequence.id} className="flex items-center justify-between p-3 border-l-4 border-purple-400 bg-purple-50 rounded-r-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{sequence.name}</h4>
                          <p className="text-sm text-gray-600">
                            {sequence.type.replace('_', ' ')} • {sequence.steps} steps
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            {new Date(sequence.updatedAt).toLocaleDateString()}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                            sequence.status === 'active' ? 'bg-green-100 text-green-600' :
                            sequence.status === 'paused' ? 'bg-yellow-100 text-yellow-600' :
                            sequence.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {sequence.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Sequence Breakdown */}
              {calculateAnalytics.sequenceBreakdown.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">All Sequences Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sequence
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Steps
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Step Types
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {calculateAnalytics.sequenceBreakdown.map((sequence) => (
                          <tr key={sequence.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{sequence.name}</div>
                              <div className="text-sm text-gray-500">{sequence.trigger.replace('_', ' ')}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900 capitalize">
                                {sequence.type.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                sequence.status === 'active' ? 'bg-green-100 text-green-800' :
                                sequence.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                sequence.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {sequence.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {sequence.steps}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex space-x-2">
                                {sequence.emailSteps > 0 && (
                                  <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs">
                                    {sequence.emailSteps} email
                                  </span>
                                )}
                                {sequence.linkedinSteps > 0 && (
                                  <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
                                    {sequence.linkedinSteps} linkedin
                                  </span>
                                )}
                                {sequence.callSteps > 0 && (
                                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
                                    {sequence.callSteps} call
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(sequence.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {(!emailSequencesData || emailSequencesData.length === 0) && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
                    <p className="text-gray-600 mb-4">Create email sequences to view comprehensive analytics</p>
                    <Link
                      to={`/dashboard/sourcing/projects/${projectId}/sequences`}
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Sequence
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateTemplate && (
        <CreateEmailTemplateModal
          projectId={projectId!}
          template={selectedTemplate}
          onClose={() => {
            setShowCreateTemplate(false);
            setSelectedTemplate(null);
          }}
          onSuccess={() => {
            setShowCreateTemplate(false);
            setSelectedTemplate(null);
          }}
        />
      )}

      {showSettings && (
        <ProjectEmailSettings
          projectId={projectId!}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showPreview && selectedTemplate && (
        <EmailPreviewModal
          template={selectedTemplate}
          onClose={() => {
            setShowPreview(false);
            setSelectedTemplate(null);
          }}
        />
      )}

      {/* Setup Default Sequences Confirmation Modal */}
      <ConfirmationModal
        isOpen={setupDefaultConfirmation}
        onClose={cancelSetupDefaultSequences}
        onConfirm={confirmSetupDefaultSequences}
        title="Setup Default Sequences"
        message="This will create 3 default email sequences with multiple steps and templates based on your pipeline stages:

• Initial Outreach Sequence (3 steps)
• Response Follow-up Sequence (2 steps) 
• Interest Nurturing Sequence (2 steps)

These sequences will be automatically triggered when prospects move between pipeline stages and include professional HTML email templates."
        confirmText="Create Default Sequences"
        cancelText="Cancel"
        type="primary"
      />
    </div>
  );
};

export default ProjectEmailTemplatesPage;

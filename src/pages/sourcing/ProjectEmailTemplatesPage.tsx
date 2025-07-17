import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Search, Filter, Mail, 
  Eye, Edit, Copy, Trash2, MessageSquare, Clock,
  Users, Target, Settings, BarChart3,
  Calendar, CheckCircle, AlertCircle, Tag
} from 'lucide-react';
import { useProject } from '../../hooks/useSourcingProjects';
import { useEmailTemplates, useSourcingTemplates } from '../../hooks/useEmailManagement';
import { 
  useProjectSequences
} from '../../hooks/useSourcingSequences';
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

  // Data fetching
  const { data: project, isLoading: projectLoading, error: projectError } = useProject(projectId!);
  const { data: templatesData, isLoading: templatesLoading } = useEmailTemplates({
    category: 'sourcing',
    type: selectedType || undefined,
  });
  const { data: sourcingTemplates, isLoading: sourcingLoading } = useSourcingTemplates();
  
  // Email sequences (campaigns) and analytics
  const { data: emailSequencesData, isLoading: sequencesLoading } = useProjectSequences(projectId!);
  const sequenceAnalytics = { data: null }; // TODO: Implement analytics for sourcing sequences

  // Handlers

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
  if (projectLoading || sequencesLoading) {
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
          {sequencesLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Analytics */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Performance Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {emailSequencesData?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Sequences</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {emailSequencesData?.filter(seq => seq.status === 'active').length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Active Sequences</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round((emailSequencesData?.reduce((avg, seq) => avg + (seq.metrics?.responseRate || 0), 0) / Math.max(emailSequencesData?.length || 1, 1)) || 0)}%
                    </div>
                    <div className="text-sm text-gray-600">Avg Response Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {emailSequencesData?.reduce((total, seq) => total + (seq.metrics?.totalUsage || 0), 0) || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Usage</div>
                  </div>
                </div>
              </div>

              {/* Top Performing Sequences */}
              {emailSequencesData && emailSequencesData.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Sequences</h3>
                  <div className="space-y-3">
                    {emailSequencesData.slice(0, 5).map((sequence) => (
                      <div key={sequence.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{sequence.name}</h4>
                          <p className="text-sm text-gray-600">{sequence.type}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">
                            {Math.round((sequence.metrics?.responseRate || 0) * 100)}% response rate
                          </div>
                          <div className="text-xs text-gray-500">
                            {sequence.metrics?.totalUsage || 0} uses
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Breakdown */}
              {emailSequencesData && emailSequencesData.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sequences by Category</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(
                      emailSequencesData.reduce((acc, seq) => {
                        acc[seq.type] = (acc[seq.type] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([category, count]) => (
                      <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-xl font-bold text-purple-600">{count}</div>
                        <div className="text-sm text-gray-600 capitalize">{category.replace('_', ' ')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {(!emailSequencesData || emailSequencesData.length === 0) && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
                    <p className="text-gray-600">Create email sequences to view performance analytics</p>
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
    </div>
  );
};

export default ProjectEmailTemplatesPage;

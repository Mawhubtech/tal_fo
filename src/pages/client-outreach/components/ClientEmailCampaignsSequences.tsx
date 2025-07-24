import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Mail, 
  MessageSquare, 
  Tag, 
  Play, 
  Pause, 
  Calendar,
  Users,
  TrendingUp,
  BarChart3,
  Settings,
  ArrowLeft,
  Clock,
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import CreateCampaignModal from './CreateCampaignModal';
import CreateClientSequenceStepModal from './CreateClientSequenceStepModal';
import { useProjects } from '../../../hooks/useClientOutreach';
import { useCreateClientSequenceStep } from '../../../hooks/useClientOutreachSequences';
import { usePipeline } from '../../../hooks/usePipelines';

interface ClientEmailCampaignsSequencesProps {
  projectId: string;
  sequences?: any[];
  isLoading?: boolean;
}

interface Campaign {
  id: string;
  name: string;
  type: 'email';
  category: 'initial_outreach' | 'follow_up' | 'nurture' | 'promotional' | 'client_communication';
  status: 'active' | 'paused' | 'draft' | 'completed';
  emails: number;
  totalRecipients: number;
  sentEmails: number;
  openRate: number;
  replyRate: number;
  clickRate: number;
  description: string;
  lastSent?: Date;
  createdAt: Date;
  updatedAt: Date;
  steps?: CampaignStep[];
  targetCriteria?: {
    stages?: (string | {
      id: string;
      name: string;
      description?: string;
      type: string;
      order: number;
      color: string;
      icon?: string;
      isActive: boolean;
      isTerminal: boolean;
    })[];
  };
}

interface CampaignStep {
  id: string;
  stepOrder: number;
  type: 'email' | 'delay';
  name: string;
  subject?: string;
  content?: string;
  delayDays?: number;
  delayHours?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CampaignEnrollment {
  id: string;
  campaignId: string;
  contactEmail: string;
  contactName: string;
  contactCompany?: string;
  contactTitle?: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  currentStep: number;
  enrolledAt: Date;
  lastEmailSent?: Date;
  nextEmailDue?: Date;
  totalEmailsSent: number;
  totalEmailsOpened: number;
  totalEmailsClicked: number;
  hasReplied: boolean;
}

interface CampaignResponse {
  id: string;
  campaignId: string;
  enrollmentId: string;
  contactEmail: string;
  contactName: string;
  stepId: string;
  stepName: string;
  emailSubject: string;
  responseType: 'reply' | 'click' | 'open' | 'bounce' | 'unsubscribe';
  responseContent?: string;
  responseDate: Date;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

type ViewMode = 'list' | 'steps';

interface ClientEmailCampaignsSequencesProps {
  projectId: string;
}

const ClientEmailCampaignsSequences: React.FC<ClientEmailCampaignsSequencesProps> = ({ 
  projectId, 
  sequences = [], 
  isLoading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [activeStepsTab, setActiveStepsTab] = useState<'steps' | 'contacts' | 'responses'>('steps');
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);
  const [editingSequence, setEditingSequence] = useState<any>(null);
  const [showCreateStepModal, setShowCreateStepModal] = useState(false);
  const [editingStep, setEditingStep] = useState<any>(null);

  // Get project data for modal
  const { data: projects = [] } = useProjects();
  const project = projects.find(p => p.id.toString() === projectId);

  // Get pipeline data for stage lookup (use first sequence's pipeline if available)
  const firstSequence = sequences[0];
  const pipelineId = project?.pipelineId || firstSequence?.pipelineId;
  const { data: pipeline } = usePipeline(pipelineId || '');

  // Helper function to get stage name from stage ID or stage object
  const getStageNameById = (stageId: string): string => {
    // First try to find the stage in the sequences' targetCriteria (which now includes full stage objects)
    for (const sequence of sequences) {
      if (sequence.targetCriteria?.stages) {
        const stage = sequence.targetCriteria.stages.find((s: any) => 
          typeof s === 'object' ? s.id === stageId : s === stageId
        );
        if (stage && typeof stage === 'object' && stage.name) {
          return stage.name;
        }
      }
    }
    
    // Fallback to pipeline lookup if available
    if (pipeline?.stages) {
      const stage = pipeline.stages.find(s => s.id === stageId);
      if (stage) return stage.name;
    }
    
    return 'Unknown Stage';
  };

  // Hook for creating sequence steps
  const createStepMutation = useCreateClientSequenceStep();

  // Transform sequences from API to campaign format
  const campaigns: Campaign[] = sequences.map(sequence => ({
    id: sequence.id,
    name: sequence.name,
    type: 'email',
    category: sequence.category || 'initial_outreach',
    status: sequence.status,
    emails: sequence.steps?.length || 0,
    totalRecipients: sequence.metrics?.totalRecipients || 0,
    sentEmails: sequence.metrics?.totalSent || 0,
    openRate: sequence.metrics?.totalOpens && sequence.metrics?.totalSent 
      ? Math.round((sequence.metrics.totalOpens / sequence.metrics.totalSent) * 100 * 10) / 10 
      : 0,
    replyRate: sequence.metrics?.totalResponses && sequence.metrics?.totalSent 
      ? Math.round((sequence.metrics.totalResponses / sequence.metrics.totalSent) * 100 * 10) / 10 
      : 0,
    clickRate: sequence.metrics?.totalClicks && sequence.metrics?.totalSent 
      ? Math.round((sequence.metrics.totalClicks / sequence.metrics.totalSent) * 100 * 10) / 10 
      : 0,
    description: sequence.description || 'No description available',
    lastSent: sequence.updatedAt ? new Date(sequence.updatedAt) : undefined,
    createdAt: new Date(sequence.createdAt),
    updatedAt: new Date(sequence.updatedAt),
    targetCriteria: sequence.targetCriteria,
    steps: sequence.steps?.map((step: any) => ({
      id: step.id,
      stepOrder: step.stepOrder,
      type: step.type,
      name: step.name,
      subject: step.subject,
      content: step.content,
      delayDays: step.config?.delayDays,
      delayHours: step.config?.delayHours,
      isActive: step.status === 'active',
      createdAt: new Date(step.createdAt),
      updatedAt: new Date(step.updatedAt)
    })) || []
  }));
  // For now, use empty enrollments - will be replaced with real API data
  const campaignEnrollments: CampaignEnrollment[] = [];
  // For now, use empty responses - will be replaced with real API data
  const campaignResponses: CampaignResponse[] = [];

  const categories = [
    { key: '', label: 'All Categories' },
    { key: 'initial_outreach', label: 'Initial Outreach' },
    { key: 'follow_up', label: 'Follow Up' },
    { key: 'nurture', label: 'Nurture' },
    { key: 'promotional', label: 'Promotional' },
    { key: 'client_communication', label: 'Client Communication' }
  ];

  const statuses = [
    { key: '', label: 'All Statuses' },
    { key: 'active', label: 'Active' },
    { key: 'paused', label: 'Paused' },
    { key: 'draft', label: 'Draft' },
    { key: 'completed', label: 'Completed' }
  ];

  // Modal handlers
  const handleCreateCampaign = () => {
    setEditingSequence(null);
    setShowCreateCampaignModal(true);
  };

  const handleEditCampaign = (sequence: any) => {
    setEditingSequence(sequence);
    setShowCreateCampaignModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateCampaignModal(false);
    setEditingSequence(null);
  };

  const handleCampaignSuccess = (sequenceId: string) => {
    setShowCreateCampaignModal(false);
    setEditingSequence(null);
    // The parent component should handle data refresh through query invalidation
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || campaign.category === selectedCategory;
    const matchesStatus = !selectedStatus || campaign.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handler functions
  const handleManageSteps = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setViewMode('steps');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCampaignId(null);
  };

  // Step creation handlers
  const handleAddStep = () => {
    setEditingStep(null);
    setShowCreateStepModal(true);
  };

  const handleEditStep = (step: any) => {
    setEditingStep(step);
    setShowCreateStepModal(true);
  };

  const handleStepModalClose = () => {
    setShowCreateStepModal(false);
    setEditingStep(null);
  };

  const handleStepSave = async (stepData: any) => {
    if (!selectedCampaignId) return;

    try {
      await createStepMutation.mutateAsync({
        sequenceId: selectedCampaignId,
        data: stepData
      });
      setShowCreateStepModal(false);
      setEditingStep(null);
      // The data will be refetched automatically due to query invalidation
    } catch (error) {
      console.error('Failed to create step:', error);
      // Handle error (show toast, etc.)
    }
  };

  // Component to display enrolled contacts for a campaign
  const CampaignEnrollments: React.FC<{ campaignId: string }> = ({ campaignId }) => {
    const enrollments = campaignEnrollments.filter(e => e.campaignId === campaignId);

    if (enrollments.length === 0) {
      return (
        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700 flex items-center">
          <Users className="w-3 h-3 mr-1" />
          No contacts enrolled yet
        </div>
      );
    }

    const activeEnrollments = enrollments.filter(e => e.status === 'active');
    const pausedEnrollments = enrollments.filter(e => e.status === 'paused');
    const completedEnrollments = enrollments.filter(e => e.status === 'completed');
    const failedEnrollments = enrollments.filter(e => e.status === 'failed');

    return (
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-gray-700">
          <span className="flex items-center">
            <Users className="w-3 h-3 mr-1" />
            Enrolled Contacts ({enrollments.length})
          </span>
        </div>
        
        <div className="grid grid-cols-4 gap-1 text-xs">
          <div className="bg-green-50 border border-green-200 rounded px-2 py-1 text-center">
            <div className="font-medium text-green-700">{activeEnrollments.length}</div>
            <div className="text-green-600">Active</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded px-2 py-1 text-center">
            <div className="font-medium text-yellow-700">{pausedEnrollments.length}</div>
            <div className="text-yellow-600">Paused</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1 text-center">
            <div className="font-medium text-blue-700">{completedEnrollments.length}</div>
            <div className="text-blue-600">Completed</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded px-2 py-1 text-center">
            <div className="font-medium text-red-700">{failedEnrollments.length}</div>
            <div className="text-red-600">Failed</div>
          </div>
        </div>

        {/* Show list of active contacts */}
        {activeEnrollments.length > 0 && (
          <div className="text-xs">
            <div className="text-gray-600 font-medium mb-1">Active Contacts:</div>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {activeEnrollments.slice(0, 3).map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                  <span className="text-gray-700">
                    {enrollment.contactName}
                  </span>
                  <span className="text-gray-500">Step {enrollment.currentStep}</span>
                </div>
              ))}
              {activeEnrollments.length > 3 && (
                <div className="text-gray-500 text-center">
                  +{activeEnrollments.length - 3} more...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Campaign Steps View Component
  const CampaignStepsView: React.FC<{ campaignId: string }> = ({ campaignId }) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    
    if (!campaign) {
      return <div>Campaign not found</div>;
    }

    const steps = campaign.steps || [];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToList}
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Campaigns
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{campaign.name} - Steps</h2>
              <p className="text-gray-600 mt-1">Manage the sequence of emails and delays for this campaign</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleAddStep}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Step
            </button>
          </div>
        </div>

        {/* Campaign Info and Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                <p className="text-sm text-gray-600">{campaign.description}</p>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(campaign.status)}`}>
                  {getStatusIcon(campaign.status)}
                  {campaign.status.toUpperCase()}
                </span>
                <span className="text-gray-500">{steps.length} steps</span>
                <span className="text-gray-500">{campaign.totalRecipients} recipients</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-4">
              {[
                { key: 'steps', label: 'Steps', count: steps.length },
                { key: 'contacts', label: 'Contacts', count: campaignEnrollments.filter(e => e.campaignId === campaignId).length },
                { key: 'responses', label: 'Responses', count: campaignResponses.filter(r => r.campaignId === campaignId).length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveStepsTab(tab.key as any)}
                  className={`${
                    activeStepsTab === tab.key
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  {tab.label}
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activeStepsTab === tab.key ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Steps Tab */}
          {activeStepsTab === 'steps' && (
            <div className="space-y-4">
              {steps.length > 0 ? (
                steps.map((step, index) => (
                  <div key={step.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {step.stepOrder}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="text-purple-600">
                              {step.type === 'email' ? <Mail className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{step.name}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              step.type === 'email' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {step.type.toUpperCase()}
                            </span>
                          </div>
                          
                          {step.type === 'email' && step.subject && (
                            <div className="mb-2">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Subject:</span> {step.subject}
                              </p>
                            </div>
                          )}
                          
                          {step.type === 'delay' && (
                            <div className="mb-2">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Delay:</span> {step.delayDays} days {step.delayHours ? `${step.delayHours} hours` : ''}
                              </p>
                            </div>
                          )}
                          
                          {step.content && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-600 line-clamp-3">
                                {step.content.substring(0, 200)}...
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditStep(step)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg" 
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Preview">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4">
                        <span>Created {step.createdAt.toLocaleDateString()}</span>
                        <span className={`flex items-center gap-1 ${step.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                          {step.isActive ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          {step.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <span>Updated {step.updatedAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Settings className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No steps configured</h3>
                  <p className="text-gray-600 mb-4">Add email templates and delays to create your campaign sequence.</p>
                  <button 
                    onClick={handleAddStep}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Step
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Contacts Tab */}
          {activeStepsTab === 'contacts' && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Campaign Contacts</h3>
                  <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contacts
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Step</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {campaignEnrollments.filter(e => e.campaignId === campaignId).map((enrollment) => (
                      <tr key={enrollment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-purple-600">
                                  {enrollment.contactName.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{enrollment.contactName}</div>
                              <div className="text-sm text-gray-500">{enrollment.contactEmail}</div>
                              {enrollment.contactCompany && (
                                <div className="text-xs text-gray-400">{enrollment.contactTitle} at {enrollment.contactCompany}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(enrollment.status)}`}>
                            {enrollment.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Step {enrollment.currentStep} of {steps.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{enrollment.totalEmailsSent} sent</span>
                            <span>•</span>
                            <span>{enrollment.totalEmailsOpened} opened</span>
                            <span>•</span>
                            <span>{enrollment.totalEmailsClicked} clicked</span>
                            {enrollment.hasReplied && (
                              <>
                                <span>•</span>
                                <span className="text-green-600 font-medium">Replied</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {enrollment.nextEmailDue ? (
                            <div>
                              <div>{enrollment.nextEmailDue.toLocaleDateString()}</div>
                              <div className="text-xs">{enrollment.nextEmailDue.toLocaleTimeString()}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Completed</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-purple-600 hover:text-purple-900" title="View Details">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-yellow-600 hover:text-yellow-900" title="Pause">
                              <Pause className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900" title="Remove">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {campaignEnrollments.filter(e => e.campaignId === campaignId).length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts enrolled</h3>
                    <p className="text-gray-600 mb-4">Add contacts to start your email campaign</p>
                    <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Contacts
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Responses Tab */}
          {activeStepsTab === 'responses' && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Campaign Responses</h3>
                <p className="text-sm text-gray-600 mt-1">Track opens, clicks, replies, and other engagement</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {campaignResponses.filter(r => r.campaignId === campaignId).map((response) => (
                    <div key={response.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                <span className="text-xs font-medium text-purple-600">
                                  {response.contactName.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{response.contactName}</h4>
                              <p className="text-xs text-gray-500">{response.contactEmail}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              response.responseType === 'reply' ? 'bg-green-100 text-green-700' :
                              response.responseType === 'click' ? 'bg-blue-100 text-blue-700' :
                              response.responseType === 'open' ? 'bg-yellow-100 text-yellow-700' :
                              response.responseType === 'bounce' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {response.responseType.toUpperCase()}
                            </span>
                            {response.sentiment && (
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                response.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                                response.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {response.sentiment}
                              </span>
                            )}
                          </div>
                          
                          <div className="mb-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Step:</span> {response.stepName}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Subject:</span> {response.emailSubject}
                            </p>
                          </div>
                          
                          {response.responseContent && (
                            <div className="bg-gray-50 rounded-lg p-3 mt-3">
                              <p className="text-sm text-gray-700">{response.responseContent}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end text-xs text-gray-500">
                          <span>{response.responseDate.toLocaleDateString()}</span>
                          <span>{response.responseDate.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {campaignResponses.filter(r => r.campaignId === campaignId).length === 0 && (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h3>
                      <p className="text-gray-600">Responses will appear here as contacts engage with your emails</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'paused': return 'bg-yellow-100 text-yellow-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'initial_outreach': return 'bg-blue-100 text-blue-700';
      case 'follow_up': return 'bg-yellow-100 text-yellow-700';
      case 'nurture': return 'bg-purple-100 text-purple-700';
      case 'promotional': return 'bg-green-100 text-green-700';
      case 'client_communication': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'completed': return <BarChart3 className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const CampaignCard: React.FC<{ campaign: Campaign }> = ({ campaign }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className="text-purple-600">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(campaign.status)}`}>
              {getStatusIcon(campaign.status)}
              {campaign.status.toUpperCase()}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(campaign.category)}`}>
              {campaign.category.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {campaign.description}
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setSelectedCampaign(campaign)}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleManageSteps(campaign.id)}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
            title="Manage Steps"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Clone">
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditCampaign(campaign)}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
            <Mail className="w-4 h-4" />
            <span className="text-xs">Emails</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">{campaign.emails}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs">Recipients</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">{campaign.totalRecipients}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Open Rate</span>
          </div>
          <p className="text-lg font-semibold text-green-600">{campaign.openRate}%</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs">Reply Rate</span>
          </div>
          <p className="text-lg font-semibold text-blue-600">{campaign.replyRate}%</p>
        </div>
      </div>

      {/* Campaign Timeline */}
      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <span>Created {campaign.createdAt.toLocaleDateString()}</span>
          {campaign.lastSent && (
            <span>Last sent {campaign.lastSent.toLocaleDateString()}</span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4" />
          <span>Updated {campaign.updatedAt.toLocaleDateString()}</span>
        </div>
      </div>

      {/* Target Criteria */}
      {campaign.targetCriteria?.stages && campaign.targetCriteria.stages.length > 0 && (
        <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center text-sm font-medium text-blue-900">
              <Tag className="w-4 h-4 mr-1" />
              Target Stages ({campaign.targetCriteria.stages.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {campaign.targetCriteria.stages.map((stage: any, index: number) => {
              // Handle both old format (string IDs) and new format (stage objects)
              const stageId = typeof stage === 'object' ? stage.id : stage;
              const stageName = typeof stage === 'object' ? stage.name : getStageNameById(stage);
              const stageColor = typeof stage === 'object' ? stage.color : '#3B82F6';
              const stageOrder = typeof stage === 'object' ? stage.order : index + 1;
              
              return (
                <div key={stageId} className="inline-flex items-center px-3 py-1 bg-white rounded-full border border-blue-200 shadow-sm">
                  <div 
                    className="w-5 h-5 text-white rounded-full flex items-center justify-center text-xs font-medium mr-2"
                    style={{ backgroundColor: stageColor }}
                  >
                    {stageOrder}
                  </div>
                  <span className="text-sm font-medium text-blue-900">
                    {stageName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Target Prospect Steps */}
      <div className="mt-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-3">
        <div className="flex items-center justify-between mb-3">
          <span className="flex items-center text-sm font-medium text-purple-900">
            <Settings className="w-4 h-4 mr-1" />
            Target Prospect Journey ({campaign.steps?.length || 0} steps)
          </span>
          <button
            onClick={() => handleManageSteps(campaign.id)}
            className="text-purple-600 hover:text-purple-800 font-medium text-xs bg-white rounded px-2 py-1 border border-purple-200 hover:border-purple-300"
          >
            Manage Steps →
          </button>
        </div>
        
        {campaign.steps && campaign.steps.length > 0 ? (
          <div className="space-y-2">
            {campaign.steps.slice(0, 4).map((step, index) => (
              <div key={step.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-purple-100 shadow-sm">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                    {step.stepOrder}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{step.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        step.type === 'email' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {step.type === 'email' ? 'Email' : 'Delay'}
                      </span>
                    </div>
                    {step.type === 'email' && step.subject && (
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        Subject: {step.subject}
                      </p>
                    )}
                    {step.type === 'delay' && (
                      <p className="text-xs text-gray-600 mt-1">
                        Wait: {step.delayDays} days {step.delayHours ? `${step.delayHours}h` : ''}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {step.isActive ? (
                    <div title="Active">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  ) : (
                    <div title="Inactive">
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {campaign.steps.length > 4 && (
              <div className="text-center">
                <button
                  onClick={() => handleManageSteps(campaign.id)}
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium bg-white rounded px-3 py-1 border border-purple-200"
                >
                  View all {campaign.steps.length} steps →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="bg-white rounded-lg border-2 border-dashed border-purple-200 p-4">
              <Settings className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-purple-600 font-medium mb-1">No prospect journey configured</p>
              <p className="text-xs text-gray-600 mb-3">Set up email steps and delays to guide prospects through your outreach sequence</p>
              <button
                onClick={() => handleManageSteps(campaign.id)}
                className="inline-flex items-center px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add First Step
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enrollment Information */}
      <CampaignEnrollments campaignId={campaign.id} />
    </div>
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading email campaigns...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show steps view if selected
  if (viewMode === 'steps' && selectedCampaignId) {
    return (
      <>
        <CampaignStepsView campaignId={selectedCampaignId} />
        
        {/* Create/Edit Step Modal */}
        {showCreateStepModal && (
          <CreateClientSequenceStepModal
            isOpen={showCreateStepModal}
            onClose={handleStepModalClose}
            onSave={handleStepSave}
            editingStep={editingStep}
            sequenceId={selectedCampaignId || ''}
            nextStepOrder={(campaigns.find(c => c.id === selectedCampaignId)?.steps?.length || 0) + 1}
          />
        )}
      </>
    );
  }

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
          <p className="text-gray-600 mt-1">Create and manage automated email campaigns for client outreach</p>
        </div>
        <button
          onClick={handleCreateCampaign}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search campaigns..."
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
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {statuses.map(status => (
              <option key={status.key} value={status.key}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Campaigns Grid - Full Width */}
      <div className="space-y-6">
        {filteredCampaigns.map(campaign => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>

      {/* Empty State */}
      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory || selectedStatus
              ? 'Try adjusting your filters to see more campaigns'
              : 'Create your first email campaign to get started'
            }
          </p>
          <button
            onClick={handleCreateCampaign}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </button>
        </div>
      )}

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedCampaign.name}</h2>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(selectedCampaign.status)}`}>
                      {getStatusIcon(selectedCampaign.status)}
                      {selectedCampaign.status.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(selectedCampaign.category)}`}>
                      {selectedCampaign.category.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Description</label>
                <p className="text-gray-900">{selectedCampaign.description}</p>
              </div>
              
              {/* Performance Metrics */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">Performance Metrics</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 text-sm font-medium">Total Recipients</p>
                        <p className="text-2xl font-bold text-purple-900">{selectedCampaign.totalRecipients}</p>
                      </div>
                      <Users className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-sm font-medium">Open Rate</p>
                        <p className="text-2xl font-bold text-green-900">{selectedCampaign.openRate}%</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 text-sm font-medium">Reply Rate</p>
                        <p className="text-2xl font-bold text-purple-900">{selectedCampaign.replyRate}%</p>
                      </div>
                      <MessageSquare className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-600 text-sm font-medium">Click Rate</p>
                        <p className="text-2xl font-bold text-orange-900">{selectedCampaign.clickRate}%</p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Information</label>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Number of emails:</span>
                      <span className="font-medium">{selectedCampaign.emails}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Emails sent:</span>
                      <span className="font-medium">{selectedCampaign.sentEmails}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created:</span>
                      <span className="font-medium">{selectedCampaign.createdAt.toLocaleDateString()}</span>
                    </div>
                    {selectedCampaign.lastSent && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last sent:</span>
                        <span className="font-medium">{selectedCampaign.lastSent.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quick Actions</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleEditCampaign(selectedCampaign)}
                      className="block w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-center"
                    >
                      Edit Campaign
                    </button>
                    <button className="block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      Clone Campaign
                    </button>
                    <button className="block w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                      View Analytics
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedCampaign(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Campaign Modal */}
      {showCreateCampaignModal && (
        <CreateCampaignModal
          projectId={projectId}
          sequence={editingSequence}
          onClose={handleCloseModal}
          onSuccess={handleCampaignSuccess}
        />
      )}
    </div>
  );
};

export default ClientEmailCampaignsSequences;

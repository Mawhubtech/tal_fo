import React, { useState, useEffect } from 'react';
import { Plus, X, Users, FileText, Settings, MapPin, Building, DollarSign, Clock, Calendar, Save, AlertCircle, ChevronDown, ChevronRight, Sparkles, Globe, Lock, ExternalLink, Edit, Edit2, UserPlus, Check, CheckCircle, RefreshCw } from 'lucide-react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useCreateJob, useUpdateJob, useJob } from '../../../hooks/useJobs';
import { useOrganization, useOrganizationDepartments, useOrganizations } from '../../../hooks/useOrganizations';
import { useActivePipelines } from '../../../hooks/useActivePipelines';
import { useHiringTeams } from '../../../hooks/useHiringTeam';
import { usePipelines } from '../../../hooks/usePipelines';
import { usePipelineModal } from '../../../hooks/usePipelineModal';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../contexts/ToastContext';
import { pipelineService } from '../../../services/pipelineService';
import { jobApiService } from '../../../services/jobApiService';
import { createJobUrl } from '../../../lib/urlUtils';
import type { CreateJobData, JobPublishingOptions } from '../../../services/jobApiService';
import type { Department } from '../../organizations/services/organizationApiService';
import type { Pipeline, CreatePipelineDto } from '../../../services/pipelineService';
import AIJobGeneratorDialog from '../components/AIJobGeneratorDialog';
import JobPublishingModal from '../components/JobPublishingModal';
import PublishingSettingsCard from '../components/PublishingSettingsCard';
import PipelineModal from '../../../components/PipelineModal';
import PipelineUsageWarningModal from '../../../components/PipelineUsageWarningModal';
import JobCollaboratorInviteForm, { JobCollaboratorInvite } from '../components/JobCollaboratorInviteForm';
import AIJobPromptInput from '../components/AIJobPromptInput';
import AIPromptDisplay from '../components/AIPromptDisplay';
import { useAIStructuredQuery } from '../../../hooks/useAIStructuredQuery';

// Helper function to get currency symbol
const getCurrencySymbol = (currencyCode: string): string => {
  const currencySymbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'CAD': 'C$',
    'AUD': 'A$',
    'AED': 'د.إ',
    'SAR': '﷼',
    'QAR': 'ر.ق',
    'KWD': 'د.ك',
    'BHD': 'د.ب',
    'OMR': 'ر.ع.',
    'JOD': 'د.ا',
    'EGP': '£',
    'LBP': 'ل.ل',
    'ILS': '₪',
    'TRY': '₺',
    'IRR': '﷼',
    'IQD': 'ع.د',
  };
  return currencySymbols[currencyCode] || currencyCode;
};

const CreateJobPage: React.FC = () => {
  const { organizationId, departmentId } = useParams<{ 
    organizationId: string; 
    departmentId: string; 
  }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Check if we're in edit mode
  const editJobId = searchParams.get('edit');
  const isEditMode = !!editJobId;
  
  // Use hooks for data fetching
  const { user } = useAuth();
  
  // Form state - declare first for use in hooks
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>(''); // For standalone mode
  
  // For standalone mode (no organizationId in URL), fetch all organizations
  const {
    data: allOrganizations = [],
    isLoading: allOrganizationsLoading
  } = useOrganizations();

  const {
    data: organization,
    isLoading: organizationLoading,
    error: organizationError
  } = useOrganization(organizationId || '');

  // In standalone mode, fetch departments for the selected organization
  const effectiveOrgId = organizationId || selectedOrganizationId;
  
  const {
    data: departments = [],
    isLoading: departmentsLoading,
    error: departmentsError
  } = useOrganizationDepartments(effectiveOrgId || '');

  const {
    data: activePipelines = [],
    isLoading: pipelinesLoading,
    error: pipelinesError,
    refetch: refetchActivePipelines
  } = useActivePipelines('recruitment');

  const {
    data: hiringTeams = [],
    isLoading: hiringTeamsLoading,
    error: hiringTeamsError
  } = useHiringTeams(effectiveOrgId ? [effectiveOrgId] : undefined);

  const {
    data: editingJob,
    isLoading: jobLoading,
    error: jobError
  } = useJob(editJobId || '');

  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();
  const { addToast } = useToast();
  
  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [showPromptInput, setShowPromptInput] = useState<boolean>(!isEditMode); // Show prompt input initially unless editing
  const [isGeneratingFromPrompt, setIsGeneratingFromPrompt] = useState(false);
  const { data: aiData, loading: aiLoading, error: aiError, structuredQuery, reset: resetAI } = useAIStructuredQuery();
  
  // Rest of form state
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [departmentIdForm, setDepartmentIdForm] = useState('');
  const [location, setLocation] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [salaryPeriod, setSalaryPeriod] = useState<'monthly' | 'annual'>('annual');
  const [remote, setRemote] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState('');
  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [selectedHiringTeamId, setSelectedHiringTeamId] = useState<string>('');
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState('');
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [newResponsibility, setNewResponsibility] = useState('');
  const [customQuestions, setCustomQuestions] = useState<{question: string, type: 'text' | 'multiple-choice', required: boolean}[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [showPublishingModal, setShowPublishingModal] = useState(false);
  const [publishingOptions, setPublishingOptions] = useState<JobPublishingOptions>({
    visibility: 'private',
  });
  const [availableJobBoards, setAvailableJobBoards] = useState<Array<{
    id: string;
    name: string;
    description: string;
    isEnabled: boolean;
    requiresCredentials: boolean;
    popular: boolean;
    icon?: string;
  }>>([]);
  const [invitedCollaborators, setInvitedCollaborators] = useState<string[]>([]);
  const [pendingCollaborators, setPendingCollaborators] = useState<JobCollaboratorInvite[]>([]);
  const [showCollaboratorForm, setShowCollaboratorForm] = useState(false);

  // Collapsible sections state
  const [isTeamMembersExpanded, setIsTeamMembersExpanded] = useState(true);
  const [isAIPromptExpanded, setIsAIPromptExpanded] = useState(true);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState('');

  // Pipeline usage warning state
  const [showUsageWarning, setShowUsageWarning] = useState(false);
  const [pendingEditPipeline, setPendingEditPipeline] = useState<Pipeline | null>(null);
  const [pipelineUsage, setPipelineUsage] = useState<any>(null);

  // Pipeline error state
  const [pipelineError, setPipelineError] = useState<string | null>(null);

  // Pipeline creation functionality
  const { createPipeline, updatePipeline } = usePipelines();
  const {
    showCreateModal: showPipelineModal,
    openCreateModal: openPipelineModal,
    openEditModal: openPipelineEditModal,
    closeModal: closePipelineModal,
    modalLoading: pipelineModalLoading,
    setModalLoading,
    selectedPipeline: editingPipeline,
  } = usePipelineModal();

  // Helper function to determine if a pipeline can be edited
  const canEditPipeline = (pipeline: Pipeline): boolean => {
    if (!user) return false;
    // User can edit pipelines they created (private and organization)
    // Public pipelines created by others (system templates) are not editable
    return pipeline.createdBy.id === user.id;
  };

  // Handle pipeline editing with usage validation
  const handleEditPipeline = async (pipeline: Pipeline) => {
    if (!canEditPipeline(pipeline)) {
      return;
    }

    try {
      // Check if pipeline is being used
      const usage = await pipelineService.getPipelineUsage(pipeline.id);
      
      if (usage.activeJobs > 0 || usage.activeApplications > 0) {
        // Show warning modal
        setPendingEditPipeline(pipeline);
        setPipelineUsage(usage);
        setShowUsageWarning(true);
      } else {
        // Safe to edit directly
        openPipelineEditModal(pipeline);
      }
    } catch (error: any) {
      console.error('Error checking pipeline usage:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to check pipeline usage';
      addToast({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
      // If check fails, allow editing but user should be aware
      openPipelineEditModal(pipeline);
    }
  };

  // Handle creating a copy of the pipeline
  const handleCreatePipelineCopy = async () => {
    if (!pendingEditPipeline) return;

    try {
      const copyName = `${pendingEditPipeline.name} (Copy)`;
      const copiedPipeline = await pipelineService.createPipelineCopy(pendingEditPipeline.id, copyName);
      
      // Refresh pipelines list
      await refetchActivePipelines();
      
      // Close warning modal and open edit modal for the copy
      setShowUsageWarning(false);
      setPendingEditPipeline(null);
      setPipelineUsage(null);
      
      // Select and edit the new copy
      setSelectedPipelineId(copiedPipeline.id);
      openPipelineEditModal(copiedPipeline);
    } catch (error: any) {
      console.error('Error creating pipeline copy:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to create pipeline copy';
      addToast({
        type: 'error',
        title: 'Copy Failed',
        message: errorMessage
      });
    }
  };

  // Handle proceeding with editing the original pipeline
  const handleProceedWithOriginalEdit = () => {
    if (!pendingEditPipeline) return;

    setShowUsageWarning(false);
    openPipelineEditModal(pendingEditPipeline);
    setPendingEditPipeline(null);
    setPipelineUsage(null);
  };

  // Handle closing usage warning modal
  const handleCloseUsageWarning = () => {
    setShowUsageWarning(false);
    setPendingEditPipeline(null);
    setPipelineUsage(null);
  };

  // Handle clearing pipeline error
  const handleClearPipelineError = () => {
    setPipelineError(null);
  };

  // Handle closing pipeline modal with error cleanup
  const handleClosePipelineModal = () => {
    setPipelineError(null); // Clear error when modal closes
    closePipelineModal();
  };

  // Calculate loading states
  const loading = organizationLoading || departmentsLoading || pipelinesLoading || hiringTeamsLoading || (isEditMode && jobLoading);
  const submitLoading = createJobMutation.isPending || updateJobMutation.isPending;

  // Set selected department when departmentId is available or when departments change
  useEffect(() => {
    if (departmentId && departments.length > 0) {
      const selectedDept = departments.find(dept => dept.id === departmentId);
      if (selectedDept) {
        setSelectedDepartment(selectedDept);
        setDepartmentIdForm(selectedDept.id);
      }
    }
  }, [departmentId, departments]);

  // Preselect default pipeline when pipelines are loaded
  useEffect(() => {
    if (activePipelines.length > 0 && !selectedPipelineId && !isEditMode) {
      const defaultPipeline = activePipelines.find(pipeline => pipeline.isDefault);
      if (defaultPipeline) {
        setSelectedPipelineId(defaultPipeline.id);
      } else if (activePipelines.length > 0) {
        // If no default pipeline is marked, select the first one
        setSelectedPipelineId(activePipelines[0].id);
      }
    }
  }, [activePipelines, selectedPipelineId, isEditMode]);

  // Preselect default hiring team when teams are loaded
  useEffect(() => {
    if (hiringTeams.length > 0 && !selectedHiringTeamId && !isEditMode) {
      const defaultTeam = hiringTeams.find(team => team.isDefault);
      if (defaultTeam) {
        setSelectedHiringTeamId(defaultTeam.id);
      } else if (hiringTeams.length > 0) {
        // If no default team is marked, select the first one
        setSelectedHiringTeamId(hiringTeams[0].id);
      }
    }
  }, [hiringTeams, selectedHiringTeamId, isEditMode]);

  // Populate form fields when editing job data is loaded
  useEffect(() => {
    if (editingJob && isEditMode) {
      setJobTitle(editingJob.title || '');
      setLocation(editingJob.location || '');
      setJobDescription(editingJob.description || '');
      setEmploymentType(editingJob.type || 'Full-time');
      setExperienceLevel(editingJob.experienceLevel || '');
      setSalaryMin(editingJob.salaryMin ? editingJob.salaryMin.toString() : '');
      setSalaryMax(editingJob.salaryMax ? editingJob.salaryMax.toString() : '');
      setCurrency(editingJob.currency || 'USD');
      setSalaryPeriod((editingJob as any).salaryPeriod || 'annual');
      setRemote(editingJob.remote || false);
      setSkills(Array.isArray(editingJob.skills) ? editingJob.skills : editingJob.skills ? [editingJob.skills] : []);
      setBenefits(Array.isArray(editingJob.benefits) ? editingJob.benefits : editingJob.benefits ? [editingJob.benefits] : []);
      setApplicationDeadline(editingJob.applicationDeadline ? 
        (typeof editingJob.applicationDeadline === 'string' ? editingJob.applicationDeadline : editingJob.applicationDeadline.toISOString().split('T')[0]) 
        : '');
      setRequirements(Array.isArray(editingJob.requirements) ? editingJob.requirements : editingJob.requirements ? [editingJob.requirements] : ['']);
      setResponsibilities(Array.isArray(editingJob.responsibilities) ? editingJob.responsibilities : editingJob.responsibilities ? [editingJob.responsibilities] : ['']);
      setDepartmentIdForm(editingJob.departmentId || departmentId || '');
      setSelectedPipelineId(editingJob.pipelineId || '');
      setSelectedHiringTeamId(editingJob.hiringTeamId || '');
      
      // Set publishing options if they exist
      if (editingJob.publishingOptions) {
        setPublishingOptions(editingJob.publishingOptions);
      }

      // Load existing collaborators
      if (editingJob.collaborators && editingJob.collaborators.length > 0) {
        const collaboratorEmails = editingJob.collaborators.map((collab: any) => collab.email);
        setInvitedCollaborators(collaboratorEmails);
      }
    }
  }, [editingJob, isEditMode, departmentId]);
  
  // Fetch available job boards on component mount
  useEffect(() => {
    const fetchJobBoards = async () => {
      try {
        const boards = await jobApiService.getAvailableJobBoards();
        setAvailableJobBoards(boards);
      } catch (error: any) {
        console.warn('Failed to fetch available job boards:', error);
        // Continue without external job boards - user will see only TAL board and private options
        addToast({
          type: 'error',
          title: 'Warning',
          message: 'Failed to load external job boards. You can still publish to TAL board.',
          duration: 5000
        });
      }
    };

    fetchJobBoards();
  }, []);
  
  // Load context data when organizationId is present
  useEffect(() => {
    if (organizationError) {
      setError('Failed to load organization data. Please try again.');
    } else if (departmentsError) {
      setError('Failed to load departments. Please try again.');
    } else if (pipelinesError) {
      setError('Failed to load recruitment pipelines. Please check your pipelines configuration.');
    } else if (hiringTeamsError && !hiringTeamsError.message?.includes('404') && !hiringTeamsError.message?.includes('Not Found')) {
      setError('Failed to load hiring teams. Please check your teams configuration.');
    } else if (jobError && isEditMode) {
      setError('Failed to load job data. Please try again.');
    } else {
      setError(null);
    }
  }, [organizationError, departmentsError, pipelinesError, hiringTeamsError, jobError, isEditMode]);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !benefits.includes(newBenefit.trim())) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  const removeBenefit = (benefitToRemove: string) => {
    setBenefits(benefits.filter(benefit => benefit !== benefitToRemove));
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !requirements.includes(newRequirement.trim())) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const removeRequirement = (requirementToRemove: string) => {
    setRequirements(requirements.filter(requirement => requirement !== requirementToRemove));
  };

  const addResponsibility = () => {
    if (newResponsibility.trim() && !responsibilities.includes(newResponsibility.trim())) {
      setResponsibilities([...responsibilities, newResponsibility.trim()]);
      setNewResponsibility('');
    }
  };

  const removeResponsibility = (responsibilityToRemove: string) => {
    setResponsibilities(responsibilities.filter(responsibility => responsibility !== responsibilityToRemove));
  };

  // Handle AI Prompt Generation
  const handleGenerateFromPrompt = async (prompt: string) => {
    setAiPrompt(prompt);
    setIsGeneratingFromPrompt(true);

    const schema = {
      type: 'object',
      properties: {
        jobTitle: {
          type: 'string',
          description: 'A clear, professional job title that accurately reflects the role and seniority level. Should be concise and industry-standard.'
        },
        experienceLevel: {
          type: 'string',
          enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Lead/Principal', 'Executive'],
          description: 'The experience level required for this position based on the responsibilities and requirements.'
        },
        location: {
          type: 'string',
          description: 'The job location. Can be a city and country (e.g., "New York, USA", "London, UK"), "Remote", "Hybrid", or a combination (e.g., "San Francisco, USA (Hybrid)"). Be specific about the location.'
        },
        minSalary: {
          type: 'number',
          description: 'The minimum salary for this position. Provide a realistic number based on the role, experience level, and market standards. For entry-level, typically 30000-50000; mid-level 50000-80000; senior 80000-120000; lead/principal 120000-180000; executive 150000+.'
        },
        maxSalary: {
          type: 'number',
          description: 'The maximum salary for this position. Should be 20-40% higher than minSalary to provide a competitive range. Ensure it reflects market rates for the role and experience level.'
        },
        currency: {
          type: 'string',
          enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'EGP', 'LBP', 'ILS', 'TRY', 'IRR', 'IQD'],
          description: 'The currency code for the salary. Choose based on the job location: USD for USA/international, EUR for Europe, GBP for UK, AED for UAE, SAR for Saudi Arabia, etc.'
        },
        jobDescription: {
          type: 'string',
          description: 'A comprehensive, engaging job description that explains the role, company culture, and what makes this position exciting. Should be 3-5 paragraphs.'
        },
        responsibilities: {
          type: 'array',
          items: { type: 'string' },
          description: 'A list of 5-8 key responsibilities and daily tasks for this role. Each should be specific and actionable.'
        },
        requirements: {
          type: 'array',
          items: { type: 'string' },
          description: 'A list of 5-10 specific requirements, qualifications, and experience needed. Include education, experience, and other must-haves.'
        },
        skills: {
          type: 'array',
          items: { type: 'string' },
          description: 'A list of 10-20 individual skills required for this role. Each skill should be a SINGLE item (e.g., "Python", "JavaScript", "React", "Communication", "Teamwork"). Do NOT group skills into categories like "Technical:" or "Soft:". List each skill separately.'
        },
        benefits: {
          type: 'array',
          items: { type: 'string' },
          description: 'A list of 8-15 individual benefits and perks. Each benefit should be a SINGLE, specific item (e.g., "Competitive salary", "Health insurance", "Remote work options", "Professional development budget"). List each benefit separately, not as paragraphs.'
        }
      },
      required: ['jobTitle', 'experienceLevel', 'location', 'minSalary', 'maxSalary', 'currency', 'jobDescription', 'responsibilities', 'requirements', 'skills', 'benefits']
    };

    const systemPrompt = `You are an expert HR professional and job description writer with extensive experience in recruitment. Your task is to create compelling, detailed job content that attracts top talent while being specific about requirements. Focus on creating content that is:

1. Professional yet engaging
2. Specific and actionable
3. Attractive to qualified candidates
4. Clear about expectations and compensation
5. Industry-appropriate and competitive

Always provide realistic salary ranges based on the role level and market standards. Consider location when determining currency and salary ranges.

Always respond with valid JSON that matches the provided schema exactly.`;

    const fullPrompt = `Generate comprehensive job content based on this description: "${prompt}"

Please create detailed, professional content that includes:
- A clear, compelling job title that accurately reflects the role
- An appropriate experience level (Entry Level, Mid Level, Senior Level, Lead/Principal, Executive)
- A specific job location (city, country, or Remote/Hybrid)
- A realistic salary range (minSalary and maxSalary) appropriate for the role and experience level
- The appropriate currency code based on the location
- A compelling job description that attracts candidates
- Key responsibilities that clearly outline daily tasks
- Specific requirements and qualifications needed
- Technical and soft skills required
- Attractive benefits and perks

Make the content engaging, specific, and tailored to the role. Ensure salary ranges are competitive and realistic for the market.`;

    try {
      await structuredQuery({
        prompt: fullPrompt,
        schema,
        systemPrompt,
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        max_tokens: 3000,
        temperature: 0.7
      });
    } catch (err) {
      console.error('AI generation error:', err);
      setError('Failed to generate job content with AI. Please try again.');
      setIsGeneratingFromPrompt(false);
    }
  };

  // Handle regeneration from existing prompt
  const handleRegenerateFromPrompt = (newPrompt: string) => {
    handleGenerateFromPrompt(newPrompt);
  };

  // Process AI response when it arrives
  useEffect(() => {
    if (aiData && !aiLoading && !aiError && isGeneratingFromPrompt) {
      const generatedData = aiData.data as any;
      
      // Populate form with AI-generated data
      setJobTitle(generatedData.jobTitle || '');
      setExperienceLevel(generatedData.experienceLevel || '');
      setJobDescription(generatedData.jobDescription || '');
      
      // Set location if provided
      if (generatedData.location) {
        setLocation(generatedData.location);
      }
      
      // Set salary range if provided
      if (generatedData.minSalary) {
        setSalaryMin(generatedData.minSalary.toString());
      }
      if (generatedData.maxSalary) {
        setSalaryMax(generatedData.maxSalary.toString());
      }
      
      // Set currency if provided
      if (generatedData.currency) {
        setCurrency(generatedData.currency);
      }
      
      // Parse and update responsibilities
      setResponsibilities(Array.isArray(generatedData.responsibilities) 
        ? generatedData.responsibilities.filter((r: string) => r.trim()) 
        : []);
      
      // Parse and update requirements
      setRequirements(Array.isArray(generatedData.requirements) 
        ? generatedData.requirements.filter((r: string) => r.trim()) 
        : []);
      
      // Parse skills - handle grouped format
      const parsedSkills = parseGroupedItems(Array.isArray(generatedData.skills) ? generatedData.skills : []);
      setSkills(parsedSkills);
      
      // Parse benefits - handle grouped format
      const parsedBenefits = parseGroupedItems(Array.isArray(generatedData.benefits) ? generatedData.benefits : []);
      setBenefits(parsedBenefits);
      
      // Hide prompt input and show form
      setShowPromptInput(false);
      setIsGeneratingFromPrompt(false);
    }
  }, [aiData, aiLoading, aiError, isGeneratingFromPrompt]);

  // Handle AI errors
  useEffect(() => {
    if (aiError && isGeneratingFromPrompt) {
      setError('Failed to generate job content with AI. Please try again.');
      setIsGeneratingFromPrompt(false);
    }
  }, [aiError, isGeneratingFromPrompt]);

  const handleSubmit = async (publish: boolean) => {
    // Commenting out publish modal - directly submit the job
    // if (publish) {
    //   // Show publishing modal for publish action
    //   setShowPublishingModal(true);
    //   return;
    // }

    // Submit directly without modal
    await submitJob(publish, publishingOptions);
  };

  const handlePublishWithOptions = async (options: JobPublishingOptions) => {
    setPublishingOptions(options);
    setShowPublishingModal(false);
    await submitJob(true, options);
  };

  const submitJob = async (publish: boolean, options: JobPublishingOptions) => {
    try {
      setError(null);

      // Validate required fields
      if (!jobTitle.trim()) {
        setError('Job title is required');
        return;
      }

      // Department is optional - no validation needed

      if (!location.trim()) {
        setError('Location is required');
        return;
      }

      // Pipeline is auto-selected (default pipeline), no need to validate

      // Hiring team is optional, no validation required

      // Validate salary range
      const minSalary = salaryMin ? parseFloat(salaryMin) : undefined;
      const maxSalary = salaryMax ? parseFloat(salaryMax) : undefined;
      
      if (minSalary && maxSalary && minSalary > maxSalary) {
        setError('Minimum salary cannot be greater than maximum salary');
        return;
      }

      // Department is optional - find it if selected
      const selectedDept = departmentIdForm 
        ? departments.find(dept => dept.id === departmentIdForm) 
        : null;

      const jobData: CreateJobData = {
        title: jobTitle.trim(),
        description: jobDescription.trim() || undefined,
        department: selectedDept?.name || undefined,
        location: location.trim(),
        type: employmentType as any,
        status: publish ? 'Published' : 'Draft',
        experienceLevel: experienceLevel.trim() || undefined,
        salaryMin: minSalary,
        salaryMax: maxSalary,
        currency: currency,
        salaryPeriod: salaryPeriod,
        remote: remote,
        skills: skills.length > 0 ? skills : undefined,
        benefits: benefits.length > 0 ? benefits : undefined,
        requirements: requirements.filter(req => req.trim()).length > 0 
          ? requirements.filter(req => req.trim()) 
          : undefined,
        responsibilities: responsibilities.filter(resp => resp.trim()).length > 0 
          ? responsibilities.filter(resp => resp.trim()) 
          : undefined,
        applicationDeadline: applicationDeadline || undefined,
        organizationId: effectiveOrgId || undefined,
        customQuestions: customQuestions.length > 0 ? customQuestions : undefined,
        pipelineId: selectedPipelineId,
        publishingOptions: publish ? options : undefined,
      };

      // Add fields that are only needed for job creation (not updates)
      if (!isEditMode) {
        jobData.departmentId = departmentIdForm || undefined;
        jobData.hiringTeamId = selectedHiringTeamId || undefined;
        jobData.collaborators = pendingCollaborators.length > 0 ? pendingCollaborators : undefined;
      }

      // Debug logging to ensure hiring team and pipeline are being saved
      console.log(`${isEditMode ? 'Updating' : 'Creating'} job with:`, {
        hiringTeamId: jobData.hiringTeamId,
        pipelineId: jobData.pipelineId,
        publishingOptions: jobData.publishingOptions,
        collaborators: jobData.collaborators,
        selectedHiringTeam: hiringTeams.find(t => t.id === selectedHiringTeamId),
        selectedPipeline: activePipelines.find(p => p.id === selectedPipelineId)
      });

      let resultJob;
      if (isEditMode && editJobId) {
        // Update existing job
        resultJob = await updateJobMutation.mutateAsync({ id: editJobId, data: jobData });
        
        // Handle collaborators separately for edit mode
        if (resultJob.id && pendingCollaborators.length > 0) {
          try {
            console.log('Inviting collaborators to updated job:', resultJob.id);
            const { jobCollaboratorApiService } = await import('../../../services/jobCollaboratorApiService');
            await jobCollaboratorApiService.inviteBulk(resultJob.id, pendingCollaborators);
            console.log('Successfully invited', pendingCollaborators.length, 'collaborators');
            // Clear pending collaborators after successful invitation
            setPendingCollaborators([]);
          } catch (inviteError: any) {
            console.error('Error inviting collaborators:', inviteError);
            const errorMessage = inviteError?.response?.data?.message || 'Failed to send some invitations';
            // Show warning but don't fail the job update
            addToast({
              type: 'error',
              title: 'Partial Success',
              message: `Job updated successfully, but ${errorMessage}`
            });
            setError(`Job updated successfully, but failed to send some invitations: ${inviteError.message}`);
          }
        }
      } else {
        // Create new job (collaborators will be invited automatically by the backend)
        resultJob = await createJobMutation.mutateAsync(jobData);
        
        // Clear pending collaborators after successful job creation
        if (resultJob.id && pendingCollaborators.length > 0) {
          setPendingCollaborators([]);
        }
      }
      
      // Navigate to the job ATS page with slugified title
      if (resultJob.slug) {
        navigate(createJobUrl(resultJob.slug, resultJob.title));
        addToast({
          type: 'success',
          title: 'Success',
          message: `Job ${isEditMode ? 'updated' : 'created'} successfully`
        });
      } else {
        navigate('/organizations');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} job. Please try again.`;
      setError(errorMessage);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} job:`, err);
      addToast({
        type: 'error',
        title: `${isEditMode ? 'Update' : 'Creation'} Failed`,
        message: errorMessage
      });
    }
  };

  // Utility function to parse and split grouped items (e.g., "Technical: Python, JavaScript, React" -> ["Python", "JavaScript", "React"])
  const parseGroupedItems = (items: string[]): string[] => {
    const parsed: string[] = [];
    
    items.forEach(item => {
      const trimmedItem = item.trim();
      
      // Check if item contains a category prefix like "Technical:" or "Soft:"
      const colonIndex = trimmedItem.indexOf(':');
      if (colonIndex > 0 && colonIndex < 20) { // Category label should be short
        // Extract the part after the colon
        const content = trimmedItem.substring(colonIndex + 1).trim();
        
        // Split by commas and add each as separate item
        const splitItems = content.split(',').map(s => s.trim()).filter(s => s.length > 0);
        parsed.push(...splitItems);
      } else {
        // Check if it's a comma-separated list without category
        if (trimmedItem.includes(',')) {
          const splitItems = trimmedItem.split(',').map(s => s.trim()).filter(s => s.length > 0);
          parsed.push(...splitItems);
        } else {
          // Single item, add as is
          parsed.push(trimmedItem);
        }
      }
    });
    
    // Remove duplicates and empty strings
    return [...new Set(parsed)].filter(item => item.length > 0);
  };

  // AI generation handler
  const handleAIGeneration = (aiData: {
    jobTitle: string;
    jobDescription: string;
    experienceLevel: string;
    responsibilities: string[];
    requirements: string[];
    skills: string[];
    benefits: string[];
  }) => {
    // Update job title
    setJobTitle(aiData.jobTitle);
    
    // Update experience level
    setExperienceLevel(aiData.experienceLevel);
    
    // Clear and update job description
    setJobDescription(aiData.jobDescription);
    
    // Clear and update responsibilities (filter out empty ones)
    setResponsibilities(aiData.responsibilities.filter(resp => resp.trim()));
    
    // Clear and update requirements (filter out empty ones)
    setRequirements(aiData.requirements.filter(req => req.trim()));
    
    // Parse and update skills (handle grouped format like "Technical: Python, JavaScript")
    const parsedSkills = parseGroupedItems(aiData.skills);
    setSkills(parsedSkills);
    
    // Parse and update benefits (handle grouped format)
    const parsedBenefits = parseGroupedItems(aiData.benefits);
    setBenefits(parsedBenefits);
  };

  // Pipeline creation handler
  const handlePipelineSubmit = async (data: CreatePipelineDto) => {
    try {
      setModalLoading(true);
      setPipelineError(null); // Clear any previous errors
      
      // Ensure we're working with a recruitment pipeline
      const recruitmentPipelineData = {
        ...data,
        type: 'recruitment' as const
      };
      
      if (editingPipeline) {
        // Update existing pipeline - call service directly to get better error info
        await pipelineService.updatePipeline(editingPipeline.id, recruitmentPipelineData);
        // If we're editing the currently selected pipeline, keep it selected
        if (selectedPipelineId === editingPipeline.id) {
          // Pipeline will be updated in the list automatically after refetch
        }
      } else {
        // Create new pipeline - call service directly to get better error info
        await pipelineService.createPipeline(recruitmentPipelineData);
      }
      
      // Refetch active pipelines to include the changes
      await refetchActivePipelines();
      
      // Only close modal on success
      handleClosePipelineModal();
      
      addToast({
        type: 'success',
        title: 'Success',
        message: `Pipeline ${editingPipeline ? 'updated' : 'created'} successfully`
      });
      
      if (!editingPipeline) {
        // For new pipelines, find and select the newly created one
        const updatedPipelines = await refetchActivePipelines();
        const newPipeline = updatedPipelines.data?.find(p => p.name === data.name && p.type === 'recruitment');
        if (newPipeline) {
          setSelectedPipelineId(newPipeline.id);
        }
      }
    } catch (err: any) {
      console.error('Error with pipeline operation:', err);
      
      // Extract meaningful error message
      let errorMessage = 'An unexpected error occurred while updating the pipeline.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        
        // If it's a stage validation error, add the suggestion
        if (err.response.data.code === 'STAGE_HAS_APPLICATIONS' && err.response.data.suggestion) {
          errorMessage += ' ' + err.response.data.suggestion;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setPipelineError(errorMessage);
      addToast({
        type: 'error',
        title: `Pipeline ${editingPipeline ? 'Update' : 'Creation'} Failed`,
        message: errorMessage
      });
      // Don't close the modal on error - let user see the error and try again
    } finally {
      setModalLoading(false);
    }
  };

  // Handle inviting collaborators - Store them temporarily until job is created
  const handleInviteCollaborators = async (collaborators: JobCollaboratorInvite[]) => {
    // Validate that all collaborators have emails
    const invalidCollaborators = collaborators.filter(c => !c.email || !c.email.trim());
    if (invalidCollaborators.length > 0) {
      throw new Error('All collaborators must have a valid email address');
    }
    
    // Store collaborators to be invited after job creation
    setPendingCollaborators([...pendingCollaborators, ...collaborators]);
    
    // Add emails to the invited list for UI display
    const emails = collaborators.map(c => c.email.toLowerCase());
    setInvitedCollaborators([...invitedCollaborators, ...emails]);
    
    console.log('Stored collaborators for invitation after job creation:', collaborators);
    
    return Promise.resolve();
  };

  // Handle removing collaborators
  const handleRemoveCollaborator = (emailToRemove: string) => {
    // Remove from invited collaborators list
    setInvitedCollaborators(invitedCollaborators.filter(email => email !== emailToRemove));
    
    // Remove from pending collaborators list
    setPendingCollaborators(pendingCollaborators.filter(collab => collab.email.toLowerCase() !== emailToRemove.toLowerCase()));
    
    console.log('Removed collaborator:', emailToRemove);
  };

  // Early return if no organizationId - allow standalone job creation
  // In this case, user will need to manually select organization and department

  // Show loading state only if we're in organization mode and still loading
  if (organizationId && loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading organization details...</p>
        </div>
      </div>
    );
  }

  // Show error state only if we're in organization mode and there's an error
  if (organizationId && (organizationError || departmentsError) && !organization) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Organization</h3>
          <p className="text-gray-500 mb-4">{error || 'Failed to load organization data'}</p>
          <Link 
            to="/organizations" 
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to Organizations
          </Link>
        </div>
      </div>
    );
  }

  // Show AI Prompt Input Screen (Initial State - unless in edit mode)
  if (showPromptInput && !isEditMode) {
    return (
      <AIJobPromptInput
        onGenerate={handleGenerateFromPrompt}
        initialPrompt={aiPrompt}
        isLoading={isGeneratingFromPrompt || aiLoading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Breadcrumbs */}
      <div className="bg-white border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="py-2 sm:py-3">
            <div className="flex items-center text-xs sm:text-sm text-gray-500 overflow-x-auto whitespace-nowrap">
              <Link to="/my-jobs" className="hover:text-gray-700">Jobs</Link>
              <span className="mx-2">/</span>
              {organizationId ? (
                <>
                  <Link to="/organizations" className="hover:text-gray-700">Organizations</Link>
                  <span className="mx-2">/</span>
                  {organization ? (
                    <Link 
                      to={`/organizations/${organizationId}`} 
                      className="hover:text-gray-700"
                    >
                      {organization.name}
                    </Link>
                  ) : (
                    <span>Loading...</span>
                  )}
                  <span className="mx-2">/</span>               
				     {departmentId && selectedDepartment ? (
                    <>
                      <Link 
                        to={`/organizations/${organizationId}/departments/${departmentId}/jobs`}
                        className="hover:text-gray-700"
                      >
                        {selectedDepartment.name}
                      </Link>
                      <span className="mx-2">/</span>
                    </>
                  ) : null}
                  <span className="text-gray-900 font-medium">{isEditMode ? 'Edit Job' : 'Create Job'}</span>
                </>
              ) : (
                <>
                  <span className="text-gray-900 font-medium">{isEditMode ? 'Edit Job' : 'Create Job'}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>      {/* Header */}      <div className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 sm:py-4 gap-2 sm:gap-0 min-h-[4rem] sm:min-h-[4rem]">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate max-w-full sm:max-w-md">Create New Job</h1>           
			 <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {error && (
                <div className="flex items-center text-red-600 bg-red-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm w-full sm:w-auto">
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                  <span className="truncate">{error}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={submitLoading}
                className="px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-purple-600 text-purple-700 rounded-md hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-200 font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center whitespace-nowrap flex-1 sm:flex-initial"
              >
                {submitLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-purple-600 border-t-transparent mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5 mr-2" />
                    {isEditMode ? 'Save Changes' : 'Save as Draft'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowCollaboratorForm(true)}
                className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-200 font-medium text-xs shadow-sm flex items-center justify-center whitespace-nowrap flex-1 sm:flex-initial"
              >
                <UserPlus className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Invite Team</span>
                <span className="sm:hidden">Invite</span>
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={submitLoading}
                className="px-2 sm:px-3 py-1.5 sm:py-2 bg-purple-600 border border-purple-600 text-white rounded-md hover:bg-purple-700 hover:border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-200 font-medium text-xs shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center whitespace-nowrap flex-1 sm:flex-initial"
              >
                {submitLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent mr-2"></div>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2" />
                    <span className="hidden sm:inline">{isEditMode ? 'Update Job' : 'Create Job'}</span>
                    <span className="sm:hidden">{isEditMode ? 'Update' : 'Create'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full px-2 sm:px-4 lg:px-8 py-3 sm:py-4 md:py-6">
        {/* Team Members Display - Show invited collaborators at the top */}
        {(invitedCollaborators.length > 0 || pendingCollaborators.length > 0) && (
          <div className="mb-3 sm:mb-4 md:mb-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setIsTeamMembersExpanded(!isTeamMembersExpanded)}>
              <div className="flex items-center min-w-0 flex-1">
                {isTeamMembersExpanded ? (
                  <ChevronDown className="text-gray-400 mr-1.5 sm:mr-2 flex-shrink-0" size={18} />
                ) : (
                  <ChevronRight className="text-gray-400 mr-1.5 sm:mr-2 flex-shrink-0" size={18} />
                )}
                <Users className="text-purple-600 mr-2 sm:mr-3 flex-shrink-0" size={18} />
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate">
                  Team Members ({invitedCollaborators.length})
                </h3>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCollaboratorForm(true);
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap ml-2"
              >
                <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Invite More</span>
                <span className="sm:hidden">Invite</span>
              </button>
            </div>
            {isTeamMembersExpanded && (
              <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                  {invitedCollaborators.map((email, index) => (
                    <div key={index} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-purple-50 border border-purple-200 rounded-lg group hover:bg-purple-100 transition-colors">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{email}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500">Team Member</p>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                        <button
                          onClick={() => handleRemoveCollaborator(email)}
                          className="p-0.5 sm:p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remove team member"
                          type="button"
                        >
                          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* AI Prompt Display - Show the prompt that was used to generate this job */}
        {aiPrompt && (
          <div className="mb-3 sm:mb-4 md:mb-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div 
              className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors"
            >
              <div 
                className="flex items-center flex-1 cursor-pointer min-w-0"
                onClick={() => setIsAIPromptExpanded(!isAIPromptExpanded)}
              >
                {isAIPromptExpanded ? (
                  <ChevronDown className="text-gray-400 mr-1.5 sm:mr-2 flex-shrink-0" size={18} />
                ) : (
                  <ChevronRight className="text-gray-400 mr-1.5 sm:mr-2 flex-shrink-0" size={18} />
                )}
                <Sparkles className="text-purple-600 mr-2 sm:mr-3 flex-shrink-0" size={18} />
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate">AI Generated Content</h3>
              </div>
              <div className="flex gap-1.5 sm:gap-2 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditedPrompt(aiPrompt);
                    setIsEditingPrompt(true);
                    setIsAIPromptExpanded(true);
                  }}
                  disabled={isGeneratingFromPrompt || aiLoading || isEditingPrompt}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-all text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  type="button"
                >
                  <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Edit Prompt</span>
                  <span className="sm:hidden">Edit</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRegenerateFromPrompt(aiPrompt);
                  }}
                  disabled={isGeneratingFromPrompt || aiLoading || isEditingPrompt}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  type="button"
                >
                  <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isGeneratingFromPrompt || aiLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{isGeneratingFromPrompt || aiLoading ? 'Regenerating...' : 'Regenerate'}</span>
                  <span className="sm:hidden">{isGeneratingFromPrompt || aiLoading ? '...' : 'Regen'}</span>
                </button>
              </div>
            </div>
            {isAIPromptExpanded && (
              <div className="px-6 pb-4">
                {isEditingPrompt ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Edit your prompt and regenerate:
                      </label>
                      <textarea
                        value={editedPrompt}
                        onChange={(e) => setEditedPrompt(e.target.value)}
                        className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none resize-none text-gray-800"
                        placeholder="Describe the job you want to create..."
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setIsEditingPrompt(false);
                          setEditedPrompt('');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                        type="button"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          handleRegenerateFromPrompt(editedPrompt);
                          setIsEditingPrompt(false);
                        }}
                        disabled={!editedPrompt.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        type="button"
                      >
                        <Sparkles className="w-4 h-4" />
                        Save & Regenerate
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-purple-700 mb-2">Your AI Prompt:</p>
                    <p className="text-purple-700 whitespace-pre-wrap leading-relaxed text-sm">
                      {aiPrompt}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          {/* Job Overview & Compensation - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-4 md:mb-6">
            {/* Job Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4">
                <div className="flex items-center">
                  <Building className="text-purple-600 mr-2 sm:mr-3 flex-shrink-0" size={18} />
                  <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Job Overview</h2>
                </div>
              </div>
              <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
              {/* Job Title */}
              <div>
                <label htmlFor="jobTitle" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all duration-200 hover:border-gray-400"
                  placeholder="e.g., Senior Software Engineer"
                  required
                />
              </div>
                
                {/* Organization selector - HIDDEN */}
                {false && !organizationId && (
                  <div>
                    <label htmlFor="organization" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                      Organization <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <select
                      id="organization"
                      value={selectedOrganizationId}
                      onChange={(e) => {
                        setSelectedOrganizationId(e.target.value);
                        // Reset department when organization changes
                        setDepartmentIdForm('');
                        setSelectedDepartment(null);
                      }}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all duration-200 hover:border-gray-400 bg-white"
                      disabled={allOrganizationsLoading}
                    >
                      <option value="">Select Organization</option>
                      {allOrganizations.map((org: any) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                    {allOrganizationsLoading && (
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Loading organizations...</p>
                    )}
                  </div>
                )}

              {/* Department field - HIDDEN */}
              {false && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                <div className={!organizationId ? "lg:col-span-2" : ""}>
                  <label htmlFor="department" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Department <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <select
                    id="department"
                    value={departmentIdForm}
                    onChange={(e) => {
                      setDepartmentIdForm(e.target.value);
                      const selected = departments.find(dept => dept.id === e.target.value);
                      setSelectedDepartment(selected || null);
                    }}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all duration-200 hover:border-gray-400 bg-white"
                    disabled={loading || departments.length === 0}
                  >
                    <option value="">
                      {departments.length === 0 
                        ? 'No departments available' 
                        : 'Select Department (Optional)'}
                    </option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {loading && (
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Loading departments...</p>
                  )}
                  {!loading && effectiveOrgId && departments.length === 0 && (
                    <p className="text-[10px] sm:text-xs text-red-500 mt-1">No departments found for this organization.</p>
                  )}
                </div>
              </div>
              )}

              {/* Location and Employment Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                <div>
                  <label htmlFor="location" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    <MapPin className="inline mr-1" size={14} />
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all duration-200 hover:border-gray-400"
                    placeholder="e.g., New York, NY"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="employmentType" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    <Clock className="inline mr-1" size={14} />
                    Employment Type *
                  </label>
                  <select
                    id="employmentType"
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all duration-200 hover:border-gray-400 bg-white"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Temporary">Temporary</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              {/* Experience Level and Remote */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                <div>
                  <label htmlFor="experienceLevel" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Experience Level
                  </label>
                  <select
                    id="experienceLevel"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all duration-200 hover:border-gray-400 bg-white"
                  >
                    <option value="">Select Experience Level</option>
                    <option value="Entry Level">Entry Level (0-2 years)</option>
                    <option value="Mid Level">Mid Level (3-5 years)</option>
                    <option value="Senior Level">Senior Level (6-10 years)</option>
                    <option value="Lead Level">Lead Level (10+ years)</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                
                <div className="flex items-center sm:pt-6 md:pt-8">
                  <input
                    type="checkbox"
                    id="remote"
                    checked={remote}
                    onChange={(e) => setRemote(e.target.checked)}
                    className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 focus:ring-purple-500 focus:outline-none border-gray-300 rounded"
                  />
                  <label htmlFor="remote" className="ml-2 sm:ml-3 text-xs sm:text-sm font-semibold text-gray-700">
                    Remote work available
                  </label>
                </div>
                
                {/* Application Deadline - HIDDEN */}
                {false && (
                <div>
                  <label htmlFor="applicationDeadline" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    <Calendar className="inline mr-1" size={14} />
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    id="applicationDeadline"
                    value={applicationDeadline}
                    onChange={(e) => setApplicationDeadline(e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all duration-200 hover:border-gray-400"
                  />
                </div>
                )}
              </div>
            </div>
          </div>

            {/* Compensation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4">
                <div className="flex items-center">
                  <DollarSign className="text-purple-600 mr-2 sm:mr-3 flex-shrink-0" size={18} />
                  <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Compensation</h2>
                </div>
              </div>
              <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="currency" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                      Currency
                    </label>
                    <select
                      id="currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all duration-200 hover:border-gray-400 bg-white"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD (C$)</option>
                      <option value="AUD">AUD (A$)</option>
                      
                      {/* Middle East Currencies */}
                      <option value="AED">AED (د.إ) - UAE Dirham</option>
                      <option value="SAR">SAR (﷼) - Saudi Riyal</option>
                      <option value="QAR">QAR (ر.ق) - Qatari Riyal</option>
                      <option value="KWD">KWD (د.ك) - Kuwaiti Dinar</option>
                      <option value="BHD">BHD (د.ب) - Bahraini Dinar</option>
                      <option value="OMR">OMR (ر.ع.) - Omani Rial</option>
                      <option value="JOD">JOD (د.ا) - Jordanian Dinar</option>
                      <option value="EGP">EGP (£) - Egyptian Pound</option>
                      <option value="LBP">LBP (ل.ل) - Lebanese Pound</option>
                      <option value="ILS">ILS (₪) - Israeli Shekel</option>
                      <option value="TRY">TRY (₺) - Turkish Lira</option>
                      <option value="IRR">IRR (﷼) - Iranian Rial</option>
                      <option value="IQD">IQD (ع.د) - Iraqi Dinar</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="salaryPeriod" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                      Salary Period
                    </label>
                    <select
                      id="salaryPeriod"
                      value={salaryPeriod}
                      onChange={(e) => setSalaryPeriod(e.target.value as 'monthly' | 'annual')}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all duration-200 hover:border-gray-400 bg-white"
                    >
                      <option value="annual">Annual</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="salaryMin" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Minimum Salary
                  </label>
                  <input
                    type="number"
                    id="salaryMin"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all duration-200 hover:border-gray-400"
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label htmlFor="salaryMax" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Maximum Salary
                  </label>
                  <input
                    type="number"
                    id="salaryMax"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all duration-200 hover:border-gray-400"
                    placeholder="80000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Job Description & Skills - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-4 md:mb-6">
            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4">
                <div className="flex items-center">
                  <FileText className="text-purple-600 mr-2 sm:mr-3 flex-shrink-0" size={18} />
                  <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Job Description</h2>
                </div>
              </div>
            <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
              <div>
                <label htmlFor="jobDescription" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Job Overview *
                </label>
                <textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={4}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all duration-200 hover:border-gray-400"
                  placeholder="Provide a compelling overview of the role, company culture, and what makes this position exciting..."
                  required
                />
              </div>

              {/* Responsibilities */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Key Responsibilities
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {responsibilities.map((responsibility, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                    >
                      {responsibility}
                      <button
                        type="button"
                        onClick={() => removeResponsibility(responsibility)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-3">
                  <textarea
                    value={newResponsibility}
                    onChange={(e) => setNewResponsibility(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        addResponsibility();
                      }
                    }}
                    rows={3}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all duration-200 hover:border-gray-400 resize-y"
                    placeholder="e.g., Design and implement scalable backend systems&#10;Press Enter to add, Shift+Enter for new line"
                  />
                  <button
                    type="button"
                    onClick={addResponsibility}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium text-sm self-start"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

            {/* Requirements */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center">
                  <CheckCircle className="text-purple-600 mr-3" size={20} />
                  <h2 className="text-lg font-semibold text-gray-900">Requirements</h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
              {/* Requirements & Qualifications */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Requirements & Qualifications
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {requirements.map((requirement, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                    >
                      {requirement}
                      <button
                        type="button"
                        onClick={() => removeRequirement(requirement)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-3">
                  <textarea
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        addRequirement();
                      }
                    }}
                    rows={3}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all duration-200 hover:border-gray-400 resize-y"
                    placeholder="e.g., 5+ years of experience with React and TypeScript&#10;Press Enter to add, Shift+Enter for new line"
                  />
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium text-sm self-start"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Required Skills
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all duration-200 hover:border-gray-400"
                    placeholder="e.g., React, TypeScript, Node.js"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium text-xs"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        </form>

        {/* Live Job Preview - Moved to bottom */}
        <div className="mt-8 mb-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">📋 Live Preview</h3>
              <p className="text-xs text-gray-500 mt-1">See how your job posting will appear to candidates</p>
            </div>
              <div className="p-6">
                <div className="space-y-6">
                  {/* Job Title */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {jobTitle || 'Job Title'}
                    </h2>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <MapPin size={14} className="mr-1" />
                        {location || 'Location'}
                      </span>
                </div>

                {/* Employment Type & Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                    {employmentType}
                  </span>
                  {remote && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                      Remote Available
                    </span>
                  )}
                  {experienceLevel && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                      {experienceLevel}
                    </span>
                  )}
                  
                  {/* Publishing Status Badge */}
                  {publishingOptions.talJobBoard && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full flex items-center">
                      <Building className="w-3 h-3 mr-1" />
                      TAL Job Board
                    </span>
                  )}
                  {/* External job boards badge hidden */}
                  {!publishingOptions.talJobBoard && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full flex items-center">
                      <Lock className="w-3 h-3 mr-1" />
                      Private Only
                    </span>
                  )}
                </div>
              </div>{/* Salary Range */}
              {(salaryMin || salaryMax) && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-purple-800 mb-1">Salary Range</p>
                  <p className="text-lg font-semibold text-purple-900">
                    {salaryMin && salaryMax 
                      ? `${getCurrencySymbol(currency)}${parseInt(salaryMin).toLocaleString()} - ${getCurrencySymbol(currency)}${parseInt(salaryMax).toLocaleString()}`
                      : salaryMin 
                        ? `From ${getCurrencySymbol(currency)}${parseInt(salaryMin).toLocaleString()}`
                        : salaryMax 
                          ? `Up to ${getCurrencySymbol(currency)}${parseInt(salaryMax).toLocaleString()}`
                          : ''
                    }
                  </p>
                </div>
              )}              
			  {/* Job Description */}
              {jobDescription && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">About the Role</p>
                  <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4 border border-gray-200 leading-relaxed break-words overflow-x-hidden">
                    {jobDescription.split('\n').map((line, index) => (
                      <p key={index} className="mb-2 last:mb-0">{line || ' '}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Responsibilities */}
              {responsibilities.some(resp => resp.trim()) && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Key Responsibilities</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {responsibilities.filter(resp => resp.trim()).map((responsibility, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {responsibility}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {requirements.some(req => req.trim()) && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Requirements</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {requirements.filter(req => req.trim()).map((requirement, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Pipeline - Hidden from preview */}

              {/* Publishing Options - Hidden from preview */}

              {/* Application Deadline */}
              {applicationDeadline && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-orange-800 mb-1">Application Deadline</p>
                  <p className="text-sm text-orange-900">
                    {new Date(applicationDeadline).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}              {/* Preview Footer */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  This is how your job posting will appear to candidates
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Publishing Options Modal - COMMENTED OUT */}
      {/* <JobPublishingModal
        isOpen={showPublishingModal}
        onClose={() => setShowPublishingModal(false)}
        onPublish={handlePublishWithOptions}
        isLoading={submitLoading}
        currentOptions={publishingOptions}
        availableJobBoards={availableJobBoards}
      /> */}

      {/* AI Job Generator Dialog */}
      <AIJobGeneratorDialog
        isOpen={showAIDialog}
        onClose={() => setShowAIDialog(false)}
        onGenerate={handleAIGeneration}
        currentData={{
          jobTitle,
          location,
          employmentType,
          experienceLevel,
          departmentName: selectedDepartment?.name
        }}
      />

      {/* Pipeline Creation Dialog */}
      <PipelineModal
        isOpen={showPipelineModal}
        onClose={handleClosePipelineModal}
        onSubmit={handlePipelineSubmit}
        pipeline={editingPipeline}
        isLoading={pipelineModalLoading}
        error={pipelineError}
        onClearError={handleClearPipelineError}
      />

      {/* Pipeline Usage Warning Modal */}
      {showUsageWarning && pendingEditPipeline && pipelineUsage && (
        <PipelineUsageWarningModal
          isOpen={showUsageWarning}
          onClose={handleCloseUsageWarning}
          onCreateCopy={handleCreatePipelineCopy}
          onProceedAnyway={handleProceedWithOriginalEdit}
          pipelineName={pendingEditPipeline.name}
          usage={pipelineUsage}
        />
      )}

      {/* Invite Team Modal */}
      {showCollaboratorForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="text-purple-600 mr-3" size={24} />
                  <h2 className="text-xl font-semibold text-gray-900">Invite Team Members</h2>
                </div>
                <button
                  onClick={() => setShowCollaboratorForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Add team members to collaborate on this job posting. They will be invited after you save or publish.
              </p>
            </div>
            <div className="p-6">
              <JobCollaboratorInviteForm
                onInvite={handleInviteCollaborators}
                onClose={() => setShowCollaboratorForm(false)}
                existingCollaborators={invitedCollaborators}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateJobPage;

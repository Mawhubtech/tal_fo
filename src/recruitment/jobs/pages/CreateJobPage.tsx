import React, { useState, useEffect } from 'react';
import { Plus, X, Users, FileText, Settings, MapPin, Building, DollarSign, Clock, Calendar, Save, AlertCircle, ChevronDown, Sparkles } from 'lucide-react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useCreateJob, useUpdateJob, useJob } from '../../../hooks/useJobs';
import { useOrganization, useOrganizationDepartments } from '../../../hooks/useOrganizations';
import { useActivePipelines } from '../../../hooks/useActivePipelines';
import { useHiringTeams } from '../../../hooks/useHiringTeam';
import { usePipelines } from '../../../hooks/usePipelines';
import { usePipelineModal } from '../../../hooks/usePipelineModal';
import type { CreateJobData } from '../../../services/jobApiService';
import type { Department } from '../../organizations/services/organizationApiService';
import type { Pipeline, CreatePipelineDto } from '../../../services/pipelineService';
import AIJobGeneratorDialog from '../components/AIJobGeneratorDialog';
import PipelineModal from '../../../components/PipelineModal';

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
  const {
    data: organization,
    isLoading: organizationLoading,
    error: organizationError
  } = useOrganization(organizationId || '');

  const {
    data: departments = [],
    isLoading: departmentsLoading,
    error: departmentsError
  } = useOrganizationDepartments(organizationId || '');

  const {
    data: activePipelines = [],
    isLoading: pipelinesLoading,
    error: pipelinesError,
    refetch: refetchActivePipelines
  } = useActivePipelines();

  const {
    data: hiringTeams = [],
    isLoading: hiringTeamsLoading,
    error: hiringTeamsError
  } = useHiringTeams(organizationId ? [organizationId] : undefined);

  const {
    data: editingJob,
    isLoading: jobLoading,
    error: jobError
  } = useJob(editJobId || '');

  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();
  
  // Form state
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
  const [remote, setRemote] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState('');
  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [selectedHiringTeamId, setSelectedHiringTeamId] = useState<string>('');
  const [requirements, setRequirements] = useState(['']);
  const [responsibilities, setResponsibilities] = useState(['']);
  const [customQuestions, setCustomQuestions] = useState<{question: string, type: 'text' | 'multiple-choice', required: boolean}[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const [showAIDialog, setShowAIDialog] = useState(false);

  // Pipeline creation functionality
  const { createPipeline } = usePipelines();
  const {
    showCreateModal: showPipelineModal,
    openCreateModal: openPipelineModal,
    closeModal: closePipelineModal,
    modalLoading: pipelineModalLoading,
  } = usePipelineModal();

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
    }
  }, [editingJob, isEditMode, departmentId]);
  // Load context data when organizationId is present
  useEffect(() => {
    if (organizationError) {
      setError('Failed to load organization data. Please try again.');
    } else if (departmentsError) {
      setError('Failed to load departments. Please try again.');
    } else if (pipelinesError) {
      setError('Failed to load hiring pipelines. Please check your pipelines configuration.');
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
    setRequirements([...requirements, '']);
  };

  const updateRequirement = (index: number, value: string) => {
    const updated = [...requirements];
    updated[index] = value;
    setRequirements(updated);
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const addResponsibility = () => {
    setResponsibilities([...responsibilities, '']);
  };

  const updateResponsibility = (index: number, value: string) => {
    const updated = [...responsibilities];
    updated[index] = value;
    setResponsibilities(updated);
  };

  const removeResponsibility = (index: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };  const handleSubmit = async (publish: boolean) => {
    try {
      setError(null);

      // Validate required fields
      if (!jobTitle.trim()) {
        setError('Job title is required');
        return;
      }

      if (!departmentIdForm.trim()) {
        setError('Department is required');
        return;
      }

      if (!location.trim()) {
        setError('Location is required');
        return;
      }

      if (!selectedPipelineId.trim()) {
        setError('Hiring pipeline is required');
        return;
      }

      // Only require hiring team if teams are available for this organization
      if (hiringTeams.length > 0 && !selectedHiringTeamId.trim()) {
        setError('Please select a hiring team. If no teams are available, create one in the admin section first.');
        return;
      }

      // Validate salary range
      const minSalary = salaryMin ? parseFloat(salaryMin) : undefined;
      const maxSalary = salaryMax ? parseFloat(salaryMax) : undefined;
      
      if (minSalary && maxSalary && minSalary > maxSalary) {
        setError('Minimum salary cannot be greater than maximum salary');
        return;
      }

      // Find the selected department to get its name
      const selectedDept = departments.find(dept => dept.id === departmentIdForm);
      if (!selectedDept) {
        setError('Invalid department selected');
        return;
      }

      const jobData: CreateJobData = {
        title: jobTitle.trim(),
        description: jobDescription.trim() || undefined,
        department: selectedDept.name,
        departmentId: departmentIdForm,
        location: location.trim(),
        type: employmentType as any,
        status: publish ? 'Published' : 'Draft',
        experienceLevel: experienceLevel.trim() || undefined,
        salaryMin: minSalary,
        salaryMax: maxSalary,
        currency: currency,
        remote: remote,
        skills: skills.length > 0 ? skills : undefined,
        benefits: benefits.length > 0 ? benefits : undefined,
        requirements: requirements.filter(req => req.trim()).length > 0 
          ? requirements.filter(req => req.trim()) 
          : undefined,
        responsibilities: responsibilities.filter(resp => resp.trim()).length > 0 
          ? responsibilities.filter(resp => resp.trim()) 
          : undefined,
        hiringTeamId: selectedHiringTeamId || undefined,
        applicationDeadline: applicationDeadline || undefined,
        organizationId: organizationId || undefined,
        customQuestions: customQuestions.length > 0 ? customQuestions : undefined,
        pipelineId: selectedPipelineId,
      };

      // Debug logging to ensure hiring team and pipeline are being saved
      console.log('Creating job with:', {
        hiringTeamId: jobData.hiringTeamId,
        pipelineId: jobData.pipelineId,
        selectedHiringTeam: hiringTeams.find(t => t.id === selectedHiringTeamId),
        selectedPipeline: activePipelines.find(p => p.id === selectedPipelineId)
      });

      let resultJob;
      if (isEditMode && editJobId) {
        // Update existing job
        resultJob = await updateJobMutation.mutateAsync({ id: editJobId, data: jobData });
      } else {
        // Create new job
        resultJob = await createJobMutation.mutateAsync(jobData);
      }
      
      // Navigate to the job ATS page within the organization context
      if (organizationId && resultJob.departmentId) {
        navigate(`/dashboard/organizations/${organizationId}/departments/${resultJob.departmentId}/jobs/${resultJob.id}/ats`);
      } else {
        navigate('/dashboard/organizations');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} job. Please try again.`);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} job:`, err);
    }
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
    
    // Clear and update skills (replace existing with new ones)
    setSkills(aiData.skills.filter(skill => skill.trim()));
    
    // Clear and update benefits (replace existing with new ones)
    setBenefits(aiData.benefits.filter(benefit => benefit.trim()));
  };

  // Pipeline creation handler
  const handleCreatePipeline = async (data: CreatePipelineDto) => {
    try {
      await createPipeline(data);
      // Refetch active pipelines to include the newly created one
      await refetchActivePipelines();
      closePipelineModal();
      
      // Find the newly created pipeline and set it as selected
      // Since we can't get the exact ID from createPipeline, we'll refetch and find by name
      const updatedPipelines = await refetchActivePipelines();
      const newPipeline = updatedPipelines.data?.find(p => p.name === data.name);
      if (newPipeline) {
        setSelectedPipelineId(newPipeline.id);
      }
    } catch (err) {
      console.error('Error creating pipeline:', err);
      // Error handling is managed by the usePipelines hook
    }
  };

  // Early return if no organizationId
  if (!organizationId) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid URL</h3>
          <p className="text-gray-500 mb-4">
            Organization ID is required to create a job.
          </p>
          <Link 
            to="/dashboard/organizations" 
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to Organizations
          </Link>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading organization details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if ((organizationError || departmentsError) && !organization) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Organization</h3>
          <p className="text-gray-500 mb-4">{error || 'Failed to load organization data'}</p>
          <Link 
            to="/dashboard/organizations" 
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to Organizations
          </Link>
        </div>
      </div>
    );
  }

  return (    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">      {/* Breadcrumbs */}
      <div className="bg-white border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center text-sm text-gray-500">
              <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
              <span className="mx-2">/</span>
              {organizationId ? (
                <>
                  <Link to="/dashboard/organizations" className="hover:text-gray-700">Organizations</Link>
                  <span className="mx-2">/</span>
                  {organization ? (
                    <Link 
                      to={`/dashboard/organizations/${organizationId}`} 
                      className="hover:text-gray-700"
                    >
                      {organization.name}
                    </Link>
                  ) : (
                    <span>Loading...</span>
                  )}
                  <span className="mx-2">/</span>                  {departmentId && selectedDepartment ? (
                    <>
                      <Link 
                        to={`/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs`}
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
                  <Link to="/dashboard/jobs" className="hover:text-gray-700">Jobs</Link>
                  <span className="mx-2">/</span>
                  <span className="text-gray-900 font-medium">{isEditMode ? 'Edit Job' : 'Create Job'}</span>
                  <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">Legacy View</span>
                </>
              )}
            </div>
            {!organizationId && (
              <Link 
                to="/dashboard/organizations" 
                className="text-sm bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Switch to Hierarchical Flow
              </Link>
            )}
          </div>
        </div>
      </div>      {/* Header */}      <div className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Create New Job</h1>            <div className="flex gap-4">
              {error && (
                <div className="flex items-center text-red-600 bg-red-50 px-3 py-2 rounded-lg mr-4">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={submitLoading}
                className="px-4 py-2 border-2 border-purple-600 text-purple-700 rounded-lg hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditMode ? 'Save Changes' : 'Save as Draft'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={submitLoading}
                className="px-4 py-2 bg-purple-600 border border-purple-600 text-white rounded-lg hover:bg-purple-700 hover:border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-200 font-medium text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    {isEditMode ? 'Updating...' : 'Publishing...'}
                  </>
                ) : (
                  isEditMode ? 'Update & Publish' : 'Publish Job'
                )}
              </button>
            </div>
          </div>
        </div>
      </div><div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow flex flex-col">        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-148px)] overflow-hidden">
            {/* Main Content - Takes up 1/2 space on large screens, full width on smaller */}
          <div className="overflow-y-auto lg:pr-4 h-full pb-20">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          {/* Job Overview */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-purple-600 overflow-hidden">
            <div className="bg-white border-b-2 border-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building className="text-purple-600 mr-3" size={24} />
                  <h2 className="text-xl font-semibold text-purple-600">Job Overview</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAIDialog(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 group"
                  title="Generate job content with AI"
                >
                  <Sparkles className="h-4 w-4 animate-pulse group-hover:animate-spin" />
                  <span className="text-sm font-medium">AI Generate</span>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="e.g., Senior Software Engineer"
                    required
                  />
                </div>                <div>
                  <label htmlFor="department" className="block text-sm font-semibold text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    id="department"
                    value={departmentIdForm}
                    onChange={(e) => {
                      setDepartmentIdForm(e.target.value);
                      const selected = departments.find(dept => dept.id === e.target.value);
                      setSelectedDepartment(selected || null);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white"
                    required
                    disabled={loading || departments.length === 0}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {loading && (
                    <p className="text-xs text-gray-500 mt-1">Loading departments...</p>
                  )}
                  {!loading && departments.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">No departments found for this organization.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="inline mr-1" size={16} />
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="e.g., New York, NY"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="employmentType" className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="inline mr-1" size={16} />
                    Employment Type *
                  </label>
                  <select
                    id="employmentType"
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Temporary">Temporary</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="experienceLevel" className="block text-sm font-semibold text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    id="experienceLevel"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white"
                  >
                    <option value="">Select Experience Level</option>
                    <option value="Entry Level">Entry Level (0-2 years)</option>
                    <option value="Mid Level">Mid Level (3-5 years)</option>
                    <option value="Senior Level">Senior Level (6-10 years)</option>
                    <option value="Lead Level">Lead Level (10+ years)</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="applicationDeadline" className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="inline mr-1" size={16} />
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    id="applicationDeadline"
                    value={applicationDeadline}
                    onChange={(e) => setApplicationDeadline(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remote"
                  checked={remote}
                  onChange={(e) => setRemote(e.target.checked)}
                  className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="remote" className="ml-3 text-sm font-semibold text-gray-700">
                  Remote work available
                </label>
              </div>
            </div>
          </div>

          {/* Compensation */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-purple-600 overflow-hidden">
            <div className="bg-white border-b-2 border-purple-600 px-6 py-4">
              <div className="flex items-center">
                <DollarSign className="text-purple-600 mr-3" size={24} />
                <h2 className="text-xl font-semibold text-purple-600">Compensation</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="salaryMin" className="block text-sm font-semibold text-gray-700 mb-2">
                    Minimum Salary
                  </label>
                  <input
                    type="number"
                    id="salaryMin"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label htmlFor="salaryMax" className="block text-sm font-semibold text-gray-700 mb-2">
                    Maximum Salary
                  </label>
                  <input
                    type="number"
                    id="salaryMax"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="80000"
                  />
                </div>
                <div>
                  <label htmlFor="currency" className="block text-sm font-semibold text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD (C$)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>          {/* Job Description */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-purple-600 overflow-hidden">
            <div className="bg-white border-b-2 border-purple-600 px-6 py-4">
              <div className="flex items-center">
                <FileText className="text-purple-600 mr-3" size={24} />
                <h2 className="text-xl font-semibold text-purple-600">Job Description</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="jobDescription" className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Overview *
                </label>
                <textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="Provide a compelling overview of the role, company culture, and what makes this position exciting..."
                  required
                />
              </div>

              {/* Responsibilities */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Key Responsibilities
                </label>
                {responsibilities.map((responsibility, index) => (
                  <div key={index} className="flex items-center space-x-3 mb-3">
                    <input
                      type="text"
                      value={responsibility}
                      onChange={(e) => updateResponsibility(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      placeholder="e.g., Design and implement scalable backend systems"
                    />
                    {responsibilities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeResponsibility(index)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addResponsibility}
                  className="flex items-center text-purple-600 hover:text-purple-800 font-medium mt-2"
                >
                  <Plus size={16} className="mr-1" />
                  Add Responsibility
                </button>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Requirements & Qualifications
                </label>
                {requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center space-x-3 mb-3">
                    <input
                      type="text"
                      value={requirement}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      placeholder="e.g., 5+ years of experience with React and TypeScript"
                    />
                    {requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRequirement}
                  className="flex items-center text-purple-600 hover:text-purple-800 font-medium mt-2"
                >
                  <Plus size={16} className="mr-1" />
                  Add Requirement
                </button>
              </div>
            </div>
          </div>

          {/* Skills & Benefits */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-purple-600 overflow-hidden">
            <div className="bg-white border-b-2 border-purple-600 px-6 py-4">
              <div className="flex items-center">
                <Settings className="text-purple-600 mr-3" size={24} />
                <h2 className="text-xl font-semibold text-purple-600">Skills & Benefits</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
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
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="e.g., React, TypeScript, Node.js"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Benefits */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Benefits & Perks
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {benefits.map((benefit, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                    >
                      {benefit}
                      <button
                        type="button"
                        onClick={() => removeBenefit(benefit)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="e.g., Health Insurance, Remote Work, Flexible Hours"
                  />
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="px-6 py-3 bg-purple-600 border border-purple-600 text-white rounded-lg hover:bg-purple-700 hover:border-purple-700 transition-colors font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>          {/* Hiring Process */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-purple-600 overflow-hidden">
            <div className="bg-white border-b-2 border-purple-600 px-6 py-4">
              <div className="flex items-center">
                <Users className="text-purple-600 mr-3" size={24} />
                <h2 className="text-xl font-semibold text-purple-600">Hiring Process</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Application Questions */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Custom Application Questions
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Standard questions (name, email, resume, cover letter) are included by default.
                  </p>
                  <button
                    type="button"
                    className="flex items-center text-purple-600 hover:text-purple-800 font-medium"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Custom Question (Coming Soon)
                  </button>
                </div>
              </div>

              {/* Pipeline Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="pipeline" className="block text-sm font-semibold text-gray-700">
                    Hiring Pipeline *
                  </label>
                  <button
                    type="button"
                    onClick={openPipelineModal}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    title="Create new pipeline"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Pipeline</span>
                  </button>
                </div>
                <select
                  id="pipeline"
                  value={selectedPipelineId}
                  onChange={(e) => setSelectedPipelineId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white"
                  disabled={pipelinesLoading}
                  required
                >
                  <option value="">Select a pipeline *</option>
                  {activePipelines.map((pipeline) => (
                    <option key={pipeline.id} value={pipeline.id}>
                      {pipeline.name} {pipeline.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
                {pipelinesLoading && (
                  <p className="text-xs text-gray-500 mt-1">Loading pipelines...</p>
                )}
                {!pipelinesLoading && activePipelines.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">No active pipelines found. Please create a pipeline first before creating jobs.</p>
                )}
                
                {/* Show selected pipeline stages */}
                {selectedPipelineId && (() => {
                  const selectedPipeline = activePipelines.find(p => p.id === selectedPipelineId);
                  return selectedPipeline ? (
                    <div className="mt-3 bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Pipeline Stages:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedPipeline.stages
                          .sort((a, b) => a.order - b.order)
                          .map((stage) => (
                            <span
                              key={stage.id}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                            >
                              {stage.order}. {stage.name}
                            </span>
                          ))}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Hiring Team Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="hiringTeam" className="block text-sm font-semibold text-gray-700">
                    Hiring Team {hiringTeams.length > 0 ? '*' : '(Optional)'}
                  </label>
                  <Link
                    to={`/admin/organizations/${organizationId}/hiring-teams`}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    title="Manage hiring teams"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Manage Teams</span>
                  </Link>
                </div>
                <select
                  id="hiringTeam"
                  value={selectedHiringTeamId}
                  onChange={(e) => setSelectedHiringTeamId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white"
                  disabled={hiringTeamsLoading}
                  required={hiringTeams.length > 0}
                >
                  <option value="">Select a hiring team *</option>
                  {hiringTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} {team.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
                {hiringTeamsLoading && (
                  <p className="text-xs text-gray-500 mt-1">Loading hiring teams...</p>
                )}
                {!hiringTeamsLoading && hiringTeams.length === 0 && (
                  <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-2">No hiring teams found for this organization.</p>
                    <Link
                      to={`/admin/organizations/${organizationId}/hiring-teams`}
                      className="inline-flex items-center text-sm text-yellow-700 hover:text-yellow-900 font-medium"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Create hiring teams in admin section
                    </Link>
                  </div>
                )}
                
                {/* Show selected hiring team details */}
                {selectedHiringTeamId && (() => {
                  const selectedTeam = hiringTeams.find(t => t.id === selectedHiringTeamId);
                  return selectedTeam ? (
                    <div className="mt-3 bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Team Members ({selectedTeam.members?.length || 0}):</p>
                      {selectedTeam.description && (
                        <p className="text-sm text-gray-600 mb-2">{selectedTeam.description}</p>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        <span>You can manage team members in the admin section</span>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          </div>          </form>

            {/* Hiring Team Management - Only show in edit mode */}
            {/* Teams are now managed in admin section */}
      </div>        {/* Sidebar - Takes up 1/2 space on large screens, full width on smaller */}      
	  <div className="h-full">
        {/* Live Job Preview */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-purple-600 overflow-hidden h-full flex flex-col relative">          <div className="bg-white border-b-2 border-purple-600 px-6 py-4 flex-shrink-0 sticky top-0 z-10">
            <h3 className="text-lg font-semibold text-purple-600">📋 Live Preview</h3>
          </div>
          <div className="p-6 overflow-y-auto overflow-x-hidden flex-grow max-h-[calc(100vh-200px)]">
            <div className="space-y-6">{/* Job Title */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {jobTitle || 'Job Title'}
                </h2>
                <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">                  <span className="flex items-center">
                    <Building size={14} className="mr-1" />
                    {selectedDepartment?.name || 'Department'}
                  </span>
                  <span className="flex items-center">
                    <MapPin size={14} className="mr-1" />
                    {location || 'Location'}
                  </span>
                </div>

                {/* Employment Type & Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {employmentType}
                  </span>
                  {remote && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Remote Available
                    </span>
                  )}
                  {experienceLevel && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                      {experienceLevel}
                    </span>
                  )}
                </div>
              </div>{/* Salary Range */}
              {(salaryMin || salaryMax) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-800 mb-1">Salary Range</p>
                  <p className="text-lg font-semibold text-green-900">
                    {salaryMin && salaryMax 
                      ? `${currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : 'C$'}${parseInt(salaryMin).toLocaleString()} - ${currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : 'C$'}${parseInt(salaryMax).toLocaleString()}`
                      : salaryMin 
                        ? `From ${currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : 'C$'}${parseInt(salaryMin).toLocaleString()}`
                        : salaryMax 
                          ? `Up to ${currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : 'C$'}${parseInt(salaryMax).toLocaleString()}`
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
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
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

              {/* Benefits */}
              {benefits.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Benefits & Perks</p>
                  <div className="flex flex-wrap gap-1">
                    {benefits.map((benefit, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Pipeline */}
              {selectedPipelineId && (() => {
                const selectedPipeline = activePipelines.find(p => p.id === selectedPipelineId);
                return selectedPipeline ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-800 mb-2">Hiring Process</p>
                    <p className="text-sm text-blue-900 mb-2">{selectedPipeline.name}</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedPipeline.stages
                        .sort((a, b) => a.order - b.order)
                        .map((stage) => (
                          <span
                            key={stage.id}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                          >
                            {stage.order}. {stage.name}
                          </span>
                        ))}
                    </div>
                  </div>
                ) : null;
              })()}

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
            </div>      </div>
        </div>        {/* Progress Indicator - Hidden on larger screens since sidebar is already full height */}
        <div className="lg:hidden bg-white rounded-xl shadow-lg border-2 border-purple-600 overflow-hidden mt-6 mb-24">
          <div className="bg-white border-b-2 border-purple-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-purple-600">📊 Completion</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Job Details</span>
                <span className={`font-medium ${jobTitle && departmentIdForm && location ? 'text-green-600' : 'text-gray-400'}`}>
                  {jobTitle && departmentIdForm && location ? '✓' : '○'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Description</span>
                <span className={`font-medium ${jobDescription ? 'text-green-600' : 'text-gray-400'}`}>
                  {jobDescription ? '✓' : '○'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Requirements</span>
                <span className={`font-medium ${requirements.some(req => req.trim()) ? 'text-green-600' : 'text-gray-400'}`}>
                  {requirements.some(req => req.trim()) ? '✓' : '○'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Skills</span>
                <span className={`font-medium ${skills.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                  {skills.length > 0 ? '✓' : '○'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Pipeline</span>
                <span className={`font-medium ${selectedPipelineId ? 'text-green-600' : 'text-gray-400'}`}>
                  {selectedPipelineId ? '✓' : '○'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Hiring Team</span>
                <span className={`font-medium ${selectedHiringTeamId || hiringTeams.length === 0 ? 'text-green-600' : 'text-gray-400'}`}>
                  {selectedHiringTeamId || hiringTeams.length === 0 ? '✓' : '○'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"                  style={{
                    width: `${Math.round(
                      ((jobTitle && departmentIdForm && location ? 17 : 0) +
                       (jobDescription ? 17 : 0) +
                       (requirements.some(req => req.trim()) ? 17 : 0) +
                       (skills.length > 0 ? 17 : 0) +
                       (selectedPipelineId ? 16 : 0) +
                       (selectedHiringTeamId || hiringTeams.length === 0 ? 16 : 0))
                    )}%`
                  }}
                ></div>
              </div>
            </div>
          </div>       
		   </div>     
		    </div>        
        </div>
      </div>

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
        onClose={closePipelineModal}
        onSubmit={handleCreatePipeline}
        isLoading={pipelineModalLoading}
      />
    </div>
  );
};

export default CreateJobPage;

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Save, Plus, X } from 'lucide-react';
import { useJob, useJobBySlug } from '../../../hooks/useJobs';
import { useExternalJobDetail } from '../../../hooks/useExternalJobs';
import { useCreateEmailSequence } from '../../../hooks/useEmailSequences';
import { usePipeline } from '../../../hooks/usePipelines';
import { useAuthContext } from '../../../contexts/AuthContext';
import { isExternalUser } from '../../../utils/userUtils';
import { createJobUrl } from '../../../lib/urlUtils';

const CreateJobEmailSequencePage: React.FC = () => {
  const { slug, jobId } = useParams<{ 
    slug?: string;
    jobId?: string; 
  }>();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  
  // Determine if current user is external and use appropriate hook
  const isExternal = isExternalUser(user);
  
  // Extract the actual slug from the URL parameter if it's in the combined format
  const extractSlug = (slugParam: string | undefined): string => {
    if (!slugParam) return '';
    const parts = slugParam.split('-');
    return parts[parts.length - 1];
  };
  
  const actualSlug = slug ? extractSlug(slug) : '';

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'candidate_outreach' as const,
    category: 'recruitment' as const,
    status: 'draft' as const,
    tags: [] as string[],
    variables: [] as string[],
    pipelineStages: [] as string[] // Replace scope with pipeline stages
  });

  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get job data using slug for internal users, jobId for external
  const { data: job, isLoading: jobLoading, error: jobError } = isExternal 
    ? useJob(jobId || '') 
    : useJobBySlug(actualSlug);
    
  const organizationId = job?.organizationId;
  const departmentId = job?.departmentId;
  const { 
    data: externalJob, 
    isLoading: externalJobLoading, 
    error: externalJobError 
  } = useExternalJobDetail(isExternal ? (jobId || '') : '');

  // Create sequence mutation
  const createSequenceMutation = useCreateEmailSequence();

  // Use appropriate data
  const effectiveJob = isExternal ? externalJob : job;
  const effectiveLoading = isExternal ? externalJobLoading : jobLoading;
  const effectiveError = isExternal ? externalJobError : jobError;

  // Get pipeline data for the job
  const { data: pipeline, isLoading: pipelineLoading } = usePipeline(effectiveJob?.pipeline?.id || '');

  // Construct URLs
  const backUrl = isExternal 
    ? `/external/jobs/${jobId}/email-sequences`
    : `/jobs/${slug}/email-sequences`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveJob) return;

    // Validate that at least one pipeline stage is selected
    if (formData.pipelineStages.length === 0) {
      alert('Please select at least one pipeline stage for this sequence.');
      return;
    }

    setIsSubmitting(true);
    try {
      const sequenceData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        status: formData.status,
        tags: formData.tags,
        variables: formData.variables,
        organizationId: organizationId || effectiveJob.organizationId,
        metadata: {
          jobId: effectiveJob.id, // Use actual job UUID instead of URL parameter
          jobTitle: effectiveJob.title,
          department: effectiveJob.department,
          location: effectiveJob.location,
          pipelineStages: formData.pipelineStages // Add pipeline stages to metadata
        },
        steps: [] // Start with empty steps - user can add them later
      };

      const newSequence = await createSequenceMutation.mutateAsync(sequenceData);
      
      // Navigate to the new sequence detail page
      const detailUrl = isExternal 
        ? `/external/jobs/${jobId}/email-sequences/${newSequence.id}`
        : `/jobs/${slug}/email-sequences/${newSequence.id}`;
      
      navigate(detailUrl);
    } catch (error) {
      console.error('Failed to create sequence:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (effectiveLoading || pipelineLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (effectiveError || !effectiveJob) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4">The job you're looking for doesn't exist.</p>
          <Link
            to={isExternal ? "/external/jobs" : "/my-jobs"}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumbs - Only show for internal users */}
      {!isExternal && effectiveJob && (
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link to="/my-jobs" className="hover:text-gray-700">Jobs</Link>
          <span className="mx-2">/</span>
          <Link to={createJobUrl(effectiveJob.slug || '', effectiveJob.title)} className="hover:text-gray-700">
            {effectiveJob.title}
          </Link>
          <span className="mx-2">/</span>
          <Link to={backUrl} className="hover:text-gray-700">
            Email Sequences
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Create New</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to={backUrl}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Email Sequences
          </Link>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Email Sequence</h1>
          <p className="text-gray-600 mt-1">
            Create a new automated email sequence for {effectiveJob.title}
          </p>
        </div>
      </div>

      {/* Job Info Card */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-purple-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">{effectiveJob.title}</h3>
            <p className="text-gray-600 text-sm">
              {effectiveJob.department} • {effectiveJob.location} • {effectiveJob.type}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Sequence Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                placeholder="e.g., Software Engineer Recruitment Sequence"
                required
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Sequence Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
              >
                <option value="candidate_outreach">Candidate Outreach</option>
                <option value="initial">Initial Contact</option>
                <option value="follow_up">Follow Up</option>
                <option value="warm_intro">Warm Introduction</option>
                <option value="thank_you">Thank You</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
              placeholder="Describe this recruitment sequence - e.g., Multi-step outreach for reaching passive candidates interested in software engineering roles..."
            />
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="pipelineStages" className="block text-sm font-medium text-gray-700 mb-2">
                Pipeline Stages *
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                {pipelineLoading ? (
                  <div className="text-sm text-gray-500">Loading pipeline stages...</div>
                ) : pipeline?.stages && pipeline.stages.length > 0 ? (
                  pipeline.stages
                    .filter(stage => stage.isActive)
                    .sort((a, b) => a.order - b.order)
                    .map((stage) => (
                      <label key={stage.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.pipelineStages.includes(stage.id)}
                          onChange={(e) => {
                            const stageId = stage.id;
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                pipelineStages: [...prev.pipelineStages, stageId]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                pipelineStages: prev.pipelineStages.filter(id => id !== stageId)
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:outline-none"
                        />
                        <span className="text-sm text-gray-700">{stage.name}</span>
                      </label>
                    ))
                ) : (
                  <div className="text-sm text-gray-500">No pipeline stages available</div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Select the pipeline stages where this sequence will be available for candidates
              </p>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Initial Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-purple-500 hover:text-purple-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <Link
              to={backUrl}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
              className="inline-flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Create Sequence
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobEmailSequencePage;

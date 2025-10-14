import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Save, Plus, X } from 'lucide-react';
import { useJob } from '../../../hooks/useJobs';
import { useExternalJobDetail } from '../../../hooks/useExternalJobs';
import { useCreateEmailSequence } from '../../../hooks/useEmailSequences';
import { usePipeline } from '../../../hooks/usePipelines';
import { useAuthContext } from '../../../contexts/AuthContext';
import { isExternalUser } from '../../../utils/userUtils';
import { createJobUrl } from '../../../lib/urlUtils';

const CreateJobEmailSequencePage: React.FC = () => {
  const { organizationId, departmentId, jobId } = useParams<{ 
    organizationId: string; 
    departmentId: string; 
    jobId: string; 
  }>();
  const { user } = useAuthContext();
  const navigate = useNavigate();

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

  // Determine if current user is external
  const isExternal = isExternalUser(user);
  
  // Get job data
  const { data: job, isLoading: jobLoading, error: jobError } = useJob(jobId || '');
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
    : `/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs/${jobId}/email-sequences`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveJob) return;

    setIsSubmitting(true);
    try {
      const sequenceData = {
        ...formData,
        organizationId: organizationId || effectiveJob.organizationId,
        metadata: {
          jobId: jobId,
          jobTitle: effectiveJob.title,
          department: effectiveJob.department,
          location: effectiveJob.location
        },
        steps: [] // Start with empty steps - user can add them later
      };

      const newSequence = await createSequenceMutation.mutateAsync(sequenceData);
      
      // Navigate to the new sequence detail page
      const detailUrl = isExternal 
        ? `/external/jobs/${jobId}/email-sequences/${newSequence.id}`
        : `/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs/${jobId}/email-sequences/${newSequence.id}`;
      
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

  if (effectiveLoading) {
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
            to={isExternal 
              ? "/external/jobs"
              : `/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs`
            }
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
      {!isExternal && (
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <span className="mx-2">/</span>
          <Link to="/dashboard/organizations" className="hover:text-gray-700">Organizations</Link>
          <span className="mx-2">/</span>
          <Link to={`/dashboard/organizations/${organizationId}`} className="hover:text-gray-700">
            Organization
          </Link>
          <span className="mx-2">/</span>
          <Link to={`/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs`} className="hover:text-gray-700">
            {effectiveJob.department}
          </Link>
          <span className="mx-2">/</span>
          <Link to={createJobUrl(jobId || '', effectiveJob.title)} className="hover:text-gray-700">
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
                placeholder="e.g., Initial Candidate Outreach"
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
                <option value="follow_up">Follow Up</option>
                <option value="cold_outreach">Cold Outreach</option>
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
              placeholder="Describe the purpose and flow of this email sequence..."
            />
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="scope" className="block text-sm font-medium text-gray-700 mb-2">
                Sequence Scope
              </label>
              <select
                id="scope"
                value={formData.scope}
                onChange={(e) => handleInputChange('scope', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
              >
                <option value="organization">Organization</option>
                <option value="team">Team</option>
                <option value="personal">Personal</option>
              </select>
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

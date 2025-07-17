import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, X, Users, Calendar, Target, GitBranch } from 'lucide-react';
import { useCreateProject } from '../../hooks/useSourcingProjects';
import { CreateSourcingProjectDto } from '../../services/sourcingProjectApiService';
import { usePipelines } from '../../hooks/usePipelines';
import LoadingSpinner from '../../components/LoadingSpinner';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Name too long'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  targetCompletionDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
  targets: z.object({
    totalProspects: z.number().min(1, 'Target prospects must be at least 1'),
    responseRate: z.number().min(0).max(100).optional(),
    hireTarget: z.number().min(0).optional(),
  }).optional(),
  assignedToTeamId: z.string().optional(),
  pipelineId: z.string().min(1, 'Please select a sourcing pipeline'),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [tagInput, setTagInput] = useState('');
  const createProject = useCreateProject();
  const { pipelines, loading: pipelinesLoading } = usePipelines();

  // Filter pipelines to only show sourcing pipelines
  const sourcingPipelines = pipelines.filter(pipeline => 
    pipeline.type === 'sourcing' && pipeline.status === 'active'
  );
  
  // Find default sourcing pipeline
  const defaultSourcingPipeline = sourcingPipelines.find(pipeline => pipeline.isDefault);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    setError,
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      priority: 'medium',
      tags: [],
      targets: {
        totalProspects: 100,
        responseRate: 20,
        hireTarget: 1,
      },
      pipelineId: '',
    },
  });

  // Set default pipeline when pipelines are loaded
  React.useEffect(() => {
    if (defaultSourcingPipeline && !watch('pipelineId')) {
      setValue('pipelineId', defaultSourcingPipeline.id);
    }
  }, [defaultSourcingPipeline, setValue, watch]);

  const watchedTags = watch('tags') || [];

  const onSubmit = async (data: CreateProjectFormData) => {
    try {
      // Transform form data to match DTO requirements
      const projectData: CreateSourcingProjectDto = {
        name: data.name,
        description: data.description,
        priority: data.priority,
        targetCompletionDate: data.targetCompletionDate,
        tags: data.tags || [],
        targets: data.targets,
        assignedToTeamId: data.assignedToTeamId || undefined,
        pipelineId: data.pipelineId,
      };

      const result = await createProject.mutateAsync(projectData);
      navigate(`/dashboard/sourcing/projects/${result.id}`);
    } catch (error: any) {
      console.error('Failed to create project:', error);
      setError('root', {
        type: 'manual',
        message: error.response?.data?.message || 'Failed to create project',
      });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      const newTags = [...watchedTags, tagInput.trim()];
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = watchedTags.filter(tag => tag !== tagToRemove);
    setValue('tags', newTags);
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link 
            to="/dashboard/sourcing/projects"
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Projects
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
        <p className="text-gray-600 mt-1">
          Set up a new sourcing project to organize your talent acquisition efforts
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter project name..."
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                {...register('description')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe the project goals, requirements, and context..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  id="priority"
                  {...register('priority')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                {errors.priority && (
                  <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="targetCompletionDate" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Target Completion Date
                </label>
                <input
                  type="date"
                  id="targetCompletionDate"
                  {...register('targetCompletionDate')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {errors.targetCompletionDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.targetCompletionDate.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Targets */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            <Target className="w-5 h-5 inline mr-2" />
            Project Targets
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="totalProspects" className="block text-sm font-medium text-gray-700 mb-2">
                Total Prospects Target *
              </label>
              <input
                type="number"
                id="totalProspects"
                min="1"
                {...register('targets.totalProspects', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="100"
              />
              {errors.targets?.totalProspects && (
                <p className="mt-1 text-sm text-red-600">{errors.targets.totalProspects.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="responseRate" className="block text-sm font-medium text-gray-700 mb-2">
                Target Response Rate (%)
              </label>
              <input
                type="number"
                id="responseRate"
                min="0"
                max="100"
                {...register('targets.responseRate', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="20"
              />
              {errors.targets?.responseRate && (
                <p className="mt-1 text-sm text-red-600">{errors.targets.responseRate.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="hireTarget" className="block text-sm font-medium text-gray-700 mb-2">
                Hire Target
              </label>
              <input
                type="number"
                id="hireTarget"
                min="0"
                {...register('targets.hireTarget', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="1"
              />
              {errors.targets?.hireTarget && (
                <p className="mt-1 text-sm text-red-600">{errors.targets.hireTarget.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Tags</h2>
          
          <div>
            <label htmlFor="tagInput" className="block text-sm font-medium text-gray-700 mb-2">
              Add Tags
            </label>
            <div className="flex">
              <input
                type="text"
                id="tagInput"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter tag and press Enter..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {watchedTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {watchedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-purple-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pipeline Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            <GitBranch className="w-5 h-5 inline mr-2" />
            Sourcing Pipeline
          </h2>
          
          <div>
            <label htmlFor="pipelineId" className="block text-sm font-medium text-gray-700 mb-2">
              Select Pipeline*
            </label>
            <select
              id="pipelineId"
              {...register('pipelineId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={pipelinesLoading}
            >
              <option value="">Select a pipeline...</option>
              {sourcingPipelines.map((pipeline) => (
                <option key={pipeline.id} value={pipeline.id}>
                  {pipeline.name} {pipeline.isDefault ? '(Default)' : ''}
                </option>
              ))}
            </select>
            {errors.pipelineId && (
              <p className="mt-1 text-sm text-red-600">{errors.pipelineId.message}</p>
            )}
            {pipelinesLoading && (
              <p className="mt-1 text-sm text-gray-500">Loading pipelines...</p>
            )}
          </div>
        </div>

        {/* Team Assignment */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            <Users className="w-5 h-5 inline mr-2" />
            Team Assignment
          </h2>
          
          <div>
            <label htmlFor="assignedToTeamId" className="block text-sm font-medium text-gray-700 mb-2">
              Assign to Team
            </label>
            <select
              id="assignedToTeamId"
              {...register('assignedToTeamId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select a team (optional)</option>
              {/* Teams will be loaded dynamically */}
            </select>
            {errors.assignedToTeamId && (
              <p className="mt-1 text-sm text-red-600">{errors.assignedToTeamId.message}</p>
            )}
          </div>
        </div>

        {/* Error Display */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <Link
            to="/dashboard/sourcing/projects"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Creating...
              </>
            ) : (
              'Create Project'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProjectPage;

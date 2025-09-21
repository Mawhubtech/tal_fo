import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, X, Users, Calendar, Target, Trash2 } from 'lucide-react';
import { useProject, useUpdateProject, useDeleteProject } from '../../hooks/useSourcingProjects';
import LoadingSpinner from '../../components/LoadingSpinner';

const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Name too long'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['active', 'paused', 'completed', 'archived']).optional(),
  targetCompletionDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
  targets: z.object({
    totalProspects: z.number().min(1, 'Target prospects must be at least 1'),
    responseRate: z.number().min(0).max(100).optional(),
    hireTarget: z.number().min(0).optional(),
  }).optional(),
  assignedToTeamId: z.string().optional(),
});

type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;

const EditProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [tagInput, setTagInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { data: project, isLoading: projectLoading } = useProject(projectId!);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    setError,
    reset,
  } = useForm<UpdateProjectFormData>({
    resolver: zodResolver(updateProjectSchema),
  });

  // Initialize form with project data
  React.useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description || '',
        priority: project.priority || 'medium',
        status: project.status,
        targetCompletionDate: project.targetCompletionDate ? 
          new Date(project.targetCompletionDate).toISOString().split('T')[0] : '',
        tags: project.tags || [],
        targets: project.targets || {
          totalProspects: 100,
          responseRate: 20,
          hireTarget: 1,
        },
        assignedToTeamId: project.assignedToTeamId || '',
      });
    }
  }, [project, reset]);

  const watchedTags = watch('tags') || [];

  if (projectLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
        <p className="text-gray-600 mb-4">The project you're trying to edit doesn't exist.</p>
        <Link 
          to="/dashboard/sourcing/projects"
          className="text-purple-600 hover:text-purple-700"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: UpdateProjectFormData) => {
    try {
      await updateProject.mutateAsync({
        id: project.id,
        data,
      });
      navigate(`/dashboard/sourcing/projects/${project.id}`);
    } catch (error: any) {
      console.error('Failed to update project:', error);
      setError('root', {
        type: 'manual',
        message: error.response?.data?.message || 'Failed to update project',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject.mutateAsync(project.id);
      navigate('/dashboard/sourcing/projects');
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      setError('root', {
        type: 'manual',
        message: error.response?.data?.message || 'Failed to delete project',
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link 
            to={`/dashboard/sourcing/projects/${project.id}`}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Project
          </Link>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
            <p className="text-gray-600 mt-1">
              Update project details and settings
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
              <span className="capitalize">{project.status}</span>
            </span>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                placeholder="Describe the project goals, requirements, and context..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  id="status"
                  {...register('status')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  id="priority"
                  {...register('priority')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
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
            to={`/dashboard/sourcing/projects/${project.id}`}
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
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Project</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete "{project.name}"? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteProject.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors inline-flex items-center"
              >
                {deleteProject.isPending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete Project'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProjectPage;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, X, Users, Calendar, Target, MapPin, Briefcase, TrendingUp, Building, Clock, Trash2 } from 'lucide-react';
import { useCreateProject, useProject, useUpdateProject, useDeleteProject } from '../../hooks/useSourcingProjects';
import { CreateSourcingProjectDto } from '../../services/sourcingProjectApiService';
import LoadingSpinner from '../../components/LoadingSpinner';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Name too long'),
  description: z.string().optional(),
  jobTitle: z.string().min(1, 'Job title is required'),
  location: z.array(z.string()).min(1, 'At least one location is required'),
  seniority: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']),
  targetCompletionDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
  targets: z.object({
    totalProspects: z.number().min(1, 'Target prospects must be at least 1'),
    responseRate: z.number().min(0).max(100).optional(),
    hireTarget: z.number().min(0).optional(),
  }).optional(),
  assignedToTeamId: z.string().optional(),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

// Common tags for recruitment projects - Middle East focused
const COMMON_TAGS = [
  'Remote',
  'Hybrid',
  'On-site',
  'Urgent',
  'Contract',
  'Full-time',
  'Part-time',
  'Expatriate',
  'Local National',
  'Arabic Speaking',
  'English Speaking',
  'Bilingual',
  'Government',
  'Private Sector',
  'Oil & Gas',
  'Banking',
  'Fintech',
  'Healthcare',
  'Construction',
  'Real Estate',
  'Hospitality',
  'Tech',
  'Engineering',
  'Finance',
  'Marketing',
  'Sales',
  'Operations',
  'Management',
  'Executive',
  'NEOM',
  'Vision 2030',
  'Free Zone'
];

// Common locations - focused on Middle East, Saudi Arabia & UAE
const COMMON_LOCATIONS = [
  'Remote',
  // Saudi Arabia
  'Riyadh, Saudi Arabia',
  'Jeddah, Saudi Arabia',
  'Dammam, Saudi Arabia',
  'Khobar, Saudi Arabia',
  'Mecca, Saudi Arabia',
  'Medina, Saudi Arabia',
  'Tabuk, Saudi Arabia',
  'Abha, Saudi Arabia',
  // UAE
  'Dubai, UAE',
  'Abu Dhabi, UAE',
  'Sharjah, UAE',
  'Ajman, UAE',
  'Ras Al Khaimah, UAE',
  'Fujairah, UAE',
  'Umm Al Quwain, UAE',
  // Other GCC Countries
  'Kuwait City, Kuwait',
  'Doha, Qatar',
  'Manama, Bahrain',
  'Muscat, Oman',
  // Other Middle Eastern Cities
  'Amman, Jordan',
  'Beirut, Lebanon',
  'Cairo, Egypt',
  'Baghdad, Iraq'
];

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const [tagInput, setTagInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  
  // Determine if we're in edit mode
  const isEditMode = !!projectId;
  
  // Hooks for create/edit operations
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const { data: existingProject, isLoading: projectLoading } = isEditMode 
    ? useProject(projectId!) 
    : { data: null, isLoading: false };

  // Get state from navigation (for return flow from global search)
  const { fromGlobalSearch, candidate, returnToGlobalSearch } = location.state || {};

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    setError,
    reset,
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      seniority: 'mid',
      location: [],
      tags: [],
      targets: {
        totalProspects: 100,
        responseRate: 20,
        hireTarget: 1,
      },
    },
  });

  // No longer need to set default pipeline - projects will get their own when candidates are added

  const watchedTags = watch('tags') || [];
  const watchedLocation = watch('location') || [];

  // Populate form when editing and project data is loaded
  useEffect(() => {
    if (isEditMode && existingProject) {
      // Extract job title from metadata
      const jobTitle = existingProject.metadata?.jobTitle || '';
      
      // Extract seniority from requirements
      const seniority = existingProject.requirements?.experience || 'mid';
      
      // Extract locations (new format or legacy)
      const locations = existingProject.requirements?.location || 
                       existingProject.requirements?.locations || [];

      // Format target completion date for HTML date input (YYYY-MM-DD)
      let formattedDate = '';
      if (existingProject.targetCompletionDate) {
        const date = new Date(existingProject.targetCompletionDate);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0];
        }
      }

      reset({
        name: existingProject.name,
        description: existingProject.description || '',
        jobTitle,
        seniority: seniority as 'entry' | 'mid' | 'senior' | 'lead' | 'executive',
        location: locations,
        targetCompletionDate: formattedDate,
        tags: existingProject.tags || [],
        targets: {
          totalProspects: existingProject.targets?.totalProspects || 100,
          responseRate: existingProject.targets?.expectedResponseRate || 20,
          hireTarget: existingProject.targets?.expectedHireRate || 1,
        },
        assignedToTeamId: existingProject.assignedToTeamId || '',
      });
    }
  }, [existingProject, isEditMode, reset]);

  const onSubmit = async (data: CreateProjectFormData) => {
    try {
      // Transform form data to match DTO requirements
      const projectData: CreateSourcingProjectDto = {
        name: data.name,
        description: data.description,
        targetCompletionDate: data.targetCompletionDate,
        tags: data.tags || [],
        targets: data.targets,
        assignedToTeamId: data.assignedToTeamId || undefined,
        requirements: {
          experience: data.seniority,
          location: data.location,
        },
        metadata: {
          jobTitle: data.jobTitle,
        },
      };

      let result;
      if (isEditMode) {
        result = await updateProject.mutateAsync({ 
          id: projectId!, 
          data: projectData 
        });
      } else {
        result = await createProject.mutateAsync(projectData);
      }
      
      // Handle return flow for global search (only in create mode)
      if (!isEditMode && returnToGlobalSearch && candidate) {
        // Return to global search results with the new project ID and candidate info
        navigate('/dashboard/search-results', {
          state: {
            ...location.state, // Preserve original search state
            newProjectId: result.id,
            candidateToShortlist: candidate,
            shouldAutoShortlist: true
          }
        });
      } else {
        // Normal flow - go to project detail page
        const projectIdToUse = isEditMode ? projectId : result.id;
        navigate(`/dashboard/sourcing/projects/${projectIdToUse}`);
      }
    } catch (error: any) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} project:`, error);
      setError('root', {
        type: 'manual',
        message: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} project`,
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

  const addLocation = () => {
    if (locationInput.trim() && !watchedLocation.includes(locationInput.trim())) {
      const newLocations = [...watchedLocation, locationInput.trim()];
      setValue('location', newLocations);
      setLocationInput('');
    }
  };

  const removeLocation = (locationToRemove: string) => {
    const newLocations = watchedLocation.filter(location => location !== locationToRemove);
    setValue('location', newLocations);
  };

  const addCommonTag = (tag: string) => {
    if (!watchedTags.includes(tag)) {
      const newTags = [...watchedTags, tag];
      setValue('tags', newTags);
    }
  };

  const addCommonLocation = (location: string) => {
    if (!watchedLocation.includes(location)) {
      const newLocations = [...watchedLocation, location];
      setValue('location', newLocations);
    }
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleLocationInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLocation();
    }
  };

  if (isEditMode && projectLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link 
            to={isEditMode ? `/dashboard/sourcing/projects/${projectId}` : "/dashboard/sourcing/projects"}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {isEditMode ? 'Back to Project' : 'Back to Projects'}
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Edit Sourcing Project' : 'Create New Sourcing Project'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode 
            ? 'Update your recruitment project details and requirements'
            : 'Set up a new recruitment project to find and hire top talent across Saudi Arabia, UAE, and the Middle East'
          }
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Job Requirements</h2>
          
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="w-4 h-4 inline mr-1" />
                  Job Title *
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  {...register('jobTitle')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  placeholder="e.g. Senior Project Manager, Financial Analyst, Civil Engineer"
                />
                {errors.jobTitle && (
                  <p className="mt-1 text-sm text-red-600">{errors.jobTitle.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="seniority" className="block text-sm font-medium text-gray-700 mb-2">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  Seniority Level *
                </label>
                <select
                  id="seniority"
                  {...register('seniority')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                >
                  <option value="entry">Entry Level (0-2 years)</option>
                  <option value="mid">Mid Level (3-5 years)</option>
                  <option value="senior">Senior Level (6-10 years)</option>
                  <option value="lead">Lead/Principal (10+ years)</option>
                  <option value="executive">Executive/C-Level</option>
                </select>
                {errors.seniority && (
                  <p className="mt-1 text-sm text-red-600">{errors.seniority.message}</p>
                )}
              </div>
            </div>

            {/* Location Management */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location(s) *
              </label>
              
              <div className="flex mb-2">
                <input
                  type="text"
                  id="locationInput"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyPress={handleLocationInputKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  placeholder="e.g. Riyadh, Saudi Arabia or Dubai, UAE"
                />
                <button
                  type="button"
                  onClick={addLocation}
                  className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {/* Common Locations */}
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">Quick select popular locations:</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_LOCATIONS.slice(0, 12).map((location) => (
                    <button
                      key={location}
                      type="button"
                      onClick={() => addCommonLocation(location)}
                      disabled={watchedLocation.includes(location)}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                        watchedLocation.includes(location)
                          ? 'bg-purple-100 text-purple-800 border-purple-200 cursor-not-allowed'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-50 hover:border-purple-300'
                      }`}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>
              
              {watchedLocation.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {watchedLocation.map((location, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      {location}
                      <button
                        type="button"
                        onClick={() => removeLocation(location)}
                        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
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
          <h2 className="text-lg font-medium text-gray-900 mb-6">Project Tags</h2>
          
          <div>
            <label htmlFor="tagInput" className="block text-sm font-medium text-gray-700 mb-2">
              Add Custom Tags
            </label>
            <div className="flex mb-3">
              <input
                type="text"
                id="tagInput"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                placeholder="e.g. Visa Sponsorship, NEOM Project, Expat Friendly"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {/* Common Tags */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Popular tags:</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addCommonTag(tag)}
                    disabled={watchedTags.includes(tag)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                      watchedTags.includes(tag)
                        ? 'bg-purple-100 text-purple-800 border-purple-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-50 hover:border-purple-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            
            {watchedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
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
            to={isEditMode ? `/dashboard/sourcing/projects/${projectId}` : "/dashboard/sourcing/projects"}
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
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditMode ? 'Update Project' : 'Create Project'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProjectPage;

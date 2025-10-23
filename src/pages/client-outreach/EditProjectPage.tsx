import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building, Target, Calendar, Plus, X, Workflow, Save } from 'lucide-react';
import { useUpdateProject, useProject } from '../../hooks/useClientOutreach';
import { useClientPipelines } from '../../hooks/useClientPipeline';
import { UpdateProjectData } from '../../services/clientOutreachApiService';
import LoadingSpinner from '../../components/LoadingSpinner';

const EditProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const updateProjectMutation = useUpdateProject();
  const { data: project, isLoading: projectLoading } = useProject(id!);
  const { data: clientPipelines = [], isLoading: pipelinesLoading } = useClientPipelines();

  const [formData, setFormData] = useState<UpdateProjectData>({
    id: id!,
    name: '',
    description: '',
    status: 'active',
    pipelineId: '',
    targetCriteria: {
      industries: [],
      locations: [],
      companySize: [],
      technologies: [],
      keywords: [],
    },
    goals: {
      targetProspects: undefined,
      targetRevenue: undefined,
      timeline: '',
      notes: '',
    },
    color: '#6366f1',
    tags: '',
  });

  const [industryInput, setIndustryInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [companySizeInput, setCompanySizeInput] = useState('');
  const [technologyInput, setTechnologyInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');

  // Populate form when project data loads
  useEffect(() => {
    if (project) {
      setFormData({
        id: project.id,
        name: project.name,
        description: project.description || '',
        status: project.status,
        pipelineId: project.pipeline?.id || '',
        targetCriteria: {
          industries: project.targetCriteria?.industries || [],
          locations: project.targetCriteria?.locations || [],
          companySize: project.targetCriteria?.companySize || [],
          technologies: project.targetCriteria?.technologies || [],
          keywords: project.targetCriteria?.keywords || [],
        },
        goals: {
          targetProspects: project.goals?.targetProspects,
          targetRevenue: project.goals?.targetRevenue,
          timeline: project.goals?.timeline || '',
          notes: project.goals?.notes || '',
        },
        color: project.color || '#6366f1',
        tags: project.tags || '',
      });
    }
  }, [project]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof UpdateProjectData] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const addToArray = (field: string, value: string, setState: React.Dispatch<React.SetStateAction<string>>) => {
    if (value.trim()) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof UpdateProjectData] as any),
          [child]: [...((prev[parent as keyof UpdateProjectData] as any)[child] || []), value.trim()],
        },
      }));
      setState('');
    }
  };

  const removeFromArray = (field: string, index: number) => {
    const [parent, child] = field.split('.');
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof UpdateProjectData] as any),
        [child]: ((prev[parent as keyof UpdateProjectData] as any)[child] || []).filter((_: any, i: number) => i !== index),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id, ...data } = formData;
      await updateProjectMutation.mutateAsync({ id, data });
      navigate(`/client-outreach/projects/${id}`);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  if (projectLoading) {
    return <LoadingSpinner />;
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The project you're trying to edit doesn't exist.</p>
          <Link
            to="/client-outreach/projects"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/client-outreach/projects/${id}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Project
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
          <p className="text-gray-600 mt-2">
            Update your client outreach project settings and configuration.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Building className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Enterprise SaaS Outreach Q4 2025"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the project objectives and scope..."
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Q4, Enterprise, SaaS"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="pipelineId" className="block text-sm font-medium text-gray-700 mb-2">
                  Pipeline <span className="text-gray-500">(Optional)</span>
                </label>
                <select
                  id="pipelineId"
                  value={formData.pipelineId}
                  onChange={(e) => handleInputChange('pipelineId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={pipelinesLoading}
                >
                  <option value="">Use Default Client Pipeline</option>
                  {clientPipelines.map((pipeline) => (
                    <option key={pipeline.id} value={pipeline.id}>
                      {pipeline.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select a custom pipeline or leave empty to use the default client pipeline.
                  {project.pipeline && (
                    <span className="text-blue-600"> Currently using: {project.pipeline.name}</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Pipeline Section */}
          {formData.pipelineId && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Workflow className="w-6 h-6 text-purple-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Selected Pipeline</h2>
              </div>
              {(() => {
                const selectedPipeline = clientPipelines.find(p => p.id === formData.pipelineId);
                return selectedPipeline ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{selectedPipeline.name}</h3>
                    {selectedPipeline.description && (
                      <p className="text-sm text-gray-600 mb-3">{selectedPipeline.description}</p>
                    )}
                    {selectedPipeline.stages && selectedPipeline.stages.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Pipeline Stages:</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedPipeline.stages
                            .sort((a, b) => a.order - b.order)
                            .map((stage) => (
                              <span
                                key={stage.id}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                                style={{
                                  backgroundColor: stage.color ? `${stage.color}20` : '#f3f4f6',
                                  color: stage.color || '#6b7280'
                                }}
                              >
                                {stage.name}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null;
              })()}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <Link
              to={`/client-outreach/projects/${id}`}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={updateProjectMutation.isPending}
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {updateProjectMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectPage;

import React, { useState, useEffect } from 'react';
import { X, Building, MapPin, Users, Plus, AlertCircle } from 'lucide-react';
import { useCreateProspect, useProjects } from '../hooks/useClientOutreach';
import { useClientDefaultPipeline } from '../hooks/useClientPipeline';
import type { CreateProspectData } from '../services/clientOutreachApiService';

interface CompanyData {
  id: number;
  name: string;
  domain?: string;
  industry?: string;
  sizeRange?: string;
  employeeCount?: number;
  location?: string;
  description?: string;
  specialties?: string[];
  technologies?: string[];
  founded?: string;
  linkedinUrl?: string;
  logo?: string;
  score?: number;
}

interface AddToProspectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyData;
  projectId?: string; // Current project ID from route params
  searchContext?: {
    searchQuery?: string;
    extractedFilters?: any;
  };
}

const AddToProspectsModal: React.FC<AddToProspectsModalProps> = ({
  isOpen,
  onClose,
  company,
  projectId, // Current project ID from route params
  searchContext
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hooks
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: defaultPipeline, isLoading: pipelineLoading } = useClientDefaultPipeline();
  const createProspectMutation = useCreateProspect();

  // Get available stages from default pipeline
  const availableStages = defaultPipeline?.stages?.sort((a, b) => a.order - b.order) || [];

  // Set project ID from props when available
  useEffect(() => {
    if (projectId) {
      setSelectedProjectId(projectId);
    }
  }, [projectId]);

  // Set default stage when pipeline loads
  useEffect(() => {
    if (availableStages.length > 0 && !selectedStageId) {
      setSelectedStageId(availableStages[0].id);
    }
  }, [availableStages, selectedStageId]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setError('');
      setNotes('');
      if (searchContext?.searchQuery) {
        setNotes(`Added from search: "${searchContext.searchQuery}"`);
      }
    }
  }, [isOpen, searchContext]);

  const handleSubmit = async () => {
    setError('');
    
    if (!selectedStageId) {
      setError('Please select a stage for the prospect');
      return;
    }

    try {
      setIsSubmitting(true);

      const prospectData: CreateProspectData = {
        companyName: company.name,
        description: company.description,
        industry: company.industry,
        website: company.domain,
        linkedinUrl: company.linkedinUrl,
        location: company.location,
        sizeRange: company.sizeRange,
        employeeCount: company.employeeCount,
        technologies: company.technologies,
        specialties: company.specialties,
        matchScore: company.score,
        coreSignalId: company.id.toString(),
        projectId: selectedProjectId || undefined,
        currentStageId: selectedStageId,
      };

      await createProspectMutation.mutateAsync(prospectData);
      
      onClose();
    } catch (error: any) {
      console.error('Failed to create prospect:', error);
      setError(error.response?.data?.message || 'Failed to add prospect. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add to Prospects</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Company Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-4">
              {company.logo && (
                <img
                  src={company.logo.startsWith('/9j/') || company.logo.startsWith('data:') ? 
                    `data:image/jpeg;base64,${company.logo.replace(/\r?\n/g, '')}` : 
                    company.logo
                  }
                  alt={`${company.name} logo`}
                  className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{company.name}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {company.industry && (
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-1" />
                      {company.industry}
                    </div>
                  )}
                  {company.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {company.location}
                    </div>
                  )}
                  {(company.employeeCount || company.sizeRange) && (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {company.employeeCount ? `${company.employeeCount} employees` : company.sizeRange}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Current Project Indicator - Show when project ID is provided */}
          {projectId && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Adding to Project</h4>
              <p className="text-sm text-blue-700">
                This prospect will be added to the current project and assigned to the selected pipeline stage.
              </p>
            </div>
          )}

          {/* Default Stage Info */}
          {!projectId && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Prospect Creation</h4>
              <p className="text-sm text-blue-700">
                This prospect will be created and assigned to the selected pipeline stage. You can move it to other stages later from the prospect management view.
              </p>
            </div>
          )}

          {/* Project Selection - Only show if no project ID provided from route */}
          {!projectId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project (Optional)
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={projectsLoading}
              >
                <option value="">No specific project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {projectsLoading && (
                <p className="text-sm text-gray-500 mt-1">Loading projects...</p>
              )}
            </div>
          )}

          {/* Stage Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pipeline Stage <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedStageId}
              onChange={(e) => setSelectedStageId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={pipelineLoading}
              required
            >
              <option value="">Select a stage</option>
              {availableStages.map((stage, index) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name} {index === 0 ? '(Default - First Stage)' : `(Stage ${index + 1})`}
                </option>
              ))}
            </select>
            {pipelineLoading && (
              <p className="text-sm text-gray-500 mt-1">Loading pipeline stages...</p>
            )}
            {!pipelineLoading && availableStages.length > 0 && !selectedStageId && (
              <p className="text-sm text-gray-500 mt-1">
                Select the stage where this prospect should be placed. The first stage is typically used for new prospects.
              </p>
            )}
            
            {/* Current Stage Info */}
            {selectedStageId && availableStages.length > 0 && (
              <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                {(() => {
                  const selectedStage = availableStages.find(stage => stage.id === selectedStageId);
                  return selectedStage ? (
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: selectedStage.color || '#8B5CF6' }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-purple-900">
                          {selectedStage.name}
                        </p>
                        <p className="text-xs text-purple-700">
                          Prospect will be added to this stage in the pipeline
                        </p>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this prospect..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Search Context */}
          {searchContext && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Search Context</h4>
              {searchContext.searchQuery && (
                <p className="text-sm text-blue-700 mb-2">
                  <strong>Query:</strong> "{searchContext.searchQuery}"
                </p>
              )}
              {searchContext.extractedFilters && (
                <div className="flex flex-wrap gap-1">
                  {searchContext.extractedFilters.industries?.map((industry: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {industry}
                    </span>
                  ))}
                  {searchContext.extractedFilters.locations?.map((location: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      {location}
                    </span>
                  ))}
                  {searchContext.extractedFilters.technologies?.map((tech: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedStageId}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add to Prospects
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToProspectsModal;

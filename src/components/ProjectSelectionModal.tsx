import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, FolderOpen } from 'lucide-react';
import { useProjects } from '../hooks/useSourcingProjects';
import { SourcingProject } from '../services/sourcingProjectApiService';
import LoadingSpinner from './LoadingSpinner';

interface ProjectSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: any;
  onProjectSelected: (projectId: string) => void;
  searchState?: any; // Current search state to preserve
}

const ProjectSelectionModal: React.FC<ProjectSelectionModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onProjectSelected,
  searchState
}) => {
  const navigate = useNavigate();
  const [showCreateNew, setShowCreateNew] = useState(false);
  
  const { data: projectsData, isLoading } = useProjects({
    status: 'active',
    includeCollaborations: true,
  });

  const projects = projectsData?.projects || [];

  const handleCreateProject = () => {
    navigate('/dashboard/sourcing/projects/create', {
      state: {
        fromGlobalSearch: true,
        candidate: candidate,
        returnToGlobalSearch: true,
        ...searchState // Preserve the original search state
      }
    });
  };

  const handleSelectProject = (projectId: string) => {
    onProjectSelected(projectId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Select Project for Shortlisting
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Choose a project to add {candidate?.fullName || 'this candidate'} to your sourcing pipeline
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Create New Project Option */}
          <div className="mb-6">
            <button
              onClick={handleCreateProject}
              className="w-full p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors group"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="bg-purple-100 group-hover:bg-purple-200 p-2 rounded-lg transition-colors">
                  <Plus className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Create New Project</div>
                  <div className="text-sm text-gray-600">Start a new sourcing project for this candidate</div>
                </div>
              </div>
            </button>
          </div>

          {/* Existing Projects */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Or select an existing project:</h4>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FolderOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No active projects found</p>
                <p className="text-sm">Create your first project to continue</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {projects.map((project: SourcingProject) => (
                  <button
                    key={project.id}
                    onClick={() => handleSelectProject(project.id)}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{project.name}</div>
                        <div className="text-sm text-gray-600 truncate">
                          {project.description || 'No description'}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 ml-4">
                        {project.progress?.totalProspects || 0} prospects
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSelectionModal;

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Mail } from 'lucide-react';
import { useProject } from '../../hooks/useSourcingProjects';
import { CandidateOutreachTemplates } from '../../sourcing/outreach';

const ProjectSequencesPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading, error } = useProject(projectId!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
          <Link
            to="/sourcing/projects"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to={`/sourcing/projects/${project.id}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Project
          </Link>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name} - Sequences</h1>
            <p className="text-gray-600 mt-1">Manage outreach sequences for this project</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              to={`/sourcing/projects/${project.id}/email-templates`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Templates
            </Link>
            <Link
              to={`/sourcing/projects/${project.id}/sequences/create`}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Sequence
            </Link>
          </div>
        </div>
      </div>

      {/* Sequences Content */}
      <div className="bg-white rounded-lg shadow">
        <CandidateOutreachTemplates />
      </div>
    </div>
  );
};

export default ProjectSequencesPage;

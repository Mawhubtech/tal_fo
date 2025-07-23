import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useProjects } from '../../hooks/useClientOutreach';
import { ClientOutreachProspects } from './components';

const ProjectProspectsPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { data: projects = [] } = useProjects();
  
  const project = projects.find(p => p.id.toString() === projectId);

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
          <Link
            to="/dashboard/client-outreach/projects"
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
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to={`/dashboard/client-outreach/projects/${projectId}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Project
          </Link>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name} - Prospects</h1>
            <p className="text-gray-600 mt-1">Manage prospects and outreach for this project</p>
          </div>
        </div>
      </div>

      {/* Prospects Content */}
      <div className="flex-1 bg-gray-50">
        <ClientOutreachProspects projectId={projectId} />
      </div>
    </div>
  );
};

export default ProjectProspectsPage;

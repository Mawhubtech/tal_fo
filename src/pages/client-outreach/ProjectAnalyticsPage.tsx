import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, TrendingUp, Users, Target } from 'lucide-react';
import { useProjects, useProjectProspects } from '../../hooks/useClientOutreach';
import LoadingSpinner from '../../components/LoadingSpinner';

const ProjectAnalyticsPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { data: projects = [] } = useProjects();
  const { data: prospects = [], isLoading } = useProjectProspects(projectId!);
  
  const project = projects.find(p => p.id.toString() === projectId);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
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

  // Calculate analytics from prospects data
  const totalProspects = prospects.length;
  const newProspects = prospects.filter(p => p.status === 'new').length;
  const contactedProspects = prospects.filter(p => p.status === 'contacted').length;
  const respondedProspects = prospects.filter(p => p.status === 'responded').length;
  const meetingsScheduled = prospects.filter(p => p.status === 'meeting_scheduled').length;
  const qualifiedProspects = prospects.filter(p => p.status === 'qualified').length;

  const responseRate = contactedProspects > 0 ? (respondedProspects / contactedProspects * 100).toFixed(1) : '0';
  const conversionRate = totalProspects > 0 ? (qualifiedProspects / totalProspects * 100).toFixed(1) : '0';

  const targetProspects = project.goals?.targetProspects || 0;
  const progressPercentage = targetProspects > 0 ? Math.min((totalProspects / targetProspects * 100), 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/client-outreach/projects/${projectId}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Project
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-2">
                Performance metrics for <span className="font-medium">{project.name}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Prospects</p>
                <p className="text-2xl font-bold text-gray-900">{totalProspects}</p>
                {targetProspects > 0 && (
                  <p className="text-sm text-gray-600">of {targetProspects} target</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Response Rate</p>
                <p className="text-2xl font-bold text-gray-900">{responseRate}%</p>
                <p className="text-sm text-gray-600">{respondedProspects} of {contactedProspects} contacted</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{conversionRate}%</p>
                <p className="text-sm text-gray-600">{qualifiedProspects} qualified</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Meetings Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">{meetingsScheduled}</p>
                <p className="text-sm text-gray-600">from prospects</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Chart */}
        {targetProspects > 0 && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Towards Goal</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Prospects Found</span>
                <span className="font-medium">{totalProspects} / {targetProspects}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600">
                {progressPercentage}% complete
              </div>
            </div>
          </div>
        )}

        {/* Status Breakdown */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prospect Status Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{newProspects}</div>
              <div className="text-sm text-gray-600">New Prospects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{contactedProspects}</div>
              <div className="text-sm text-gray-600">Contacted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{respondedProspects}</div>
              <div className="text-sm text-gray-600">Responded</div>
            </div>
          </div>
        </div>

        {/* Goals Overview */}
        {project.goals && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Goals</h3>
            <div className="space-y-4">
              {project.goals.targetProspects && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Target Prospects:</span>
                  <span className="font-medium">{project.goals.targetProspects}</span>
                </div>
              )}
              {project.goals.targetRevenue && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Target Revenue:</span>
                  <span className="font-medium">${project.goals.targetRevenue.toLocaleString()}</span>
                </div>
              )}
              {project.goals.timeline && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Timeline:</span>
                  <span className="font-medium">{project.goals.timeline}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectAnalyticsPage;

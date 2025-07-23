import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Mail, 
  Calendar,
  Clock,
  Users,
  BarChart3,
  Settings,
  Play,
  Pause,
  Edit,
  Trash2
} from 'lucide-react';
import { useProjects } from '../../hooks/useClientOutreach';
import LoadingSpinner from '../../components/LoadingSpinner';

const ProjectEmailSequencesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: projects = [], isLoading } = useProjects();
  
  const project = projects.find(p => p.id.toString() === id);

  // Mock data for email sequences - replace with actual API call
  const emailSequences = [
    {
      id: 1,
      name: "Initial Outreach Sequence",
      status: "active",
      emails: 3,
      totalRecipients: 156,
      sentEmails: 234,
      openRate: 45.2,
      replyRate: 8.7,
      createdAt: "2025-01-15T10:00:00Z",
      updatedAt: "2025-01-20T14:30:00Z"
    },
    {
      id: 2,
      name: "Follow-up Sequence",
      status: "paused",
      emails: 2,
      totalRecipients: 89,
      sentEmails: 178,
      openRate: 38.9,
      replyRate: 12.4,
      createdAt: "2025-01-10T09:00:00Z",
      updatedAt: "2025-01-18T16:45:00Z"
    },
    {
      id: 3,
      name: "Re-engagement Campaign",
      status: "draft",
      emails: 4,
      totalRecipients: 0,
      sentEmails: 0,
      openRate: 0,
      replyRate: 0,
      createdAt: "2025-01-22T11:15:00Z",
      updatedAt: "2025-01-22T11:15:00Z"
    }
  ];

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4" />;
      case 'paused':
        return <Pause className="w-4 h-4" />;
      case 'draft':
        return <Edit className="w-4 h-4" />;
      case 'completed':
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/dashboard/client-outreach/projects/${id}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Project
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Email Sequences</h1>
              <p className="text-gray-600 mt-1">
                Manage email sequences for {project.name}
              </p>
            </div>
            
            <Link
              to={`/dashboard/client-outreach/projects/${id}/sequences/create`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Sequence
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Mail className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sequences</p>
                <p className="text-2xl font-semibold text-gray-900">{emailSequences.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Recipients</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {emailSequences.reduce((total, seq) => total + seq.totalRecipients, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Open Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {emailSequences.length > 0 
                    ? (emailSequences.reduce((total, seq) => total + seq.openRate, 0) / emailSequences.length).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Reply Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {emailSequences.length > 0 
                    ? (emailSequences.reduce((total, seq) => total + seq.replyRate, 0) / emailSequences.length).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Email Sequences List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Email Sequences</h2>
          </div>
          
          {emailSequences.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No email sequences</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first email sequence.</p>
              <Link
                to={`/dashboard/client-outreach/projects/${id}/sequences/create`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Sequence
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sequence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Emails
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipients
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {emailSequences.map((sequence) => (
                    <tr key={sequence.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <Link
                            to={`/dashboard/client-outreach/projects/${id}/sequences/${sequence.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            {sequence.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sequence.status)}`}>
                          {getStatusIcon(sequence.status)}
                          <span className="ml-1">{sequence.status.charAt(0).toUpperCase() + sequence.status.slice(1)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sequence.emails} emails
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sequence.totalRecipients}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Open: {sequence.openRate}%</div>
                          <div>Reply: {sequence.replyRate}%</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(sequence.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/dashboard/client-outreach/projects/${id}/sequences/${sequence.id}/edit`}
                            className="text-gray-400 hover:text-gray-600"
                            title="Edit sequence"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/dashboard/client-outreach/projects/${id}/sequences/${sequence.id}/settings`}
                            className="text-gray-400 hover:text-gray-600"
                            title="Sequence settings"
                          >
                            <Settings className="w-4 h-4" />
                          </Link>
                          <button
                            className="text-gray-400 hover:text-red-600"
                            title="Delete sequence"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectEmailSequencesPage;

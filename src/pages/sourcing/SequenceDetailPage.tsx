import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Users, UserPlus, Settings, Play, BarChart3 } from 'lucide-react';
import { useProject } from '../../hooks/useSourcingProjects';
import { useSequence, useSequenceEnrollments, useSendSequenceEmails } from '../../hooks/useSourcingSequences';
import { EmailTrackingAnalytics } from '../../components/EmailTrackingAnalytics';

const SequenceDetailPage: React.FC = () => {
  const { projectId, sequenceId } = useParams<{ projectId: string; sequenceId: string }>();
  
  const { data: project, isLoading: projectLoading } = useProject(projectId!);
  const { data: sequence, isLoading: sequenceLoading } = useSequence(sequenceId!);
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useSequenceEnrollments(sequenceId!);
  const sendEmailsMutation = useSendSequenceEmails();

  const handleSendEmails = async () => {
    if (!sequence) return;
    
    try {
      const result = await sendEmailsMutation.mutateAsync(sequence.id);
      alert(`Email sending initiated! ${result.message}`);
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Failed to send emails. Please try again.');
    }
  };

  if (projectLoading || sequenceLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (!sequence) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sequence Not Found</h2>
          <p className="text-gray-600 mb-4">The sequence you're looking for doesn't exist.</p>
          <Link
            to={`/dashboard/sourcing/projects/${project.id}/sequences`}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sequences
          </Link>
        </div>
      </div>
    );
  }

  const activeEnrollments = enrollments.filter(e => e.status === 'active');
  const pausedEnrollments = enrollments.filter(e => e.status === 'paused');
  const completedEnrollments = enrollments.filter(e => e.status === 'completed');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to={`/dashboard/sourcing/projects/${project.id}/sequences`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Sequences
          </Link>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{sequence.name}</h1>
            <p className="text-gray-600 mt-1">{sequence.description || 'No description provided'}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full border text-xs font-medium ${
                sequence.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
                sequence.status === 'paused' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                sequence.status === 'draft' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                'bg-blue-100 text-blue-700 border-blue-200'
              }`}>
                {sequence.status.charAt(0).toUpperCase() + sequence.status.slice(1)}
              </span>
              <span className="text-sm text-gray-500">
                {sequence.type.charAt(0).toUpperCase() + sequence.type.slice(1)} • {sequence.trigger} trigger
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {sequence.status === 'active' && (
              <>
                <button
                  onClick={handleSendEmails}
                  disabled={sendEmailsMutation.isPending}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {sendEmailsMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  Send Emails
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Enroll Candidates
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Steps</p>
              <p className="text-2xl font-bold text-gray-900">{sequence.steps?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Enrolled</p>
              <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Play className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{activeEnrollments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedEnrollments.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* First Row: Sequence Steps */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Sequence Steps</h2>
              <Link
                to={`/dashboard/sourcing/projects/${projectId}/sequences/${sequenceId}/steps`}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Manage Steps
              </Link>
            </div>
          </div>
          <div className="p-6">
            {sequence.steps && sequence.steps.length > 0 ? (
              <div className="space-y-4">
                {sequence.steps.map((step, index) => (
                  <div key={step.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{step.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{step.type}</p>
                      {step.subject && (
                        <p className="text-sm text-gray-500 mt-1">Subject: {step.subject}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Settings className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No steps configured</h3>
                <p className="mt-1 text-sm text-gray-500">Add steps to define your sequence workflow</p>
              </div>
            )}
          </div>
        </div>

        {/* Second Row: Email Tracking Analytics */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">Email Analytics</h2>
              </div>
            </div>
          </div>
          <div className="p-6">
            <EmailTrackingAnalytics sequenceId={sequence.id} />
          </div>
        </div>

        {/* Third Row: Enrolled Candidates */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Enrolled Candidates</h2>
          </div>
          <div className="p-6">
            {enrollmentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : enrollments.length > 0 ? (
              <div className="space-y-3">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-700">{activeEnrollments.length}</div>
                    <div className="text-sm text-green-600">Active</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-lg font-bold text-yellow-700">{pausedEnrollments.length}</div>
                    <div className="text-sm text-yellow-600">Paused</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-700">{completedEnrollments.length}</div>
                    <div className="text-sm text-blue-600">Completed</div>
                  </div>
                </div>

                {/* Recent enrollments */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">Recent Activity</h3>
                  {enrollments.slice(0, 5).map((enrollment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">
                          {enrollment.candidate?.fullName || enrollment.candidate?.email || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">Step {enrollment.currentStepOrder}</div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        enrollment.status === 'active' ? 'bg-green-100 text-green-800' :
                        enrollment.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {enrollment.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No enrolled candidates</h3>
                <p className="mt-1 text-sm text-gray-500">Enroll candidates to start your sequence</p>
                {sequence.status === 'active' && (
                  <button className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Enroll Candidates
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SequenceDetailPage;

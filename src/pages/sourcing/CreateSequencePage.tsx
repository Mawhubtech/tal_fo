import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Save, X } from 'lucide-react';
import { useProject } from '../../hooks/useSourcingProjects';
import { useCreateSequence } from '../../hooks/useSourcingSequences';
import { useToast } from '../../contexts/ToastContext';

interface CreateSequenceForm {
  name: string;
  description: string;
  type: 'email' | 'linkedin' | 'phone' | 'multi_channel';
  trigger: 'manual' | 'automatic' | 'prospect_added' | 'stage_change' | 'time_based';
  config: {
    maxSteps: number;
    stopOnReply: boolean;
    stopOnUnsubscribe: boolean;
    businessHoursOnly: boolean;
    timezone: string;
    sendingDays: number[];
    sendingHours: {
      start: number;
      end: number;
    };
    respectOptOuts: boolean;
    trackingEnabled: boolean;
    autoFollowUpDays: number;
  };
}

const CreateSequencePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const { data: project, isLoading: projectLoading } = useProject(projectId!);
  const createSequenceMutation = useCreateSequence();

  const [formData, setFormData] = useState<CreateSequenceForm>({
    name: '',
    description: '',
    type: 'email',
    trigger: 'manual',
    config: {
      maxSteps: 5,
      stopOnReply: true,
      stopOnUnsubscribe: true,
      businessHoursOnly: true,
      timezone: 'America/New_York',
      sendingDays: [1, 2, 3, 4, 5], // Mon-Fri
      sendingHours: {
        start: 9,
        end: 17
      },
      respectOptOuts: true,
      trackingEnabled: true,
      autoFollowUpDays: 1
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CreateSequenceForm] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      addToast({
        type: 'error',
        title: 'Please enter a sequence name'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const sequenceData = {
        ...formData,
        projectId: projectId!
      };

      const newSequence = await createSequenceMutation.mutateAsync(sequenceData);
      
      addToast({
        type: 'success',
        title: 'Sequence created successfully!'
      });
      navigate(`/dashboard/sourcing/projects/${projectId}/sequences`);
    } catch (error: any) {
      console.error('Error creating sequence:', error);
      addToast({
        type: 'error',
        title: error.response?.data?.message || 'Failed to create sequence'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (projectLoading) {
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
          <Link
            to="/dashboard/sourcing/projects"
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
            to={`/dashboard/sourcing/projects/${project.id}/sequences`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Sequences
          </Link>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Sequence</h1>
            <p className="text-gray-600 mt-1">Create a new outreach sequence for {project.name}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sequence Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                placeholder="e.g. Initial Outreach Sequence"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              >
                <option value="email">Email</option>
                <option value="linkedin">LinkedIn</option>
                <option value="phone">Phone</option>
                <option value="multi_channel">Multi-Channel</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                placeholder="Describe the purpose and goals of this sequence..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trigger
              </label>
              <select
                value={formData.trigger}
                onChange={(e) => handleInputChange('trigger', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              >
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
                <option value="prospect_added">When Prospect Added</option>
                <option value="stage_change">Stage Change</option>
                <option value="time_based">Time Based</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Steps
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.config.maxSteps}
                onChange={(e) => handleInputChange('config.maxSteps', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.config.stopOnReply}
                  onChange={(e) => handleInputChange('config.stopOnReply', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:outline-none"
                />
                <span className="ml-2 text-sm text-gray-700">Stop sequence on reply</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.config.stopOnUnsubscribe}
                  onChange={(e) => handleInputChange('config.stopOnUnsubscribe', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:outline-none"
                />
                <span className="ml-2 text-sm text-gray-700">Stop on unsubscribe</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.config.businessHoursOnly}
                  onChange={(e) => handleInputChange('config.businessHoursOnly', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:outline-none"
                />
                <span className="ml-2 text-sm text-gray-700">Business hours only</span>
              </label>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={formData.config.timezone}
                  onChange={(e) => handleInputChange('config.timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Hour
                </label>
                <select
                  value={formData.config.sendingHours.start}
                  onChange={(e) => handleInputChange('config.sendingHours.start', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Hour
                </label>
                <select
                  value={formData.config.sendingHours.end}
                  onChange={(e) => handleInputChange('config.sendingHours.end', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <Link
            to={`/dashboard/sourcing/projects/${project.id}/sequences`}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? 'Creating...' : 'Create Sequence'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSequencePage;

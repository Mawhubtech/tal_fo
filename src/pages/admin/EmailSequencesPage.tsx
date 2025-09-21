import React, { useState } from 'react';
import { useEmailSequences, useCreateEmailSequence, useUpdateEmailSequence } from '../../hooks/useEmailSequences';
import { EmailSequence } from '../../services/emailSequencesApiService';
import CreateSequenceModal from '../../components/CreateSequenceModal';
import SequencePreviewModal from '../../components/SequencePreviewModal';
import { useToast } from '../../contexts/ToastContext';
import { 
  Plus, 
  AlertTriangle, 
  Edit, 
  MessageSquare,
  Mail,
  BarChart3,
  TrendingUp,
  Users,
  Zap,
  Eye,
  X,
  Clock,
  Send
} from 'lucide-react';

const EmailSequencesPage: React.FC = () => {
  const { data: sequencesData, isLoading, error } = useEmailSequences();
  const createSequenceMutation = useCreateEmailSequence();
  const updateSequenceMutation = useUpdateEmailSequence();
  const { addToast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewSequence, setPreviewSequence] = useState<EmailSequence | null>(null);
  const [editSequence, setEditSequence] = useState<EmailSequence | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const handleCreateSequence = async (data: any) => {
    try {
      if (modalMode === 'edit' && editSequence) {
        await updateSequenceMutation.mutateAsync({ id: editSequence.id, data });
        addToast({
          type: 'success',
          title: 'System Preset Updated',
          message: `The sequence "${data.name}" has been updated successfully.`,
          duration: 5000
        });
      } else {
        await createSequenceMutation.mutateAsync(data);
        addToast({
          type: 'success',
          title: 'System Preset Created',
          message: `The sequence "${data.name}" has been created successfully and is now available to all users.`,
          duration: 5000
        });
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save sequence:', error);
      addToast({
        type: 'error',
        title: modalMode === 'edit' ? 'Failed to Update Preset' : 'Failed to Create Preset',
        message: `There was an error ${modalMode === 'edit' ? 'updating' : 'creating'} the system preset. Please try again.`,
        duration: 5000
      });
    }
  };

  const handleCreateNew = () => {
    setModalMode('create');
    setEditSequence(null);
    setIsCreateModalOpen(true);
  };

  const handleEditSequence = (sequence: EmailSequence) => {
    setModalMode('edit');
    setEditSequence(sequence);
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditSequence(null);
    setModalMode('create');
  };

  const renderToggle = (isOn: boolean, onClick: () => void) => (
    <button onClick={onClick} className="flex items-center">
      <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
        isOn ? 'bg-purple-600' : 'bg-gray-200'
      }`}>
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
            isOn ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </div>
    </button>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">Error loading email sequences</span>
          </div>
        </div>
      </div>
    );
  }

  const sequences = sequencesData?.data || [];
  const globalSequences = sequences.filter(s => s.scope === 'global');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Sequences</h1>
          <p className="text-gray-600 mt-1">Manage system-wide email sequence templates and settings</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create System Preset
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {sequences.length}
              </div>
              <div className="text-sm text-blue-600">Total Sequences</div>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center">
            <Zap className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-green-600">
                {sequences.filter(s => s.status === 'active').length}
              </div>
              <div className="text-sm text-green-600">Active Sequences</div>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {globalSequences.length}
              </div>
              <div className="text-sm text-purple-600">System Presets</div>
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-orange-600">N/A</div>
              <div className="text-sm text-orange-600">Avg Response Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">System Preset Management</h3>
            <p className="text-sm text-yellow-700 mt-1">
              System presets are available to all users and organizations. Changes here will affect all users who haven't customized these sequences.
            </p>
          </div>
        </div>
      </div>

      {/* Sequence Categories */}
      <div className="space-y-6">
        <h2 className="text-lg font-medium text-gray-900">Sequence Categories</h2>
        
        {/* Candidate Outreach Presets */}
        <div className="border border-gray-200 rounded-lg">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Candidate Outreach</h3>
            <p className="text-sm text-gray-600">Templates for reaching out to potential candidates</p>
          </div>
          <div className="p-4 space-y-3">
            {sequences
              ?.filter(sequence => sequence.type === 'candidate_outreach' && sequence.scope === 'global')
              ?.map((sequence) => (
                <SequenceCard 
                  key={sequence.id} 
                  sequence={sequence} 
                  onPreview={setPreviewSequence} 
                  onEdit={handleEditSequence}
                />
              )) || 
              <EmptyState category="candidate outreach" />
            }
          </div>
        </div>

        {/* Client Outreach Presets */}
        <div className="border border-gray-200 rounded-lg">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Client Outreach</h3>
            <p className="text-sm text-gray-600">Templates for engaging with potential clients</p>
          </div>
          <div className="p-4 space-y-3">
            {sequences
              ?.filter(sequence => sequence.type === 'client_outreach' && sequence.scope === 'global')
              ?.map((sequence) => (
                <SequenceCard 
                  key={sequence.id} 
                  sequence={sequence} 
                  onPreview={setPreviewSequence} 
                  onEdit={handleEditSequence}
                />
              )) || 
              <EmptyState category="client outreach" />
            }
          </div>
        </div>

        {/* Custom/General Sequences */}
        <div className="border border-gray-200 rounded-lg">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">General Sequences</h3>
            <p className="text-sm text-gray-600">Versatile templates for various scenarios</p>
          </div>
          <div className="p-4 space-y-3">
            {sequences
              ?.filter(sequence => sequence.type === 'custom' && sequence.scope === 'global')
              ?.map((sequence) => (
                <SequenceCard 
                  key={sequence.id} 
                  sequence={sequence} 
                  onPreview={setPreviewSequence} 
                  onEdit={handleEditSequence}
                />
              )) || 
              <EmptyState category="general" />
            }
          </div>
        </div>
      </div>

      {/* Global Sequence Settings */}
      <div className="space-y-6">
        <h2 className="text-lg font-medium text-gray-900">Global Sequence Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Auto-advance Sequences</h4>
                <p className="text-sm text-gray-600">Automatically move to next step after delay</p>
              </div>
              {renderToggle(true, () => {})}
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Business Hours Only</h4>
                <p className="text-sm text-gray-600">Only send emails during business hours</p>
              </div>
              {renderToggle(true, () => {})}
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Track Opens & Clicks</h4>
                <p className="text-sm text-gray-600">Enable email tracking for analytics</p>
              </div>
              {renderToggle(true, () => {})}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Delay Between Steps
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none">
                <option>24 hours</option>
                <option>48 hours</option>
                <option>3 days</option>
                <option>1 week</option>
                <option>2 weeks</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Sequence Length
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none">
                <option>5 steps</option>
                <option>10 steps</option>
                <option>15 steps</option>
                <option>Unlimited</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unsubscribe Handling
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none">
                <option>Stop all sequences</option>
                <option>Stop current sequence only</option>
                <option>Mark for manual review</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Analytics */}
      <div className="space-y-6">
        <h2 className="text-lg font-medium text-gray-900">Performance Analytics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-blue-600">87%</div>
            <div className="text-sm text-blue-600">Delivery Rate</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-lg font-bold text-green-600">24%</div>
            <div className="text-sm text-green-600">Open Rate</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-lg font-bold text-purple-600">12%</div>
            <div className="text-sm text-purple-600">Click Rate</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="text-lg font-bold text-orange-600">18%</div>
            <div className="text-sm text-orange-600">Response Rate</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Top Performing Sequences (Last 30 Days)</h3>
          <div className="space-y-3">
            {sequences?.slice(0, 5).map((sequence, index) => (
              <div key={sequence.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-900">{sequence.name}</span>
                <span className="text-sm font-medium text-green-600">
                  {sequence.analytics?.totalResponses && sequence.analytics?.totalSent
                    ? `${Math.round((sequence.analytics.totalResponses / sequence.analytics.totalSent) * 100)}% response rate`
                    : 'N/A'
                  }
                </span>
              </div>
            )) || (
              <div className="text-center py-4 text-gray-500">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No performance data available yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Sequence Modal */}
      <CreateSequenceModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onSave={handleCreateSequence}
        isLoading={createSequenceMutation.isPending || updateSequenceMutation.isPending}
        editSequence={editSequence}
        mode={modalMode}
      />

      {/* Preview Sequence Modal */}
      {previewSequence && (
        <SequencePreviewModal
          sequence={previewSequence}
          onClose={() => setPreviewSequence(null)}
          onEdit={handleEditSequence}
        />
      )}
    </div>
  );
};

// Component for individual sequence cards
const SequenceCard: React.FC<{ 
  sequence: EmailSequence; 
  onPreview: (sequence: EmailSequence) => void;
  onEdit: (sequence: EmailSequence) => void;
}> = ({ sequence, onPreview, onEdit }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900">{sequence.name}</h4>
        <p className="text-xs text-gray-600">{sequence.description}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <span>{sequence.steps?.length || 0} steps</span>
          <span>•</span>
          <span>Used {sequence.analytics?.totalSent || 0} times</span>
          <span>•</span>
          <span>
            {sequence.analytics?.totalResponses && sequence.analytics?.totalSent
              ? `${Math.round((sequence.analytics.totalResponses / sequence.analytics.totalSent) * 100)}% response rate`
              : 'N/A response rate'
            }
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          sequence.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {sequence.status === 'active' ? 'Active' : 'Draft'}
        </span>
        <button 
          onClick={() => onPreview(sequence)}
          className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
          title="Preview sequence"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onEdit(sequence)}
          className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
          title="Edit sequence"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Empty state component
const EmptyState: React.FC<{ category: string }> = ({ category }) => {
  return (
    <div className="text-center py-8 text-gray-500">
      <Mail className="h-12 w-12 mx-auto mb-4 text-gray-400" />
      <p className="text-sm">No {category} sequences found</p>
      <p className="text-xs text-gray-400 mt-1">Create your first sequence template to get started</p>
    </div>
  );
};

export default EmailSequencesPage;

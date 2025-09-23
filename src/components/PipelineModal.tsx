import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, GripVertical, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';
import { Pipeline, CreatePipelineDto, PipelineStage } from '../services/pipelineService';

interface PipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePipelineDto) => Promise<void>;
  pipeline?: Pipeline | null;
  isLoading?: boolean;
  error?: string | null;
  onClearError?: () => void;
}

interface StageFormData {
  id?: string;
  name: string;
  description?: string;
  type: string;
  order: number;
  color: string;
  icon: string;
  isActive: boolean;
  isTerminal: boolean;
}

const stageTypes = [
  { value: 'application', label: 'Application' },
  { value: 'screening', label: 'Screening' },
  { value: 'interview', label: 'Interview' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'reference_check', label: 'Reference Check' },
  { value: 'offer', label: 'Offer' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
  { value: 'custom', label: 'Custom' },
];

const stageColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899',
  '#06B6D4', '#84CC16', '#F97316', '#EF4444', '#6B7280'
];

const stageIcons = [
  'file-text', 'search', 'users', 'clipboard-check', 'shield-check',
  'gift', 'check-circle', 'x-circle', 'minus-circle', 'inbox'
];

const PipelineModal: React.FC<PipelineModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  pipeline,
  isLoading = false,
  error = null,
  onClearError,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'private' as 'public' | 'private' | 'organization',
    status: 'active' as 'active' | 'inactive' | 'archived',
    type: 'recruitment' as 'recruitment' | 'sourcing' | 'client' | 'custom',
    isDefault: false,
    color: '#7C3AED',
    icon: 'briefcase',
    clientId: '',
  });

  const [stages, setStages] = useState<StageFormData[]>([]);

  // Handle body scroll and ESC key
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Add ESC key handler
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEsc);
      
      return () => {
        document.removeEventListener('keydown', handleEsc);
        // Restore body scroll when modal closes
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (pipeline) {
      setFormData({
        name: pipeline.name,
        description: pipeline.description || '',
        visibility: pipeline.visibility,
        status: pipeline.status,
        type: pipeline.type,
        isDefault: pipeline.isDefault,
        color: pipeline.color || '#7C3AED',
        icon: pipeline.icon || 'briefcase',
        clientId: pipeline.client?.id || '',
      });
      setStages(pipeline.stages
        .sort((a, b) => a.order - b.order)
        .map((stage, index) => ({
          id: stage.id,
          name: stage.name,
          description: stage.description || '',
          type: stage.type,
          order: stage.order <= 0 ? index + 1 : stage.order, // Fix any stages with order 0 or negative
          color: stage.color || '#3B82F6',
          icon: stage.icon || 'circle',
          isActive: stage.isActive,
          isTerminal: stage.isTerminal,
        })));
    } else {
      // Default stages for new pipeline
      setStages([
        {
          name: 'Application',
          description: 'Initial application received',
          type: 'application',
          order: 1,
          color: '#3B82F6',
          icon: 'file-text',
          isActive: true,
          isTerminal: false,
        },
        {
          name: 'Interview',
          description: 'Interview process',
          type: 'interview',
          order: 2,
          color: '#F59E0B',
          icon: 'users',
          isActive: true,
          isTerminal: false,
        },
        {
          name: 'Hired',
          description: 'Successfully hired',
          type: 'hired',
          order: 3,
          color: '#059669',
          icon: 'check-circle',
          isActive: true,
          isTerminal: true,
        },
      ]);
    }
  }, [pipeline]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sort stages by order before submitting
    const sortedStages = [...stages].sort((a, b) => a.order - b.order);
    
    const submitData: CreatePipelineDto = {
      ...formData,
      stages: sortedStages.map(stage => ({
        ...(stage.id && { id: stage.id }), // Include ID for existing stages
        name: stage.name,
        description: stage.description,
        type: stage.type,
        order: stage.order,
        color: stage.color,
        icon: stage.icon,
        isActive: stage.isActive,
        isTerminal: stage.isTerminal,
      })),
    };

    await onSubmit(submitData);
  };

  const addStage = () => {
    const newStage: StageFormData = {
      name: '',
      description: '',
      type: 'custom',
      order: stages.length + 1,
      color: '#3B82F6',
      icon: 'circle',
      isActive: true,
      isTerminal: false,
    };
    setStages([...stages, newStage]);
  };

  const removeStage = (index: number) => {
    const newStages = stages.filter((_, i) => i !== index);
    // Reorder remaining stages
    const reorderedStages = newStages.map((stage, i) => ({
      ...stage,
      order: i + 1,
    }));
    setStages(reorderedStages);
  };

  const moveStage = (index: number, direction: 'up' | 'down') => {
    const newStages = [...stages];
    const currentStage = newStages[index];
    
    if (direction === 'up' && index > 0) {
      const prevStage = newStages[index - 1];
      // Swap orders
      const tempOrder = currentStage.order;
      currentStage.order = prevStage.order;
      prevStage.order = tempOrder;
      
      // Swap positions in array
      newStages[index] = prevStage;
      newStages[index - 1] = currentStage;
    } else if (direction === 'down' && index < newStages.length - 1) {
      const nextStage = newStages[index + 1];
      // Swap orders
      const tempOrder = currentStage.order;
      currentStage.order = nextStage.order;
      nextStage.order = tempOrder;
      
      // Swap positions in array
      newStages[index] = nextStage;
      newStages[index + 1] = currentStage;
    }
    
    setStages(newStages);
  };

  const sortStagesByOrder = () => {
    const sortedStages = [...stages].sort((a, b) => a.order - b.order);
    setStages(sortedStages);
  };

  const normalizeStageOrders = () => {
    const normalizedStages = [...stages]
      .sort((a, b) => a.order - b.order)
      .map((stage, index) => ({
        ...stage,
        order: index + 1,
      }));
    setStages(normalizedStages);
  };

  const updateStage = (index: number, field: keyof StageFormData, value: any) => {
    // Clear error when user starts modifying stages
    if (onClearError) {
      onClearError();
    }
    
    const newStages = [...stages];
    newStages[index] = { ...newStages[index], [field]: value };
    
    // If order was changed, check for duplicates and adjust if needed
    if (field === 'order') {
      const newOrder = parseInt(value) || 1;
      const duplicateIndex = newStages.findIndex((stage, i) => i !== index && stage.order === newOrder);
      
      if (duplicateIndex !== -1) {
        // If there's a duplicate, swap the orders
        newStages[duplicateIndex].order = newStages[index].order;
      }
      
      newStages[index].order = newOrder;
      
      // Sort stages after order change
      setTimeout(() => sortStagesByOrder(), 100);
    }
    
    setStages(newStages);
  };

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-900">
              {pipeline ? 'Edit Pipeline' : 'Create New Pipeline'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Pipeline Update Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                  {onClearError && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={onClearError}
                        className="text-sm text-red-600 hover:text-red-800 underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pipeline Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    placeholder="Enter pipeline name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  placeholder="Enter pipeline description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  >
                    <option value="recruitment">Recruitment</option>
                    <option value="sourcing">Sourcing</option>
                    <option value="client">Client</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visibility
                  </label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                    <option value="organization">Organization</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                    Set as default pipeline
                  </label>
                </div>
              </div>
            </div>

            {/* Pipeline Stages */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Pipeline Stages</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={normalizeStageOrders}
                    className="flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                    title="Reset stage orders to 1, 2, 3..."
                  >
                    Normalize Orders
                  </button>
                  <button
                    type="button"
                    onClick={sortStagesByOrder}
                    className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    Sort by Order
                  </button>
                  <button
                    type="button"
                    onClick={addStage}
                    className="flex items-center px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Stage
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {stages.map((stage, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Order *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={stage.order}
                          onChange={(e) => updateStage(index, 'order', parseInt(e.target.value) || 1)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                          placeholder="1"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Stage Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={stage.name}
                          onChange={(e) => updateStage(index, 'name', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                          placeholder="Stage name"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={stage.type}
                          onChange={(e) => updateStage(index, 'type', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                          {stageTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Color
                        </label>
                        <div className="flex gap-1">
                          {stageColors.map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => updateStage(index, 'color', color)}
                              className={`w-6 h-6 rounded border-2 ${stage.color === color ? 'border-gray-400' : 'border-gray-200'}`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-end gap-2">
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => moveStage(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveStage(index, 'down')}
                            disabled={index === stages.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={stage.isActive}
                              onChange={(e) => updateStage(index, 'isActive', e.target.checked)}
                              className="h-3 w-3 text-purple-600 border-gray-300 rounded"
                            />
                            <label className="ml-1 text-xs text-gray-700">Active</label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={stage.isTerminal}
                              onChange={(e) => updateStage(index, 'isTerminal', e.target.checked)}
                              className="h-3 w-3 text-purple-600 border-gray-300 rounded"
                            />
                            <label className="ml-1 text-xs text-gray-700">Terminal</label>
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => removeStage(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove stage"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={stage.description}
                        onChange={(e) => updateStage(index, 'description', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                        placeholder="Stage description"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : pipeline ? 'Update Pipeline' : 'Create Pipeline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PipelineModal;

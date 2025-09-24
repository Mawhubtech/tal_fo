import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { EmailSequence } from '../services/emailSequencesApiService';
import { X, Clock, Send, MessageSquare, Phone, Calendar, Linkedin } from 'lucide-react';

interface SequencePreviewModalProps {
  sequence: EmailSequence;
  onClose: () => void;
  onEdit?: (sequence: EmailSequence) => void;
}

const SequencePreviewModal: React.FC<SequencePreviewModalProps> = ({ sequence, onClose, onEdit }) => {
  // Enhanced modal behavior - ESC key and body scroll prevention
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  // Handle overlay click to close modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Send className="w-4 h-4" />;
      case 'sms':
        return <MessageSquare className="w-4 h-4" />;
      case 'call':
        return <Phone className="w-4 h-4" />;
      case 'wait':
        return <Clock className="w-4 h-4" />;
      case 'linkedin_message':
        return <Linkedin className="w-4 h-4" />;
      case 'task':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Send className="w-4 h-4" />;
    }
  };

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'sms':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'call':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'wait':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'linkedin_message':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'task':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const formatDelay = (delayHours: number, delayMinutes: number) => {
    if (delayHours === 0 && delayMinutes === 0) return 'Immediate';
    if (delayHours === 0) return `${delayMinutes}m`;
    if (delayMinutes === 0) return `${delayHours}h`;
    return `${delayHours}h ${delayMinutes}m`;
  };

  const steps = sequence.steps || [];

  return createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-purple-600 text-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{sequence.name}</h2>
              <p className="text-purple-100 mt-1">{sequence.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-purple-100">
                <span className="capitalize">{sequence.type.replace('_', ' ')}</span>
                <span>•</span>
                <span>{steps.length} steps</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  sequence.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {sequence.status}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-purple-200 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {steps.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No steps configured for this sequence</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Sequence Steps</h3>
              
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={step.id || index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      {/* Step Number */}
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      
                      {/* Step Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStepTypeColor(step.type)}`}>
                            {getStepIcon(step.type)}
                            {step.type.replace('_', ' ').toUpperCase()}
                          </div>
                          
                          {(step.delayHours > 0 || step.delayMinutes > 0) && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {formatDelay(step.delayHours, step.delayMinutes)} delay
                            </div>
                          )}
                          
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            step.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {step.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <h4 className="font-medium text-gray-900 mb-2">{step.name}</h4>
                        
                        {step.description && (
                          <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                        )}
                        
                        {step.subject && (
                          <div className="mb-3">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subject</label>
                            <p className="text-sm text-gray-900 mt-1">{step.subject}</p>
                          </div>
                        )}
                        
                        {step.content && (
                          <div className="mb-3">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Content</label>
                            <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                              <div 
                                className="text-sm text-gray-900 whitespace-pre-wrap"
                                dangerouslySetInnerHTML={{ __html: step.htmlContent || step.content }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {step.variables && step.variables.length > 0 && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Variables Used</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {step.variables.map((variable, idx) => (
                                <span 
                                  key={idx}
                                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700"
                                >
                                  {variable}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Sequence Settings */}
              {sequence.timing && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Sequence Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900">Auto Advance</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {sequence.timing.autoAdvance ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900">Business Hours Only</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {sequence.timing.businessHoursOnly ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900">Default Delay</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {sequence.timing.defaultDelay} hours
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900">Timezone</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {sequence.timing.timezone || 'UTC'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Analytics */}
              {sequence.analytics && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Performance</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">
                        {sequence.analytics.totalSent || 0}
                      </div>
                      <div className="text-sm text-blue-600">Total Sent</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600">
                        {sequence.analytics.totalResponses || 0}
                      </div>
                      <div className="text-sm text-green-600">Responses</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="text-2xl font-bold text-purple-600">
                        {sequence.analytics.totalSent && sequence.analytics.totalResponses
                          ? `${Math.round((sequence.analytics.totalResponses / sequence.analytics.totalSent) * 100)}%`
                          : 'N/A'
                        }
                      </div>
                      <div className="text-sm text-purple-600">Response Rate</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <div className="text-2xl font-bold text-orange-600">
                        {sequence.usageCount || 0}
                      </div>
                      <div className="text-sm text-orange-600">Times Used</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {onEdit && (
            <button
              onClick={() => {
                onEdit(sequence);
                onClose();
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Edit Sequence
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SequencePreviewModal;

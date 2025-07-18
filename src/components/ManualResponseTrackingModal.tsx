import React, { useState } from 'react';
import { X, Phone, MessageSquare, Mail, Linkedin } from 'lucide-react';
import { useTrackCandidateResponse } from '../hooks/useResponseTracking';

interface ManualResponseTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  executionId: string;
  candidateName: string;
  sequenceName: string;
}

type ResponseType = 'email_reply' | 'phone_answer' | 'linkedin_message' | 'linkedin_accept';

const ManualResponseTrackingModal: React.FC<ManualResponseTrackingModalProps> = ({
  isOpen,
  onClose,
  executionId,
  candidateName,
  sequenceName
}) => {
  const [responseType, setResponseType] = useState<ResponseType>('email_reply');
  const [responseText, setResponseText] = useState('');
  const [notes, setNotes] = useState('');
  
  const trackResponseMutation = useTrackCandidateResponse();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await trackResponseMutation.mutateAsync({
        executionId,
        responseData: {
          type: responseType,
          data: {
            responseText: responseText.trim() || undefined,
            notes: notes.trim() || undefined,
            timestamp: new Date().toISOString(),
            source: 'manual_tracking'
          },
          timestamp: new Date().toISOString()
        }
      });
      
      onClose();
      setResponseText('');
      setNotes('');
    } catch (error) {
      console.error('Error tracking response:', error);
    }
  };

  const responseTypeOptions = [
    { value: 'email_reply', label: 'Email Reply', icon: Mail, description: 'Candidate replied to email' },
    { value: 'phone_answer', label: 'Phone Call', icon: Phone, description: 'Spoke with candidate by phone' },
    { value: 'linkedin_message', label: 'LinkedIn Message', icon: MessageSquare, description: 'Candidate sent LinkedIn message' },
    { value: 'linkedin_accept', label: 'LinkedIn Connection', icon: Linkedin, description: 'Candidate accepted LinkedIn connection' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Track Response</h2>
            <p className="text-sm text-gray-600 mt-1">
              {candidateName} • {sequenceName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Response Type
            </label>
            <div className="space-y-2">
              {responseTypeOptions.map(({ value, label, icon: Icon, description }) => (
                <label key={value} className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="responseType"
                    value={value}
                    checked={responseType === value}
                    onChange={(e) => setResponseType(e.target.value as ResponseType)}
                    className="mt-1 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <Icon className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{label}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="responseText" className="block text-sm font-medium text-gray-700 mb-2">
              Response Content (Optional)
            </label>
            <textarea
              id="responseText"
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
              placeholder="What did the candidate say or do?"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
              placeholder="Any additional notes about this interaction..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={trackResponseMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {trackResponseMutation.isPending ? 'Tracking...' : 'Track Response'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualResponseTrackingModal;

import React, { useState } from 'react';
import { Eye, Mail, Phone, MessageSquare, Linkedin, Calendar, User, ArrowRight } from 'lucide-react';
import ManualResponseTrackingModal from './ManualResponseTrackingModal';

interface ResponseEvent {
  id: string;
  type: 'email_open' | 'email_reply' | 'linkedin_accept' | 'linkedin_message' | 'phone_answer';
  timestamp: string;
  source: 'tracking_pixel' | 'manual_tracking' | 'webhook' | 'chrome_extension';
  data?: any;
}

interface SequenceExecution {
  id: string;
  candidateName: string;
  candidateEmail: string;
  stepTitle: string;
  sequenceName: string;
  status: 'pending' | 'sent' | 'responded' | 'stopped';
  emailOpened: boolean;
  emailOpenedAt?: string;
  emailReplied: boolean;
  emailRepliedAt?: string;
  linkedinConnectionAccepted: boolean;
  linkedinConnectionAcceptedAt?: string;
  responseEvents?: ResponseEvent[];
  lastActionAt: string;
}

interface ResponseTrackingTableProps {
  executions: SequenceExecution[];
  onRefresh?: () => void;
}

const ResponseTrackingTable: React.FC<ResponseTrackingTableProps> = ({ 
  executions, 
  onRefresh 
}) => {
  const [selectedExecution, setSelectedExecution] = useState<SequenceExecution | null>(null);

  const getResponseIcon = (type: string) => {
    switch (type) {
      case 'email_open': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'email_reply': return <Mail className="h-4 w-4 text-green-500" />;
      case 'phone_answer': return <Phone className="h-4 w-4 text-purple-500" />;
      case 'linkedin_message': return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'linkedin_accept': return <Linkedin className="h-4 w-4 text-blue-700" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'pending':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
      case 'sent':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Sent</span>;
      case 'responded':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Responded</span>;
      case 'stopped':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Stopped</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Unknown</span>;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getResponseSummary = (execution: SequenceExecution) => {
    const responses = [];
    if (execution.emailOpened) responses.push('Opened');
    if (execution.emailReplied) responses.push('Replied');
    if (execution.linkedinConnectionAccepted) responses.push('Connected');
    return responses.length > 0 ? responses.join(', ') : 'No response';
  };

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Response Tracking</h3>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3 py-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Refresh
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sequence / Step
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Responses
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {executions.map((execution) => (
              <tr key={execution.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {execution.candidateName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {execution.candidateEmail}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{execution.sequenceName}</div>
                  <div className="text-sm text-gray-500">{execution.stepTitle}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(execution.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {execution.emailOpened && (
                      <div className="flex items-center space-x-1" title="Email opened">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span className="text-xs text-gray-600">
                          {execution.emailOpenedAt && formatTimestamp(execution.emailOpenedAt)}
                        </span>
                      </div>
                    )}
                    {execution.emailReplied && (
                      <div className="flex items-center space-x-1" title="Email replied">
                        <Mail className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-gray-600">
                          {execution.emailRepliedAt && formatTimestamp(execution.emailRepliedAt)}
                        </span>
                      </div>
                    )}
                    {execution.linkedinConnectionAccepted && (
                      <div className="flex items-center space-x-1" title="LinkedIn connected">
                        <Linkedin className="h-4 w-4 text-blue-700" />
                        <span className="text-xs text-gray-600">
                          {execution.linkedinConnectionAcceptedAt && formatTimestamp(execution.linkedinConnectionAcceptedAt)}
                        </span>
                      </div>
                    )}
                    {!execution.emailOpened && !execution.emailReplied && !execution.linkedinConnectionAccepted && (
                      <span className="text-sm text-gray-500">No responses</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatTimestamp(execution.lastActionAt)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setSelectedExecution(execution)}
                    className="text-purple-600 hover:text-purple-900 flex items-center space-x-1"
                  >
                    <span>Track Response</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {executions.length === 0 && (
        <div className="px-6 py-12 text-center">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No executions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start a sequence to begin tracking candidate responses.
          </p>
        </div>
      )}

      {selectedExecution && (
        <ManualResponseTrackingModal
          isOpen={true}
          onClose={() => setSelectedExecution(null)}
          executionId={selectedExecution.id}
          candidateName={selectedExecution.candidateName}
          sequenceName={selectedExecution.sequenceName}
        />
      )}
    </div>
  );
};

export default ResponseTrackingTable;

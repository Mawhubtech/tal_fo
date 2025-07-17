import React, { useState } from 'react';
import { 
  Eye, Edit, Pause, Play, Trash2, Users, Mail, 
  MessageSquare, Calendar, TrendingUp, AlertCircle, 
  CheckCircle, Clock, Settings
} from 'lucide-react';
import { EmailCampaignDetailsModal } from './EmailCampaignDetailsModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface EmailCampaignCardProps {
  campaign: {
    id: string;
    name: string;
    status: 'active' | 'paused' | 'scheduled' | 'completed' | 'draft';
    template: string;
    recipients: number;
    sent: number;
    opened: number;
    replied: number;
    clicked: number;
    scheduled?: Date;
    lastActivity?: Date | null;
    stages?: string[];
  };
  onEdit: () => void;
  onPause: () => void;
  onDelete: (id: string) => Promise<void>;
}

export const EmailCampaignCard: React.FC<EmailCampaignCardProps> = ({
  campaign,
  onEdit,
  onPause,
  onDelete,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(campaign.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete campaign:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-600" />;
      case 'scheduled': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-gray-600" />;
      case 'draft': return <Settings className="w-4 h-4 text-gray-500" />;
      default: return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'paused': return 'bg-yellow-100 text-yellow-700';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'draft': return 'bg-gray-100 text-gray-600';
      default: return 'bg-red-100 text-red-700';
    }
  };

  const openRate = campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0;
  const replyRate = campaign.sent > 0 ? Math.round((campaign.replied / campaign.sent) * 100) : 0;
  const clickRate = campaign.sent > 0 ? Math.round((campaign.clicked / campaign.sent) * 100) : 0;

  const formatDate = (date?: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
            <div className="flex items-center gap-2">
              {getStatusIcon(campaign.status)}
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                {campaign.status}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Template:</span> {campaign.template}
          </p>
          {campaign.stages && campaign.stages.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-gray-500">Target stages:</span>
              {campaign.stages.map((stage, index) => (
                <span key={index} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                  {stage}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">Recipients</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{campaign.recipients}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Mail className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-600">Sent</span>
          </div>
          <p className="text-xl font-bold text-purple-600">{campaign.sent}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Eye className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-600">Opened</span>
          </div>
          <p className="text-xl font-bold text-green-600">{campaign.opened}</p>
          <p className="text-xs text-gray-500">{openRate}%</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <MessageSquare className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-600">Replied</span>
          </div>
          <p className="text-xl font-bold text-purple-600">{campaign.replied}</p>
          <p className="text-xs text-gray-500">{replyRate}%</p>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Performance</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              {clickRate}% CTR
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(replyRate * 2, 100)}%` }}
          />
        </div>
      </div>

      {/* Metadata */}
      <div className="text-xs text-gray-500 space-y-1 mb-4">
        {campaign.scheduled && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Scheduled: {formatDate(campaign.scheduled)}
          </div>
        )}
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Last activity: {formatDate(campaign.lastActivity)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => setShowDetails(true)}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Edit Campaign"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onPause}
            disabled={campaign.status === 'completed' || campaign.status === 'draft'}
            className={`p-2 rounded-lg transition-colors ${
              campaign.status === 'completed' || campaign.status === 'draft'
                ? 'text-gray-400 cursor-not-allowed'
                : campaign.status === 'active' 
                  ? 'text-yellow-600 hover:bg-yellow-50' 
                  : 'text-green-600 hover:bg-green-50'
            }`}
            title={
              campaign.status === 'completed' ? 'Campaign completed' :
              campaign.status === 'draft' ? 'Campaign in draft' :
              campaign.status === 'active' ? 'Pause Campaign' : 'Resume Campaign'
            }
          >
            {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowDetails(true)}
            className="px-3 py-1 text-sm bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors"
          >
            View Details
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Campaign"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modals */}
      {showDetails && (
        <EmailCampaignDetailsModal
          campaign={campaign}
          onClose={() => setShowDetails(false)}
          onEdit={() => {
            setShowDetails(false);
            onEdit();
          }}
          onPause={() => {
            setShowDetails(false);
            onPause();
          }}
        />
      )}

      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Email Campaign"
        message={`Are you sure you want to delete the campaign "${campaign.name}"? This action cannot be undone and will stop all scheduled emails.`}
        confirmText="Delete Campaign"
      />
    </div>
  );
};

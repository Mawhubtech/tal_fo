import React from 'react';
import {
  X, Calendar, Users, Mail, Eye, MessageSquare, TrendingUp,
  Clock, Tag, Target, Settings, CheckCircle, Pause, Play,
  AlertCircle
} from 'lucide-react';

interface EmailCampaignDetailsModalProps {
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
  onClose: () => void;
  onEdit?: () => void;
  onPause?: () => void;
}

export const EmailCampaignDetailsModal: React.FC<EmailCampaignDetailsModalProps> = ({
  campaign,
  onClose,
  onEdit,
  onPause,
}) => {
  const openRate = campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0;
  const replyRate = campaign.sent > 0 ? Math.round((campaign.replied / campaign.sent) * 100) : 0;
  const clickRate = campaign.sent > 0 ? Math.round((campaign.clicked / campaign.sent) * 100) : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'paused': return <Pause className="w-5 h-5 text-yellow-600" />;
      case 'scheduled': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-gray-600" />;
      case 'draft': return <Settings className="w-5 h-5 text-gray-500" />;
      default: return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'draft': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  const formatDate = (date?: Date | null) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">{campaign.name}</h2>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(campaign.status)}`}>
                {getStatusIcon(campaign.status)}
                <span className="text-sm font-medium capitalize">{campaign.status}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="space-y-8">
            {/* Campaign Overview */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Template</p>
                      <p className="text-gray-900">{campaign.template}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Total Recipients</p>
                      <p className="text-gray-900 text-lg font-semibold">{campaign.recipients}</p>
                    </div>
                  </div>

                  {campaign.scheduled && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Scheduled Date</p>
                        <p className="text-gray-900">{formatDate(campaign.scheduled)}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Clock className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Last Activity</p>
                      <p className="text-gray-900">{formatDate(campaign.lastActivity)}</p>
                    </div>
                  </div>
                </div>

                {/* Target Stages */}
                {campaign.stages && campaign.stages.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Tag className="w-5 h-5 text-purple-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Target Stages</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {campaign.stages.map((stage, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full border border-purple-200"
                        >
                          {stage}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Metrics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Emails Sent</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">{campaign.sent}</p>
                  <p className="text-xs text-purple-600">out of {campaign.recipients} recipients</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Opened</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">{campaign.opened}</p>
                  <p className="text-xs text-green-600">{openRate}% open rate</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Replied</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">{campaign.replied}</p>
                  <p className="text-xs text-purple-600">{replyRate}% reply rate</p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">Clicked</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-900">{campaign.clicked}</p>
                  <p className="text-xs text-orange-600">{clickRate}% click rate</p>
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Open Rate</span>
                    <span>{openRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${openRate}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Reply Rate</span>
                    <span>{replyRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${replyRate}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Click Rate</span>
                    <span>{clickRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${clickRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Recipient Details Section */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Recipient Details
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Total Targeted</span>
                  </div>
                  <p className="text-xl font-bold text-blue-900">{campaign.recipients}</p>
                  <p className="text-xs text-blue-600">candidates selected</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Emails Sent</span>
                  </div>
                  <p className="text-xl font-bold text-purple-900">{campaign.sent}</p>
                  <p className="text-xs text-purple-600">
                    {campaign.recipients > 0 ? Math.round((campaign.sent / campaign.recipients) * 100) : 0}% delivered
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-700">Pending</span>
                  </div>
                  <p className="text-xl font-bold text-yellow-900">{campaign.recipients - campaign.sent}</p>
                  <p className="text-xs text-yellow-600">awaiting delivery</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Engaged</span>
                  </div>
                  <p className="text-xl font-bold text-green-900">{campaign.opened + campaign.replied}</p>
                  <p className="text-xs text-green-600">opened or replied</p>
                </div>
              </div>

              {/* Pipeline Stages */}
              {campaign.stages && campaign.stages.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Target Pipeline Stages</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {campaign.stages.map((stage, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full border border-purple-200"
                      >
                        {stage}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Campaign targets candidates in these pipeline stages
                  </p>
                </div>
              )}

              {/* Campaign Timeline */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Campaign Timeline</span>
                </div>
                <div className="space-y-2 text-sm">
                  {campaign.scheduled && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Scheduled:</span>
                      <span className="text-gray-900">{campaign.scheduled.toLocaleDateString()}</span>
                    </div>
                  )}
                  {campaign.lastActivity && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Activity:</span>
                      <span className="text-gray-900">{campaign.lastActivity.toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(campaign.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Campaign ID: {campaign.id}
            </div>
            <div className="flex items-center gap-3">
              {onPause && campaign.status !== 'completed' && campaign.status !== 'draft' && (
                <button
                  onClick={onPause}
                  className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    campaign.status === 'active'
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {campaign.status === 'active' ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Campaign
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Resume Campaign
                    </>
                  )}
                </button>
              )}
              
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Campaign
                </button>
              )}
              
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Mail, 
  Plus,
  Trash2,
  Settings,
  Users
} from 'lucide-react';
import { useProjects } from '../../hooks/useClientOutreach';
import LoadingSpinner from '../../components/LoadingSpinner';

const CreateEmailCampaignPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useProjects();
  
  const project = projects.find(p => p.id.toString() === id);

  const [campaignData, setCampaignData] = useState({
    name: '',
    description: '',
    type: 'initial_outreach' as 'initial_outreach' | 'follow_up' | 'nurture' | 'promotional',
    status: 'draft' as 'draft' | 'active' | 'paused',
    emails: [] as Array<{
      id: string;
      subject: string;
      content: string;
      delay: number;
      delayUnit: 'hours' | 'days';
    }>
  });

  const [currentEmail, setCurrentEmail] = useState({
    subject: '',
    content: '',
    delay: 1,
    delayUnit: 'days' as 'hours' | 'days'
  });

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

  const handleAddEmail = () => {
    if (currentEmail.subject.trim() && currentEmail.content.trim()) {
      const newEmail = {
        ...currentEmail,
        id: Date.now().toString()
      };
      setCampaignData(prev => ({
        ...prev,
        emails: [...prev.emails, newEmail]
      }));
      setCurrentEmail({
        subject: '',
        content: '',
        delay: 1,
        delayUnit: 'days'
      });
    }
  };

  const handleRemoveEmail = (emailId: string) => {
    setCampaignData(prev => ({
      ...prev,
      emails: prev.emails.filter(email => email.id !== emailId)
    }));
  };

  const handleSaveCampaign = () => {
    // TODO: Implement campaign saving logic
    console.log('Saving campaign:', campaignData);
    navigate(`/dashboard/client-outreach/projects/${id}/campaigns`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/dashboard/client-outreach/projects/${id}/campaigns`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Campaigns
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Email Campaign</h1>
              <p className="text-gray-600 mt-1">
                Create a new email campaign for {project.name}
              </p>
            </div>
            
            <button
              onClick={handleSaveCampaign}
              disabled={!campaignData.name.trim() || campaignData.emails.length === 0}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Campaign
            </button>
          </div>
        </div>

        {/* Campaign Settings */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Campaign Settings</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={campaignData.name}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter campaign name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Type
                </label>
                <select
                  value={campaignData.type}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="initial_outreach">Initial Outreach</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="nurture">Nurture</option>
                  <option value="promotional">Promotional</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={campaignData.description}
                onChange={(e) => setCampaignData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the purpose and goals of this campaign"
              />
            </div>
          </div>
        </div>

        {/* Email Builder */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Email Builder</h2>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject *
              </label>
              <input
                type="text"
                value={currentEmail.subject}
                onChange={(e) => setCurrentEmail(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email subject"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Content *
              </label>
              <textarea
                value={currentEmail.content}
                onChange={(e) => setCurrentEmail(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Write your email content here..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delay Amount
                </label>
                <input
                  type="number"
                  min="1"
                  value={currentEmail.delay}
                  onChange={(e) => setCurrentEmail(prev => ({ ...prev, delay: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delay Unit
                </label>
                <select
                  value={currentEmail.delayUnit}
                  onChange={(e) => setCurrentEmail(prev => ({ ...prev, delayUnit: e.target.value as 'hours' | 'days' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={handleAddEmail}
                  disabled={!currentEmail.subject.trim() || !currentEmail.content.trim()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Email
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Email List */}
        {campaignData.emails.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Campaign Emails ({campaignData.emails.length})</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {campaignData.emails.map((email, index) => (
                  <div key={email.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="font-medium text-gray-900">{email.subject}</h3>
                          <p className="text-sm text-gray-500">
                            Sends {email.delay} {email.delayUnit} after {index === 0 ? 'enrollment' : 'previous email'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveEmail(email.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-sm text-gray-600 line-clamp-3">{email.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateEmailCampaignPage;

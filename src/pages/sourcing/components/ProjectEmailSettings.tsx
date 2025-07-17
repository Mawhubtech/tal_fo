import React, { useState } from 'react';
import { X, Save, Mail, Clock, Users, Settings, AlertCircle, CheckCircle } from 'lucide-react';

interface ProjectEmailSettingsProps {
  projectId: string;
  onClose: () => void;
}

export const ProjectEmailSettings: React.FC<ProjectEmailSettingsProps> = ({
  projectId,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'automation' | 'providers'>('general');
  
  // Mock settings data - replace with actual API calls
  const [settings, setSettings] = useState({
    general: {
      fromName: 'TAL Recruiting Team',
      fromEmail: 'recruiting@tal.com',
      replyToEmail: 'noreply@tal.com',
      emailSignature: `Best regards,\nTAL Recruiting Team\n\nPhone: +1 (555) 123-4567\nEmail: recruiting@tal.com\nWebsite: www.tal.com`,
      trackOpens: true,
      trackClicks: true,
      enableUnsubscribe: true,
    },
    automation: {
      enableAutomation: true,
      defaultDelay: 24, // hours
      maxFollowUps: 3,
      respectedBusinessHours: true,
      businessHoursStart: '09:00',
      businessHoursEnd: '17:00',
      workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      timezone: 'America/New_York',
    },
    providers: {
      primaryProvider: 'gmail',
      fallbackProvider: 'smtp',
      providers: [
        { id: 'gmail', name: 'Gmail', status: 'connected', isDefault: true },
        { id: 'outlook', name: 'Outlook', status: 'disconnected', isDefault: false },
        { id: 'smtp', name: 'SMTP', status: 'configured', isDefault: false },
      ]
    }
  });

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving settings for project:', projectId, settings);
    onClose();
  };

  const getProviderStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'configured': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'disconnected': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Email Settings</h2>
              <p className="text-gray-600 mt-1">Configure email settings for this project</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6">
            {[
              { key: 'general', label: 'General', icon: Settings },
              { key: 'automation', label: 'Automation', icon: Clock },
              { key: 'providers', label: 'Providers', icon: Mail },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`${
                  activeTab === tab.key
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Name
                  </label>
                  <input
                    type="text"
                    value={settings.general.fromName}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, fromName: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Email
                  </label>
                  <input
                    type="email"
                    value={settings.general.fromEmail}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, fromEmail: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reply-To Email
                  </label>
                  <input
                    type="email"
                    value={settings.general.replyToEmail}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, replyToEmail: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Signature
                </label>
                <textarea
                  rows={6}
                  value={settings.general.emailSignature}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, emailSignature: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Tracking Options</h3>
                <div className="space-y-3">
                  {[
                    { key: 'trackOpens', label: 'Track email opens', description: 'Monitor when recipients open emails' },
                    { key: 'trackClicks', label: 'Track link clicks', description: 'Monitor when recipients click links in emails' },
                    { key: 'enableUnsubscribe', label: 'Include unsubscribe link', description: 'Add unsubscribe option to all emails' },
                  ].map((option) => (
                    <div key={option.key} className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={settings.general[option.key as keyof typeof settings.general] as boolean}
                        onChange={(e) => setSettings({
                          ...settings,
                          general: { ...settings.general, [option.key]: e.target.checked }
                        })}
                        className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{option.label}</p>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Automation Settings */}
          {activeTab === 'automation' && (
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={settings.automation.enableAutomation}
                  onChange={(e) => setSettings({
                    ...settings,
                    automation: { ...settings.automation, enableAutomation: e.target.checked }
                  })}
                  className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Enable Email Automation</p>
                  <p className="text-sm text-gray-600">Allow automatic email sending based on stage changes</p>
                </div>
              </div>

              {settings.automation.enableAutomation && (
                <div className="space-y-6 ml-7">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Delay (hours)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="168"
                        value={settings.automation.defaultDelay}
                        onChange={(e) => setSettings({
                          ...settings,
                          automation: { ...settings.automation, defaultDelay: parseInt(e.target.value) }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Follow-ups
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={settings.automation.maxFollowUps}
                        onChange={(e) => setSettings({
                          ...settings,
                          automation: { ...settings.automation, maxFollowUps: parseInt(e.target.value) }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={settings.automation.respectedBusinessHours}
                      onChange={(e) => setSettings({
                        ...settings,
                        automation: { ...settings.automation, respectedBusinessHours: e.target.checked }
                      })}
                      className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Respect Business Hours</p>
                      <p className="text-sm text-gray-600">Only send emails during specified business hours</p>
                    </div>
                  </div>

                  {settings.automation.respectedBusinessHours && (
                    <div className="ml-7 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Hours Start
                          </label>
                          <input
                            type="time"
                            value={settings.automation.businessHoursStart}
                            onChange={(e) => setSettings({
                              ...settings,
                              automation: { ...settings.automation, businessHoursStart: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Hours End
                          </label>
                          <input
                            type="time"
                            value={settings.automation.businessHoursEnd}
                            onChange={(e) => setSettings({
                              ...settings,
                              automation: { ...settings.automation, businessHoursEnd: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Timezone
                          </label>
                          <select
                            value={settings.automation.timezone}
                            onChange={(e) => setSettings({
                              ...settings,
                              automation: { ...settings.automation, timezone: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="America/New_York">Eastern Time</option>
                            <option value="America/Chicago">Central Time</option>
                            <option value="America/Denver">Mountain Time</option>
                            <option value="America/Los_Angeles">Pacific Time</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Work Days
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                            <label key={day} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={settings.automation.workDays.includes(day)}
                                onChange={(e) => {
                                  const workDays = e.target.checked
                                    ? [...settings.automation.workDays, day]
                                    : settings.automation.workDays.filter(d => d !== day);
                                  setSettings({
                                    ...settings,
                                    automation: { ...settings.automation, workDays }
                                  });
                                }}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700 capitalize">{day.slice(0, 3)}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Providers Settings */}
          {activeTab === 'providers' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Email Providers</h3>
                <div className="space-y-4">
                  {settings.providers.providers.map((provider) => (
                    <div key={provider.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getProviderStatusIcon(provider.status)}
                        <div>
                          <p className="font-medium text-gray-900">{provider.name}</p>
                          <p className="text-sm text-gray-600 capitalize">{provider.status}</p>
                        </div>
                        {provider.isDefault && (
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded">
                          Configure
                        </button>
                        {!provider.isDefault && (
                          <button className="px-3 py-1 text-sm bg-purple-600 text-white hover:bg-purple-700 rounded">
                            Set as Default
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Provider Recommendations</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      For best deliverability, we recommend using Gmail or Outlook for personal outreach, 
                      and configuring SMTP for high-volume campaigns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

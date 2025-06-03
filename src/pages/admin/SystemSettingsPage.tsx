import React, { useState } from 'react';
import { Save, Shield, Bell, Mail, Database, Key, Globe, Users, FileText, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react';

interface SettingsSection {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
}

const SystemSettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    slackIntegration: true,
    weeklyReports: true,
    candidateUpdates: true,
    systemAlerts: true
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: true,
    sessionTimeout: '8',
    passwordExpiry: '90',
    apiRateLimit: '1000',
    ipWhitelist: false
  });

  const sections: SettingsSection[] = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'integrations', name: 'Integrations', icon: Database },
    { id: 'user-management', name: 'User Management', icon: Users },
    { id: 'data-retention', name: 'Data & Privacy', icon: FileText }
  ];

  const toggleNotification = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const renderToggle = (isOn: boolean, onClick: () => void) => (
    <button onClick={onClick} className="flex items-center">
      {isOn ? (
        <ToggleRight className="h-6 w-6 text-green-500" />
      ) : (
        <ToggleLeft className="h-6 w-6 text-gray-400" />
      )}
    </button>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800">
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white rounded-lg border p-4">
          <nav className="space-y-2">
            {sections.map((section) => {
              const IconComponent = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className="h-5 w-5 mr-3" />
                  {section.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white rounded-lg border p-6">
          {/* General Settings */}
          {activeSection === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    defaultValue="TalentAcquisition Corp"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Time Zone
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>America/New_York (EST)</option>
                    <option>America/Chicago (CST)</option>
                    <option>America/Denver (MST)</option>
                    <option>America/Los_Angeles (PST)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Currency
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>USD - US Dollar</option>
                    <option>EUR - Euro</option>
                    <option>GBP - British Pound</option>
                    <option>CAD - Canadian Dollar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Format
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">Two-Factor Authentication</h3>
                      <p className="text-sm text-yellow-700">Require 2FA for all admin users</p>
                    </div>
                  </div>
                  {renderToggle(security.twoFactorAuth, () => setSecurity(prev => ({ ...prev, twoFactorAuth: !prev.twoFactorAuth })))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (hours)
                    </label>
                    <input
                      type="number"
                      value={security.sessionTimeout}
                      onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password Expiry (days)
                    </label>
                    <input
                      type="number"
                      value={security.passwordExpiry}
                      onChange={(e) => setSecurity(prev => ({ ...prev, passwordExpiry: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Rate Limit (requests/hour)
                    </label>
                    <input
                      type="number"
                      value={security.apiRateLimit}
                      onChange={(e) => setSecurity(prev => ({ ...prev, apiRateLimit: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">IP Whitelist</h3>
                    <p className="text-sm text-gray-600">Restrict access to specific IP addresses</p>
                  </div>
                  {renderToggle(security.ipWhitelist, () => setSecurity(prev => ({ ...prev, ipWhitelist: !prev.ipWhitelist })))}
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email Alerts</h3>
                    <p className="text-sm text-gray-600">Send important notifications via email</p>
                  </div>
                  {renderToggle(notifications.emailAlerts, () => toggleNotification('emailAlerts'))}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">SMS Alerts</h3>
                    <p className="text-sm text-gray-600">Send critical alerts via SMS</p>
                  </div>
                  {renderToggle(notifications.smsAlerts, () => toggleNotification('smsAlerts'))}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Slack Integration</h3>
                    <p className="text-sm text-gray-600">Post notifications to Slack channels</p>
                  </div>
                  {renderToggle(notifications.slackIntegration, () => toggleNotification('slackIntegration'))}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Weekly Reports</h3>
                    <p className="text-sm text-gray-600">Automated weekly performance reports</p>
                  </div>
                  {renderToggle(notifications.weeklyReports, () => toggleNotification('weeklyReports'))}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Candidate Updates</h3>
                    <p className="text-sm text-gray-600">Notifications for candidate status changes</p>
                  </div>
                  {renderToggle(notifications.candidateUpdates, () => toggleNotification('candidateUpdates'))}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">System Alerts</h3>
                    <p className="text-sm text-gray-600">Critical system health notifications</p>
                  </div>
                  {renderToggle(notifications.systemAlerts, () => toggleNotification('systemAlerts'))}
                </div>
              </div>
            </div>
          )}

          {/* Integrations Settings */}
          {activeSection === 'integrations' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Integration Settings</h2>

              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">                      <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                        <Database className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Database</h3>
                        <p className="text-sm text-gray-600">PostgreSQL connection settings</p>
                      </div>
                    </div>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Connected
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Host</label>
                      <input
                        type="text"
                        defaultValue="localhost"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Port</label>
                      <input
                        type="text"
                        defaultValue="5432"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <Mail className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Email Service</h3>
                        <p className="text-sm text-gray-600">SMTP configuration for email delivery</p>
                      </div>
                    </div>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">SMTP Server</label>
                      <input
                        type="text"
                        defaultValue="smtp.gmail.com"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Port</label>
                      <input
                        type="text"
                        defaultValue="587"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                        <Key className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">API Keys</h3>
                        <p className="text-sm text-gray-600">External service API configurations</p>
                      </div>
                    </div>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Needs Update
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">LinkedIn API Key</label>
                      <input
                        type="password"
                        defaultValue="••••••••••••••••"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Indeed API Key</label>
                      <input
                        type="password"
                        defaultValue="••••••••••••••••"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Management Settings */}
          {activeSection === 'user-management' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">User Management Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default User Role
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Recruiter</option>
                    <option>Admin</option>
                    <option>Manager</option>
                    <option>Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Lockout Threshold (failed attempts)
                  </label>
                  <input
                    type="number"
                    defaultValue={5}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Auto-approve New Users</h3>
                    <p className="text-sm text-gray-600">Automatically activate new user accounts</p>
                  </div>
                  {renderToggle(false, () => {})}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Self-registration</h3>
                    <p className="text-sm text-gray-600">Allow users to create their own accounts</p>
                  </div>
                  {renderToggle(true, () => {})}
                </div>
              </div>
            </div>
          )}

          {/* Data & Privacy Settings */}
          {activeSection === 'data-retention' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Data & Privacy Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Candidate Data Retention (months)
                  </label>
                  <input
                    type="number"
                    defaultValue={24}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">How long to keep candidate data after last activity</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Data Retention (months)
                  </label>
                  <input
                    type="number"
                    defaultValue={36}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">How long to keep job posting data</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">GDPR Compliance</h3>
                    <p className="text-sm text-gray-600">Enable GDPR data protection features</p>
                  </div>
                  {renderToggle(true, () => {})}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Data Anonymization</h3>
                    <p className="text-sm text-gray-600">Automatically anonymize expired candidate data</p>
                  </div>
                  {renderToggle(true, () => {})}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Audit Logging</h3>
                    <p className="text-sm text-gray-600">Log all system activities for compliance</p>
                  </div>
                  {renderToggle(true, () => {})}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsPage;

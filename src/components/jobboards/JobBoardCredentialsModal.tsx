import React, { useState } from 'react';
import { X, Eye, EyeOff, Key, Globe, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useJobBoardConfig, useTestJobBoardConnection } from '../../hooks/useJobBoards';
import type { JobBoardConfig, OrganizationJobBoard } from '../../services/jobBoardApiService';

interface JobBoardCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobBoardId: string;
  organizationId: string;
  existingConfig?: OrganizationJobBoard;
  onSave: (credentials: { [key: string]: string }, settings: OrganizationJobBoard['settings']) => Promise<void>;
}

const JobBoardCredentialsModal: React.FC<JobBoardCredentialsModalProps> = ({
  isOpen,
  onClose,
  jobBoardId,
  organizationId,
  existingConfig,
  onSave
}) => {
  const [credentials, setCredentials] = useState<{ [key: string]: string }>(() => {
    if (existingConfig?.credentials.fields) {
      // Don't pre-fill sensitive fields for security
      const fields = { ...existingConfig.credentials.fields };
      Object.keys(fields).forEach(key => {
        if (key.toLowerCase().includes('password') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('key')) {
          fields[key] = '';
        }
      });
      return fields;
    }
    return {};
  });

  const [settings, setSettings] = useState<OrganizationJobBoard['settings']>(() => 
    existingConfig?.settings || {
      autoPost: false,
      requireApproval: true,
      syncFrequency: 'daily',
      notifications: {
        onNewResponse: true,
        onSyncError: true,
        onBudgetAlert: true
      }
    }
  );

  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    features: string[];
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: jobBoardConfig, isLoading: configLoading } = useJobBoardConfig(jobBoardId);
  const testConnection = useTestJobBoardConnection();

  const handleCredentialChange = (fieldName: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [fieldName]: value
    }));
    // Clear test results when credentials change
    setTestResult(null);
  };

  const handleSettingsChange = (key: keyof OrganizationJobBoard['settings'], value: any) => {
    if (key === 'notifications') {
      setSettings(prev => ({
        ...prev,
        notifications: { ...prev.notifications, ...value }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const handleTestConnection = async () => {
    if (!organizationId || !jobBoardId) return;
    
    try {
      const result = await testConnection.mutateAsync({
        organizationId,
        jobBoardId
      });
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to test connection. Please check your credentials.',
        features: []
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(credentials, settings);
      onClose();
    } catch (error) {
      console.error('Failed to save job board configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isPasswordField = (fieldName: string) => {
    return fieldName.toLowerCase().includes('password') || 
           fieldName.toLowerCase().includes('secret') || 
           fieldName.toLowerCase().includes('key');
  };

  const getFieldType = (fieldConfig: JobBoardConfig['fields'][string], fieldName: string) => {
    if (fieldConfig.type === 'password' || isPasswordField(fieldName)) {
      return showPasswords[fieldName] ? 'text' : 'password';
    }
    return fieldConfig.type === 'email' ? 'email' : fieldConfig.type === 'url' ? 'url' : 'text';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Globe className="w-6 h-6 text-purple-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {existingConfig ? 'Update' : 'Configure'} Job Board
              </h2>
              <p className="text-sm text-gray-500">
                {jobBoardConfig?.name || jobBoardId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {configLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Loading configuration...</span>
            </div>
          ) : (
            <>
              {/* Credentials Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  Credentials
                </h3>
                <div className="space-y-4">
                  {jobBoardConfig?.fields && Object.entries(jobBoardConfig.fields).map(([fieldName, fieldConfig]) => (
                    <div key={fieldName}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {fieldConfig.label}
                        {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <div className="relative">
                        <input
                          type={getFieldType(fieldConfig, fieldName)}
                          value={credentials[fieldName] || ''}
                          onChange={(e) => handleCredentialChange(fieldName, e.target.value)}
                          placeholder={fieldConfig.placeholder}
                          required={fieldConfig.required}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                        />
                        {(fieldConfig.type === 'password' || isPasswordField(fieldName)) && (
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(fieldName)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords[fieldName] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Test Connection */}
                <div className="mt-4">
                  <button
                    onClick={handleTestConnection}
                    disabled={testConnection.isPending}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testConnection.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Globe className="w-4 h-4 mr-2" />
                    )}
                    Test Connection
                  </button>

                  {testResult && (
                    <div className={`mt-3 p-3 rounded-lg flex items-start ${
                      testResult.success 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {testResult.success ? (
                        <Check className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium">{testResult.message}</p>
                        {testResult.success && testResult.features.length > 0 && (
                          <div className="mt-1">
                            <p className="text-sm">Available features:</p>
                            <ul className="text-sm list-disc list-inside mt-1">
                              {testResult.features.map((feature, index) => (
                                <li key={index}>{feature}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Settings Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Posting Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Auto-posting</label>
                      <p className="text-sm text-gray-500">Automatically post approved jobs</p>
                    </div>
                    <button
                      onClick={() => handleSettingsChange('autoPost', !settings.autoPost)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.autoPost ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.autoPost ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Require approval</label>
                      <p className="text-sm text-gray-500">Jobs must be approved before posting</p>
                    </div>
                    <button
                      onClick={() => handleSettingsChange('requireApproval', !settings.requireApproval)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.requireApproval ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.requireApproval ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sync frequency
                    </label>
                    <select
                      value={settings.syncFrequency}
                      onChange={(e) => handleSettingsChange('syncFrequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    >
                      <option value="realtime">Real-time</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notifications Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">New responses</label>
                      <p className="text-sm text-gray-500">Notify when new responses are received</p>
                    </div>
                    <button
                      onClick={() => handleSettingsChange('notifications', { onNewResponse: !settings.notifications.onNewResponse })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications.onNewResponse ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications.onNewResponse ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Sync errors</label>
                      <p className="text-sm text-gray-500">Notify when sync fails</p>
                    </div>
                    <button
                      onClick={() => handleSettingsChange('notifications', { onSyncError: !settings.notifications.onSyncError })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications.onSyncError ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications.onSyncError ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Budget alerts</label>
                      <p className="text-sm text-gray-500">Notify when budget thresholds are reached</p>
                    </div>
                    <button
                      onClick={() => handleSettingsChange('notifications', { onBudgetAlert: !settings.notifications.onBudgetAlert })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications.onBudgetAlert ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications.onBudgetAlert ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || configLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {existingConfig ? 'Update' : 'Configure'} Job Board
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobBoardCredentialsModal;

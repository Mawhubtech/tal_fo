import React, { useState, useEffect } from 'react';
import { toast } from '../components/ToastContainer';
import { 
  GoogleCalendarApiService, 
  GoogleCalendarSyncSettings, 
  SyncResult,
  EnableSyncResponse
} from '../services/googleCalendarApiService';

interface GoogleCalendarSyncProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete?: (result: SyncResult) => void;
}

export const GoogleCalendarSync: React.FC<GoogleCalendarSyncProps> = ({
  isOpen,
  onClose,
  onSyncComplete
}) => {
  const [settings, setSettings] = useState<GoogleCalendarSyncSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [needsReauth, setNeedsReauth] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNeedsReauth(false);
      loadSettings();
    }
  }, [isOpen]);

  // Handle ESC key and body scroll
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Handle ESC key
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        // Restore body scroll
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const syncSettings = await GoogleCalendarApiService.getSyncSettings();
      setSettings(syncSettings);
    } catch (error) {
      console.error('Error loading sync settings:', error);
      toast.error('Failed to load Google Calendar sync settings', 'Could not retrieve sync settings from server');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableSync = async () => {
    try {
      setLoading(true);
      const response: EnableSyncResponse = await GoogleCalendarApiService.enableSync();
      
      if (response.requiresAuth && response.authUrl) {
        // Redirect to Google OAuth for Calendar permissions
        toast.info('Redirecting to Google', 'You will be redirected to grant Calendar permissions');
        window.location.href = response.authUrl;
      } else {
        // Already has permissions
        toast.success('Google Calendar Connected', response.message);
        await loadSettings();
      }
    } catch (error: any) {
      console.error('Error enabling sync:', error);
      toast.error('Connection Failed', error.response?.data?.message || 'Failed to enable Google Calendar sync');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToGoogle = async () => {
    try {
      setSyncing(true);
      setNeedsReauth(false);
      const response = await GoogleCalendarApiService.syncToGoogle();
      setLastSyncResult(response.result);
      toast.success('Sync Complete', `Sync completed: ${response.result.exported} exported, ${response.result.updated} updated`);
      if (onSyncComplete) {
        onSyncComplete(response.result);
      }
    } catch (error: any) {
      console.error('Error syncing to Google:', error);
      const errorMessage = error.response?.data?.message || 'Failed to sync to Google Calendar';
      
      if (errorMessage.includes('Insufficient Google Calendar permissions')) {
        setNeedsReauth(true);
        toast.error('Permissions Required', 'Please reconnect with Google Calendar permissions');
      } else {
        toast.error('Sync Failed', errorMessage);
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncFromGoogle = async () => {
    try {
      setSyncing(true);
      setNeedsReauth(false);
      const response = await GoogleCalendarApiService.syncFromGoogle();
      setLastSyncResult(response.result);
      toast.success('Sync Complete', `Sync completed: ${response.result.imported} imported, ${response.result.updated} updated`);
      if (onSyncComplete) {
        onSyncComplete(response.result);
      }
    } catch (error: any) {
      console.error('Error syncing from Google:', error);
      const errorMessage = error.response?.data?.message || 'Failed to sync from Google Calendar';
      
      if (errorMessage.includes('Insufficient Google Calendar permissions')) {
        setNeedsReauth(true);
        toast.error('Permissions Required', 'Please reconnect with Google Calendar permissions');
      } else {
        toast.error('Sync Failed', errorMessage);
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleFullSync = async () => {
    try {
      setSyncing(true);
      setNeedsReauth(false);
      const response = await GoogleCalendarApiService.fullSync();
      setLastSyncResult(response.result);
      toast.success('Full Sync Complete', `Full sync completed! Imported: ${response.result.imported}, Exported: ${response.result.exported}, Updated: ${response.result.updated}`);
      if (onSyncComplete) {
        onSyncComplete(response.result);
      }
    } catch (error: any) {
      console.error('Error performing full sync:', error);
      const errorMessage = error.response?.data?.message || 'Failed to perform full sync';
      
      if (errorMessage.includes('Insufficient Google Calendar permissions')) {
        setNeedsReauth(true);
        toast.error('Permissions Required', 'Please reconnect with Google Calendar permissions');
      } else {
        toast.error('Full Sync Failed', errorMessage);
      }
    } finally {
      setSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleOverlayClick}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Google Calendar Sync</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading sync settings...</p>
            </div>
          ) : !settings ? (
            <div className="text-center text-gray-600">
              Failed to load sync settings
            </div>
          ) : !settings.isGoogleCalendarConnected ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Google Calendar Permissions Required</h3>
              <p className="text-gray-600 mb-6">
                To sync your calendar events, we need permission to access your Google Calendar. This requires additional permissions beyond your current Google account connection.
              </p>
              <button
                onClick={handleEnableSync}
                disabled={loading}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Requesting Permissions...' : 'Request Calendar Permissions'}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                You will be redirected to Google to grant calendar permissions
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center text-green-600 mb-6">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Google Calendar connected</span>
              </div>

              {needsReauth && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800">
                        Additional Permissions Required
                      </h3>
                      <div className="mt-2 text-sm text-amber-700">
                        <p>Your Google account needs additional Calendar permissions to sync events.</p>
                      </div>
                      <div className="mt-3">
                        <button
                          onClick={handleEnableSync}
                          disabled={loading}
                          className="text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded-md hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {loading ? 'Requesting...' : 'Request Calendar Permissions'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {settings.lastSyncAt && (
                <div className="text-sm text-gray-600 mb-6">
                  Last synced: {new Date(settings.lastSyncAt).toLocaleString()}
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleFullSync}
                  disabled={syncing}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {syncing ? 'Syncing...' : 'Full Two-Way Sync'}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleSyncToGoogle}
                    disabled={syncing}
                    className="px-3 py-2 text-sm border border-purple-300 text-purple-700 rounded-md hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {syncing ? 'Syncing...' : 'Export to Google'}
                  </button>
                  <button
                    onClick={handleSyncFromGoogle}
                    disabled={syncing}
                    className="px-3 py-2 text-sm border border-purple-300 text-purple-700 rounded-md hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {syncing ? 'Syncing...' : 'Import from Google'}
                  </button>
                </div>
              </div>

              {lastSyncResult && (
                <div className="mt-6 p-4 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Last Sync Results:</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Imported: {lastSyncResult.imported} events</div>
                    <div>Exported: {lastSyncResult.exported} events</div>
                    <div>Updated: {lastSyncResult.updated} events</div>
                    {lastSyncResult.conflicts > 0 && (
                      <div className="text-amber-600">Conflicts: {lastSyncResult.conflicts}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full text-gray-700 bg-white border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useJobsWebSocket } from '../hooks/useJobsWebSocket';

/**
 * Temporary debugging component to diagnose WebSocket issues
 * Add this to any page to see WebSocket connection status
 * 
 * Usage:
 * import WebSocketDebugPanel from './components/WebSocketDebugPanel';
 * 
 * // In your component:
 * <WebSocketDebugPanel />
 */
export const WebSocketDebugPanel: React.FC = () => {
  const { user } = useAuthContext();

  const { isConnected } = useJobsWebSocket({
    enabled: !!user,
    onJobCreated: (job) => {
      console.log('🎉 DEBUG: Job created callback triggered:', job);
      alert(`Job Created: ${job.title}`);
    },
    onJobUpdated: (job) => {
      console.log('✏️ DEBUG: Job updated callback triggered:', job);
      alert(`Job Updated: ${job.title}`);
    },
    onJobDeleted: (data) => {
      console.log('🗑️ DEBUG: Job deleted callback triggered:', data);
      alert(`Job Deleted: ${data.jobId}`);
    },
  });

  useEffect(() => {
    console.log('=== WEBSOCKET DEBUG INFO ===');
    console.log('User:', user);
    console.log('WebSocket Enabled:', !!user);
    console.log('WebSocket Connected:', isConnected);
    console.log('===========================');
  }, [user, isConnected]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: isConnected ? '#10b981' : '#ef4444',
        color: 'white',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        zIndex: 9999,
        fontFamily: 'monospace',
        fontSize: '12px',
        maxWidth: '300px',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
        WebSocket Debug Panel
      </div>
      <div style={{ marginBottom: '4px' }}>
        <strong>Status:</strong> {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
      <div style={{ marginBottom: '4px' }}>
        <strong>User:</strong> {user?.email || 'N/A'}
      </div>
      <div style={{ marginBottom: '4px' }}>
        <strong>User ID:</strong> {user?.id || 'N/A'}
      </div>
      <div style={{ fontSize: '10px', marginTop: '8px', opacity: 0.9 }}>
        Broadcasting to all authenticated users
      </div>
      <div style={{ fontSize: '10px', opacity: 0.9 }}>
        Check console for detailed logs
      </div>
    </div>
  );
};

export default WebSocketDebugPanel;

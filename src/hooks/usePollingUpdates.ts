import { useEffect, useRef, useState } from 'react';
import { Comment, TeamMember } from '../components/CollaborativeSidePanel';

interface UsePollingUpdatesProps {
  jobId: string;
  currentUserId: string;
  enabled: boolean;
  pollInterval?: number; // in milliseconds, default 5000 (5 seconds)
  onCommentsUpdate?: (comments: Comment[]) => void;
  onPresenceUpdate?: (users: TeamMember[]) => void;
}

export const usePollingUpdates = ({
  jobId,
  currentUserId,
  enabled,
  pollInterval = 5000,
  onCommentsUpdate,
  onPresenceUpdate,
}: UsePollingUpdatesProps) => {
  const [lastPollTime, setLastPollTime] = useState<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !jobId) return;

    const pollForUpdates = async () => {
      try {
        // Poll for new comments since last poll time
        const commentsResponse = await fetch(
          `/api/job-comments/${jobId}/since/${lastPollTime.toISOString()}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (commentsResponse.ok) {
          const newComments = await commentsResponse.json();
          if (newComments.length > 0 && onCommentsUpdate) {
            onCommentsUpdate(newComments);
          }
        }

        // Poll for active users
        const presenceResponse = await fetch(
          `/api/job-comments/${jobId}/active-users`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ userId: currentUserId }),
          }
        );

        if (presenceResponse.ok) {
          const activeUsers = await presenceResponse.json();
          if (onPresenceUpdate) {
            onPresenceUpdate(activeUsers);
          }
        }

        setLastPollTime(new Date());
      } catch (error) {
        console.error('Error polling for updates:', error);
      }
    };

    // Initial poll
    pollForUpdates();

    // Set up interval
    intervalRef.current = setInterval(pollForUpdates, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, jobId, currentUserId, pollInterval, lastPollTime, onCommentsUpdate, onPresenceUpdate]);

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  return { cleanup };
};

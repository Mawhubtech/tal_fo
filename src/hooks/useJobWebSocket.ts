import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseJobWebSocketProps {
  jobId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  enabled?: boolean;
}

interface UserPresence {
  userId: string;
  userName: string;
  userAvatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

interface UserTyping {
  userId: string;
  userName: string;
  isTyping: boolean;
}

interface WebSocketComment {
  id: string;
  jobId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  parentId?: string;
  reactions: any[];
  replies: any[];
  taggedCandidates?: any[];
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
}

interface UseJobWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  activeUsers: UserPresence[];
  typingUsers: UserTyping[];
  sendTyping: (isTyping: boolean) => void;
  onNewComment: (callback: (comment: WebSocketComment) => void) => void;
  onCommentUpdated: (callback: (comment: WebSocketComment) => void) => void;
  onCommentDeleted: (callback: (data: { commentId: string }) => void) => void;
  onNewReaction: (callback: (reaction: any) => void) => void;
  onReactionRemoved: (callback: (data: { commentId: string; emoji: string; userId: string }) => void) => void;
  cleanup: () => void;
}

export const useJobWebSocket = ({
  jobId,
  userId,
  userName,
  userAvatar,
  enabled = true,
}: UseJobWebSocketProps): UseJobWebSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  const [typingUsers, setTypingUsers] = useState<UserTyping[]>([]);
  
  const callbacksRef = useRef({
    onNewComment: null as ((comment: WebSocketComment) => void) | null,
    onCommentUpdated: null as ((comment: WebSocketComment) => void) | null,
    onCommentDeleted: null as ((data: { commentId: string }) => void) | null,
    onNewReaction: null as ((reaction: any) => void) | null,
    onReactionRemoved: null as ((data: { commentId: string; emoji: string; userId: string }) => void) | null,
  });

  useEffect(() => {
    if (!enabled || !jobId || !userId) return;

    // Initialize socket connection - use production URL as default
    const backendUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'https://tal.mawhub.io';
    const token = localStorage.getItem('accessToken');
    
    const socket = io(`${backendUrl}/job-comments`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: {
        token: token,
      },
      extraHeaders: token ? {
        Authorization: `Bearer ${token}`
      } : {},
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to job comments WebSocket for job:', jobId);
      setIsConnected(true);
      
      // Wait a moment for authentication to complete, then join the job room
      setTimeout(() => {
        console.log('Joining job room:', jobId);
        socket.emit('joinJob', {
          jobId,
          userId,
          userName,
          userAvatar,
        });
      }, 100); // Wait 100ms for backend authentication to complete
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from job comments WebSocket for job:', jobId);
      setIsConnected(false);
      setActiveUsers([]); // Clear active users on disconnect
      setTypingUsers([]); // Clear typing users on disconnect
    });

    // Presence events
    socket.on('presenceUpdate', (users: UserPresence[]) => {
      console.log('Received presenceUpdate:', users);
      setActiveUsers(users);
    });

    socket.on('userJoined', (user: { userId: string; userName: string; userAvatar?: string }) => {
      console.log(`${user.userName} joined the discussion`);
    });

    socket.on('userLeft', (user: { userId: string; userName: string }) => {
      console.log(`${user.userName} left the discussion`);
    });

    // Typing events
    socket.on('userTyping', (data: UserTyping) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(u => u.userId !== data.userId);
        if (data.isTyping) {
          return [...filtered, data];
        }
        return filtered;
      });

      // Clear typing indicator after 3 seconds
      if (data.isTyping) {
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
        }, 3000);
      }
    });

    // Comment events
    socket.on('newComment', (comment: WebSocketComment) => {
      console.log('Received newComment:', comment);
      if (callbacksRef.current.onNewComment) {
        callbacksRef.current.onNewComment(comment);
      }
    });

    socket.on('commentUpdated', (comment: WebSocketComment) => {
      console.log('Received commentUpdated:', comment);
      if (callbacksRef.current.onCommentUpdated) {
        callbacksRef.current.onCommentUpdated(comment);
      }
    });

    socket.on('commentDeleted', (data: { commentId: string }) => {
      console.log('Received commentDeleted:', data);
      if (callbacksRef.current.onCommentDeleted) {
        callbacksRef.current.onCommentDeleted(data);
      }
    });

    socket.on('newReaction', (reaction: any) => {
      if (callbacksRef.current.onNewReaction) {
        callbacksRef.current.onNewReaction(reaction);
      }
    });

    socket.on('reactionRemoved', (data: { commentId: string; emoji: string; userId: string }) => {
      if (callbacksRef.current.onReactionRemoved) {
        callbacksRef.current.onReactionRemoved(data);
      }
    });

    return () => {
      console.log('Cleaning up WebSocket connection for job:', jobId);
      socket.emit('leaveJob');
      socket.disconnect();
    };
  }, [enabled, jobId, userId, userName, userAvatar]);

  const sendTyping = (isTyping: boolean) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing', { jobId, isTyping });
    }
  };

  const onNewComment = (callback: (comment: WebSocketComment) => void) => {
    callbacksRef.current.onNewComment = callback;
  };

  const onCommentUpdated = (callback: (comment: WebSocketComment) => void) => {
    callbacksRef.current.onCommentUpdated = callback;
  };

  const onCommentDeleted = (callback: (data: { commentId: string }) => void) => {
    callbacksRef.current.onCommentDeleted = callback;
  };

  const onNewReaction = (callback: (reaction: any) => void) => {
    callbacksRef.current.onNewReaction = callback;
  };

  const onReactionRemoved = (callback: (data: { commentId: string; emoji: string; userId: string }) => void) => {
    callbacksRef.current.onReactionRemoved = callback;
  };

  const cleanup = () => {
    if (socketRef.current) {
      socketRef.current.emit('leaveJob');
      socketRef.current.disconnect();
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    activeUsers,
    typingUsers,
    sendTyping,
    onNewComment,
    onCommentUpdated,
    onCommentDeleted,
    onNewReaction,
    onReactionRemoved,
    cleanup,
  };
};

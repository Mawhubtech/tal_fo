import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Plus, Send, MessageSquare, Users, 
  Clock, Edit, Trash2, Heart, Smile, ThumbsUp, Reply, MoreVertical, Tag, Search, Wifi, WifiOff
} from 'lucide-react';
import Button from './Button';
import { useJobWebSocket } from '../hooks/useJobWebSocket';

// Types for comments and reactions
export interface Comment {
  id: string;
  jobId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  parentId?: string; // For replies
  reactions: Reaction[];
  replies: Comment[];
  taggedCandidates?: TaggedCandidate[]; // New field for candidate tags
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
}

export interface TaggedCandidate {
  id: string;
  name: string;
  avatar?: string;
  stage?: string;
}

export interface Reaction {
  id: string;
  commentId: string;
  userId: string;
  userName: string;
  emoji: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface Candidate {
  id: string;
  name: string;
  avatar?: string;
  stage?: string;
  email?: string;
}

export type CollaborativePanelState = 'closed' | 'collapsed' | 'expanded';

interface CollaborativeSidePanelProps {
  jobId: string;
  teamMembers: TeamMember[];
  candidates?: Candidate[]; // New prop for candidates
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
  panelState: CollaborativePanelState;
  onStateChange: (state: CollaborativePanelState) => void;
  onAddComment?: (content: string, parentId?: string, taggedCandidateIds?: string[]) => Promise<void>;
  onEditComment?: (commentId: string, content: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  onAddReaction?: (commentId: string, emoji: string) => Promise<void>;
  onRemoveReaction?: (commentId: string, emoji: string) => Promise<void>;
  onRefreshComments?: () => Promise<void>; // New callback for refreshing comments
  comments?: Comment[];
  isLoading?: boolean;
  rightOffset?: string; // For positioning when other panels are open
}

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

const CollaborativeSidePanel: React.FC<CollaborativeSidePanelProps> = ({
  jobId,
  teamMembers,
  candidates = [],
  currentUserId,
  currentUserName,
  currentUserAvatar,
  panelState,
  onStateChange,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onAddReaction,
  onRemoveReaction,
  onRefreshComments,
  comments = [],
  isLoading = false,
  rightOffset = 'right-0'
}) => {
  const [activeTab, setActiveTab] = useState<'comments' | 'team'>('comments');
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [showCandidatePicker, setShowCandidatePicker] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [candidateSearchQuery, setCandidateSearchQuery] = useState('');
  const [liveComments, setLiveComments] = useState<Comment[]>([]);
  const [liveTeamMembers, setLiveTeamMembers] = useState<TeamMember[]>(teamMembers);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const commentsInitializedRef = useRef<boolean>(false);
  const lastPanelStateRef = useRef<CollaborativePanelState>(panelState);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new comments arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [liveComments]);

  // Lock body scroll when panel is open
  useEffect(() => {
    if (panelState !== 'closed') {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        // Restore scroll position
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      };
    }
  }, [panelState]);

  // Initialize live comments with sorted data
  useEffect(() => {
    const topLevelComments = comments.filter(c => !c.parentId);
    const sortedComments = topLevelComments
      .map(comment => ({
        ...comment,
        replies: comment.replies ? comment.replies.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ) : []
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setLiveComments(sortedComments);
  }, []); // Only run once on mount

  // WebSocket integration for live updates
  const {
    isConnected,
    activeUsers,
    typingUsers,
    sendTyping,
    onNewComment,
    onCommentUpdated,
    onCommentDeleted,
    onNewReaction,
    onReactionRemoved,
  } = useJobWebSocket({
    jobId,
    userId: currentUserId,
    userName: currentUserName,
    userAvatar: currentUserAvatar,
    enabled: panelState !== 'closed',
  });

  // Handle panel state changes and force refresh on open
  useEffect(() => {
    const wasClosedNowOpen = lastPanelStateRef.current === 'closed' && panelState !== 'closed';
    const wasOpenNowClosed = lastPanelStateRef.current !== 'closed' && panelState === 'closed';
    
    if (wasClosedNowOpen) {
      // Panel was closed and now opened - always refresh to get latest data
      console.log('Panel reopened, forcing refresh for job:', jobId);
      
      // Reset state immediately to clear any stale data
      commentsInitializedRef.current = false;
      
      if (onRefreshComments) {
        onRefreshComments()
          .then(() => {
            console.log('Comments refreshed successfully on panel open');
            // The comments prop will update via the useEffect below
          })
          .catch(error => {
            console.error('Failed to refresh comments on panel open:', error);
            // Fallback to current comments if refresh fails
            const topLevelComments = comments.filter(c => !c.parentId);
            const sortedComments = topLevelComments
              .map(comment => ({
                ...comment,
                replies: comment.replies ? comment.replies.sort((a, b) => 
                  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                ) : []
              }))
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setLiveComments(sortedComments);
            commentsInitializedRef.current = true;
          });
      } else {
        // No refresh function provided, just use current comments
        console.log('No refresh function, using current comments');
        const topLevelComments = comments.filter(c => !c.parentId);
        const sortedComments = topLevelComments
          .map(comment => ({
            ...comment,
            replies: comment.replies ? comment.replies.sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            ) : []
          }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setLiveComments(sortedComments);
        commentsInitializedRef.current = true;
      }
    } else if (wasOpenNowClosed) {
      // Panel is closing - reset initialization flag for next open
      console.log('Panel closing, will refresh on next open');
      commentsInitializedRef.current = false;
    }
    
    lastPanelStateRef.current = panelState;
  }, [panelState, onRefreshComments, jobId, comments]);

  // Handle comments prop changes - update live comments when they change
  useEffect(() => {
    if (panelState !== 'closed') {
      // Sort the incoming comments properly before setting them
      // First, separate top-level comments from replies
      const topLevelComments = comments.filter(c => !c.parentId);
      
      // Sort each comment's replies chronologically (oldest first)
      // and sort top-level comments by newest first
      const sortedIncomingComments = topLevelComments
        .map(comment => ({
          ...comment,
          replies: comment.replies ? comment.replies.sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          ) : []
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Always update live comments with the latest from server
      // This ensures we have all comments including from other users
      setLiveComments(sortedIncomingComments);
      
      // Mark as initialized after setting comments
      if (!commentsInitializedRef.current && sortedIncomingComments.length >= 0) {
        commentsInitializedRef.current = true;
      }
    }
  }, [comments, panelState]);

  // Ensure we have the latest comments when WebSocket reconnects
  useEffect(() => {
    if (isConnected && panelState !== 'closed' && commentsInitializedRef.current) {
      // WebSocket reconnected, make sure we have the latest state
      // The parent component should handle refetching if needed
      console.log('WebSocket reconnected for job:', jobId);
    }
  }, [isConnected, panelState, jobId]);

  // Update team members with live presence
  useEffect(() => {
    const updatedTeamMembers = teamMembers.map(member => {
      const activeUser = activeUsers.find(user => user.userId === member.id);
      return {
        ...member,
        isOnline: activeUser ? activeUser.isOnline : member.isOnline,
        lastSeen: activeUser?.lastSeen ? activeUser.lastSeen.toString() : member.lastSeen,
      };
    });
    setLiveTeamMembers(updatedTeamMembers);
  }, [teamMembers, activeUsers]);

  // Set up WebSocket event handlers
  useEffect(() => {
    onNewComment((newComment) => {
      console.log('Processing new comment:', newComment);
      setLiveComments(prev => {
        // First, check if this might be replacing an optimistic comment
        // Remove any temporary comments with similar content from the same author
        const prevWithoutOptimistic = prev.map(comment => {
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: comment.replies.filter(reply => 
                !(reply.id.startsWith('temp-') && 
                  reply.authorId === newComment.authorId && 
                  reply.content === newComment.content &&
                  Math.abs(new Date(reply.createdAt).getTime() - new Date(newComment.createdAt).getTime()) < 5000)
              )
            };
          }
          return comment;
        }).filter(comment => 
          !(comment.id.startsWith('temp-') && 
            comment.authorId === newComment.authorId && 
            comment.content === newComment.content &&
            Math.abs(new Date(comment.createdAt).getTime() - new Date(newComment.createdAt).getTime()) < 5000)
        );
        
        // Check if comment already exists (by real ID) to avoid duplicates
        if (prevWithoutOptimistic.some(c => c.id === newComment.id)) {
          console.log('Comment already exists, skipping:', newComment.id);
          return prevWithoutOptimistic;
        }
        
        // Check if reply already exists in any parent
        const replyExists = prevWithoutOptimistic.some(c => 
          c.replies && c.replies.some(r => r.id === newComment.id)
        );
        if (replyExists) {
          console.log('Reply already exists, skipping:', newComment.id);
          return prevWithoutOptimistic;
        }
        
        // If it's a reply (has parentId), add it to the parent's replies array
        if (newComment.parentId) {
          console.log('Adding reply to parent:', newComment.parentId);
          return prevWithoutOptimistic.map(comment => {
            if (comment.id === newComment.parentId) {
              console.log('Adding new reply to parent comment');
              return {
                ...comment,
                replies: [...comment.replies, newComment].sort((a, b) => 
                  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                ) // Sort replies chronologically (oldest first)
              };
            }
            return comment;
          });
        } else {
          // It's a top-level comment - insert in chronological order
          console.log('Adding new top-level comment');
          const newComments = [newComment, ...prevWithoutOptimistic];
          return newComments.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ); // Sort top-level comments newest first
        }
      });
    });

    onCommentUpdated((updatedComment) => {
      setLiveComments(prev => 
        prev.map(comment => {
          // Check if it's a top-level comment
          if (comment.id === updatedComment.id) {
            return {
              ...updatedComment,
              replies: updatedComment.replies ? updatedComment.replies.sort((a, b) => 
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              ) : []
            };
          }
          // Check if it's a reply
          if (comment.replies.some(r => r.id === updatedComment.id)) {
            return {
              ...comment,
              replies: comment.replies.map(reply => 
                reply.id === updatedComment.id ? updatedComment : reply
              ).sort((a, b) => 
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              )
            };
          }
          return comment;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );
    });

    onCommentDeleted(({ commentId }) => {
      setLiveComments(prev => 
        prev.map(comment => {
          // Remove from replies if it's a reply
          const updatedReplies = comment.replies.filter(r => r.id !== commentId);
          return {
            ...comment,
            replies: updatedReplies
          };
        }).filter(c => c.id !== commentId) // Remove top-level comment if it matches
      );
    });

    onNewReaction((reaction) => {
      setLiveComments(prev => 
        prev.map(comment => {
          // Check top-level comment
          if (comment.id === reaction.commentId) {
            return {
              ...comment,
              reactions: [...comment.reactions, reaction]
            };
          }
          // Check replies
          const updatedReplies = comment.replies.map(reply => {
            if (reply.id === reaction.commentId) {
              return {
                ...reply,
                reactions: [...reply.reactions, reaction]
              };
            }
            return reply;
          });
          return {
            ...comment,
            replies: updatedReplies
          };
        })
      );
    });

    onReactionRemoved(({ commentId, emoji, userId }) => {
      setLiveComments(prev => 
        prev.map(comment => {
          // Check top-level comment
          if (comment.id === commentId) {
            return {
              ...comment,
              reactions: comment.reactions.filter(r => !(r.emoji === emoji && r.userId === userId))
            };
          }
          // Check replies
          const updatedReplies = comment.replies.map(reply => {
            if (reply.id === commentId) {
              return {
                ...reply,
                reactions: reply.reactions.filter(r => !(r.emoji === emoji && r.userId === userId))
              };
            }
            return reply;
          });
          return {
            ...comment,
            replies: updatedReplies
          };
        })
      );
    });
  }, [onNewComment, onCommentUpdated, onCommentDeleted, onNewReaction, onReactionRemoved]);

  // Handle typing indicators
  const handleInputChange = (value: string) => {
    setNewComment(value);
    
    // Send typing indicator
    if (value.trim() && !typingTimeoutRef.current) {
      sendTyping(true);
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing indicator after 2 seconds of no typing
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
      typingTimeoutRef.current = null;
    }, 2000);
  };

  // Sort comments by creation date (newest first) - use live comments
  const sortedComments = liveComments
    .filter(comment => !comment.parentId) // Only top-level comments
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(comment => ({
      ...comment,
      replies: comment.replies ? comment.replies.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ) : [] // Sort replies chronologically (oldest first)
    }));

  // Calculate total comment count including replies
  const totalCommentCount = liveComments.reduce((total, comment) => {
    if (!comment.parentId) {
      // It's a top-level comment, count it + its replies
      return total + 1 + (comment.replies?.length || 0);
    }
    return total;
  }, 0);

  if (panelState === 'closed') {
    return null;
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !onAddComment) return;
    
    try {
      // Create optimistic comment for immediate UI update
      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        jobId,
        authorId: currentUserId,
        authorName: currentUserName,
        authorAvatar: currentUserAvatar,
        content: newComment,
        parentId: replyTo || undefined,
        reactions: [],
        replies: [],
        taggedCandidates: selectedCandidates.length > 0 
          ? candidates.filter(c => selectedCandidates.includes(c.id)).map(c => ({
              id: c.id,
              name: c.name,
              avatar: c.avatar,
              stage: c.stage
            }))
          : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isEdited: false,
      };

      // Optimistically add to UI immediately
      setLiveComments(prev => {
        if (replyTo) {
          // It's a reply - add to parent's replies
          return prev.map(comment => {
            if (comment.id === replyTo) {
              return {
                ...comment,
                replies: [...comment.replies, optimisticComment].sort((a, b) => 
                  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                )
              };
            }
            return comment;
          });
        } else {
          // It's a top-level comment
          return [optimisticComment, ...prev].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
      });

      // Clear input immediately for better UX
      const commentContent = newComment;
      const parentId = replyTo || undefined;
      const taggedIds = selectedCandidates.length > 0 ? selectedCandidates : undefined;
      
      setNewComment('');
      setReplyTo(null);
      setSelectedCandidates([]);
      setShowCandidatePicker(false);

      // Send to server
      await onAddComment(commentContent, parentId, taggedIds);
      
      // The real comment will come back via WebSocket and replace the optimistic one
    } catch (error) {
      console.error('Error adding comment:', error);
      // On error, you might want to remove the optimistic comment or show an error
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim() || !onEditComment) return;
    
    try {
      await onEditComment(commentId, editContent);
      setEditingComment(null);
      setEditContent('');
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleAddReaction = async (commentId: string, emoji: string) => {
    if (!onAddReaction) return;
    
    try {
      await onAddReaction(commentId, emoji);
      setShowEmojiPicker(null);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(candidateSearchQuery.toLowerCase())
  );

  const handleToggleCandidateSelection = (candidateId: string) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const getSelectedCandidatesData = () => {
    return candidates.filter(candidate => selectedCandidates.includes(candidate.id));
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const CommentComponent: React.FC<{ comment: Comment; isReply?: boolean }> = ({ comment, isReply = false }) => {
    const isAuthor = comment.authorId === currentUserId;
    const isEditing = editingComment === comment.id;

    // Find the parent comment if this is a reply
    const parentComment = isReply && comment.parentId 
      ? liveComments.find(c => c.id === comment.parentId)
      : null;

    return (
      <div className={`mb-2 ${isReply ? 'ml-10' : ''}`}>
        <div className={`flex items-start ${isAuthor ? 'justify-end' : 'justify-start'} gap-2`}>
          {/* Avatar for others */}
          {!isAuthor && (
            <div className="flex-shrink-0">
              {comment.authorAvatar ? (
                <img 
                  src={comment.authorAvatar} 
                  alt={comment.authorName}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <div className="bg-purple-100 rounded-full h-7 w-7 flex items-center justify-center text-purple-600 text-xs font-semibold">
                  {comment.authorName.charAt(0)}
                </div>
              )}
            </div>
          )}

          {/* Message Container */}
          <div className={`max-w-[70%] ${isAuthor ? 'order-first' : ''}`}>
            {/* Author name and time in one line for others */}
            {!isAuthor && (
              <div className="flex items-center gap-2 mb-0.5 px-1">
                <span className="text-xs font-medium text-gray-700">{comment.authorName}</span>
                <span className="text-xs text-gray-400">{formatTime(comment.createdAt)}</span>
              </div>
            )}
            
            <div className="flex items-end gap-1">
              {/* Message Bubble */}
              <div className={`rounded-2xl px-3 py-2 ${
                isAuthor 
                  ? 'bg-purple-600 text-white rounded-tr-sm' 
                  : 'bg-gray-100 text-gray-900 rounded-tl-sm'
              }`}>
                {/* Reply preview */}
                {isReply && parentComment && (
                  <div className={`mb-2 border-l-2 pl-2 ${
                    isAuthor ? 'border-purple-400' : 'border-gray-400'
                  }`}>
                    <div className={`text-xs font-medium ${isAuthor ? 'text-purple-200' : 'text-gray-600'}`}>
                      {parentComment.authorId === currentUserId ? 'You' : parentComment.authorName}
                    </div>
                    <div className={`text-xs ${isAuthor ? 'text-purple-100' : 'text-gray-500'} line-clamp-1`}>
                      {parentComment.content}
                    </div>
                  </div>
                )}

                {/* Edit mode */}
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none text-gray-900 bg-white"
                      rows={2}
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditComment(comment.id)}
                        disabled={!editContent.trim()}
                        className="text-xs px-3 py-1 bg-white text-purple-600 rounded-full hover:bg-purple-50 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingComment(null);
                          setEditContent('');
                        }}
                        className="text-xs px-3 py-1 bg-transparent text-white hover:bg-purple-700 rounded-full"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Message content */}
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{comment.content}</p>
                    
                    {/* Tagged Candidates - inline */}
                    {comment.taggedCandidates && comment.taggedCandidates.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {comment.taggedCandidates.map(candidate => (
                          <div 
                            key={candidate.id} 
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                              isAuthor 
                                ? 'bg-purple-500/40 text-white' 
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            <Tag className="h-3 w-3" />
                            <span className="font-medium">{candidate.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Time for author messages - inside bubble */}
                    {isAuthor && (
                      <div className="flex items-center justify-end gap-1.5 mt-1">
                        {comment.isEdited && <span className="text-xs text-purple-200">(edited)</span>}
                        <span className="text-xs text-purple-200">{formatTime(comment.createdAt)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Reactions - compact horizontal display */}
              {comment.reactions.length > 0 && (
                <div className="flex items-center gap-0.5">
                  {Object.entries(
                    comment.reactions.reduce((acc, reaction) => {
                      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([emoji, count]) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        const userReaction = comment.reactions.find(
                          r => r.emoji === emoji && r.userId === currentUserId
                        );
                        if (userReaction) {
                          onRemoveReaction?.(comment.id, emoji);
                        } else {
                          handleAddReaction(comment.id, emoji);
                        }
                      }}
                      className={`flex items-center px-1.5 py-0.5 rounded-full text-xs border shadow-sm ${
                        comment.reactions.some(r => r.emoji === emoji && r.userId === currentUserId)
                          ? 'bg-purple-100 border-purple-200'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      title={`${count} reaction${count > 1 ? 's' : ''}`}
                    >
                      <span>{emoji}</span>
                      {count > 1 && <span className="ml-0.5 text-xs font-medium">{count}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Quick Actions - horizontal compact */}
            <div className={`flex items-center gap-3 mt-1 px-1 ${
              isAuthor ? 'justify-end' : 'justify-start'
            }`}>
              {/* Emoji Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(showEmojiPicker === comment.id ? null : comment.id)}
                  className="text-gray-400 hover:text-purple-600 transition-colors"
                  title="React"
                >
                  <Smile className="h-3.5 w-3.5" />
                </button>
                {showEmojiPicker === comment.id && (
                  <div className={`absolute ${isAuthor ? 'right-0' : 'left-0'} bottom-full mb-2 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-10`}>
                    <div className="flex space-x-1">
                      {EMOJI_OPTIONS.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => handleAddReaction(comment.id, emoji)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-lg transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Reply Button */}
              {!isReply && (
                <button
                  onClick={() => setReplyTo(comment.id)}
                  className="text-gray-400 hover:text-purple-600 transition-colors"
                  title="Reply"
                >
                  <Reply className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Edit/Delete for author */}
              {isAuthor && (
                <>
                  <button
                    onClick={() => {
                      setEditingComment(comment.id);
                      setEditContent(comment.content);
                    }}
                    className="text-gray-400 hover:text-purple-600 transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteComment?.(comment.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Avatar for current user on right */}
          {isAuthor && (
            <div className="flex-shrink-0">
              {comment.authorAvatar ? (
                <img 
                  src={comment.authorAvatar} 
                  alt={comment.authorName}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <div className="bg-purple-600 rounded-full h-7 w-7 flex items-center justify-center text-white text-xs font-semibold">
                  {comment.authorName.charAt(0)}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Replies */}
        {!isReply && comment.replies && comment.replies.length > 0 && (
          <div className="mt-1 space-y-1">
            {comment.replies.map(reply => (
              <CommentComponent key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Collapsed state
  if (panelState === 'collapsed') {
    return (
      <div 
        className={`fixed inset-y-0 ${rightOffset} w-1/3 bg-white shadow-2xl z-50 flex overflow-hidden`}
        onWheel={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchMove={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="flex-1 w-full flex flex-col overflow-hidden">
          {/* Panel Header */}
          <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                <h3 className="text-md font-semibold text-gray-800">Team Collaboration</h3>
              </div>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={() => onStateChange('expanded')}
                  className="text-gray-500 hover:text-gray-700 p-2"
                  aria-label="Expand Panel"
                >
                  <ChevronLeft size={20} />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => onStateChange('closed')}
                  className="text-gray-500 hover:text-gray-700 p-2 ml-1"
                  aria-label="Close Panel"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{totalCommentCount}</div>
                <div className="text-xs text-gray-500">Comments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{liveTeamMembers.filter(m => m.isOnline).length}</div>
                <div className="text-xs text-gray-500">Online</div>
              </div>
            </div>
          </div>

          {/* Recent Comments Preview */}
          <div 
            className="flex-1 overflow-y-auto p-4"
            onWheel={(e) => {
              // Only stop propagation, allow scrolling within this container
              e.stopPropagation();
            }}
          >
            <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Comments</h4>
            <div className="space-y-3">
              {sortedComments.slice(0, 3).map(comment => (
                <div key={comment.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="bg-purple-100 rounded-full h-6 w-6 flex items-center justify-center text-purple-600 text-xs font-semibold">
                      {comment.authorName.charAt(0)}
                    </div>
                    <span className="text-xs font-medium text-gray-700">{comment.authorName}</span>
                    <span className="text-xs text-gray-500">{formatTime(comment.createdAt)}</span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Expanded state
  return (
    <div 
      className={`fixed inset-y-0 ${rightOffset} w-2/3 bg-white shadow-2xl z-50 flex overflow-hidden`}
      onWheel={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onTouchMove={(e) => {
        e.stopPropagation();
      }}
    >
      {/* Comments Section - 2/3 width */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-800">Team Chat</h3>
              <span className="text-sm text-gray-500">({totalCommentCount} messages)</span>
              
              {/* Connection Status */}
              <div className="flex items-center space-x-1">
                {isConnected ? (
                  <div title="Connected">
                    <Wifi className="h-4 w-4 text-green-500" />
                  </div>
                ) : (
                  <div title="Disconnected">
                    <WifiOff className="h-4 w-4 text-red-500" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => onStateChange('collapsed')}
                className="text-gray-500 hover:text-gray-700 p-2"
                aria-label="Collapse Panel"
              >
                <ChevronRight size={20} />
              </Button>
              <Button
                variant="ghost"
                onClick={() => onStateChange('closed')}
                className="text-gray-500 hover:text-gray-700 p-2 ml-1"
                aria-label="Close Panel"
              >
                <X size={20} />
              </Button>
            </div>
          </div>
        </div>

        {/* Comments List - Now at top, scrollable */}
        <div 
          className="flex-1 overflow-y-auto p-4 bg-gray-50"
          onWheel={(e) => {
            // Only stop propagation, allow scrolling within this container
            e.stopPropagation();
          }}
        >
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading messages...</div>
          ) : sortedComments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation by sending the first message!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedComments.map(comment => (
                <CommentComponent key={comment.id} comment={comment} />
              ))}
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Comment Input - Now at bottom */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="flex space-x-3 ">
            <div className="flex-shrink-0">
              {currentUserAvatar ? (
                <img 
                  src={currentUserAvatar} 
                  alt={currentUserName}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="bg-purple-100 rounded-full h-8 w-8 flex items-center justify-center text-purple-600 text-sm font-semibold">
                  {currentUserName.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              {replyTo && (
                <div className="mb-2 flex items-center space-x-2 text-sm text-gray-600">
                  <Reply className="h-4 w-4" />
                  <span>Replying to {
                    // Find the comment from liveComments instead of comments prop
                    (() => {
                      const findComment = (comments: Comment[]): Comment | undefined => {
                        for (const comment of comments) {
                          if (comment.id === replyTo) return comment;
                          if (comment.replies) {
                            const found = findComment(comment.replies);
                            if (found) return found;
                          }
                        }
                        return undefined;
                      };
                      return findComment(liveComments)?.authorName || 'Unknown';
                    })()
                  }</span>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {/* Selected Candidates Display */}
              {selectedCandidates.length > 0 && (
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    Tagged:
                  </span>
                  {getSelectedCandidatesData().map(candidate => (
                    <div key={candidate.id} className="inline-flex items-center space-x-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs">
                      {candidate.avatar ? (
                        <img 
                          src={candidate.avatar} 
                          alt={candidate.name}
                          className="h-4 w-4 rounded-full object-cover"
                        />
                      ) : (
                        <div className="bg-purple-100 rounded-full h-4 w-4 flex items-center justify-center text-purple-600 text-xs font-semibold">
                          {candidate.name.charAt(0)}
                        </div>
                      )}
                      <span>{candidate.name}</span>
                      <button
                        onClick={() => handleToggleCandidateSelection(candidate.id)}
                        className="text-purple-500 hover:text-purple-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setSelectedCandidates([])}
                    className="text-xs text-purple-500 hover:text-purple-700"
                  >
                    Clear all
                  </button>
                </div>
              )}
              
              <div className="flex space-x-2">
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={replyTo ? "Type your reply..." : "Type a message..."}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 resize-none"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitComment();
                      }
                    }}
                  />
                  
                  {/* Typing Indicators */}
                  {typingUsers.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500 italic">
                      {typingUsers.length === 1 
                        ? `${typingUsers[0].userName} is typing...`
                        : `${typingUsers.length} people are typing...`
                      }
                    </div>
                  )}
                  
                  {/* Comment Actions */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <button
                          onClick={() => setShowCandidatePicker(!showCandidatePicker)}
                          className="flex items-center text-sm text-gray-500 hover:text-purple-700"
                        >
                          <Tag className="h-4 w-4 mr-1" />
                          Tag Candidates
                        </button>
                        
                        {/* Candidate Picker Dropdown */}
                        {showCandidatePicker && (
                          <div className="absolute bottom-full left-0 mb-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                            <div className="p-3">
                              <div className="relative mb-2">
                                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                  type="text"
                                  placeholder="Search candidates..."
                                  value={candidateSearchQuery}
                                  onChange={(e) => setCandidateSearchQuery(e.target.value)}
                                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                                />
                              </div>
                              <div className="max-h-48 overflow-y-auto">
                                {filteredCandidates.length === 0 ? (
                                  <p className="text-sm text-gray-500 text-center py-4">No candidates found</p>
                                ) : (
                                  filteredCandidates.map(candidate => (
                                    <button
                                      key={candidate.id}
                                      onClick={() => handleToggleCandidateSelection(candidate.id)}
                                      className={`w-full flex items-center space-x-2 p-2 rounded-md text-left hover:bg-purple-50 ${
                                        selectedCandidates.includes(candidate.id) ? 'bg-purple-50 text-purple-700' : ''
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedCandidates.includes(candidate.id)}
                                        onChange={() => {}} // Handled by button click
                                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:outline-none"
                                      />
                                      {candidate.avatar ? (
                                        <img 
                                          src={candidate.avatar} 
                                          alt={candidate.name}
                                          className="h-6 w-6 rounded-full object-cover"
                                        />
                                      ) : (
                                        <div className="bg-gray-100 rounded-full h-6 w-6 flex items-center justify-center text-gray-600 text-xs font-semibold">
                                          {candidate.name.charAt(0)}
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <span className="text-sm font-medium truncate block">{candidate.name}</span>
                                        {candidate.stage && (
                                          <span className="text-xs text-gray-500">{candidate.stage}</span>
                                        )}
                                      </div>
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || isLoading}
					  className='bg-purple-600 text-white rounded-md px-3 py-1 text-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 flex items-center'
                    
                    >
                      <Send className="h-3.5 w-3.5 mr-1" />
                      {replyTo ? 'Send' : 'Send'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Sidebar - 1/3 width */}
      <div className="w-1/3 border-l border-gray-200 flex flex-col overflow-hidden">
        {/* Team Header */}          <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <h4 className="font-semibold text-gray-800">Team Members</h4>
              <span className="text-sm text-gray-500">({liveTeamMembers.length})</span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                {liveTeamMembers.filter(m => m.isOnline).length} online
              </span>
            </div>
          </div>

        {/* Team Members List */}
        <div 
          className="flex-1 overflow-y-auto p-4"
          onWheel={(e) => {
            // Only stop propagation, allow scrolling within this container
            e.stopPropagation();
          }}
        >
          <div className="space-y-3">
            {liveTeamMembers.map(member => (
              <div key={member.id} className="flex items-center space-x-3">
                <div className="relative">
                  {member.avatar ? (
                    <img 
                      src={member.avatar} 
                      alt={member.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="bg-gray-100 rounded-full h-8 w-8 flex items-center justify-center text-gray-600 text-sm font-semibold">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                    member.isOnline ? 'bg-purple-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-medium text-gray-900 truncate">{member.name}</h5>
                  <p className="text-xs text-gray-500">{member.role}</p>
                  {!member.isOnline && member.lastSeen && (
                    <p className="text-xs text-gray-400">Last seen {formatTime(member.lastSeen)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborativeSidePanel;

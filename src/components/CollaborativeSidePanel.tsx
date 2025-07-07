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

  // Initialize live comments with sorted data
  useEffect(() => {
    const sortedComments = comments
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
      
      if (onRefreshComments) {
        // Don't reset commentsInitializedRef here - let the refresh complete first
        onRefreshComments()
          .then(() => {
            console.log('Comments refreshed successfully on panel open');
            commentsInitializedRef.current = true;
          })
          .catch(error => {
            console.error('Failed to refresh comments on panel open:', error);
            // Fallback to current comments if refresh fails
            setLiveComments(comments);
            commentsInitializedRef.current = true;
          });
      } else {
        // No refresh function provided, just use current comments
        console.log('No refresh function, using current comments');
        setLiveComments(comments);
        commentsInitializedRef.current = true;
      }
    } else if (wasOpenNowClosed) {
      // Panel is closing - reset initialization flag for next open
      console.log('Panel closing, will refresh on next open');
      commentsInitializedRef.current = false;
    }
    
    lastPanelStateRef.current = panelState;
  }, [panelState, onRefreshComments, jobId]);

  // Handle comments prop changes - update live comments when they change
  useEffect(() => {
    if (panelState !== 'closed') {
      console.log('Comments prop updated. Incoming count:', comments.length);
      console.log('Current live comments count:', liveComments.length);
      console.log('Comments initialized?', commentsInitializedRef.current);
      
      // Sort the incoming comments properly before setting them
      const sortedIncomingComments = comments
        .map(comment => ({
          ...comment,
          replies: comment.replies ? comment.replies.sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          ) : []
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      console.log('Setting live comments to:', sortedIncomingComments.length, 'comments');
      setLiveComments(sortedIncomingComments);
      
      if (!commentsInitializedRef.current) {
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
        // Check if comment already exists to avoid duplicates
        if (prev.some(c => c.id === newComment.id)) {
          console.log('Comment already exists, skipping:', newComment.id);
          return prev;
        }
        
        // If it's a reply (has parentId), add it to the parent's replies array
        if (newComment.parentId) {
          console.log('Adding reply to parent:', newComment.parentId);
          return prev.map(comment => {
            if (comment.id === newComment.parentId) {
              // Check if reply already exists in the replies array
              if (comment.replies.some(r => r.id === newComment.id)) {
                console.log('Reply already exists in parent, skipping:', newComment.id);
                return comment;
              }
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
          const newComments = [newComment, ...prev];
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
      await onAddComment(newComment, replyTo || undefined, selectedCandidates.length > 0 ? selectedCandidates : undefined);
      setNewComment('');
      setReplyTo(null);
      setSelectedCandidates([]);
      setShowCandidatePicker(false);
    } catch (error) {
      console.error('Error adding comment:', error);
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

    return (
      <div className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            {comment.authorAvatar ? (
              <img 
                src={comment.authorAvatar} 
                alt={comment.authorName}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="bg-purple-100 rounded-full h-8 w-8 flex items-center justify-center text-purple-600 text-sm font-semibold">
                {comment.authorName.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-gray-900">{comment.authorName}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">{formatTime(comment.createdAt)}</span>
                  {comment.isEdited && <span className="text-xs text-gray-400">(edited)</span>}
                  {isAuthor && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingComment(comment.id);
                          setEditContent(comment.content);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => onDeleteComment?.(comment.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={2}
                  />
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleEditComment(comment.id)}
                      size="sm"
                      disabled={!editContent.trim()}
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingComment(null);
                        setEditContent('');
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  {/* Tagged Candidates */}
                  {comment.taggedCandidates && comment.taggedCandidates.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {comment.taggedCandidates.map(candidate => (
                        <div key={candidate.id} className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
                          <Tag className="h-3 w-3" />
                          {candidate.avatar ? (
                            <img 
                              src={candidate.avatar} 
                              alt={candidate.name}
                              className="h-4 w-4 rounded-full object-cover"
                            />
                          ) : (
                            <div className="bg-blue-100 rounded-full h-4 w-4 flex items-center justify-center text-blue-600 text-xs font-semibold">
                              {candidate.name.charAt(0)}
                            </div>
                          )}
                          <span className="font-medium">{candidate.name}</span>
                          {candidate.stage && (
                            <span className="text-blue-500">• {candidate.stage}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Reactions and Actions */}
            <div className="flex items-center space-x-4 mt-2">
              {/* Reactions */}
              {comment.reactions.length > 0 && (
                <div className="flex items-center space-x-1">
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
                      className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                        comment.reactions.some(r => r.emoji === emoji && r.userId === currentUserId)
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span>{emoji}</span>
                      <span>{count}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex items-center space-x-3 text-xs text-gray-500">
                <div className="relative">
                  <button
                    onClick={() => setShowEmojiPicker(showEmojiPicker === comment.id ? null : comment.id)}
                    className="hover:text-gray-700 flex items-center space-x-1"
                  >
                    <Smile className="h-3 w-3" />
                    <span>React</span>
                  </button>
                  {showEmojiPicker === comment.id && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
                      <div className="flex space-x-1">
                        {EMOJI_OPTIONS.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => handleAddReaction(comment.id, emoji)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {!isReply && (
                  <button
                    onClick={() => setReplyTo(comment.id)}
                    className="hover:text-gray-700 flex items-center space-x-1"
                  >
                    <Reply className="h-3 w-3" />
                    <span>Reply</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 space-y-3">
                {comment.replies.map(reply => (
                  <CommentComponent key={reply.id} comment={reply} isReply={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Collapsed state
  if (panelState === 'collapsed') {
    return (
      <div className={`fixed inset-y-0 ${rightOffset} w-1/3 bg-white shadow-2xl z-50 flex`}>
        <div className="flex-1 w-full flex flex-col">
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
          <div className="flex-1 overflow-y-auto p-4">
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
    <div className={`fixed inset-y-0 ${rightOffset} w-2/3 bg-white shadow-2xl z-50 flex`}>
      {/* Comments Section - 2/3 width */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-800">Team Discussion</h3>
              <span className="text-sm text-gray-500">({totalCommentCount} comments)</span>
              
              {/* Debug refresh button - remove in production */}
              {process.env.NODE_ENV === 'development' && onRefreshComments && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      console.log('Manual refresh triggered');
                      console.log('Current comments prop:', comments.length);
                      console.log('Current live comments:', liveComments.length);
                      onRefreshComments();
                    }}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                    title="Debug: Refresh Comments"
                  >
                    🔄
                  </button>
                  <span className="text-xs text-gray-500">
                    Prop:{comments.length} Live:{liveComments.length}
                  </span>
                </div>
              )}
              
              {/* Connection Status */}
              <div className="flex items-center space-x-1">
                {isConnected ? (
                  <div title="Connected">
                    <Wifi className="h-4 w-4 text-purple-500" />
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

        {/* Comment Input */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex space-x-3">
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
                    placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowCandidatePicker(!showCandidatePicker)}
                          className="text-gray-500 hover:text-purple-700"
                        >
                          <Tag className="h-4 w-4 mr-1" />
                          Tag Candidates
                        </Button>
                        
                        {/* Candidate Picker Dropdown */}
                        {showCandidatePicker && (
                          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                            <div className="p-3">
                              <div className="relative mb-2">
                                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                  type="text"
                                  placeholder="Search candidates..."
                                  value={candidateSearchQuery}
                                  onChange={(e) => setCandidateSearchQuery(e.target.value)}
                                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
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
                    <Button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || isLoading}
                      size="sm"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      {replyTo ? 'Reply' : 'Comment'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading comments...</div>
          ) : sortedComments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No comments yet</p>
              <p className="text-sm">Start the discussion by adding the first comment!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedComments.map(comment => (
                <CommentComponent key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Team Sidebar - 1/3 width */}
      <div className="w-1/3 border-l border-gray-200 flex flex-col">
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
        <div className="flex-1 overflow-y-auto p-4">
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

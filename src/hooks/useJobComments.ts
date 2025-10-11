import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  jobCommentsApiService, 
  type CreateCommentRequest, 
  type UpdateCommentRequest,
  type AddReactionRequest 
} from '../services/jobCommentsApiService';
import type { Comment, Reaction } from '../components/CollaborativeSidePanel';

// Query keys
export const jobCommentsKeys = {
  all: ['jobComments'] as const,
  job: (jobId: string) => [...jobCommentsKeys.all, jobId] as const,
  comment: (commentId: string) => [...jobCommentsKeys.all, 'comment', commentId] as const,
};

// Get comments for a job
export function useJobComments(jobId: string) {
  return useQuery({
    queryKey: jobCommentsKeys.job(jobId),
    queryFn: () => jobCommentsApiService.getJobComments(jobId),
    enabled: !!jobId,
    staleTime: 0, // Always consider data stale to ensure fresh fetches
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes (previously cacheTime)
  });
}

// Create comment mutation
export function useCreateComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCommentRequest) => jobCommentsApiService.createComment(data),
    onSuccess: (newComment) => {
      // Update the job comments cache
      queryClient.setQueryData(
        jobCommentsKeys.job(newComment.jobId),
        (oldComments: Comment[] = []) => {
          if (newComment.parentId) {
            // This is a reply - find the parent comment and add to its replies
            return oldComments.map(comment => {
              if (comment.id === newComment.parentId) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), newComment]
                };
              }
              return comment;
            });
          } else {
            // This is a top-level comment
            return [newComment, ...oldComments];
          }
        }
      );
    },
  });
}

// Update comment mutation
export function useUpdateComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: UpdateCommentRequest }) =>
      jobCommentsApiService.updateComment(commentId, data),
    onSuccess: (updatedComment) => {
      // Update the job comments cache
      queryClient.setQueryData(
        jobCommentsKeys.job(updatedComment.jobId),
        (oldComments: Comment[] = []) => {
          const updateCommentInArray = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
              if (comment.id === updatedComment.id) {
                return updatedComment;
              }
              if (comment.replies && comment.replies.length > 0) {
                return {
                  ...comment,
                  replies: updateCommentInArray(comment.replies)
                };
              }
              return comment;
            });
          };
          return updateCommentInArray(oldComments);
        }
      );
    },
  });
}

// Delete comment mutation
export function useDeleteComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (commentId: string) => jobCommentsApiService.deleteComment(commentId),
    onSuccess: (_, commentId) => {
      // Remove the comment from all job comments caches
      queryClient.setQueriesData(
        { queryKey: jobCommentsKeys.all },
        (oldComments: Comment[] | undefined) => {
          if (!oldComments) return oldComments;
          
          const removeCommentFromArray = (comments: Comment[]): Comment[] => {
            return comments
              .filter(comment => comment.id !== commentId)
              .map(comment => ({
                ...comment,
                replies: comment.replies ? removeCommentFromArray(comment.replies) : []
              }));
          };
          
          return removeCommentFromArray(oldComments);
        }
      );
    },
  });
}

// Add reaction mutation
export function useAddReaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ commentId, emoji }: { commentId: string; emoji: string }) =>
      jobCommentsApiService.addReaction(commentId, { emoji }),
    onSuccess: (newReaction, { commentId }) => {
      // Update the reaction in the comments cache
      queryClient.setQueriesData(
        { queryKey: jobCommentsKeys.all },
        (oldComments: Comment[] | undefined) => {
          if (!oldComments) return oldComments;
          
          const updateReactionsInArray = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  reactions: [...comment.reactions, newReaction]
                };
              }
              if (comment.replies && comment.replies.length > 0) {
                return {
                  ...comment,
                  replies: updateReactionsInArray(comment.replies)
                };
              }
              return comment;
            });
          };
          
          return updateReactionsInArray(oldComments);
        }
      );
    },
  });
}

// Remove reaction mutation
export function useRemoveReaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ commentId, emoji }: { commentId: string; emoji: string }) =>
      jobCommentsApiService.removeReaction(commentId, emoji),
    onSuccess: (_, { commentId, emoji }) => {
      // Remove the reaction from the comments cache
      queryClient.setQueriesData(
        { queryKey: jobCommentsKeys.all },
        (oldComments: Comment[] | undefined) => {
          if (!oldComments) return oldComments;
          
          const updateReactionsInArray = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  reactions: comment.reactions.filter(reaction => reaction.emoji !== emoji)
                };
              }
              if (comment.replies && comment.replies.length > 0) {
                return {
                  ...comment,
                  replies: updateReactionsInArray(comment.replies)
                };
              }
              return comment;
            });
          };
          
          return updateReactionsInArray(oldComments);
        }
      );
    },
  });
}

// src/hooks/useComments.ts
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentReaction,
  addRealtimeComment,
  updateRealtimeComment,
  removeRealtimeComment,
  updateRealtimeReaction,
} from '@/store/slices/commentSlice';
import websocketService from '@/services/webSocket';
import CommentService from '@/services/comment';
import { 
  CommentCreate, 
  TypingUser,
  WSMessage,
  Comment 
} from '@/types/commentTypes';
import { toast } from '@/components/ui/toast-wrapper';

export function useComments(entityType: string, entityId: string) {
  const dispatch = useDispatch<AppDispatch>();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [localTypingTimeout, setLocalTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const entityKey = `${entityType}:${entityId}`;
  
  // Get comments state from Redux
  const commentsState = useSelector((state: RootState) => state.comments);
  
  const comments = commentsState.commentsByEntity[entityKey] || [];
  const loading = commentsState.loading;
  const error = commentsState.error;
  const pagination = commentsState.pagination;
  
  const paginationInfo = useMemo(() => {
    return pagination[entityKey] || {
      skip: 0,
      limit: 20,
      total: 0,
      hasMore: false,
    };
  }, [pagination, entityKey]);

  // Initialize WebSocket and fetch comments
  useEffect(() => {
    websocketService.connect(entityType, entityId);

    dispatch(fetchComments({
      entityType,
      entityId,
      skip: 0,
      limit: 20,
    }));

    const handleNewComment = (message: WSMessage) => {
      if (message.type === 'new_comment' && 'comment' in message) {
        dispatch(addRealtimeComment({
          entityType,
          entityId,
          comment: message.comment as Comment,
        }));
      }
    };

    const handleCommentUpdated = (message: WSMessage) => {
      if (message.type === 'comment_updated' && 'comment' in message) {
        dispatch(updateRealtimeComment({
          entityType,
          entityId,
          comment: message.comment as Comment,
        }));
      }
    };

    const handleCommentDeleted = (message: WSMessage) => {
      if (message.type === 'comment_deleted' && 'comment_id' in message) {
        dispatch(removeRealtimeComment({
          entityType,
          entityId,
          commentId: message.comment_id as string,
        }));
      }
    };

    const handleReactionUpdate = (message: WSMessage) => {
      if (message.type === 'reaction_update' && 
          'comment_id' in message && 
          'reactions' in message && 
          'reaction_counts' in message) {
        dispatch(updateRealtimeReaction({
          entityType,
          entityId,
          commentId: message.comment_id as string,
          reactions: message.reactions as Record<string, string[]>,
          reactionCounts: message.reaction_counts as Record<string, number>,
        }));
      }
    };

    const handleTyping = (message: WSMessage) => {
      if (message.type === 'typing' && 'user_id' in message && 'user_info' in message && 'is_typing' in message) {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.id !== message.user_id);
          if (message.is_typing) {
            return [...filtered, {
              ...(message.user_info as TypingUser),
              id: message.user_id as string,
              timestamp: new Date().toISOString(),
            }];
          }
          return filtered;
        });
      }
    };

    websocketService.on(entityType, entityId, 'new_comment', handleNewComment);
    websocketService.on(entityType, entityId, 'comment_updated', handleCommentUpdated);
    websocketService.on(entityType, entityId, 'comment_deleted', handleCommentDeleted);
    websocketService.on(entityType, entityId, 'reaction_update', handleReactionUpdate);
    websocketService.on(entityType, entityId, 'typing', handleTyping);

    return () => {
      websocketService.off(entityType, entityId, 'new_comment', handleNewComment);
      websocketService.off(entityType, entityId, 'comment_updated', handleCommentUpdated);
      websocketService.off(entityType, entityId, 'comment_deleted', handleCommentDeleted);
      websocketService.off(entityType, entityId, 'reaction_update', handleReactionUpdate);
      websocketService.off(entityType, entityId, 'typing', handleTyping);
      websocketService.disconnect(entityType, entityId);
    };
  }, [entityType, entityId, dispatch]);

  // Clean up stale typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTypingUsers(prev => 
        prev.filter(user => {
          const timestamp = new Date(user.timestamp);
          return now.getTime() - timestamp.getTime() < 3000;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCreateComment = useCallback(async (data: Partial<CommentCreate>) => {
    try {
      const result = await dispatch(createComment({
        entityType,
        entityId,
        data: CommentService.createCommentData(
          entityType,
          entityId,
          data.content || '',
          data.parent_id
        ),
      })).unwrap();
      
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully.",
        variant: "success",
      });
      
      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [dispatch, entityType, entityId]);

  const handleUpdateComment = useCallback(async (commentId: string, content: string) => {
    try {
      const result = await dispatch(updateComment({
        entityType,
        entityId,
        commentId,
        data: { content },
      })).unwrap();
      
      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully.",
        variant: "success",
      });
      
      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update comment. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [dispatch, entityType, entityId]);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    try {
      await dispatch(deleteComment({
        entityType,
        entityId,
        commentId,
      })).unwrap();
      
      toast({
        title: "Comment deleted",
        description: "The comment has been deleted successfully.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [dispatch, entityType, entityId]);

  const handleToggleReaction = useCallback(async (commentId: string, reactionType: string) => {
    try {
      await dispatch(toggleCommentReaction({
        entityType,
        entityId,
        commentId,
        reactionType,
      })).unwrap();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reaction. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [dispatch, entityType, entityId]);

  const handleLoadMore = useCallback(async () => {
    if (!paginationInfo.hasMore || loading.fetchComments) return;
    
    try {
      await dispatch(fetchComments({
        entityType,
        entityId,
        skip: paginationInfo.skip,
        limit: paginationInfo.limit,
      })).unwrap();
    } catch {
      toast({
        title: "Error",
        description: "Failed to load more comments. Please try again.",
        variant: "destructive",
      });
    }
  }, [dispatch, entityType, entityId, paginationInfo, loading.fetchComments]);

  const handleSetTyping = useCallback((isTyping: boolean) => {
    if (localTypingTimeout) {
      clearTimeout(localTypingTimeout);
      setLocalTypingTimeout(null);
    }

    websocketService.setTypingIndicator(entityType, entityId, isTyping);

    if (isTyping) {
      const timeout = setTimeout(() => {
        websocketService.setTypingIndicator(entityType, entityId, false);
      }, 2000);
      setLocalTypingTimeout(timeout);
    }
  }, [entityType, entityId, localTypingTimeout]);

  return {
    comments,
    loading: loading.fetchComments,
    error,
    hasMore: paginationInfo.hasMore,
    typingUsers,
    createComment: handleCreateComment,
    updateComment: handleUpdateComment,
    deleteComment: handleDeleteComment,
    toggleReaction: handleToggleReaction,
    loadMore: handleLoadMore,
    setTyping: handleSetTyping,
  };
}
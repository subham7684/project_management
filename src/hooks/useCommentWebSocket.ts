// src/hooks/useCommentWebSocket.ts
import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import {
  addRealtimeComment,
  updateRealtimeComment,
  removeRealtimeComment,
  updateRealtimeReaction,
} from '@/store/slices/commentSlice';
import websocketService from '@/services/webSocket';
import { WSMessage } from '@/types/commentTypes';

interface UseCommentWebSocketProps {
  entityType: string;
  entityId: string;
  onTypingUpdate?: (typingUsers: any[]) => void;
  onActiveUsersUpdate?: (activeUsers: any[]) => void;
}

export function useCommentWebSocket({
  entityType,
  entityId,
  onTypingUpdate,
  onActiveUsersUpdate,
}: UseCommentWebSocketProps) {
  const dispatch = useDispatch<AppDispatch>();

  // Message handler
  const handleWebSocketMessage = useCallback((message: WSMessage) => {
    switch (message.type) {
      case 'new_comment':
        dispatch(addRealtimeComment({
          entityType,
          entityId,
          comment: (message as any).comment,
        }));
        break;

      case 'comment_updated':
        dispatch(updateRealtimeComment({
          entityType,
          entityId,
          comment: (message as any).comment,
        }));
        break;

      case 'comment_deleted':
        dispatch(removeRealtimeComment({
          entityType,
          entityId,
          commentId: (message as any).comment_id,
        }));
        break;

      case 'reaction_update':
        dispatch(updateRealtimeReaction({
          entityType,
          entityId,
          commentId: (message as any).comment_id,
          reactions: (message as any).reactions,
          reactionCounts: (message as any).reaction_counts,
        }));
        break;

      case 'typing':
        if (onTypingUpdate) {
          // Handle typing indicator update
          onTypingUpdate((message as any).users || []);
        }
        break;

      case 'active_users':
        if (onActiveUsersUpdate) {
          onActiveUsersUpdate((message as any).users || []);
        }
        break;
    }
  }, [dispatch, entityType, entityId, onTypingUpdate, onActiveUsersUpdate]);

  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect(entityType, entityId);

    // Register message handlers
    const messageTypes = [
      'new_comment',
      'comment_updated',
      'comment_deleted',
      'reaction_update',
      'typing',
      'active_users',
    ];

    messageTypes.forEach(type => {
      websocketService.on(entityType, entityId, type, handleWebSocketMessage);
    });

    // Get initial active users
    websocketService.getActiveUsers(entityType, entityId);

    // Cleanup
    return () => {
      messageTypes.forEach(type => {
        websocketService.off(entityType, entityId, type, handleWebSocketMessage);
      });
    };
  }, [entityType, entityId, handleWebSocketMessage]);

  // Public methods
  const sendComment = useCallback((content: string, parentId?: string) => {
    websocketService.sendComment(entityType, entityId, content, parentId);
  }, [entityType, entityId]);

  const editComment = useCallback((commentId: string, content: string) => {
    websocketService.editComment(entityType, entityId, commentId, content);
  }, [entityType, entityId]);

  const deleteComment = useCallback((commentId: string) => {
    websocketService.deleteComment(entityType, entityId, commentId);
  }, [entityType, entityId]);

  const toggleReaction = useCallback((commentId: string, reactionType: string) => {
    websocketService.toggleReaction(entityType, entityId, commentId, reactionType);
  }, [entityType, entityId]);

  const setTypingIndicator = useCallback((isTyping: boolean) => {
    websocketService.setTypingIndicator(entityType, entityId, isTyping);
  }, [entityType, entityId]);

  return {
    sendComment,
    editComment,
    deleteComment,
    toggleReaction,
    setTypingIndicator,
  };
}
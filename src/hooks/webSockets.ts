// hooks/useWebSocket.ts
import { useState, useEffect, useCallback } from 'react';
import websocketService from '../services/webSocket';
import { User } from '../types/interfaces';

interface ActiveUser {
  user_id: string;
  user_info: User;
  last_activity: string;
}

export function useWebSocketConnection(entityType: string, entityId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  
  useEffect(() => {
    // Connect when the component mounts
    websocketService.connect(entityType, entityId);
    
    // Check connection status
    const checkConnection = () => {
      const connected = websocketService.isConnected(entityType, entityId);
      setIsConnected(connected);
    };
    
    // Set up initial check and periodic checks
    checkConnection();
    const interval = setInterval(checkConnection, 2000);
    
    // Set up handler for active users
    const handleActiveUsers = (message: any) => {
      if (message.users) {
        setActiveUsers(message.users);
      }
    };
    
    websocketService.on(entityType, entityId, 'active_users', handleActiveUsers);
    websocketService.on(entityType, entityId, 'user_joined', () => {
      websocketService.getActiveUsers(entityType, entityId);
    });
    websocketService.on(entityType, entityId, 'user_left', () => {
      websocketService.getActiveUsers(entityType, entityId);
    });
    
    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      websocketService.off(entityType, entityId, 'active_users', handleActiveUsers);
      websocketService.disconnect(entityType, entityId);
    };
  }, [entityType, entityId]);
  
  const getActiveUsers = useCallback(() => {
    websocketService.getActiveUsers(entityType, entityId);
  }, [entityType, entityId]);
  
  return {
    isConnected,
    activeUsers,
    getActiveUsers
  };
}

export function useComments(entityType: string, entityId: string) {
  const [comments, setComments] = useState<any[]>([]);
  
  useEffect(() => {
    // Set up handlers for comments
    const handleNewComment = (message: any) => {
      setComments(prevComments => [...prevComments, message.comment]);
    };
    
    const handleCommentUpdated = (message: any) => {
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === message.comment.id ? message.comment : comment
        )
      );
    };
    
    const handleCommentDeleted = (message: any) => {
      setComments(prevComments => 
        prevComments.filter(comment => comment.id !== message.comment_id)
      );
    };
    
    const handleReactionUpdate = (message: any) => {
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === message.comment_id) {
            return {
              ...comment,
              reactions: message.reactions,
              reaction_counts: message.reaction_counts
            };
          }
          return comment;
        })
      );
    };
    
    websocketService.on(entityType, entityId, 'new_comment', handleNewComment);
    websocketService.on(entityType, entityId, 'comment_updated', handleCommentUpdated);
    websocketService.on(entityType, entityId, 'comment_deleted', handleCommentDeleted);
    websocketService.on(entityType, entityId, 'reaction_update', handleReactionUpdate);
    
    // Cleanup on unmount
    return () => {
      websocketService.off(entityType, entityId, 'new_comment', handleNewComment);
      websocketService.off(entityType, entityId, 'comment_updated', handleCommentUpdated);
      websocketService.off(entityType, entityId, 'comment_deleted', handleCommentDeleted);
      websocketService.off(entityType, entityId, 'reaction_update', handleReactionUpdate);
    };
  }, [entityType, entityId]);
  
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
    comments,
    sendComment,
    editComment,
    deleteComment,
    toggleReaction,
    setTypingIndicator
  };
}

export function useTypingIndicators(entityType: string, entityId: string) {
  const [typingUsers, setTypingUsers] = useState<{ [userId: string]: User & { timestamp: string } }>({});
  
  useEffect(() => {
    // Set up handler for typing indicators
    const handleTyping = (message: any) => {
      if (message.is_typing) {
        setTypingUsers(prev => ({
          ...prev,
          [message.user_id]: {
            ...message.user_info,
            timestamp: message.timestamp
          }
        }));
      } else {
        setTypingUsers(prev => {
          const newState = { ...prev };
          delete newState[message.user_id];
          return newState;
        });
      }
    };
    
    websocketService.on(entityType, entityId, 'typing', handleTyping);
    
    // Clean up typing indicators after a timeout (to handle cases where the "stopped typing" message is missed)
    const interval = setInterval(() => {
      setTypingUsers(prev => {
        const now = new Date();
        const newState = { ...prev };
        
        Object.entries(newState).forEach(([userId, user]) => {
          const timestamp = new Date(user.timestamp);
          // Remove typing indicator after 5 seconds of inactivity
          if (now.getTime() - timestamp.getTime() > 5000) {
            delete newState[userId];
          }
        });
        
        return newState;
      });
    }, 1000);
    
    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      websocketService.off(entityType, entityId, 'typing', handleTyping);
    };
  }, [entityType, entityId]);
  
  return {
    typingUsers: Object.values(typingUsers),
    setTypingIndicator: (isTyping: boolean) => 
      websocketService.setTypingIndicator(entityType, entityId, isTyping)
  };
}
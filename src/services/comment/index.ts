// src/services/comment.ts
import api from "../axiosInstance";
import { ENDPOINTS } from "../network/endpoints";
import { getHeaders } from "../network/getHeaders";
import { Comment } from "../../types/interfaces";
import { ChatRoom, CommentCreate, CommentUpdate } from "@/types/commentTypes";

// Response wrapper interface matching your backend
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total: number;
    skip: number;
    limit: number;
  };
}

// Error response interface
interface ErrorResponse {
  detail?: string;
  message?: string;
}

class CommentServiceClass {
  private handleError(error: any, defaultMessage: string): never {
    console.error(defaultMessage, error);
    const errorResponse = error.response?.data as ErrorResponse;
    const message = errorResponse?.detail || errorResponse?.message || defaultMessage;
    throw new Error(message);
  }

  // Fetch comments for any entity type
  async fetchComments(
    entityType: string, 
    entityId: string, 
    skip: number = 0, 
    limit: number = 50,
    sortOrder: number = 1
  ): Promise<ApiResponse<Comment[]>> {
    try {
      const headers = getHeaders();
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
        sort_order: sortOrder.toString()
      });
      
      const response = await api.get<ApiResponse<Comment[]>>(
        `${ENDPOINTS.COMMENTS}/${entityType}/${entityId}?${params}`, 
        { headers }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch comments');
    }
  }

  // Get single comment
  async getComment(commentId: string): Promise<ApiResponse<Comment>> {
    try {
      const headers = getHeaders();
      const response = await api.get<ApiResponse<Comment>>(
        `${ENDPOINTS.COMMENTS}/comment/${commentId}`, 
        { headers }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch comment');
    }
  }

  // Create comment
  async createComment(data: CommentCreate): Promise<ApiResponse<Comment>> {
    try {
      const headers = getHeaders();
      const response = await api.post<ApiResponse<Comment>>(
        ENDPOINTS.COMMENTS, 
        data, 
        { headers }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to create comment');
    }
  }

  // Update comment
  async updateComment(commentId: string, data: CommentUpdate): Promise<ApiResponse<Comment>> {
    try {
      const headers = getHeaders();
      const response = await api.put<ApiResponse<Comment>>(
        `${ENDPOINTS.COMMENTS}/comment/${commentId}`, 
        data, 
        { headers }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to update comment');
    }
  }

  // Delete comment
  async deleteComment(commentId: string): Promise<ApiResponse<void>> {
    try {
      const headers = getHeaders();
      const response = await api.delete<ApiResponse<void>>(
        `${ENDPOINTS.COMMENTS}/comment/${commentId}`, 
        { headers }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to delete comment');
    }
  }

  // Toggle reaction
  async toggleReaction(commentId: string, reactionType: string): Promise<ApiResponse<Comment>> {
    try {
      const headers = getHeaders();
      const response = await api.post<ApiResponse<Comment>>(
        `${ENDPOINTS.COMMENTS}/comment/${commentId}/reaction`,
        { reaction_type: reactionType },
        { headers }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to toggle reaction');
    }
  }

  // Get user's chat rooms
  async getChatRooms(): Promise<ApiResponse<ChatRoom[]>> {
    try {
      const headers = getHeaders();
      const response = await api.get<ApiResponse<ChatRoom[]>>(
        `${ENDPOINTS.COMMENTS}/chat-rooms`,
        { headers }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch chat rooms');
    }
  }

  // Get comment thread (comment with all replies) - if backend supports it
  async getCommentThread(commentId: string): Promise<ApiResponse<Comment>> {
    try {
      const headers = getHeaders();
      const response = await api.get<ApiResponse<Comment>>(
        `${ENDPOINTS.COMMENTS}/comment/${commentId}/thread`, 
        { headers }
      );
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Fallback to regular comment if thread endpoint doesn't exist
      return this.getComment(commentId);
    }
  }

  // Batch delete comments - if backend supports it
  async batchDeleteComments(commentIds: string[]): Promise<ApiResponse<void>> {
    try {
      const headers = getHeaders();
      const response = await api.post<ApiResponse<void>>(
        `${ENDPOINTS.COMMENTS}/batch/delete`,
        { comment_ids: commentIds },
        { headers }
      );
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Fallback to deleting one by one if batch endpoint doesn't exist
      console.warn('Batch delete not supported, falling back to individual deletes');
      
      const results = await Promise.allSettled(
        commentIds.map(id => this.deleteComment(id))
      );
      
      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        throw new Error(`Failed to delete ${failed.length} comments`);
      }
      
      return {
        success: true,
        message: 'Comments deleted successfully',
        data: undefined
      };
    }
  }

  // Helper method to construct entity-specific comment data
  createCommentData(
    entityType: string,
    entityId: string,
    content: string,
    parentId?: string
  ): CommentCreate {
    const data: CommentCreate = {
      content,
      parent_id: parentId
    };

    // Add entity-specific ID based on type
    switch (entityType) {
      case 'ticket':
        data.ticket_id = entityId;
        break;
      case 'epic':
        data.epic_id = entityId;
        break;
      case 'sprint':
        data.sprint_id = entityId;
        break;
      case 'project':
        data.project_id = entityId;
        break;
      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }

    return data;
  }

  // Utility method to get comments with retry logic
  async fetchCommentsWithRetry(
    entityType: string,
    entityId: string,
    skip: number = 0,
    limit: number = 50,
    sortOrder: number = 1,
    maxRetries: number = 3
  ): Promise<ApiResponse<Comment[]>> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.fetchComments(entityType, entityId, skip, limit, sortOrder);
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries - 1) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    throw lastError || new Error('Failed to fetch comments after retries');
  }

  // Check if user has reacted to a comment
  hasUserReacted(comment: Comment, userId: string, reactionType: string): boolean {
    return comment.reactions?.[reactionType]?.includes(userId) || false;
  }

  // Get reaction count for a specific type
  getReactionCount(comment: Comment, reactionType: string): number {
    return comment.reaction_counts?.[reactionType] || 0;
  }

  // Get all users who reacted with a specific type
  getReactionUsers(comment: Comment, reactionType: string): string[] {
    return comment.reactions?.[reactionType] || [];
  }
}

// Export singleton instance
const CommentService = new CommentServiceClass();
export default CommentService;
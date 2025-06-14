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

const CommentService = {
  // Fetch comments for any entity type
  async fetchComments(
    entityType: string, 
    entityId: string, 
    skip: number = 0, 
    limit: number = 50,
    sortOrder: number = 1
  ): Promise<ApiResponse<Comment[]>> {
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
  },

  // Get single comment
  async getComment(commentId: string): Promise<ApiResponse<Comment>> {
    const headers = getHeaders();
    const response = await api.get<ApiResponse<Comment>>(
      `${ENDPOINTS.COMMENTS}/comment/${commentId}`, 
      { headers }
    );
    return response.data;
  },

  // Create comment
  async createComment(data: CommentCreate): Promise<ApiResponse<Comment>> {
    const headers = getHeaders();
    const response = await api.post<ApiResponse<Comment>>(
      ENDPOINTS.COMMENTS, 
      data, 
      { headers }
    );
    return response.data;
  },

  // Update comment
  async updateComment(commentId: string, data: CommentUpdate): Promise<ApiResponse<Comment>> {
    const headers = getHeaders();
    const response = await api.put<ApiResponse<Comment>>(
      `${ENDPOINTS.COMMENTS}/comment/${commentId}`, 
      data, 
      { headers }
    );
    return response.data;
  },

  // Delete comment
  async deleteComment(commentId: string): Promise<ApiResponse<void>> {
    const headers = getHeaders();
    const response = await api.delete<ApiResponse<void>>(
      `${ENDPOINTS.COMMENTS}/comment/${commentId}`, 
      { headers }
    );
    return response.data;
  },

  // Toggle reaction
  async toggleReaction(commentId: string, reactionType: string): Promise<ApiResponse<Comment>> {
    const headers = getHeaders();
    const response = await api.post<ApiResponse<Comment>>(
      `${ENDPOINTS.COMMENTS}/comment/${commentId}/reaction`,
      { reaction_type: reactionType },
      { headers }
    );
    return response.data;
  },

  // Get user's chat rooms
  async getChatRooms(): Promise<ApiResponse<ChatRoom[]>> {
    const headers = getHeaders();
    const response = await api.get<ApiResponse<ChatRoom[]>>(
      `${ENDPOINTS.COMMENTS}/chat-rooms`,
      { headers }
    );
    return response.data;
  }
};

export default CommentService;
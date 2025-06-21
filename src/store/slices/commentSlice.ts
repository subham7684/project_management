// src/store/slices/commentSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Comment } from "../../types/interfaces";
import CommentService from "../../services/comment";
import { ChatRoom, CommentCreate, CommentUpdate } from "@/types/commentTypes";
import type { RootState } from "../store";

interface CommentState {
  commentsByEntity: Record<string, Comment[]>;
  chatRooms: ChatRoom[];
  loading: {
    fetchComments: boolean;
    createComment: boolean;
    updateComment: boolean;
    deleteComment: boolean;
    fetchChatRooms: boolean;
  };
  error: string | null;
  pagination: Record<string, {
    skip: number;
    limit: number;
    total: number;
    hasMore: boolean;
  }>;
}

const initialState: CommentState = {
  commentsByEntity: {},
  chatRooms: [],
  loading: {
    fetchComments: false,
    createComment: false,
    updateComment: false,
    deleteComment: false,
    fetchChatRooms: false,
  },
  error: null,
  pagination: {},
};

const getEntityKey = (entityType: string, entityId: string) => `${entityType}:${entityId}`;

// Async thunks
export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async (params: { 
    entityType: string; 
    entityId: string; 
    skip?: number; 
    limit?: number;
    sortOrder?: number;
  }, { rejectWithValue }) => {
    try {
      const { entityType, entityId, skip = 0, limit = 50, sortOrder = 1 } = params;
      const response = await CommentService.fetchComments(entityType, entityId, skip, limit, sortOrder);
      return { 
        entityType, 
        entityId, 
        comments: response.data, 
        meta: response.meta,
        skip,
        limit 
      };
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch comments");
    }
  }
);

export const createComment = createAsyncThunk(
  "comments/createComment",
  async (params: { 
    entityType: string; 
    entityId: string; 
    data: CommentCreate 
  }, { rejectWithValue }) => {
    try {
      const response = await CommentService.createComment(params.data);
      return { 
        entityType: params.entityType, 
        entityId: params.entityId, 
        comment: response.data 
      };
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to create comment");
    }
  }
);

export const updateComment = createAsyncThunk(
  "comments/updateComment",
  async (params: { 
    entityType: string; 
    entityId: string; 
    commentId: string; 
    data: CommentUpdate 
  }, { rejectWithValue }) => {
    try {
      const response = await CommentService.updateComment(params.commentId, params.data);
      return { 
        entityType: params.entityType, 
        entityId: params.entityId, 
        comment: response.data 
      };
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to update comment");
    }
  }
);

export const deleteComment = createAsyncThunk(
  "comments/deleteComment",
  async (params: { 
    entityType: string; 
    entityId: string; 
    commentId: string 
  }, { rejectWithValue }) => {
    try {
      await CommentService.deleteComment(params.commentId);
      return { 
        entityType: params.entityType, 
        entityId: params.entityId, 
        commentId: params.commentId 
      };
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to delete comment");
    }
  }
);

export const toggleCommentReaction = createAsyncThunk(
  "comments/toggleReaction",
  async (params: { 
    entityType: string; 
    entityId: string; 
    commentId: string; 
    reactionType: string 
  }, { rejectWithValue }) => {
    try {
      const response = await CommentService.toggleReaction(params.commentId, params.reactionType);
      return { 
        entityType: params.entityType, 
        entityId: params.entityId, 
        comment: response.data 
      };
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to toggle reaction");
    }
  }
);

export const fetchChatRooms = createAsyncThunk(
  "comments/fetchChatRooms",
  async (_, { rejectWithValue }) => {
    try {
      const response = await CommentService.getChatRooms();
      return response.data;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch chat rooms");
    }
  }
);

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    addRealtimeComment: (state, action: PayloadAction<{ 
      entityType: string; 
      entityId: string; 
      comment: Comment 
    }>) => {
      const { entityType, entityId, comment } = action.payload;
      const key = getEntityKey(entityType, entityId);
      
      if (!state.commentsByEntity[key]) {
        state.commentsByEntity[key] = [];
      }
      
      const exists = state.commentsByEntity[key].find(c => c.id === comment.id);
      if (!exists) {
        state.commentsByEntity[key].push(comment);
      }
    },
    
    updateRealtimeComment: (state, action: PayloadAction<{ 
      entityType: string; 
      entityId: string; 
      comment: Comment 
    }>) => {
      const { entityType, entityId, comment } = action.payload;
      const key = getEntityKey(entityType, entityId);
      
      if (state.commentsByEntity[key]) {
        const index = state.commentsByEntity[key].findIndex(c => c.id === comment.id);
        if (index !== -1) {
          state.commentsByEntity[key][index] = comment;
        }
      }
    },
    
    removeRealtimeComment: (state, action: PayloadAction<{ 
      entityType: string; 
      entityId: string; 
      commentId: string 
    }>) => {
      const { entityType, entityId, commentId } = action.payload;
      const key = getEntityKey(entityType, entityId);
      
      if (state.commentsByEntity[key]) {
        state.commentsByEntity[key] = state.commentsByEntity[key].filter(c => c.id !== commentId);
      }
    },
    
    updateRealtimeReaction: (state, action: PayloadAction<{ 
      entityType: string; 
      entityId: string; 
      commentId: string; 
      reactions: Record<string, string[]>;
      reactionCounts: Record<string, number>;
    }>) => {
      const { entityType, entityId, commentId, reactions, reactionCounts } = action.payload;
      const key = getEntityKey(entityType, entityId);
      
      if (state.commentsByEntity[key]) {
        const comment = state.commentsByEntity[key].find(c => c.id === commentId);
        if (comment) {
          comment.reactions = reactions;
          comment.reaction_counts = reactionCounts;
        }
      }
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Comments
      .addCase(fetchComments.pending, (state) => {
        state.loading.fetchComments = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading.fetchComments = false;
        const { entityType, entityId, comments, meta, skip } = action.payload;
        const key = getEntityKey(entityType, entityId);
        
        if (skip === 0) {
          state.commentsByEntity[key] = comments;
        } else {
          if (!state.commentsByEntity[key]) {
            state.commentsByEntity[key] = [];
          }
          state.commentsByEntity[key].push(...comments);
        }
        
        state.pagination[key] = {
          skip: skip + comments.length,
          limit: action.payload.limit,
          total: meta?.total || comments.length,
          hasMore: comments.length === action.payload.limit
        };
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading.fetchComments = false;
        state.error = action.payload as string;
      })
      
      // Create Comment
      .addCase(createComment.pending, (state) => {
        state.loading.createComment = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state) => {
        state.loading.createComment = false;
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading.createComment = false;
        state.error = action.payload as string;
      })
      
      // Update Comment
      .addCase(updateComment.pending, (state) => {
        state.loading.updateComment = true;
        state.error = null;
      })
      .addCase(updateComment.fulfilled, (state) => {
        state.loading.updateComment = false;
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.loading.updateComment = false;
        state.error = action.payload as string;
      })
      
      // Delete Comment  
      .addCase(deleteComment.pending, (state) => {
        state.loading.deleteComment = true;
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state) => {
        state.loading.deleteComment = false;
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading.deleteComment = false;
        state.error = action.payload as string;
      })
      
      // Toggle Reaction
      .addCase(toggleCommentReaction.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleCommentReaction.fulfilled, () => {
        // Handled by WebSocket
      })
      .addCase(toggleCommentReaction.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Fetch Chat Rooms
      .addCase(fetchChatRooms.pending, (state) => {
        state.loading.fetchChatRooms = true;
        state.error = null;
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        state.loading.fetchChatRooms = false;
        state.chatRooms = action.payload;
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.loading.fetchChatRooms = false;
        state.error = action.payload as string;
      });
  }
});

export const { 
  addRealtimeComment, 
  updateRealtimeComment, 
  removeRealtimeComment,
  updateRealtimeReaction,
  clearError,
} = commentSlice.actions;

// Selectors
export const selectCommentsByEntity = (state: RootState, entityType: string, entityId: string) => {
  const key = getEntityKey(entityType, entityId);
  return state.comments.commentsByEntity[key] || [];
};

export const selectCommentPagination = (state: RootState, entityType: string, entityId: string) => {
  const key = getEntityKey(entityType, entityId);
  return state.comments.pagination[key];
};

export const selectChatRooms = (state: RootState) => state.comments.chatRooms;
export const selectCommentLoading = (state: RootState) => state.comments.loading;
export const selectCommentError = (state: RootState) => state.comments.error;

export default commentSlice.reducer;
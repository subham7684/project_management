// src/types/interfaces.ts

export interface User {
  id: string;
  full_name?: string;
  email?: string;
  role?: string;
}

// ========== Author Information ==========
export interface AuthorInfo {
  id: string;
  full_name?: string;
  email?: string;
  role?: string;
}

// ========== Comment Interfaces ==========

// Base comment structure
export interface CommentBase {
  content: string;
  ticket_id?: string;
  epic_id?: string;
  sprint_id?: string;
  project_id?: string;
  parent_id?: string; // For replies
}

// Comment creation payload
export interface CommentCreate extends CommentBase {}

// Comment update payload
export interface CommentUpdate {
  content: string;
}

// Full comment object (response from API)
export interface Comment extends CommentBase {
  id: string;
  author_id: string;
  author?: AuthorInfo;
  created_at: string; // ISO date string
  edited?: boolean;
  edited_at?: string; // ISO date string
  mentions: string[]; // Array of user IDs mentioned
  reactions: Record<string, string[]>; // { "like": ["user1", "user2"], "heart": ["user3"] }
  reaction_counts: Record<string, number>; // Made required to match backend
}

// Comment with nested replies
export interface CommentWithReplies extends Comment {
  replies: Comment[];
}

// Reaction payload
export interface CommentReaction {
  reaction_type: string;
}

// ========== Chat Room Interface ==========
export interface ChatRoom {
  id: string;
  type: "ticket" | "epic" | "sprint" | "project";
  name: string;
  project_id?: string;
  sprint_id?: string;
  epic_id?: string;
  is_admin: boolean;
}

// ========== WebSocket Message Interfaces ==========

// Base WebSocket message structure
export interface WSMessage {
  type: string;
  timestamp?: string;
  [key: string]: unknown;
}

// Specific WebSocket message types
export interface WSNewCommentMessage extends WSMessage {
  type: "new_comment";
  comment: Comment;
}

export interface WSCommentUpdatedMessage extends WSMessage {
  type: "comment_updated";
  comment: Comment;
}

export interface WSCommentDeletedMessage extends WSMessage {
  type: "comment_deleted";
  comment_id: string;
  user_id: string;
}

export interface WSReactionUpdateMessage extends WSMessage {
  type: "reaction_update";
  comment_id: string;
  reactions: Record<string, string[]>;
  reaction_counts: Record<string, number>;
  user_id: string;
  reaction_type: string;
}

export interface WSTypingMessage extends WSMessage {
  type: "typing";
  user_id: string;
  user_info: User;
  is_typing: boolean;
}

export interface WSActiveUsersMessage extends WSMessage {
  type: "active_users";
  users: ActiveUser[];
  count: number;
}

export interface WSUserJoinedMessage extends WSMessage {
  type: "user_joined";
  user_id: string;
  user_info: User;
}

export interface WSUserLeftMessage extends WSMessage {
  type: "user_left";
  user_id: string;
}

export interface WSErrorMessage extends WSMessage {
  type: "error";
  message: string;
}

export interface WSPongMessage extends WSMessage {
  type: "pong";
}

// ========== Active User Interface ==========
export interface ActiveUser {
  user_id: string;
  user_info: User;
  last_activity: string; // ISO date string
}

// ========== Typing User Interface ==========
export interface TypingUser extends User {
  timestamp: string; // ISO date string
}

// ========== API Response Wrappers ==========

// Standard API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total: number;
    skip: number;
    limit: number;
  };
  errors?: string[];
}

// Pagination metadata
export interface PaginationMeta {
  total: number;
  skip: number;
  limit: number;
}

// ========== Live Watchers Interface ==========
export interface LiveWatchersResponse {
  entity_type: string;
  entity_id: string;
  connections: number;
  users: number;
}

// ========== Comment Service Parameters ==========

// Parameters for fetching comments
export interface FetchCommentsParams {
  entityType: string;
  entityId: string;
  skip?: number;
  limit?: number;
  sortOrder?: number; // 1 for ascending, -1 for descending
}

// Parameters for creating comments
export interface CreateCommentParams {
  entityType: string;
  entityId: string;
  data: CommentCreate;
}

// Parameters for updating comments
export interface UpdateCommentParams {
  entityType: string;
  entityId: string;
  commentId: string;
  data: CommentUpdate;
}

// Parameters for deleting comments
export interface DeleteCommentParams {
  entityType: string;
  entityId: string;
  commentId: string;
}

// Parameters for toggling reactions
export interface ToggleReactionParams {
  entityType: string;
  entityId: string;
  commentId: string;
  reactionType: string;
}

// ========== Redux State Interfaces ==========

// Comment slice state
export interface CommentState {
  commentsByEntity: Record<string, Comment[]>; // key: "entityType:entityId"
  chatRooms: ChatRoom[];
  loading: {
    fetchComments: boolean;
    createComment: boolean;
    updateComment: boolean;
    deleteComment: boolean;
    fetchChatRooms: boolean;
  };
  error: string | null;
  pagination: Record<string, PaginationInfo>;
}

// Pagination info for each entity
export interface PaginationInfo {
  skip: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// ========== Component Props Interfaces ==========

// Props for comment component
export interface CommentComponentProps {
  comment: Comment;
  entityType: string;
  entityId: string;
  currentUserId: string;
  onReply?: (parentId: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  onReaction?: (commentId: string, reactionType: string) => void;
  showReplies?: boolean;
  level?: number; // For nested replies
}

// Props for comment list component
export interface CommentListProps {
  entityType: string;
  entityId: string;
  comments: Comment[];
  loading: boolean;
  error: string | null;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

// Props for comment input component
export interface CommentInputProps {
  entityType: string;
  entityId: string;
  parentId?: string; // For replies
  placeholder?: string;
  onSubmit?: (content: string) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
}

// Props for typing indicators component
export interface TypingIndicatorsProps {
  typingUsers: TypingUser[];
  currentUserId: string;
}

// Props for active users component
export interface ActiveUsersProps {
  activeUsers: ActiveUser[];
  currentUserId: string;
  showDetails?: boolean;
}

// Props for reactions component
export interface ReactionsProps {
  reactions: Record<string, string[]>;
  reactionCounts: Record<string, number>;
  currentUserId: string;
  onToggleReaction: (reactionType: string) => void;
  disabled?: boolean;
}

// ========== Utility Types ==========

// Entity types
export type EntityType = "ticket" | "epic" | "sprint" | "project";

// Reaction types (matching backend ALLOWED_REACTION_TYPES)
export type ReactionType = 
  | "like"
  | "thumbs_up"
  | "heart"
  | "laugh"
  | "insightful"
  | "celebrate"
  | "confused"
  | "eyes"
  | "rocket"
  | "sad";

// WebSocket event types
export type WSEventType = 
  | "active_users"
  | "user_joined"
  | "user_left"
  | "new_comment"
  | "comment_updated"
  | "comment_deleted"
  | "reaction_update"
  | "typing"
  | "pong"
  | "error";

// Sort order for comments
export type CommentSortOrder = 1 | -1; // 1 = ascending (oldest first), -1 = descending (newest first)

// ========== Error Interfaces ==========
export interface CommentError {
  message: string;
  code?: string;
  details?: string[];
}

// ========== Notification Interface ==========
export interface MentionNotification {
  id: string;
  user_id: string;
  type: "mention";
  sender_id: string;
  sender_name: string;
  entity_type: EntityType;
  entity_id: string;
  entity_name: string;
  comment_id: string;
  message: string;
  read: boolean;
  created_at: string;
}
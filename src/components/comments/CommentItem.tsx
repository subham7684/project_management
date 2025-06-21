// src/components/comments/CommentItem.tsx
import React, { useState, useRef, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Edit2, 
  Trash2, 
  MessageSquare, 
  MoreVertical, 
  Clock,
  Check,
  X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Comment } from '@/types/commentTypes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import ReactionPicker from './ReactionPicker';
import { cn } from '@/lib/utils';

interface CommentItemProps {
  comment: Comment;
  entityType: string;
  entityId: string;
  currentUserId: string;
  userRole: string;
  level?: number;
  onReply?: (parentId: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  onReaction?: (commentId: string, reactionType: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  entityType,
  entityId,
  currentUserId,
  userRole,
  level = 0,
  onReply,
  onEdit,
  onDelete,
  onReaction,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showFullDate, setShowFullDate] = useState(false);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  const isAuthor = comment.author_id === currentUserId;
  const isAdmin = userRole === 'admin' || userRole === 'Admin';
  const canEdit = isAuthor;
  const canDelete = isAuthor || isAdmin;
  const canReply = level < 3; // Limit nesting depth

  useEffect(() => {
    if (isEditing && editTextareaRef.current) {
      editTextareaRef.current.focus();
      editTextareaRef.current.setSelectionRange(
        editContent.length,
        editContent.length
      );
    }
  }, [isEditing, editContent.length]);

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onEdit?.(comment.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.[0]?.toUpperCase() || '?';
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    if (showFullDate) {
      return format(d, 'PPpp');
    }
    return formatDistanceToNow(d, { addSuffix: true });
  };

  return (
    <div 
      className={cn(
        "group relative",
        level > 0 && "ml-2"
      )}
    >
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage 
            src={`/api/avatar/${comment.author_id}`} 
            alt={comment.author?.full_name || 'User'} 
          />
          <AvatarFallback className="text-xs">
            {getInitials(comment.author?.full_name, comment.author?.email)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">
                {comment.author?.full_name || 'Unknown User'}
              </span>
              {comment.author?.role && (
                <Badge variant="secondary" className="text-xs">
                  {comment.author.role}
                </Badge>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                      onClick={() => setShowFullDate(!showFullDate)}
                    >
                      {formatDate(comment.created_at)}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{format(new Date(comment.created_at), 'PPpp')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {comment.edited && (
                <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                  (edited)
                </span>
              )}
            </div>

            {(canEdit || canDelete) && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEdit && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete?.(comment.id)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                ref={editTextareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    handleCancelEdit();
                  } else if (e.key === 'Enter' && e.ctrlKey) {
                    handleSaveEdit();
                  }
                }}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim() || editContent === comment.content}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEdit}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    a: ({ href, children }) => (
                      <a 
                        href={href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {children}
                      </a>
                    ),
                    code: ({ children }) => (
                      <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">
                        {children}
                      </code>
                    ),
                  }}
                >
                  {comment.content}
                </ReactMarkdown>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <ReactionPicker
                  reactions={comment.reactions || {}}
                  reactionCounts={comment.reaction_counts || {}}
                  currentUserId={currentUserId}
                  onToggleReaction={(reactionType) => 
                    onReaction?.(comment.id, reactionType)
                  }
                />
                
                {canReply && onReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => onReply(comment.id)}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
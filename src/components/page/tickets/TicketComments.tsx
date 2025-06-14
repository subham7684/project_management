// --- file: src/components/ticketDetails/TicketComments.tsx ---
import { FC, useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { useDispatch } from 'react-redux';
import { Send, Edit2, Trash2, MessageSquare, SmilePlus } from 'lucide-react';
import { Comment, Ticket } from '../../../types/interfaces';
import { AppDispatch } from '../../../store/store';
import commentService from '../../../services/comment';
import websocketService from '../../../services/webSocket';
import { toast } from '../../../components/ui/use_toast';
import debounce from 'lodash/debounce';
import ReactMarkdown from 'react-markdown';
import { useAppDispatch } from '@/lib/hooks/redux';

interface TicketCommentsProps {
  comments: Comment[];
  ticket: Ticket;
  uiColors: any;
  themeColors: any;
}

interface ReactionEmoji {
  name: string;
  emoji: string;
}

const TicketComments: FC<TicketCommentsProps> = ({
  comments,
  ticket,
  uiColors,
  themeColors
}) => {
  const dispatch = useAppDispatch();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [collapsedReplies, setCollapsedReplies] = useState<Record<string, boolean>>({});
  
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const reactionPickerRef = useRef<HTMLDivElement>(null);
  
  // Get current user ID from local storage
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  
  // Available reactions
  const reactionEmojis: ReactionEmoji[] = [
    { name: 'thumbs_up', emoji: '👍' },
    { name: 'heart', emoji: '❤️' },
    { name: 'smile', emoji: '😄' },
    { name: 'tada', emoji: '🎉' },
    { name: 'thinking', emoji: '🤔' },
    { name: 'rocket', emoji: '🚀' },
  ];
  
  // Sort comments: parent comments first, then by date
  const sortedComments = [...comments].sort((a, b) => {
    // Put parent comments first
    if (!a.parent_id && b.parent_id) return -1;
    if (a.parent_id && !b.parent_id) return 1;
    
    // Then sort by date (newest first for parent comments)
    if (!a.parent_id && !b.parent_id) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    
    // Sort replies chronologically (oldest first)
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
  
  // Group comments by parent
  const commentMap = sortedComments.reduce<Record<string, Comment[]>>((acc, comment) => {
    if (!comment.parent_id) {
      // This is a parent comment
      if (!acc[comment.id]) {
        acc[comment.id] = [];
      }
    } else {
      // This is a reply
      if (!acc[comment.parent_id]) {
        acc[comment.parent_id] = [];
      }
      acc[comment.parent_id].push(comment);
    }
    return acc;
  }, {});
  
  // Parent comments
  const parentComments = sortedComments.filter(comment => !comment.parent_id);
  
  // Set up debounced typing indicator
  const debouncedTypingIndicator = useRef(
    debounce((isTyping: boolean) => {
      websocketService.setTypingIndicator('ticket', ticket.id, isTyping);
    }, 400)
  ).current;
  
  // Handle textarea input
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentText(e.target.value);
    debouncedTypingIndicator(e.target.value.length > 0);
  };
  
  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    
    setIsSubmitting(true);
    debouncedTypingIndicator(false);
    
    try {
      if (replyingTo) {
        // Send reply via WebSocket
        websocketService.sendComment('ticket', ticket.id, commentText, replyingTo);
        setReplyingTo(null);
      } else {
        // Send new comment via WebSocket
        websocketService.sendComment('ticket', ticket.id, commentText);
      }
      
      // Clear input
      setCommentText('');
      
      // Scroll to bottom after a brief delay to allow the comment to appear
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to submit comment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle editing a comment
  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.content);
  };
  
  // Save edited comment
  const handleSaveEdit = async () => {
    if (!editingCommentId || !editingText.trim()) return;
    
    try {
      // Send edited comment via WebSocket
      websocketService.editComment('ticket', ticket.id, editingCommentId, editingText);
      
      // Reset editing state
      setEditingCommentId(null);
      setEditingText('');
    } catch (error) {
      console.error('Error editing comment:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to edit comment',
        variant: 'destructive',
      });
    }
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText('');
  };
  
  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      // Send delete via WebSocket
      websocketService.deleteComment('ticket', ticket.id, commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive',
      });
    }
  };
  
  // Handle reaction click
  const handleReactionClick = (commentId: string) => {
    if (showReactionPicker === commentId) {
      setShowReactionPicker(null);
    } else {
      setShowReactionPicker(commentId);
    }
  };
  
  // Add reaction
  const handleAddReaction = (commentId: string, reactionType: string) => {
    websocketService.toggleReaction('ticket', ticket.id, commentId, reactionType);
    setShowReactionPicker(null);
  };
  
  // Handle reply to comment
  const handleReplyClick = (commentId: string) => {
    setReplyingTo(commentId);
    
    // Focus on comment input
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };
  
  // Toggle replies collapse
  const toggleRepliesCollapse = (commentId: string) => {
    setCollapsedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return format(date, 'MMM d, yyyy');
  };
  
  // Click outside to close reaction picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        reactionPickerRef.current &&
        !reactionPickerRef.current.contains(event.target as Node)
      ) {
        setShowReactionPicker(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Render comment reactions
  const renderReactions = (comment: Comment) => {
    if (!comment.reactions || !comment.reaction_counts) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {Object.entries(comment.reaction_counts).map(([type, count]) => {
          const emoji = reactionEmojis.find(r => r.name === type)?.emoji || '👍';
          const hasReacted = comment.reactions && comment.reactions[type]?.includes(currentUserId || '');
          
          return (
            <button
              key={type}
              onClick={() => handleAddReaction(comment.id, type)}
              className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                hasReacted 
                  ? `${themeColors.accentBg} ${themeColors.accentText}` 
                  : `${uiColors.softBg} ${uiColors.mutedText}`
              } transition-colors`}
            >
              <span>{emoji}</span>
              <span>{count}</span>
            </button>
          );
        })}
      </div>
    );
  };
  
  // Render single comment
  const renderComment = (comment: Comment, isReply = false) => {
    const isCurrentUserAuthor = comment.author_id === currentUserId;
    const isEditing = editingCommentId === comment.id;
    
    return (
      <div 
        key={comment.id}
        className={`${
          isReply ? 'ml-8 mt-2' : 'mt-4'
        } ${uiColors.cardBg} rounded-lg border ${uiColors.borderColor} overflow-hidden`}
      >
        {/* Comment header */}
        <div className={`flex justify-between items-center px-4 py-2 ${uiColors.softBg} border-b ${uiColors.borderColor}`}>
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white"
            >
              {comment.author_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className={`font-medium text-sm ${themeColors.primaryText}`}>
                {comment.author_name}
              </div>
              <div className={`text-xs ${uiColors.mutedText}`}>
                {formatTimestamp(comment.created_at)}
                {comment.updated_at !== comment.created_at && (
                  <span className="ml-1 italic">(edited)</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Comment actions */}
          {isCurrentUserAuthor && !isEditing && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleEditComment(comment)}
                className={`p-1 rounded-full hover:${uiColors.softBg} transition-colors`}
                aria-label="Edit comment"
              >
                <Edit2 size={16} className={uiColors.mutedText} />
              </button>
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className={`p-1 rounded-full hover:${uiColors.softBg} transition-colors`}
                aria-label="Delete comment"
              >
                <Trash2 size={16} className={uiColors.mutedText} />
              </button>
            </div>
          )}
        </div>
        
        {/* Comment content */}
        <div className="px-4 py-3">
          {isEditing ? (
            <div>
              <textarea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                className={`w-full p-3 rounded-lg border ${uiColors.borderColor} ${uiColors.inputBg} ${uiColors.inputText} min-h-[100px] focus:outline-none focus:ring-2 ${themeColors.focusRing}`}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={handleCancelEdit}
                  className={`px-3 py-1 text-sm rounded-md border ${uiColors.borderColor} hover:${uiColors.softBg} transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className={`px-3 py-1 text-sm rounded-md ${themeColors.buttonBg} ${themeColors.buttonText} hover:opacity-90 transition-colors`}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{comment.content}</ReactMarkdown>
            </div>
          )}
          
          {/* Reactions */}
          {!isEditing && renderReactions(comment)}
          
          {/* Comment actions */}
          {!isEditing && (
            <div className="flex justify-start mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleReplyClick(comment.id)}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md ${uiColors.softBg} ${uiColors.mutedText} hover:opacity-80 transition-colors mr-2`}
              >
                <MessageSquare size={14} />
                <span>Reply</span>
              </button>
              
              <div className="relative">
                <button
                  onClick={() => handleReactionClick(comment.id)}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md ${uiColors.softBg} ${uiColors.mutedText} hover:opacity-80 transition-colors`}
                >
                  <SmilePlus size={14} />
                  <span>React</span>
                </button>
                
                {/* Reaction picker */}
                {showReactionPicker === comment.id && (
                  <div 
                    ref={reactionPickerRef}
                    className={`absolute bottom-full left-0 mb-1 p-2 rounded-lg shadow-lg ${uiColors.cardBg} border ${uiColors.borderColor} flex space-x-2 z-10`}
                  >
                    {reactionEmojis.map((reaction) => (
                      <button
                        key={reaction.name}
                        onClick={() => handleAddReaction(comment.id, reaction.name)}
                        className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                      >
                        {reaction.emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Replies */}
        {!isReply && commentMap[comment.id] && commentMap[comment.id].length > 0 && (
          <div className={`px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t ${uiColors.borderColor}`}>
            <button
              onClick={() => toggleRepliesCollapse(comment.id)}
              className={`flex items-center gap-1 text-xs ${themeColors.accentText} mb-2`}
            >
              <span>{collapsedReplies[comment.id] ? 'Show' : 'Hide'} {commentMap[comment.id].length} {commentMap[comment.id].length === 1 ? 'reply' : 'replies'}</span>
            </button>
            
            {!collapsedReplies[comment.id] && (
              <div className="space-y-2">
                {commentMap[comment.id].map(reply => renderComment(reply, true))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`mb-6 ${uiColors.cardBg} rounded-xl border ${uiColors.borderColor} shadow-sm overflow-hidden`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className={`text-sm font-medium ${themeColors.secondaryText} mb-4`}>
          Comments ({comments.length})
        </h3>
        
        {/* Comments list */}
        <div className="space-y-4">
          {parentComments.length > 0 ? (
            parentComments.map(comment => renderComment(comment))
          ) : (
            <div className={`text-center py-8 ${uiColors.mutedText}`}>
              <MessageSquare size={24} className="mx-auto mb-2 opacity-40" />
              <p>No comments yet</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Comment input */}
      <div className="p-4">
        {replyingTo && (
          <div className={`flex items-center gap-2 mb-2 p-2 rounded ${uiColors.softBg}`}>
            <span className={`text-sm ${uiColors.mutedText}`}>
              Replying to comment
            </span>
            <button
              onClick={() => setReplyingTo(null)}
              className={`text-xs ${themeColors.accentText} hover:opacity-80`}
            >
              Cancel
            </button>
          </div>
        )}
        
        <div className="flex items-start gap-2">
          <textarea
            ref={commentInputRef}
            value={commentText}
            onChange={handleCommentChange}
            placeholder="Add a comment..."
            className={`flex-grow p-3 rounded-lg border ${uiColors.borderColor} ${uiColors.inputBg} ${uiColors.inputText} min-h-[100px] focus:outline-none focus:ring-2 ${themeColors.focusRing}`}
          />
          <button
            onClick={handleSubmitComment}
            disabled={isSubmitting || !commentText.trim()}
            className={`p-3 rounded-lg ${themeColors.buttonBg} ${themeColors.buttonText} ${
              isSubmitting || !commentText.trim() 
                ? 'opacity-50 cursor-not-allowed' 
                : `${themeColors.buttonHoverBg} cursor-pointer`
            } transition-colors flex items-center justify-center`}
          >
            <Send size={20} />
          </button>
        </div>
        <p className={`mt-2 text-xs ${uiColors.mutedText}`}>
          Supports Markdown formatting
        </p>
      </div>
    </div>
  );
};

export default TicketComments;
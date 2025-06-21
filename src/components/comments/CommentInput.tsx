// src/components/comments/CommentInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, AtSign, Paperclip, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import debounce from 'lodash/debounce';

interface CommentInputProps {
  entityType: string;
  entityId: string;
  parentId?: string;
  replyingTo?: { id: string; author: string } | null;
  placeholder?: string;
  onSubmit?: (content: string) => void;
  onTyping?: (isTyping: boolean) => void;
  onCancelReply?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

const EMOJI_LIST = ['👍', '❤️', '😊', '😂', '🎉', '🤔', '😢', '👏', '🔥', '💯'];

const CommentInput: React.FC<CommentInputProps> = ({
  entityType,
  entityId,
  parentId,
  replyingTo,
  placeholder = 'Write a comment...',
  onSubmit,
  onTyping,
  onCancelReply,
  disabled = false,
  autoFocus = false,
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [content]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Debounced typing indicator
  const handleTyping = debounce((isTyping: boolean) => {
    onTyping?.(isTyping);
  }, 300);

  const handleContentChange = (value: string) => {
    setContent(value);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set typing to true
    handleTyping(true);
    
    // Set typing to false after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      handleTyping(false);
    }, 2000);
  };

  const handleSubmit = async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      await onSubmit?.(trimmedContent);
      setContent('');
      handleTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const insertEmoji = (emoji: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newContent = content.slice(0, start) + emoji + content.slice(end);
      setContent(newContent);
      
      // Set cursor position after emoji
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + emoji.length;
          textareaRef.current.selectionEnd = start + emoji.length;
          textareaRef.current.focus();
        }
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      handleTyping(false);
    };
  }, []);

  return (
    <div className="space-y-2">
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Replying to <span className="font-medium">{replyingTo.author}</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onCancelReply}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isSubmitting}
          className={cn(
            "min-h-[80px] max-h-[300px] resize-none pr-12 pb-10",
            "focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          )}
        />
        
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={disabled || isSubmitting}
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start">
                <div className="grid grid-cols-5 gap-1">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => insertEmoji(emoji)}
                      className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex items-center justify-center text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={disabled || isSubmitting}
              title="Mention someone"
            >
              <AtSign className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={disabled || isSubmitting}
              title="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Ctrl+Enter to send
            </span>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting || disabled}
              className="h-8"
            >
              <Send className="h-4 w-4 mr-1" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentInput;
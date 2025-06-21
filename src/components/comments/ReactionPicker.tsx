// src/components/comments/ReactionPicker.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ReactionPickerProps {
  reactions: Record<string, string[]>;
  reactionCounts: Record<string, number>;
  currentUserId: string;
  onToggleReaction: (reactionType: string) => void;
  disabled?: boolean;
}

const REACTION_EMOJIS: Record<string, { emoji: string; label: string }> = {
  like: { emoji: '👍', label: 'Like' },
  thumbs_up: { emoji: '👍', label: 'Thumbs up' },
  heart: { emoji: '❤️', label: 'Love' },
  laugh: { emoji: '😂', label: 'Haha' },
  insightful: { emoji: '💡', label: 'Insightful' },
  celebrate: { emoji: '🎉', label: 'Celebrate' },
  confused: { emoji: '😕', label: 'Confused' },
  eyes: { emoji: '👀', label: 'Watching' },
  rocket: { emoji: '🚀', label: 'Rocket' },
  sad: { emoji: '😢', label: 'Sad' },
};

const ReactionPicker: React.FC<ReactionPickerProps> = ({
  reactions,
  reactionCounts,
  currentUserId,
  onToggleReaction,
  disabled = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const hasReacted = (reactionType: string) => {
    return reactions[reactionType]?.includes(currentUserId) || false;
  };

  const getReactionUsers = (reactionType: string) => {
    return reactions[reactionType] || [];
  };

  // Get active reactions (those with at least one user)
  const activeReactions = Object.entries(reactionCounts)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => ({ type, count }));

  return (
    <div className="flex items-center gap-1">
      <AnimatePresence>
        {activeReactions.map(({ type, count }) => {
          const reactionData = REACTION_EMOJIS[type];
          if (!reactionData) return null;
          
          const users = getReactionUsers(type);
          const userReacted = hasReacted(type);
          
          return (
            <motion.div
              key={type}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-7 px-2 gap-1",
                        userReacted && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
                        "hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                      onClick={() => onToggleReaction(type)}
                      disabled={disabled}
                    >
                      <span className="text-sm">{reactionData.emoji}</span>
                      <span className={cn(
                        "text-xs font-medium",
                        userReacted ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                      )}>
                        {count}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm">
                      <p className="font-medium mb-1">{reactionData.label}</p>
                      {users.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {users.length === 1 ? '1 person' : `${users.length} people`} reacted
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      <Popover open={showPicker} onOpenChange={setShowPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            disabled={disabled}
          >
            <SmilePlus className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-5 gap-1">
            {Object.entries(REACTION_EMOJIS).map(([type, { emoji, label }]) => (
              <TooltipProvider key={type}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        onToggleReaction(type);
                        setShowPicker(false);
                      }}
                      className={cn(
                        "h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg",
                        "flex items-center justify-center text-xl transition-all",
                        "hover:scale-110",
                        hasReacted(type) && "bg-blue-50 dark:bg-blue-900/20"
                      )}
                      disabled={disabled}
                    >
                      {emoji}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ReactionPicker;
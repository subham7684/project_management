// src/components/comments/TypingIndicator.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypingUser } from '@/types/commentTypes';

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
  currentUserId: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  currentUserId,
}) => {
  // Filter out current user
  const otherTypingUsers = typingUsers.filter(user => user.id !== currentUserId);
  
  if (otherTypingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (otherTypingUsers.length === 1) {
      return `${otherTypingUsers[0].full_name || 'Someone'} is typing`;
    } else if (otherTypingUsers.length === 2) {
      return `${otherTypingUsers[0].full_name} and ${otherTypingUsers[1].full_name} are typing`;
    } else {
      return `${otherTypingUsers[0].full_name} and ${otherTypingUsers.length - 1} others are typing`;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 px-2 py-1"
      >
        <span className="text-xs">{getTypingText()}</span>
        <div className="flex gap-1">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: 0,
            }}
            className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: 0.2,
            }}
            className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: 0.4,
            }}
            className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TypingIndicator;
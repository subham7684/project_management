// src/components/comments/ActiveUsers.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ActiveUser } from '@/types/commentTypes';
import { cn } from '@/lib/utils';

interface ActiveUsersProps {
  activeUsers: ActiveUser[];
  currentUserId: string;
  showDetails?: boolean;
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
}

const ActiveUsers: React.FC<ActiveUsersProps> = ({
  activeUsers,
  currentUserId,
  showDetails = true,
  maxDisplay = 5,
  size = 'md',
}) => {
  // Filter out current user and get unique users
  const otherUsers = activeUsers.filter(user => user.user_id !== currentUserId);
  const displayUsers = otherUsers.slice(0, maxDisplay);
  const remainingCount = Math.max(0, otherUsers.length - maxDisplay);

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

  const getActivityStatus = (lastActivity: string) => {
    const now = new Date();
    const last = new Date(lastActivity);
    const diffMinutes = Math.floor((now.getTime() - last.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return { status: 'active', text: 'Active now' };
    if (diffMinutes < 5) return { status: 'idle', text: 'Active recently' };
    return { status: 'away', text: `Active ${diffMinutes}m ago` };
  };

  const avatarSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const overlapClass = {
    sm: '-ml-2',
    md: '-ml-3',
    lg: '-ml-4',
  };

  if (otherUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        <Users className={cn(
          "text-gray-500 dark:text-gray-400",
          size === 'sm' && "h-4 w-4",
          size === 'md' && "h-5 w-5",
          size === 'lg' && "h-6 w-6"
        )} />
      </div>
      
      <div className="flex items-center">
        <AnimatePresence>
          {displayUsers.map((user, index) => {
            const activity = getActivityStatus(user.last_activity);
            
            return (
              <motion.div
                key={user.user_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "relative",
                  index > 0 && overlapClass[size]
                )}
                style={{ zIndex: maxDisplay - index }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        <Avatar className={cn(
                          avatarSizes[size],
                          "border-2 border-white dark:border-gray-900 cursor-pointer"
                        )}>
                          <AvatarImage 
                            src={`/api/avatar/${user.user_id}`} 
                            alt={user.user_info.full_name || 'User'} 
                          />
                          <AvatarFallback className="text-xs">
                            {getInitials(user.user_info.full_name, user.user_info.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-gray-900",
                          activity.status === 'active' && "bg-green-500",
                          activity.status === 'idle' && "bg-yellow-500",
                          activity.status === 'away' && "bg-gray-400",
                          size === 'sm' && "h-2 w-2",
                          size === 'md' && "h-2.5 w-2.5",
                          size === 'lg' && "h-3 w-3"
                        )} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="p-3">
                      <div className="space-y-1">
                        <p className="font-medium">
                          {user.user_info.full_name || 'Unknown User'}
                        </p>
                        {user.user_info.role && (
                          <Badge variant="secondary" className="text-xs">
                            {user.user_info.role}
                          </Badge>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.text}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {remainingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "relative",
              overlapClass[size]
            )}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    "flex items-center justify-center rounded-full",
                    "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
                    "border-2 border-white dark:border-gray-900",
                    "text-xs font-medium",
                    avatarSizes[size]
                  )}>
                    +{remainingCount}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{remainingCount} more {remainingCount === 1 ? 'user' : 'users'} viewing</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        )}
      </div>
      
      {showDetails && (
        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
          {otherUsers.length} {otherUsers.length === 1 ? 'user' : 'users'} viewing
        </span>
      )}
    </div>
  );
};

export default ActiveUsers;
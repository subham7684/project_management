// src/components/comments/CommentThread.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useComments } from '@/hooks/useComments';
import { useWebSocketConnection } from '@/hooks/webSockets';
import CommentList from './CommentList';
import CommentInput from './CommentInput';
import ActiveUsers from './ActiveUsers';
import TypingIndicator from './TypingIndicator';
import { cn } from '@/lib/utils';

interface CommentThreadProps {
  entityType: 'ticket' | 'epic' | 'sprint' | 'project';
  entityId: string;
  entityName?: string;
  currentUserId: string;
  userRole: string;
  className?: string;
}

const CommentThread: React.FC<CommentThreadProps> = ({
  entityType,
  entityId,
  entityName,
  currentUserId,
  userRole,
  className,
}) => {
  const [replyingTo, setReplyingTo] = useState<{ id: string; author: string } | null>(null);
  const [activeTab, setActiveTab] = useState('comments');

  const {
    comments,
    loading,
    error,
    hasMore,
    typingUsers,
    createComment,
    updateComment,
    deleteComment,
    toggleReaction,
    loadMore,
    setTyping,
  } = useComments(entityType, entityId);

  const { isConnected, activeUsers } = useWebSocketConnection(entityType, entityId);

  const handleReply = (parentId: string) => {
    const parentComment = comments.find((c: { id: string; }) => c.id === parentId);
    if (parentComment) {
      setReplyingTo({
        id: parentId,
        author: parentComment.author?.full_name || 'Unknown User'
      });
    }
  };

  const handleSubmitComment = async (content: string) => {
    await createComment({
      content,
      parent_id: replyingTo?.id,
    });
    setReplyingTo(null);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments
              {entityName && (
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  on {entityName}
                </span>
              )}
            </CardTitle>
            <Badge variant="secondary" className="ml-2">
              {comments.length}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <ActiveUsers 
              activeUsers={activeUsers} 
              currentUserId={currentUserId}
              size="sm"
              showDetails={false}
            />
            
            <div className="flex items-center gap-1">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 rounded-none">
            <TabsTrigger value="comments" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Discussion
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Users className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comments" className="flex-1 flex flex-col mt-0">
            <div className="flex-1 overflow-hidden p-4">
              <CommentList
                entityType={entityType}
                entityId={entityId}
                comments={comments}
                loading={loading}
                error={error}
                currentUserId={currentUserId}
                userRole={userRole}
                onLoadMore={loadMore}
                hasMore={hasMore}
                onReply={handleReply}
                onEdit={updateComment}
                onDelete={deleteComment}
                onReaction={toggleReaction}
              />
            </div>

            <div className="border-t dark:border-gray-800">
              {typingUsers.length > 0 && (
                <TypingIndicator
                  typingUsers={typingUsers}
                  currentUserId={currentUserId}
                />
              )}
              
              <div className="p-4">
                <CommentInput
                  entityType={entityType}
                  entityId={entityId}
                  parentId={replyingTo?.id}
                  replyingTo={replyingTo}
                  placeholder={replyingTo ? `Reply to ${replyingTo.author}...` : "Write a comment..."}
                  onSubmit={handleSubmitComment}
                  onTyping={setTyping}
                  onCancelReply={handleCancelReply}
                  autoFocus={!!replyingTo}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="flex-1 p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Active Users</h3>
                <ActiveUsers
                  activeUsers={activeUsers}
                  currentUserId={currentUserId}
                  showDetails={true}
                  maxDisplay={10}
                  size="lg"
                />
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-3">Recent Activity</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Activity timeline coming soon...
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CommentThread;
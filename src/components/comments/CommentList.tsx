// src/components/comments/CommentList.tsx
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import { Comment } from '@/types/interfaces';
import CommentItem from './CommentItem';
import CommentSkeleton from './CommentSkeleton';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CommentListProps {
  entityType: string;
  entityId: string;
  comments: Comment[];
  loading: boolean;
  error: string | null;
  currentUserId: string;
  userRole: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  onReply?: (parentId: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  onReaction?: (commentId: string, reactionType: string) => void;
}

const CommentList: React.FC<CommentListProps> = ({
  entityType,
  entityId,
  comments,
  loading,
  error,
  currentUserId,
  userRole,
  onLoadMore,
  hasMore = false,
  onReply,
  onEdit,
  onDelete,
  onReaction,
}) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Group comments by parent
  const commentsByParent = React.useMemo(() => {
    const map: Record<string, Comment[]> = { root: [] };
    
    comments.forEach(comment => {
      const parentId = comment.parent_id || 'root';
      if (!map[parentId]) map[parentId] = [];
      map[parentId].push(comment);
    });
    
    return map;
  }, [comments]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!onLoadMore || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [onLoadMore, hasMore, loading]);

  // Render comment tree
  const renderCommentTree = (parentId: string = 'root', level: number = 0) => {
    const childComments = commentsByParent[parentId] || [];
    
    return childComments.map((comment, index) => (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <CommentItem
          comment={comment}
          entityType={entityType}
          entityId={entityId}
          currentUserId={currentUserId}
          userRole={userRole}
          level={level}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onReaction={onReaction}
        />
        {commentsByParent[comment.id] && (
          <div className="ml-8 mt-2 border-l-2 border-gray-100 dark:border-gray-800 pl-4">
            {renderCommentTree(comment.id, level + 1)}
          </div>
        )}
      </motion.div>
    ));
  };

  if (loading && comments.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <CommentSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg font-medium">No comments yet</p>
        <p className="text-gray-400 text-sm mt-1">Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pr-4">
        <AnimatePresence mode="popLayout">
          {renderCommentTree()}
        </AnimatePresence>
        
        {hasMore && (
          <div ref={loadMoreRef} className="flex justify-center py-4">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading more comments...
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={onLoadMore}>
                Load more
              </Button>
            )}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default CommentList;
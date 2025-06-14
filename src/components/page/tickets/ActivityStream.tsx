// --- file: src/components/ticketDetails/ActivityStream.tsx ---
import { FC, useEffect, useState } from 'react';
import { Clock, ClipboardList, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { TicketHistory, Comment } from '../../../types/interfaces';

interface ActivityItem {
  id: string;
  type: 'comment' | 'history';
  content: string;
  user: string;
  timestamp: string;
}

interface ActivityStreamProps {
  history: TicketHistory[];
  comments: Comment[];
  uiColors: any;
  themeColors: any;
}

const ActivityStream: FC<ActivityStreamProps> = ({ 
  history,
  comments,
  uiColors,
  themeColors 
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  
  // Combine and sort history and comments
  useEffect(() => {
    // Transform history items
    const historyActivities: ActivityItem[] = history.map(item => ({
      id: `history-${item.timestamp}-${item.assigned_by}`,
      type: 'history',
      content: item.action,
      user: item.user_name,
      timestamp: item.timestamp
    }));
    
    // Transform comments
    const commentActivities: ActivityItem[] = comments.map(comment => ({
      id: `comment-${comment.id}`,
      type: 'comment',
      content: comment.content.length > 120 ? comment.content.substring(0, 120) + '...' : comment.content,
      user: comment.author_name,
      timestamp: comment.created_at
    }));
    
    // Combine and sort by timestamp (newest first)
    const allActivities = [...historyActivities, ...commentActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setActivities(allActivities);
  }, [history, comments]);
  
  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <div className={`mb-6 ${uiColors.cardBg} rounded-xl border ${uiColors.borderColor} shadow-sm overflow-hidden`}>
      <div className={`p-4 border-b ${uiColors.borderColor}`}>
        <h3 className={`text-sm font-medium ${themeColors.secondaryText} flex items-center gap-2`}>
          <Clock size={16} />
          <span>Activity Stream</span>
        </h3>
      </div>
      
      {activities.length > 0 ? (
        <div className={`divide-y ${uiColors.borderColor} max-h-72 overflow-y-auto`}>
          {activities.map(activity => (
            <div 
              key={activity.id}
              className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Activity type icon */}
                <div className={`mt-1 p-1.5 rounded-md ${activity.type === 'comment' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  {activity.type === 'comment' ? (
                    <MessageSquare size={14} className="text-blue-600 dark:text-blue-400" />
                  ) : (
                    <ClipboardList size={14} className={uiColors.mutedText} />
                  )}
                </div>
                
                {/* Activity content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <span className={`font-medium text-sm ${themeColors.primaryText}`}>
                      {activity.user}
                    </span>
                    <span className={`mx-1 text-xs ${uiColors.mutedText}`}>
                      {activity.type === 'comment' ? 'commented' : activity.content}
                    </span>
                  </div>
                  
                  {activity.type === 'comment' && (
                    <div className={`mt-1 text-sm ${themeColors.secondaryText}`}>
                      {activity.content}
                    </div>
                  )}
                  
                  <div className={`text-xs ${uiColors.mutedText} mt-1`}>
                    {formatRelativeTime(activity.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`p-8 text-center ${uiColors.mutedText}`}>
          <Clock size={24} className="mx-auto mb-2 opacity-40" />
          <p>No activity yet</p>
        </div>
      )}
    </div>
  );
};

export default ActivityStream;
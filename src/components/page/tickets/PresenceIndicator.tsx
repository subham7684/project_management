// --- file: src/components/ticketDetails/PresenceIndicator.tsx ---
import { FC } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { User } from '../../../types/interfaces';

interface PresenceIndicatorProps {
  presence: Record<string, { online: boolean; lastActive?: string }>;
  watchers: (User & { online?: boolean; last_active?: string })[];
  uiColors: any;
  themeColors: any;
}

const PresenceIndicator: FC<PresenceIndicatorProps> = ({ 
  presence, 
  watchers,
  uiColors,
  themeColors 
}) => {
  // Get online users
  const onlineUsers = watchers.filter(user => {
    return presence[user._id]?.online;
  });
  
  // Get offline watchers (not currently viewing)
  const offlineWatchers = watchers.filter(user => {
    return !presence[user._id]?.online;
  });

  if (watchers.length === 0) {
    return null;
  }

  return (
    <div className={`mb-6 ${uiColors.cardBg} rounded-xl border ${uiColors.borderColor} shadow-sm overflow-hidden`}>
      <div className={`p-4 border-b ${uiColors.borderColor}`}>
        <h3 className={`text-sm font-medium ${themeColors.secondaryText}`}>
          Watching This Ticket
        </h3>
      </div>
      
      <div className="p-4">
        {/* Online users */}
        {onlineUsers.length > 0 && (
          <div className="mb-4">
            <h4 className={`text-xs font-medium uppercase ${uiColors.mutedText} mb-2`}>
              Currently Viewing
            </h4>
            <div className="flex flex-wrap gap-2">
              {onlineUsers.map(user => (
                <div 
                  key={user._id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${uiColors.softBg}`}
                >
                  {/* User avatar */}
                  <div className="relative">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                      {user.full_name?.charAt(0) || user.email.charAt(0)}
                    </div>
                    
                    {/* Online indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
                  </div>
                  
                  {/* User name */}
                  <span className={`text-sm ${themeColors.primaryText}`}>
                    {user.full_name || user.email}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Offline watchers */}
        {offlineWatchers.length > 0 && (
          <div>
            <h4 className={`text-xs font-medium uppercase ${uiColors.mutedText} mb-2`}>
              Watchers
            </h4>
            <div className="flex flex-wrap gap-2">
              {offlineWatchers.map(user => (
                <div 
                  key={user._id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${uiColors.softBg}`}
                >
                  {/* User avatar */}
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-400 to-gray-600 text-white text-xs">
                    {user.full_name?.charAt(0) || user.email.charAt(0)}
                  </div>
                  
                  {/* User name */}
                  <div>
                    <div className={`text-sm ${themeColors.primaryText}`}>
                      {user.full_name || user.email}
                    </div>
                    {user.last_active && (
                      <div className={`text-xs ${uiColors.mutedText}`}>
                        Active {formatDistanceToNow(new Date(user.last_active))} ago
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Empty state */}
        {watchers.length === 0 && (
          <div className={`text-center py-4 ${uiColors.mutedText}`}>
            <p>No one is watching this ticket yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PresenceIndicator;
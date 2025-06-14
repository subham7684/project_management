// --- file: src/components/ticketDetails/TypingIndicator.tsx ---
import { FC, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectPresence } from '../../../store/slices/ticket/ticketDetails';
import websocketService, { WSEvent } from '../../../services/webSocket';

interface TypingIndicatorProps {
  ticketId: string;
  watchers: any[];
  uiColors: any;
  themeColors: any;
}

interface TypingUser {
  userId: string;
  name: string;
  timestamp: number;
}

const TypingIndicator: FC<TypingIndicatorProps> = ({ 
  ticketId,
  watchers, 
  uiColors,
  themeColors 
}) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const presence = useSelector(selectPresence);
  
  // Current user ID
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  
  // Setup typing indicator listener
  useEffect(() => {
    const room = `ticket:${ticketId}`;
    
    // Handler for typing events
    const handleTyping = (message: any) => {
      const typingData = message as unknown as { user_id: string; is_typing: boolean; timestamp: string };
      
      // Skip if it's the current user typing
      if (typingData.user_id === currentUserId) {
        return;
      }
      
      setTypingUsers(prev => {
        // If user is typing, add or update them
        if (typingData.is_typing) {
          // Find user in watchers
          const user = watchers.find(w => w._id === typingData.user_id);
          const userName = user?.full_name || user?.email || 'Someone';
          
          // Check if user is already in typing users list
          const existingIndex = prev.findIndex(u => u.userId === typingData.user_id);
          
          if (existingIndex !== -1) {
            // Update existing user timestamp
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              timestamp: Date.now()
            };
            return updated;
          } else {
            // Add new typing user
            return [...prev, {
              userId: typingData.user_id,
              name: userName,
              timestamp: Date.now()
            }];
          }
        } 
        // If user stopped typing, remove them
        else {
          return prev.filter(u => u.userId !== typingData.user_id);
        }
      });
    };
    
    // Register handler
    websocketService.on(room, WSEvent.Typing, handleTyping);
    
    // Clean up expired typing indicators every 3 seconds
    const cleanupInterval = setInterval(() => {
      setTypingUsers(prev => {
        const now = Date.now();
        return prev.filter(user => now - user.timestamp < 3000); // Remove after 3 seconds of inactivity
      });
    }, 3000);
    
    return () => {
      // Clean up
      websocketService.off(room, WSEvent.Typing, handleTyping);
      clearInterval(cleanupInterval);
    };
  }, [ticketId, currentUserId, watchers]);
  
  // If no one is typing, return null
  if (typingUsers.length === 0) {
    return null;
  }
  
  // Format message based on number of typing users
  const formatTypingMessage = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].name} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`;
    } else {
      return `${typingUsers[0].name} and ${typingUsers.length - 1} others are typing...`;
    }
  };

  return (
    <div 
      className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full ${uiColors.cardBg} border ${uiColors.borderColor} shadow-md z-50 transition-opacity duration-300`}
    >
      <div className="flex items-center gap-2">
        {/* Animated dots */}
        <div className="flex space-x-1">
          <div className={`w-2 h-2 rounded-full ${themeColors.accentBg} animate-bounce`} style={{ animationDelay: '0ms' }}></div>
          <div className={`w-2 h-2 rounded-full ${themeColors.accentBg} animate-bounce`} style={{ animationDelay: '150ms' }}></div>
          <div className={`w-2 h-2 rounded-full ${themeColors.accentBg} animate-bounce`} style={{ animationDelay: '300ms' }}></div>
        </div>
        
        {/* Message */}
        <span className={`text-sm ${themeColors.secondaryText}`}>
          {formatTypingMessage()}
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator;
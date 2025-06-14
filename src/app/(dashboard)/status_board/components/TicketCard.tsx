import React from 'react';
import { AlertCircle, User2, Calendar, Tag } from 'lucide-react';
import Image from 'next/image';
import { Ticket, User } from '../../../../types/interfaces';
import { UIColors, ThemeColors } from '@/lib/theme/theme';

interface TicketCardProps {
  ticket: Ticket;
  style?: React.CSSProperties;
  attributes?: React.HTMLAttributes<HTMLDivElement>;
  listeners?: React.HTMLAttributes<HTMLDivElement>;
  isDragOverlay?: boolean;
  onClick?: () => void;
  assigneeData?: {
    assignee?: string;
    assigneeAvatar?: string;
  };
  users?: Record<string, User>;
  uiColors?: UIColors;
  themeColors?: ThemeColors;
}

const TicketCard = React.forwardRef<HTMLDivElement, TicketCardProps>((props, ref) => {
  const { 
    ticket, 
    style = {}, 
    attributes = {}, 
    listeners = {}, 
    isDragOverlay = false, 
    onClick,
    assigneeData = {},
    users = {},
    uiColors,
    themeColors
  } = props;

  const getPriorityClass = (priority: string) => {
    if (!uiColors) {
      // Fallback styles if theme not provided
      switch (priority) {
        case 'Low':
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        case 'Medium':
          return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'High':
          return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
        case 'Critical':
          return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      }
    }
    
    // Theme-aware styles
    switch (priority) {
      case 'Low':
        return `${uiColors.infoBg} ${uiColors.infoText}`;
      case 'Medium':
        return `${uiColors.successBg} ${uiColors.successText}`;
      case 'High':
        return `${uiColors.warningBg} ${uiColors.warningText}`;
      case 'Critical':
        return `${uiColors.errorBg} ${uiColors.errorText}`;
      default:
        return `${uiColors.softBg} ${uiColors.mutedText}`;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent click when dragging
    if (!isDragOverlay && onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  // Get assignee information from either assigneeData or users object
  const assigneeName = assigneeData.assignee || 
    (ticket.assignee_id && users[ticket.assignee_id]?.full_name) || 
    'Unassigned';
  
  const assigneeAvatar = assigneeData.assigneeAvatar;

  // Set background color based on theme
  const bgColor = isDragOverlay 
    ? (uiColors?.cardBg || 'bg-white dark:bg-gray-800')
    : (uiColors?.cardBg || 'bg-white dark:bg-gray-800');

  // Set border color based on theme
  const borderColor = uiColors?.borderColor || 'border-gray-200 dark:border-gray-700';

  // Set shadow based on drag state
  const shadowClass = isDragOverlay 
    ? 'shadow-lg' 
    : 'shadow-sm hover:shadow-md transition-shadow duration-200';

  return (
    <div
      ref={ref}
      style={{
        ...style,
        ...(isDragOverlay
          ? { boxShadow: '0 5px 15px rgba(0,0,0,0.1)', cursor: 'grabbing' }
          : {})
      }}
      {...attributes}
      {...listeners}
      className={`${bgColor} p-4 rounded-lg ${shadowClass} border ${borderColor} mb-3 ${isDragOverlay ? 'scale-105' : ''} cursor-grab active:cursor-grabbing transition-all duration-200`}
      onClick={handleClick}
      title={ticket.title}
    >
      <div className="flex flex-col space-y-3">
        <div className={`font-medium ${uiColors?.primaryText || 'text-gray-900 dark:text-white'} line-clamp-2`}>
          {ticket.title}
        </div>
        
        <div className="flex items-center justify-between">
          <div className={`text-xs ${uiColors?.mutedText || 'text-gray-500 dark:text-gray-400'} flex items-center`} title={`ID: ${ticket.id}`}>
            <span className="flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {ticket.id.slice(0, 8)}...
            </span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityClass(ticket.priority)}`}>
            {ticket.priority}
          </span>
        </div>
        
        {ticket.tags && ticket.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {ticket.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${uiColors?.softBg || 'bg-gray-100 dark:bg-gray-700'} ${uiColors?.secondaryText || 'text-gray-800 dark:text-gray-300'}`}>
                <Tag size={10} className="mr-1" />
                {tag}
              </span>
            ))}
            {ticket.tags.length > 3 && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${uiColors?.softBg || 'bg-gray-100 dark:bg-gray-700'} ${uiColors?.secondaryText || 'text-gray-800 dark:text-gray-300'}`}>
                +{ticket.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        <div className={`flex items-center justify-between pt-2 border-t ${uiColors?.divider || 'border-gray-100 dark:border-gray-700'}`}>
          <div className="flex items-center" title={`Assignee: ${assigneeName}`}>
            <div className={`h-6 w-6 rounded-full ${themeColors?.buttonBg || 'bg-gray-300 dark:bg-gray-600'} flex items-center justify-center ${themeColors?.buttonText || 'text-gray-700 dark:text-gray-300'}`}>
              {assigneeAvatar ? (
                <Image 
                  src={assigneeAvatar} 
                  alt={assigneeName} 
                  className="h-6 w-6 rounded-full" 
                  width={24} 
                  height={24} 
                />
              ) : (
                <User2 size={12} />
              )}
            </div>
          </div>
          
          {ticket.due_date && (
            <div className={`flex items-center text-xs ${uiColors?.mutedText || 'text-gray-500 dark:text-gray-400'}`} title={`Due: ${new Date(ticket.due_date).toLocaleDateString()}`}>
              <Calendar size={12} className="mr-1" />
              <span>{formatDate(ticket.due_date)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

TicketCard.displayName = 'TicketCard';

export default TicketCard;
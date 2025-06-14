import React from 'react';
import { X, Edit, CheckCircle } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Ticket } from '../../../../types/interfaces';
import { UIColors, ThemeColors } from '@/lib/theme/theme';

interface RecentlyCreatedTicketBannerProps {
  ticket: Ticket | null;
  onDismiss: () => void;
  onEdit: (ticket: Ticket) => void;
  uiColors?: UIColors;
  themeColors?: ThemeColors;
}

const RecentlyCreatedTicketBanner: React.FC<RecentlyCreatedTicketBannerProps> = ({
  ticket,
  onDismiss,
  onEdit,
  uiColors,
  themeColors
}) => {
  if (!ticket) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-slideUp">
      <div className={`${uiColors?.cardBg || 'bg-white dark:bg-gray-800'} ${uiColors?.borderColor || 'border-gray-200 dark:border-gray-700'} border rounded-lg shadow-lg p-4`}>
        <div className="flex items-start">
          <div className={`${themeColors?.accentText || 'text-green-500'} mr-3 flex-shrink-0 mt-1`}>
            <CheckCircle size={20} />
          </div>
          <div className="flex-1">
            <h4 className={`${uiColors?.primaryText || 'text-gray-900 dark:text-white'} font-medium mb-1`}>
              Ticket Created
            </h4>
            <p className={`${uiColors?.secondaryText || 'text-gray-700 dark:text-gray-300'} text-sm mb-3`}>
              {ticket.title} has been created. Would you like to add more details?
            </p>
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(ticket)}
                className={`${themeColors?.buttonHoverBg || ''} flex items-center`}
              >
                <Edit size={14} className="mr-1" />
                Edit Details
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className={`${uiColors?.mutedText || 'text-gray-500'} hover:${uiColors?.secondaryText || 'text-gray-700'}`}
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Progress bar for auto-dismiss animation */}
        <div className="mt-3 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${themeColors?.accentText || 'bg-green-500'} rounded-full`}
            style={{ 
              width: '100%',
              animation: 'shrink 8s linear forwards'
            }}
          />
        </div>
        
        {/* Add a style block for the animation */}
        <style jsx>{`
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
          
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          
          .animate-slideUp {
            animation: slideUp 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
};

export default RecentlyCreatedTicketBanner;
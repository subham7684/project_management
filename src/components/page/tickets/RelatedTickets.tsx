// --- file: src/components/ticketDetails/RelatedTickets.tsx ---
import { FC } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Ticket } from '../../../types/interfaces';

interface RelatedTicketsProps {
  tickets: Ticket[];
  uiColors: any;
  themeColors: any;
}

const RelatedTickets: FC<RelatedTicketsProps> = ({ 
  tickets,
  uiColors,
  themeColors 
}) => {
  if (!tickets || tickets.length === 0) {
    return null;
  }

  // Status color mapping
  const statusColors = {
    'Open': 'bg-blue-500',
    'In Progress': 'bg-amber-500',
    'Review': 'bg-purple-500',
    'Done': 'bg-emerald-500',
  };

  return (
    <div className={`mb-6 ${uiColors.cardBg} rounded-xl border ${uiColors.borderColor} shadow-sm overflow-hidden`}>
      <div className={`p-4 border-b ${uiColors.borderColor}`}>
        <h3 className={`text-sm font-medium ${themeColors.secondaryText}`}>
          Related Tickets
        </h3>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {tickets.map(ticket => (
          <Link
            key={ticket.id}
            href={`/tickets/${ticket.id}`}
            className={`block p-4 hover:${uiColors.softBg} transition-colors`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {/* Ticket ID and status */}
                <div className="flex items-center mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${uiColors.softBg} ${uiColors.badgeText} mr-2`}>
                    {ticket.id}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded text-white ${statusColors[ticket.status as keyof typeof statusColors] || 'bg-gray-500'}`}>
                    {ticket.status}
                  </span>
                </div>
                
                {/* Ticket title */}
                <h4 className={`text-sm font-medium ${themeColors.primaryText} truncate`}>
                  {ticket.title}
                </h4>
                
                {/* Project or Epic info */}
                {/* {(ticket. || ticket.epic_name) && (
                  <p className={`text-xs ${uiColors.mutedText} mt-1 truncate`}>
                    {ticket.project_name && `Project: ${ticket.project_name}`}
                    {ticket.project_name && ticket.epic_name && ' · '}
                    {ticket.epic_name && `Epic: ${ticket.epic_name}`}
                  </p>
                )} */}
              </div>
              
              <ChevronRight size={16} className={uiColors.mutedText} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedTickets;
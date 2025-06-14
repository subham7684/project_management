import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TicketCard from './TicketCard';
import { Ticket } from '../../../../types/interfaces';
import { UIColors, ThemeColors } from '@/lib/theme/theme';

interface SortableTicketProps {
  ticket: Ticket;
  status: string;
  onClick: () => void;
  uiColors: UIColors;
  themeColors: ThemeColors;
}

const SortableTicket: React.FC<SortableTicketProps> = ({ 
  ticket, 
  status, 
  onClick,
  uiColors,
  themeColors
}) => {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition, 
    isDragging 
  } = useSortable({ 
    id: ticket.id, 
    data: { status, ticket } 
  });
  
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition as string,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 0 : 'auto' as number | 'auto'
  };
  
  return (
    <TicketCard 
      ref={setNodeRef} 
      ticket={ticket} 
      style={style} 
      attributes={attributes} 
      listeners={listeners} 
      onClick={onClick}
      isDragOverlay={false}
      uiColors={uiColors}
      themeColors={themeColors}
    />
  );
};

export default SortableTicket;
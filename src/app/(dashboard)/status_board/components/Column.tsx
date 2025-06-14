"use client"
import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { Ticket, Project, Epic, Sprint } from '../../../../types/interfaces';
import { UIColors, ThemeColors } from '@/lib/theme/theme';
import SortableTicket from './SortableTicket';
import QuickAddTicket from './QuickAddTicket';
import { Button } from '../../../../components/ui/button';

interface BoardColumn {
  id: string;
  title: string;
  color: string;
  tickets: Ticket[];
}

interface ColumnProps {
  column: BoardColumn;
  tickets: Ticket[];
  onAddTicket: (status: string) => void;
  onTicketClick: (ticket: Ticket) => void;
  selectedProjectId?: string;
  selectedEpicId?: string;
  selectedSprintId?: string;
  projects: Project[];
  epics: Epic[];
  sprints: Sprint[];
  uiColors: UIColors;
  themeColors: ThemeColors;
  onQuickAddTicket: (data: {
    title: string;
    status: string;
    priority: string;
    project_id?: string;
    epic_id?: string;
    sprint_id?: string;
  }) => Promise<void>;
}

const Column: React.FC<ColumnProps> = ({ 
  column, 
  tickets, 
  onAddTicket, 
  onTicketClick,
  selectedProjectId,
  selectedEpicId,
  selectedSprintId,
  projects,
  epics,
  sprints,
  uiColors,
  themeColors,
  onQuickAddTicket
}) => {
  const { setNodeRef } = useDroppable({ id: column.id });
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Only pass non-"all" values to inherited context
  const projectId = selectedProjectId !== 'all' ? selectedProjectId : undefined;
  const epicId = selectedEpicId !== 'all' ? selectedEpicId : undefined;
  const sprintId = selectedSprintId !== 'all' ? selectedSprintId : undefined;

  // Get color in hex or tailwind color for column header
  const getColumnColor = () => {
    // If using hex color directly
    if (column.color.startsWith('#')) {
      return column.color;
    }
    
    // Otherwise use theme color
    return `var(--${column.color.replace('#', '')})`;
  };
  
  return (
    <div className={`h-full flex flex-col ${uiColors.cardBg} rounded-lg shadow-sm border ${uiColors.borderColor} overflow-hidden transition-all duration-200`}>
      <div
        className={`p-3 font-medium flex items-center justify-between sticky top-0 z-10 ${uiColors.cardBg} border-b ${uiColors.borderColor}`}
        style={{ 
          borderLeft: `4px solid ${getColumnColor()}`,
        }}
      >
        <div className="flex items-center flex-1">
          <span className={`w-3 h-3 rounded-full mr-2 transition-all duration-300`} style={{ backgroundColor: getColumnColor() }}></span>
          <span className={`${uiColors.primaryText} font-medium truncate`}>{column.title}</span>
          <div className={`ml-2 px-2 py-0.5 ${uiColors.softBg} ${uiColors.mutedText} text-xs rounded-full`}>
            {tickets.length}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            onClick={() => onAddTicket(column.id)} 
            size="sm"
            variant="ghost"
            className={`h-7 w-7 p-0 ${uiColors.mutedText} hover:${uiColors.primaryText} ${uiColors.hoverBg} rounded-md transition-colors duration-150`}
            title="Open full ticket form"
          >
            <Plus size={16} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`h-7 w-7 ${uiColors.mutedText} hover:${uiColors.primaryText} ${uiColors.hoverBg} rounded-md transition-colors duration-150`}
            title={isCollapsed ? "Expand column" : "Collapse column"}
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </Button>
          <Button 
            size="sm"
            variant="ghost"
            className={`h-7 w-7 ${uiColors.mutedText} hover:${uiColors.primaryText} ${uiColors.hoverBg} rounded-md transition-colors duration-150`}
            title="Column options"
          >
            <MoreHorizontal size={16} />
          </Button>
        </div>
      </div>
      
      <div className={`flex-1 overflow-y-auto p-2 scrollbar-hide transition-opacity duration-200 ${isCollapsed ? 'max-h-0 opacity-0 hidden' : 'max-h-full opacity-100'}`}>
        <div ref={setNodeRef} className="min-h-[50px]">
          <SortableContext items={tickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tickets.map((ticket) => (
              <SortableTicket 
                key={ticket.id} 
                ticket={ticket} 
                status={column.id} 
                onClick={() => onTicketClick(ticket)}
                uiColors={uiColors}
                themeColors={themeColors}
              />
            ))}
          </SortableContext>
          
          {tickets.length === 0 && (
            <div className={`h-24 flex flex-col items-center justify-center py-4 text-center ${uiColors.mutedText}`}>
              <div className={`p-2 ${uiColors.softBg} rounded-full mb-2`}>
                <Plus size={16} />
              </div>
              <p className="text-sm">No tickets</p>
            </div>
          )}
          <QuickAddTicket 
            columnId={column.id} 
            projectId={projectId} 
            epicId={epicId}
            sprintId={sprintId}
            projects={projects}
            epics={epics}
            sprints={sprints}
            onAddTicket={onQuickAddTicket}
            uiColors={uiColors}
            themeColors={themeColors}
          />
        </div>
      </div>
    </div>
  );
};

export default Column;
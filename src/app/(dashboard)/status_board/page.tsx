"use client";

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Plus, Search, Filter, RefreshCw } from 'lucide-react';
import { toast } from '../../../components/ui/use-toast';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useAppTheme } from '@/context/ThemeContext';

// Import services
import BoardService from '../../../services/board';
import TicketService from '../../../services/ticket';
import ProjectService from '../../../services/project';
import SprintService from '../../../services/sprint';
import EpicService from '../../../services/epic';
import TicketAssignmentService from '../../../services/ticketAssignment';
import EpicSprintTicketsService from '../../../services/epicSprint';
import PublicUserService from '@/services/publicUser';

// Import interfaces
import { Ticket, Project, Sprint, Epic, TicketHistory, User } from '../../../types/interfaces';

// Import custom components
import TicketCard from './components/TicketCard';
import Column from './components/Column';
import TicketDetails from './components/TicketDetails';
import CreateTicketDialog from './components/CreateTicketDialogue';
import RecentlyCreatedTicketBanner from './components/RecentlyCreatedTicketBanner';
import ContextBreadcrumb from './components/ContextBreadCrumb';

interface BoardColumn {
  id: string;
  title: string;
  color: string;
  tickets: Ticket[];
}

export default function BoardPage() {
  const { uiColors, themeColors } = useAppTheme();
  
  // State for board columns
  const [columns, setColumns] = useState<BoardColumn[]>([
    { id: 'Open', title: 'Open', color: '#3b82f6', tickets: [] },
    { id: 'In Progress', title: 'In Progress', color: '#f59e0b', tickets: [] },
    { id: 'Review', title: 'Review', color: '#8b5cf6', tickets: [] },
    { id: 'Done', title: 'Done', color: '#10b981', tickets: [] }
  ]);
  
  // State for active ticket (when dragging)
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  
  // Filters state - now we use these for context inheritance too
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedAssignee, setSelectedAssignee] = useState<string>("all");
  const [selectedEpic, setSelectedEpic] = useState<string>("all");
  const [selectedSprint, setSelectedSprint] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Data state
  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [ticketDetailsOpen, setTicketDetailsOpen] = useState<boolean>(false);
  const [createTicketOpen, setCreateTicketOpen] = useState<boolean>(false);
  const [newTicketStatus, setNewTicketStatus] = useState<string>('Open');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketHistory, setTicketHistory] = useState<TicketHistory[]>([]);
  
  // New state for recently created ticket notification
  const [recentlyCreatedTicket, setRecentlyCreatedTicket] = useState<Ticket | null>(null);
  
  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  
  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);
  
  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch board data
      const boardData = await BoardService.getBoard();
      console.log("Board data in page", boardData?.data);
      // Transform board data to our columns format
      if (boardData) {
        const transformedColumns = columns.map(col => ({
          ...col,
          tickets: boardData?.[col.id] || []
        }));
        setColumns(transformedColumns);
      }
      
      // Fetch projects, sprints, epics, users
      const [projectsData, sprintsData, epicsData, publicUsersData] = await Promise.all([
        ProjectService.fetchProjects(0, 100),
        SprintService.fetchSprints(0, 100),
        EpicService.fetchEpics(0, 100),
        PublicUserService.fetchPublicUsers()
      ]);

      setProjects(projectsData);
      setSprints(sprintsData);
      setEpics(epicsData);
      setUsers(publicUsersData);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to load board data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle board refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchInitialData();
    setTimeout(() => setIsRefreshing(false), 500); // Minimum refresh time for UI feedback
  };
  
  // Filter tickets based on selection
  useEffect(() => {
    const filterTickets = async () => {
      try {
        setIsLoading(true);
        
        let filteredTickets: Ticket[] = [];
        
        // Filter by sprint
        if (selectedSprint !== 'all') {
          const sprintTickets = await EpicSprintTicketsService.getSprintTickets(selectedSprint);
          filteredTickets = sprintTickets;
        }
        // Filter by epic
        else if (selectedEpic !== 'all') {
          const epicTickets = await EpicSprintTicketsService.getEpicTickets(selectedEpic);
          filteredTickets = epicTickets;
        }
        // Filter by project
        else if (selectedProject !== 'all') {
          const projectDetails = await ProjectService.getProjectDetails(selectedProject);
          filteredTickets = projectDetails.tickets;
        }
        // No specific filter, get all tickets
        else {
          const boardData = await BoardService.getBoard();
          filteredTickets = Object.values(boardData).flat();
        }
        
        // Additional assignee filter
        if (selectedAssignee !== 'all') {
          filteredTickets = filteredTickets.filter(ticket => 
            ticket.assignee_id === selectedAssignee
          );
        }
        
        // Search query filter
        if (searchQuery) {
          const lowercasedQuery = searchQuery.toLowerCase();
          filteredTickets = filteredTickets.filter(ticket => 
            ticket.title.toLowerCase().includes(lowercasedQuery) ||
            ticket.description.toLowerCase().includes(lowercasedQuery) ||
            ticket.id.toLowerCase().includes(lowercasedQuery)
          );
        }
        
        // Group by status
        const ticketsByStatus = {
          'Open': filteredTickets.filter(t => t.status === 'Open'),
          'In Progress': filteredTickets.filter(t => t.status === 'In Progress'),
          'Review': filteredTickets.filter(t => t.status === 'Review'),
          'Done': filteredTickets.filter(t => t.status === 'Done')
        };
        
        // Update columns
        setColumns(columns.map(col => ({
          ...col,
          tickets: ticketsByStatus[col.id as keyof typeof ticketsByStatus] || []
        })));
        
      } catch (error) {
        console.error('Error filtering tickets:', error);
        toast.show({
          title: 'Error',
          description: 'Failed to filter tickets',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!isLoading) {
      filterTickets();
    }
  }, [selectedProject, selectedAssignee, selectedSprint, selectedEpic, searchQuery]);
  
  // Handle ticket click
  const handleTicketClick = async (ticket: Ticket) => {
    try {
      setIsLoading(true);
      
      // Fetch latest ticket data and history
      const [ticketDetails, history] = await Promise.all([
        TicketService.getTicket(ticket.id),
        TicketAssignmentService.getTicketHistory(ticket.id)
      ]);
      
      setSelectedTicket(ticketDetails);
      setTicketHistory(history);
      setTicketDetailsOpen(true);
      
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to load ticket details',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const ticket = active.data.current?.ticket as Ticket;
    setActiveTicket(ticket);
  };
  
  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTicket(null);
      return;
    }
    
    const activeId = active.id;
    const overId = over.id;
    
    try {
      // Find source column and ticket
      let sourceColId = '';
      let ticketToMove: Ticket | null = null;
      
      for (const column of columns) {
        const ticket = column.tickets.find(t => t.id === activeId);
        if (ticket) {
          sourceColId = column.id;
          ticketToMove = ticket;
          break;
        }
      }
      
      if (!ticketToMove) {
        setActiveTicket(null);
        return;
      }
      
      // Find target column and position
      let targetColId = '';
      let targetIndex = -1;
      
      for (const column of columns) {
        const ticketIndex = column.tickets.findIndex(t => t.id === overId);
        if (ticketIndex !== -1) {
          targetColId = column.id;
          targetIndex = ticketIndex;
          break;
        }
      }
      
      // If over column itself
      if (!targetColId && columns.some(col => col.id === overId)) {
        targetColId = String(overId);
        const targetColumn = columns.find(col => col.id === overId);
        targetIndex = targetColumn ? targetColumn.tickets.length : 0;
      }
      
      // Reorder in same column
      if (sourceColId === targetColId) {
        const oldIndex = columns.find(col => col.id === sourceColId)?.tickets.findIndex(t => t.id === activeId) || 0;
        
        // Move in local state
        setColumns(columns.map(col => {
          if (col.id !== sourceColId) return col;
          const newTickets = arrayMove(col.tickets, oldIndex, targetIndex);
          return { ...col, tickets: newTickets };
        }));
        
        // Update on server
        const updatedTicketIds = columns
          .find(col => col.id === sourceColId)
          ?.tickets.map(t => t.id) || [];
        
        await BoardService.reorderTickets(updatedTicketIds);
      } 
      // Move to different column
      else if (targetColId) {
        // Update status on server
        await BoardService.moveTicket(ticketToMove.id, targetColId);
        
        // Update in local state
        setColumns(columns.map(col => {
          if (col.id === sourceColId) {
            return { ...col, tickets: col.tickets.filter(t => t.id !== activeId) };
          }
          if (col.id === targetColId) {
            const updatedTicket = { ...ticketToMove, status: targetColId as Ticket['status'] };
            const newTickets = [...col.tickets];
            
            if (targetIndex !== -1) {
              newTickets.splice(targetIndex, 0, updatedTicket);
            } else {
              newTickets.push(updatedTicket);
            }
            
            return { ...col, tickets: newTickets };
          }
          return col;
        }));
        
        // Show success toast
        toast.show({
          title: 'Ticket Updated',
          description: `Moved "${ticketToMove.title}" to ${targetColId}`,
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error moving ticket:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to move ticket',
        variant: 'destructive'
      });
    }
    
    setActiveTicket(null);
  };
  
  const handleDragCancel = () => {
    setActiveTicket(null);
  };
  
  // Handle adding a new ticket via the full form
  const handleAddTicket = (status: string) => {
    setNewTicketStatus(status);
    setCreateTicketOpen(true);
  };
  
  // Handle quick-adding a ticket from the column
  const handleQuickAddTicket = async (data: {
    title: string;
    status: string;
    priority: string;
    project_id?: string;
    epic_id?: string;
    sprint_id?: string;
  }) => {
    try {
      setIsLoading(true);
      
      // Create minimal ticket on server with context inheritance
      const createdTicket = await TicketService.createTicket({
        title: data.title,
        description: "",
        status: data.status as "Open" | "In Progress" | "Review" | "Done",
        priority: data.priority,
        severity: "Medium", // Default severity
        tags: [],
        // Inherit context from filters
        project_id: data.project_id,
        epic_id: data.epic_id,
        sprint_id: data.sprint_id,
        // Required fields but with empty/default values
        attachments: [],
        related_tickets: [],
        watchers: []
      });
      
      // Add to local state
      setColumns(columns.map(col => {
        if (col.id === data.status) {
          return { ...col, tickets: [...col.tickets, createdTicket] };
        }
        return col;
      }));
      
      // Show notification with "Add Details" option
      setRecentlyCreatedTicket(createdTicket);
      
      // Auto-dismiss notification after 8 seconds
      setTimeout(() => {
        setRecentlyCreatedTicket(null);
      }, 8000);
      
      toast.show({
        title: 'Success',
        description: 'Ticket created successfully',
        variant: 'default'
      });
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to create ticket',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save new ticket from full form
  const handleSaveNewTicket = async (newTicket: Partial<Ticket>) => {
    try {
      setIsLoading(true);
      
      // Inherit context from filters if not already set
      if (selectedProject !== 'all' && !newTicket.project_id) {
        newTicket.project_id = selectedProject;
      }
      if (selectedEpic !== 'all' && !newTicket.epic_id) {
        newTicket.epic_id = selectedEpic;
      }
      if (selectedSprint !== 'all' && !newTicket.sprint_id) {
        newTicket.sprint_id = selectedSprint;
      }
      
      // Create ticket on server
      const createdTicket = await TicketService.createTicket({
        ...newTicket,
        status: newTicketStatus as "Open" | "In Progress" | "Review" | "Done"
      });
      
      // Add to local state
      setColumns(columns.map(col => {
        if (col.id === newTicketStatus) {
          return { ...col, tickets: [...col.tickets, createdTicket] };
        }
        return col;
      }));
      
      setCreateTicketOpen(false);
      
      toast.show({
        title: 'Success',
        description: 'Ticket created successfully',
        variant: 'default'
      });
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to create ticket',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update existing ticket
  const handleUpdateTicket = async (updatedTicket: Ticket) => {
    try {
      setIsLoading(true);
      
      // Update on server
      await TicketService.updateTicket(updatedTicket.id, updatedTicket);
      
      // If status changed, move between columns
      if (updatedTicket.status !== selectedTicket?.status) {
        // Remove from old column
        setColumns(columns.map(col => {
          if (col.id === selectedTicket?.status) {
            return { ...col, tickets: col.tickets.filter(t => t.id !== updatedTicket.id) };
          }
          return col;
        }));
        
        // Add to new column
        setColumns(columns.map(col => {
          if (col.id === updatedTicket.status) {
            return { ...col, tickets: [...col.tickets, updatedTicket] };
          }
          return col;
        }));
      } 
      // Just update in the same column
      else {
        setColumns(columns.map(col => {
          if (col.id === updatedTicket.status) {
            return {
              ...col,
              tickets: col.tickets.map(t => 
                t.id === updatedTicket.id ? updatedTicket : t
              )
            };
          }
          return col;
        }));
      }
      
      // Update selected ticket
      setSelectedTicket(updatedTicket);
      
      // If this was from the recently created notification, clear it
      if (recentlyCreatedTicket?.id === updatedTicket.id) {
        setRecentlyCreatedTicket(null);
      }
      
      toast.show({
        title: 'Success',
        description: 'Ticket updated successfully',
        variant: 'default'
      });
      
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to update ticket',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Assign ticket to epic/sprint
  const handleAssignTicket = async (ticketId: string, epicId: string | null, sprintId: string | null) => {
    try {
      setIsLoading(true);
      
      // Update on server
      const updatedTicket = await TicketAssignmentService.assignTicket({
        ticketId,
        epicId,
        sprintId
      });
      
      // Update in local state
      setColumns(columns.map(col => {
        if (col.id === updatedTicket.status) {
          return {
            ...col,
            tickets: col.tickets.map(t => 
              t.id === updatedTicket.id ? updatedTicket : t
            )
          };
        }
        return col;
      }));
      
      // Get updated history
      const history = await TicketAssignmentService.getTicketHistory(ticketId);
      setTicketHistory(history);
      
      // Update selected ticket
      setSelectedTicket(updatedTicket);
      
      toast.show({
        title: 'Success',
        description: 'Ticket assignments updated',
        variant: 'default'
      });
      
    } catch (error) {
      console.error('Error assigning ticket:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to update ticket assignments',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Custom loading spinner that uses theme colors
  const renderLoadingSpinner = () => {
    return (
      <div className={`flex items-center justify-center h-screen ${uiColors.pageBg}`}>
        <div className="text-center">
          <div className={`w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin mx-auto`}></div>
          <p className={`mt-4 ${uiColors.mutedText}`}>Loading board...</p>
        </div>
      </div>
    );
  };
  
  if (isLoading && columns.every(col => col.tickets.length === 0)) {
    return renderLoadingSpinner();
  }
  
  const totalTickets = columns.reduce((acc, col) => acc + col.tickets.length, 0);
  
  return (
    <div className={`min-h-screen ${uiColors.pageBg}`}>
      {/* Header */}
      <div className={`${uiColors.cardBg} border-b ${uiColors.borderColor} px-4 sm:px-6 py-4 shadow-sm sticky top-0 z-1`}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className={`text-2xl font-bold ${themeColors.primaryText} flex items-center`}>
            Work Board
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleRefresh}
              className="ml-2"
              disabled={isRefreshing}
            >
              <RefreshCw size={16} className={`${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0 sm:min-w-[240px]">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${uiColors.mutedText}`} size={18} />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets..."
                className={`pl-10 py-2 pr-4 w-full rounded-lg border ${uiColors.borderColor} ${uiColors.inputBg} ${uiColors.inputText} focus:outline-none focus:ring-2 ${themeColors.focusRing} transition-all duration-200`}
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                size="default"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? themeColors.highlightBg : ''}
                aria-label="Show filters"
              >
                <Filter size={18} className={showFilters ? themeColors.accentText : uiColors.mutedText} />
                <span className="ml-2 hidden sm:inline">Filters</span>
              </Button>
              <Button 
                className={`flex items-center gap-2 px-4 py-2 ${themeColors.buttonBg} ${themeColors.buttonText} rounded-lg ${themeColors.buttonHoverBg} transition-colors duration-200 w-full sm:w-auto`}
                onClick={() => {
                  setNewTicketStatus('Open');
                  setCreateTicketOpen(true);
                }}
              >
                <Plus size={18} />
                <span>New Ticket</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className={`mx-4 sm:mx-6 mt-4 ${uiColors.cardBg} rounded-lg border ${uiColors.borderColor} shadow-sm overflow-hidden`}>
          {/* Context Breadcrumb Navigation */}
          <ContextBreadcrumb
            projects={projects}
            epics={epics}
            sprints={sprints}
            selectedProjectId={selectedProject}
            selectedEpicId={selectedEpic}
            selectedSprintId={selectedSprint}
            onProjectChange={setSelectedProject}
            onEpicChange={setSelectedEpic}
            onSprintChange={setSelectedSprint}
            uiColors={uiColors}
            themeColors={themeColors}
          />
          
          <div className={`px-4 py-3 ${uiColors.softBg} border-t ${uiColors.borderColor}`}>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <span className={`${uiColors.mutedText} text-sm mr-2`}>Assignee:</span>
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className={`pl-3 pr-8 py-1.5 appearance-none rounded-md border ${uiColors.borderColor} ${uiColors.inputBg} ${uiColors.inputText} focus:outline-none focus:ring-2 ${themeColors.focusRing} transition-all duration-200 text-sm`}
                >
                  <option value="all">Everyone</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>{user.full_name || user.email}</option>
                  ))}
                </select>
              </div>
              
              <div className={`ml-auto text-sm ${uiColors.mutedText}`}>
                {totalTickets} ticket{totalTickets !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Board */}
      <div className="p-4 sm:p-6">
        <div className="h-[calc(100vh-220px)] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCorners} 
            onDragStart={handleDragStart} 
            onDragEnd={handleDragEnd} 
            onDragCancel={handleDragCancel}
          >
            {columns.map((column) => (
              <Column 
                key={column.id} 
                column={column} 
                tickets={column.tickets} 
                onAddTicket={handleAddTicket}
                onTicketClick={handleTicketClick}
                selectedProjectId={selectedProject}
                selectedEpicId={selectedEpic}
                selectedSprintId={selectedSprint}
                projects={projects}
                epics={epics}
                sprints={sprints}
                onQuickAddTicket={handleQuickAddTicket}
                uiColors={uiColors}
                themeColors={themeColors}
              />
            ))}
            <DragOverlay>
              {activeTicket ? (
                <TicketCard 
                  ticket={activeTicket} 
                  isDragOverlay={true} 
                  uiColors={uiColors}
                  themeColors={themeColors}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
      
      {/* Ticket Details Dialog */}
      {selectedTicket && (
        <TicketDetails
          ticket={selectedTicket}
          isOpen={ticketDetailsOpen}
          onClose={() => setTicketDetailsOpen(false)}
          onSave={handleUpdateTicket}
          onAssign={handleAssignTicket}
          projects={projects}
          sprints={sprints}
          epics={epics}
          users={users}
          history={ticketHistory}
          uiColors={uiColors}
          themeColors={themeColors}
        />
      )}
      
      {/* Create Ticket Dialog */}
      <CreateTicketDialog
        isOpen={createTicketOpen}
        onClose={() => setCreateTicketOpen(false)}
        onSave={handleSaveNewTicket}
        initialStatus={newTicketStatus}
        projects={projects}
        sprints={sprints}
        epics={epics}
        users={users}
        uiColors={uiColors}
        themeColors={themeColors}
      />
      
      {/* Recently Created Ticket Banner */}
      <RecentlyCreatedTicketBanner
        ticket={recentlyCreatedTicket}
        onDismiss={() => setRecentlyCreatedTicket(null)}
        onEdit={(ticket: Ticket) => {
          setSelectedTicket(ticket);
          setTicketDetailsOpen(true);
        }}
        uiColors={uiColors}
        themeColors={themeColors}
      />
    </div>
  );
}
import React, { useState } from 'react';
import { X, Plus, Calendar, Tag, ListTodo, ListCheck, Briefcase, AlertTriangle, User2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Badge } from '../../../../components/ui/badge';
import { Ticket, Project, Sprint, Epic, User } from '../../../../types/interfaces';
import { UIColors, ThemeColors } from '@/lib/theme/theme';

// Define the valid ticket status values
type TicketStatus = "Open" | "In Progress" | "Review" | "Done";

interface CreateTicketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticket: Partial<Ticket>) => void;
  initialStatus: string;
  projects: Project[];
  sprints: Sprint[];
  epics: Epic[];
  users: User[];
  uiColors?: UIColors;
  themeColors?: ThemeColors;
}

const CreateTicketDialog: React.FC<CreateTicketDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialStatus,
  projects,
  sprints,
  epics,
  users,
  uiColors,
  themeColors
}) => {
  // Cast initialStatus to the proper type
  const typedInitialStatus = initialStatus as TicketStatus;
  
  const [ticket, setTicket] = useState<Partial<Ticket>>({
    title: '',
    description: '',
    status: typedInitialStatus,
    priority: 'Medium',
    severity: 'Medium', // Adding severity as it's required by backend
    tags: [],
    epic_id: null,
    sprint_id: null,
    assignee_id: null,
    attachments: [],
    related_tickets: [],
    watchers: []
  });
  
  const [tagInput, setTagInput] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  
  // Filter epics and sprints based on selected project
  const filteredEpics = selectedProjectId 
    ? epics.filter(epic => epic.project_id === selectedProjectId)
    : epics;
    
  const filteredSprints = selectedProjectId 
    ? sprints.filter(sprint => sprint.project_id === selectedProjectId)
    : sprints;
  
  const handleTagAdd = () => {
    if (tagInput.trim() && ticket.tags) {
      setTicket({
        ...ticket,
        tags: [...ticket.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };
  
  const handleTagRemove = (tag: string) => {
    if (ticket.tags) {
      setTicket({
        ...ticket,
        tags: ticket.tags.filter(t => t !== tag)
      });
    }
  };
  
  const handleSave = () => {
    // Add project_id from selected project
    const updatedTicket = {
      ...ticket,
      project_id: selectedProjectId || undefined
    };
    
    onSave(updatedTicket);
    
    // Reset form
    setTicket({
      title: '',
      description: '',
      status: typedInitialStatus,
      priority: 'Medium',
      severity: 'Medium',
      tags: [],
      epic_id: null,
      sprint_id: null,
      assignee_id: null,
      attachments: [],
      related_tickets: [],
      watchers: []
    });
    setTagInput('');
    setSelectedProjectId('');
  };
  
  const isFormValid = () => {
    return !!ticket.title?.trim();
  };
  
  // Status badge colors
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Open': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'In Progress': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      case 'Review': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Done': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${uiColors?.cardBg || ''} max-w-3xl max-h-[90vh] overflow-y-auto`}>
        <DialogHeader className="border-b pb-4">
          <DialogTitle className={`${uiColors?.primaryText || ''} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">Create New Ticket</span>
              <Badge className={getStatusColor(ticket.status || '')}>
                {ticket.status}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={18} />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 my-4 overflow-y-auto">
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${uiColors?.secondaryText || ''}`}>Title</label>
            <Input 
              value={ticket.title || ''}
              onChange={(e) => setTicket({...ticket, title: e.target.value})}
              placeholder="Enter ticket title"
              className={`${uiColors?.inputBg || ''} ${uiColors?.inputText || ''} font-medium`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${uiColors?.secondaryText || ''}`}>Description</label>
            <Textarea 
              value={ticket.description || ''}
              onChange={(e) => setTicket({...ticket, description: e.target.value})}
              placeholder="Enter ticket description"
              rows={4}
              className={`${uiColors?.inputBg || ''} ${uiColors?.inputText || ''}`}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${uiColors?.secondaryText || ''} flex items-center gap-1.5`}>
                <Briefcase size={16} /> Project
              </label>
              <Select 
                value={selectedProjectId}
                onValueChange={(value) => {
                  setSelectedProjectId(value);
                  setTicket({
                    ...ticket,
                    epic_id: null,
                    sprint_id: null
                  });
                }}
              >
                <SelectTrigger className={`${uiColors?.inputBg || ''} ${uiColors?.inputText || ''}`}>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${uiColors?.secondaryText || ''} flex items-center gap-1.5`}>
                <AlertTriangle size={16} /> Priority
              </label>
              <Select 
                value={ticket.priority || ''}
                onValueChange={(value) => setTicket({...ticket, priority: value})}
              >
                <SelectTrigger className={`${uiColors?.inputBg || ''} ${uiColors?.inputText || ''}`}>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${uiColors?.secondaryText || ''} flex items-center gap-1.5`}>
                <AlertTriangle size={16} /> Severity
              </label>
              <Select 
                value={ticket.severity || ''}
                onValueChange={(value) => setTicket({...ticket, severity: value})}
              >
                <SelectTrigger className={`${uiColors?.inputBg || ''} ${uiColors?.inputText || ''}`}>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Minor">Minor</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Major">Major</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${uiColors?.secondaryText || ''} flex items-center gap-1.5`}>
                Status
              </label>
              <Select 
                value={ticket.status || ''}
                onValueChange={(value) => {
                  // Cast the value to TicketStatus since the Select component expects string
                  if (value === "Open" || value === "In Progress" || value === "Review" || value === "Done") {
                    setTicket({...ticket, status: value})
                  }
                }}
              >
                <SelectTrigger className={`${uiColors?.inputBg || ''} ${uiColors?.inputText || ''}`}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${uiColors?.secondaryText || ''} flex items-center gap-1.5`}>
                <ListTodo size={16} /> Epic
              </label>
              <Select 
                value={ticket.epic_id || ''}
                onValueChange={(value) => setTicket({...ticket, epic_id: value || null})}
                disabled={!selectedProjectId}
              >
                <SelectTrigger className={`${uiColors?.inputBg || ''} ${uiColors?.inputText || ''}`}>
                  <SelectValue placeholder={selectedProjectId ? "Select epic" : "Select a project first"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {filteredEpics.map(epic => (
                    <SelectItem key={epic.id} value={epic.id}>{epic.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${uiColors?.secondaryText || ''} flex items-center gap-1.5`}>
                <ListCheck size={16} /> Sprint
              </label>
              <Select 
                value={ticket.sprint_id || ''}
                onValueChange={(value) => setTicket({...ticket, sprint_id: value || null})}
                disabled={!selectedProjectId}
              >
                <SelectTrigger className={`${uiColors?.inputBg || ''} ${uiColors?.inputText || ''}`}>
                  <SelectValue placeholder={selectedProjectId ? "Select sprint" : "Select a project first"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {filteredSprints.map(sprint => (
                    <SelectItem key={sprint.id} value={sprint.id}>{sprint.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${uiColors?.secondaryText || ''} flex items-center gap-1.5`}>
                <User2 size={16} /> Assignee
              </label>
              <Select 
                value={ticket.assignee_id || ''}
                onValueChange={(value) => setTicket({...ticket, assignee_id: value || null})}
              >
                <SelectTrigger className={`${uiColors?.inputBg || ''} ${uiColors?.inputText || ''}`}>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.full_name || user.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${uiColors?.secondaryText || ''} flex items-center gap-1.5`}>
                <Calendar size={16} /> Due Date
              </label>
              <Input 
                type="date"
                value={ticket.due_date ? new Date(ticket.due_date).toISOString().split('T')[0] : ''}
                onChange={(e) => setTicket({...ticket, due_date: e.target.value ? new Date(e.target.value).toISOString() : undefined})}
                className={`${uiColors?.inputBg || ''} ${uiColors?.inputText || ''}`}
              />
            </div>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${uiColors?.secondaryText || ''} flex items-center gap-1.5`}>
              <Tag size={16} /> Tags
            </label>
            <div className="flex items-center space-x-2">
              <Input 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTagAdd();
                  }
                }}
                className={`${uiColors?.inputBg || ''} ${uiColors?.inputText || ''}`}
              />
              <Button 
                type="button" 
                onClick={handleTagAdd}
                className={`${themeColors?.buttonBg || ''} ${themeColors?.buttonText || ''}`}
                size="sm"
              >
                <Plus size={16} className="mr-1" />
                Add
              </Button>
            </div>
            {ticket.tags && ticket.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {ticket.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className={`flex items-center ${uiColors?.softBg || ''} py-1.5`}>
                    {tag}
                    <button 
                      onClick={() => handleTagRemove(tag)}
                      className={`ml-1.5 rounded-full ${uiColors?.hoverBg?.replace('hover:', '')} p-0.5`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="mt-6 border-t pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className={uiColors?.hoverBg || ''}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!isFormValid()}
            className={`${themeColors?.buttonBg || ''} ${themeColors?.buttonText || ''} ${themeColors?.buttonHoverBg || ''}`}
          >
            Create Ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTicketDialog;
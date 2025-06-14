import React, { useState, useEffect } from 'react';
import { Edit, X, User2, Calendar, Check, History, LinkIcon, Tag, AlertTriangle, Briefcase, ListTodo, ListCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Badge } from '../../../../components/ui/badge';
import { Ticket, Project, Sprint, Epic, TicketHistory, User } from '../../../../types/interfaces';
import { UIColors, ThemeColors } from '@/lib/theme/theme';

interface TicketDetailsProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTicket: Ticket) => void;
  onAssign: (ticketId: string, epicId: string | null, sprintId: string | null) => void;
  projects: Project[];
  sprints: Sprint[];
  epics: Epic[];
  users: User[];
  history: TicketHistory[];
  uiColors?: UIColors;
  themeColors?: ThemeColors;
}

const TicketDetails: React.FC<TicketDetailsProps> = ({ 
  ticket, 
  isOpen, 
  onClose, 
  onSave,
  onAssign,
  projects,
  sprints,
  epics,
  users,
  history,
  uiColors,
  themeColors
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editedTicket, setEditedTicket] = useState<Ticket | null>(null);
  const [selectedEpicId, setSelectedEpicId] = useState<string | null>(null);
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState("details");
  
  useEffect(() => {
    if (ticket) {
      setEditedTicket({...ticket});
      setSelectedEpicId(ticket.epic_id || null);
      setSelectedSprintId(ticket.sprint_id || null);
    }
  }, [ticket]);

  if (!ticket || !editedTicket) return null;

  const handleSave = () => {
    if (editedTicket) {
      onSave(editedTicket);
      setEditMode(false);
    }
  };
  
  const handleTagAdd = () => {
    if (tagInput.trim() && editedTicket.tags) {
      setEditedTicket({
        ...editedTicket,
        tags: [...editedTicket.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };
  
  const handleTagRemove = (tag: string) => {
    if (editedTicket.tags) {
      setEditedTicket({
        ...editedTicket,
        tags: editedTicket.tags.filter(t => t !== tag)
      });
    }
  };

  const handleAssign = () => {
    if (ticket) {
      onAssign(ticket.id, selectedEpicId, selectedSprintId);
      // Switch back to details tab after assigning
      setActiveTab("details");
    }
  };

  const getEpicName = (epicId: string | null | undefined) => {
    if (!epicId) return 'None';
    const epic = epics.find(e => e.id === epicId);
    return epic ? epic.title : 'Unknown Epic';
  };

  const getSprintName = (sprintId: string | null | undefined) => {
    if (!sprintId) return 'None';
    const sprint = sprints.find(s => s.id === sprintId);
    return sprint ? sprint.name : 'Unknown Sprint';
  };
  
  const getProjectName = (projectId: string | null | undefined) => {
    if (!projectId) return 'None';
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  const getUserName = (userId: string | undefined) => {
    if (!userId) return 'Unassigned';
    const user = users.find(u => u.id === userId);
    return user ? (user.full_name || user.email) : 'Unknown User';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className={`${uiColors?.cardBg || ''} max-w-3xl max-h-[90vh] overflow-y-auto p-0`}>
        <DialogHeader className="px-6 py-4 border-b sticky top-0 z-10 bg-inherit">
          <DialogTitle className={uiColors?.primaryText || ''}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 truncate pr-2">
                <span className="text-xl truncate">{editMode ? 'Edit Ticket' : ticket.title}</span>
                <Badge className={getStatusColor(ticket.status)}>
                  {ticket.status}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                {!editMode && (
                  <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6 pb-6">
          <TabsList className="mb-4 sticky top-[73px] z-10 bg-inherit">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-6">
            {editMode ? (
              <div className="space-y-5">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${uiColors?.secondaryText || ''}`}>Title</label>
                  <Input 
                    value={editedTicket.title}
                    onChange={(e) => setEditedTicket({...editedTicket, title: e.target.value})}
                    className={`${uiColors?.inputBg || ''} ${uiColors?.inputText || ''}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${uiColors?.secondaryText || ''}`}>Description</label>
                  <Textarea 
                    value={editedTicket.description}
                    onChange={(e) => setEditedTicket({...editedTicket, description: e.target.value})}
                    rows={5}
                    className={`${uiColors?.inputBg || ''} ${uiColors?.inputText || ''}`}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${uiColors?.secondaryText || ''} flex items-center gap-1.5`}>
                      <AlertTriangle size={16} /> Priority
                    </label>
                    <Select 
                      value={editedTicket.priority}
                      onValueChange={(value) => setEditedTicket({...editedTicket, priority: value})}
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
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${uiColors?.secondaryText || ''}`}>Status</label>
                    <Select 
                      value={editedTicket.status}
                      onValueChange={(value: string) => {
                        if (value === "Open" || value === "In Progress" || value === "Review" || value === "Done") {
                          setEditedTicket({...editedTicket, status: value})
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
                      <User2 size={16} /> Assignee
                    </label>
                    <Select 
                      value={editedTicket.assignee_id || ""}
                      onValueChange={(value) => setEditedTicket({
                        ...editedTicket, 
                        assignee_id: value === "" ? null : value
                      })}
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
                      value={editedTicket.due_date ? new Date(editedTicket.due_date).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditedTicket({
                        ...editedTicket, 
                        due_date: e.target.value ? new Date(e.target.value).toISOString() : undefined
                      })}
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
                      Add
                    </Button>
                  </div>
                  {editedTicket.tags && editedTicket.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {editedTicket.tags.map((tag, index) => (
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
                <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                  <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
                  <Button 
                    onClick={handleSave} 
                    className={`${themeColors?.buttonBg || ''} ${themeColors?.buttonText || ''}`}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className={`text-sm font-medium ${uiColors?.mutedText || 'text-gray-500'} mb-1`}>ID</h3>
                      <div className="flex items-center">
                        <AlertCircle size={14} className="text-gray-400 mr-1.5" />
                        <p className={`${uiColors?.primaryText || ''} font-mono`}>{ticket.id}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className={`text-sm font-medium ${uiColors?.mutedText || 'text-gray-500'} mb-1`}>Project</h3>
                      <div className="flex items-center gap-1.5">
                        <Briefcase size={16} className={themeColors?.accentText || ''} />
                        <span className={`${uiColors?.secondaryText || ''}`}>
                          {getProjectName(ticket.project_id)}
                        </span>
                      </div>
                    </div>
                  
                    <div>
                      <h3 className={`text-sm font-medium ${uiColors?.mutedText || 'text-gray-500'} mb-1`}>Status & Priority</h3>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                        <Badge className={getPriorityClass(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className={`text-sm font-medium ${uiColors?.mutedText || 'text-gray-500'} mb-1`}>Assignee</h3>
                      <div className="flex items-center gap-1.5">
                        <div className={`h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center`}>
                          <User2 size={14} className={themeColors?.accentText || ''} />
                        </div>
                        <span className={`${uiColors?.secondaryText || ''}`}>
                          {getUserName(ticket.assignee_id as string | undefined)}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className={`text-sm font-medium ${uiColors?.mutedText || 'text-gray-500'} mb-1`}>Due Date</h3>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={16} className={themeColors?.accentText || ''} />
                        <span className={`${uiColors?.secondaryText || ''}`}>
                          {ticket.due_date ? formatDate(ticket.due_date) : 'Not set'}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className={`text-sm font-medium ${uiColors?.mutedText || 'text-gray-500'} mb-1`}>Created / Updated</h3>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className={`${uiColors?.secondaryText || ''}`}>
                          Created: {formatDate(ticket.created_at)}
                        </div>
                        <div className={`${uiColors?.secondaryText || ''}`}>
                          Updated: {formatDate(ticket.updated_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className={`text-sm font-medium ${uiColors?.mutedText || 'text-gray-500'} mb-2`}>Description</h3>
                  <div className={`${uiColors?.cardBg || ''} p-4 rounded-lg border ${uiColors?.borderColor || ''} ${uiColors?.secondaryText || ''}`}>
                    {ticket.description ? (
                      <div className="whitespace-pre-line">{ticket.description}</div>
                    ) : (
                      <div className={`${uiColors?.mutedText || ''} italic`}>No description provided</div>
                    )}
                  </div>
                </div>
                
                {ticket.tags && ticket.tags.length > 0 && (
                  <div>
                    <h3 className={`text-sm font-medium ${uiColors?.mutedText || 'text-gray-500'} mb-2`}>Tags</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {ticket.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className={`${uiColors?.softBg || ''} py-1 px-2`}>
                          <Tag size={12} className="mr-1.5" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="assignments">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className={`p-4 rounded-lg border ${uiColors?.borderColor || ''}`}>
                  <h3 className={`text-sm font-medium ${uiColors?.primaryText || ''} mb-3 flex items-center gap-1.5`}>
                    <ListTodo size={16} /> Epic
                  </h3>
                  
                  <div className={`mb-4 p-3 ${uiColors?.softBg || ''} rounded-md`}>
                    <div className={`${uiColors?.mutedText || ''} text-xs mb-1`}>Current Epic</div>
                    <div className={`font-medium ${uiColors?.primaryText || ''}`}>
                      {getEpicName(ticket.epic_id)}
                    </div>
                  </div>
                  
                  <div>
                    <div className={`${uiColors?.secondaryText || ''} text-sm mb-2`}>Change Epic</div>
                    <Select 
                      value={selectedEpicId || ""}
                      onValueChange={(value) => setSelectedEpicId(value === "" ? null : value)}
                    >
                      <SelectTrigger className={`${uiColors?.inputBg || ''} ${uiColors?.inputText || ''}`}>
                        <SelectValue placeholder="Select epic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {epics.map(epic => (
                          <SelectItem key={epic.id} value={epic.id}>{epic.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg border ${uiColors?.borderColor || ''}`}>
                  <h3 className={`text-sm font-medium ${uiColors?.primaryText || ''} mb-3 flex items-center gap-1.5`}>
                    <ListCheck size={16} /> Sprint
                  </h3>
                  
                  <div className={`mb-4 p-3 ${uiColors?.softBg || ''} rounded-md`}>
                    <div className={`${uiColors?.mutedText || ''} text-xs mb-1`}>Current Sprint</div>
                    <div className={`font-medium ${uiColors?.primaryText || ''}`}>
                      {getSprintName(ticket.sprint_id)}
                    </div>
                  </div>
                  
                  <div>
                    <div className={`${uiColors?.secondaryText || ''} text-sm mb-2`}>Change Sprint</div>
                    <Select 
                      value={selectedSprintId || ""}
                      onValueChange={(value) => setSelectedSprintId(value === "" ? null : value)}
                    >
                      <SelectTrigger className={`${uiColors?.inputBg || ''} ${uiColors?.inputText || ''}`}>
                        <SelectValue placeholder="Select sprint" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {sprints.map(sprint => (
                          <SelectItem key={sprint.id} value={sprint.id}>{sprint.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6 pt-4 border-t">
                <Button 
                  onClick={handleAssign}
                  className={`${themeColors?.buttonBg || ''} ${themeColors?.buttonText || ''}`}
                >
                  <LinkIcon className="h-4 w-4 mr-1.5" />
                  Update Assignments
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className={`text-center py-8 ${uiColors?.mutedText || 'text-gray-500'}`}>
                  <History className={`h-12 w-12 mx-auto mb-2 ${uiColors?.mutedText || 'text-gray-400'}`} />
                  <p>No history available for this ticket</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((entry, index) => (
                    <div key={index} className={`border-l-2 ${themeColors?.borderColor || 'border-blue-200'} pl-4 py-3`}>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          <div className={`${themeColors?.highlightBg || 'bg-blue-100'} p-2 rounded-full`}>
                            <Check className={`h-4 w-4 ${themeColors?.accentText || 'text-blue-500'}`} />
                          </div>
                        </div>
                        <div className="flex-grow">
                          <p className={`text-sm font-medium ${uiColors?.primaryText || ''}`}>
                            <span className={themeColors?.accentText || 'text-blue-600'}>{getUserName(entry.assigned_by)}</span> assigned this ticket to:
                          </p>
                          <div className={`mt-1.5 text-sm ${uiColors?.secondaryText || ''}`}>
                            <p>Epic: <span className="font-medium">{getEpicName(entry.epic_id)}</span></p>
                            <p>Sprint: <span className="font-medium">{getSprintName(entry.sprint_id)}</span></p>
                          </div>
                          <div className={`mt-1.5 flex items-center text-xs ${uiColors?.mutedText || 'text-gray-500'}`}>
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(entry.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetails;
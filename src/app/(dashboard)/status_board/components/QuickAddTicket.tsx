// Components/QuickAddTicket.tsx
import React, { useState } from 'react';
import { Plus, X, AlertTriangle } from 'lucide-react';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Badge } from '../../../../components/ui/badge';
import { Project, Epic, Sprint } from '../../../../types/interfaces';
import { UIColors, ThemeColors } from '@/lib/theme/theme';

interface QuickAddTicketProps {
  columnId: string;
  projectId?: string;
  epicId?: string;
  sprintId?: string;
  projects: Project[];
  epics: Epic[];
  sprints: Sprint[];
  uiColors?: UIColors;
  themeColors?: ThemeColors;
  onAddTicket: (data: {
    title: string;
    status: string;
    priority: string;
    project_id?: string;
    epic_id?: string;
    sprint_id?: string;
  }) => Promise<void>;
}

const QuickAddTicket: React.FC<QuickAddTicketProps> = ({
  columnId,
  projectId,
  epicId,
  sprintId,
  projects,
  epics,
  sprints,
  uiColors,
  themeColors,
  onAddTicket
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Function to get project/epic/sprint names
  const getProjectName = (id?: string) => {
    if (!id) return null;
    const project = projects.find(p => p.id === id);
    return project?.name || null;
  };
  
  const getEpicName = (id?: string) => {
    if (!id) return null;
    const epic = epics.find(e => e.id === id);
    return epic?.title || null;
  };
  
  const getSprintName = (id?: string) => {
    if (!id) return null;
    const sprint = sprints.find(s => s.id === id);
    return sprint?.name || null;
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onAddTicket({
        title: title.trim(),
        status: columnId,
        priority,
        project_id: projectId,
        epic_id: epicId,
        sprint_id: sprintId
      });
      
      // Reset form
      setTitle('');
      setPriority('Medium');
      setIsAdding(false);
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdding) {
    return (
      <div 
        className={`mt-3 p-2 border border-dashed ${uiColors?.borderColor || 'border-gray-300'} rounded cursor-pointer
                  hover:border-blue-400 hover:${themeColors?.highlightBg || 'bg-blue-50 dark:bg-blue-900/20'}
                  transition-colors duration-150 text-center`}
        onClick={() => setIsAdding(true)}
      >
        <div className={`flex items-center justify-center ${uiColors?.mutedText || 'text-gray-500 dark:text-gray-400'} text-sm`}>
          <Plus size={16} className="mr-1" />
          <span>Add ticket</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`mt-3 p-3 ${uiColors?.cardBg || 'bg-white dark:bg-gray-800'} border ${uiColors?.borderColor || 'border-gray-200 dark:border-gray-700'} rounded shadow-sm`}>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className={`text-xs font-medium ${uiColors?.mutedText || 'text-gray-500 dark:text-gray-400'}`}>Quick Add</span>
          <button 
            className={`${uiColors?.mutedText || 'text-gray-400'} hover:${uiColors?.secondaryText || 'text-gray-600 dark:hover:text-gray-300'}`}
            onClick={() => setIsAdding(false)}
          >
            <X size={14} />
          </button>
        </div>
        
        {/* Context indicators */}
        {(projectId || epicId || sprintId) && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {projectId && (
              <Badge variant="outline" className={`${themeColors?.highlightBg || 'bg-blue-50 dark:bg-blue-900/20'} text-xs py-1`}>
                Project: {getProjectName(projectId)}
              </Badge>
            )}
            {epicId && (
              <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-xs py-1">
                Epic: {getEpicName(epicId)}
              </Badge>
            )}
            {sprintId && (
              <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-xs py-1">
                Sprint: {getSprintName(sprintId)}
              </Badge>
            )}
          </div>
        )}
        
        <Input
          autoFocus
          placeholder="Ticket title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            } else if (e.key === 'Escape') {
              setIsAdding(false);
            }
          }}
          className={`mb-2 ${uiColors?.inputBg || ''} ${uiColors?.inputText || ''}`}
        />
        
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className={uiColors?.mutedText || ''} />
          <Select
            value={priority}
            onValueChange={setPriority}
          >
            <SelectTrigger className={`w-full h-8 ${uiColors?.inputBg || ''} ${uiColors?.inputText || ''}`}>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex space-x-2 justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAdding(false)}
            className={themeColors?.buttonHoverBg || ''}
          >
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
            className={`${themeColors?.buttonBg || ''} ${themeColors?.buttonText || ''} ${themeColors?.buttonHoverBg || ''}`}
          >
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickAddTicket;
// components/ContextBreadcrumb.tsx
import React from 'react';
import { ChevronRight, Briefcase, ListTodo,  ListCheck} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../../../components/ui/select';
import { Badge } from '../../../../components/ui/badge';
import { Project, Epic, Sprint as SprintType } from '../../../../types/interfaces';
import { UIColors, ThemeColors } from '@/lib/theme/theme';

interface ContextBreadcrumbProps {
  projects: Project[];
  epics: Epic[];
  sprints: SprintType[];
  selectedProjectId: string;
  selectedEpicId: string;
  selectedSprintId: string;
  onProjectChange: (projectId: string) => void;
  onEpicChange: (epicId: string) => void;
  onSprintChange: (sprintId: string) => void;
  uiColors?: UIColors;
  themeColors?: ThemeColors;
}

const ContextBreadcrumb: React.FC<ContextBreadcrumbProps> = ({
  projects,
  epics,
  sprints,
  selectedProjectId,
  selectedEpicId,
  selectedSprintId,
  onProjectChange,
  onEpicChange,
  onSprintChange,
  uiColors,
  themeColors
}) => {
  // Filter epics and sprints based on selected project
  const filteredEpics = selectedProjectId !== 'all'
    ? epics.filter(epic => epic.project_id === selectedProjectId)
    : epics;
  
  const filteredSprints = selectedProjectId !== 'all'
    ? sprints.filter(sprint => sprint.project_id === selectedProjectId)
    : sprints;
  
  // Get entity names for display
  const getProjectName = () => {
    if (selectedProjectId === 'all') return 'All Projects';
    const project = projects.find(p => p.id === selectedProjectId);
    return project ? project.name : 'Unknown Project';
  };
  
  const getEpicName = () => {
    if (selectedEpicId === 'all') return 'All Epics';
    const epic = epics.find(e => e.id === selectedEpicId);
    return epic ? epic.title : 'Unknown Epic';
  };
  
  const getSprintName = () => {
    if (selectedSprintId === 'all') return 'All Sprints';
    const sprint = sprints.find(s => s.id === selectedSprintId);
    return sprint ? sprint.name : 'Unknown Sprint';
  };
  
  return (
    <div className="p-4">
      <h3 className={`text-sm font-medium ${uiColors?.mutedText || 'text-gray-500 dark:text-gray-400'} mb-3`}>Context Filters</h3>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center">
          <div className={`${uiColors?.softBg || 'bg-gray-100 dark:bg-gray-800'} p-1.5 rounded mr-2`}>
            <Briefcase size={16} className={uiColors?.secondaryText || 'text-gray-600 dark:text-gray-300'} />
          </div>
          <Select 
            value={selectedProjectId} 
            onValueChange={(value) => {
              onProjectChange(value);
              // Reset epic and sprint when project changes
              if (value !== selectedProjectId) {
                onEpicChange('all');
                onSprintChange('all');
              }
            }}
          >
            <SelectTrigger className={`h-9 min-w-[200px] ${uiColors?.inputBg || ''} ${uiColors?.inputText || ''}`}>
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedProjectId !== 'all' && (
          <>
            <ChevronRight size={16} className={uiColors?.mutedText || 'text-gray-400'} />
            <div className="flex items-center">
              <div className={`${uiColors?.softBg || 'bg-purple-100 dark:bg-purple-900/30'} p-1.5 rounded mr-2`}>
                <ListTodo size={16} className={uiColors?.secondaryText || 'text-purple-600 dark:text-purple-300'} />
              </div>
              <Select 
                value={selectedEpicId} 
                onValueChange={onEpicChange}
              >
                <SelectTrigger className={`h-9 min-w-[200px] ${uiColors?.inputBg || ''} ${uiColors?.inputText || ''}`}>
                  <SelectValue placeholder="All Epics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Epics</SelectItem>
                  {filteredEpics.map(epic => (
                    <SelectItem key={epic.id} value={epic.id}>{epic.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
        
        {selectedProjectId !== 'all' && (
          <>
            <ChevronRight size={16} className={uiColors?.mutedText || 'text-gray-400'} />
            <div className="flex items-center">
              <div className={`${uiColors?.softBg || 'bg-green-100 dark:bg-green-900/30'} p-1.5 rounded mr-2`}>
                <ListCheck size={16} className={uiColors?.secondaryText || 'text-green-600 dark:text-green-300'} />
              </div>
              <Select 
                value={selectedSprintId} 
                onValueChange={onSprintChange}
              >
                <SelectTrigger className={`h-9 min-w-[200px] ${uiColors?.inputBg || ''} ${uiColors?.inputText || ''}`}>
                  <SelectValue placeholder="All Sprints" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sprints</SelectItem>
                  {filteredSprints.map(sprint => (
                    <SelectItem key={sprint.id} value={sprint.id}>{sprint.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
      
      {/* Active context indicator */}
      {(selectedProjectId !== 'all' || selectedEpicId !== 'all' || selectedSprintId !== 'all') && (
        <div className={`mt-3 px-4 py-2 ${themeColors?.highlightBg || 'bg-blue-50 dark:bg-blue-900/20'} ${themeColors?.accentText || 'text-blue-700 dark:text-blue-300'} rounded-md text-sm`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">Active Context:</span>
            {selectedProjectId !== 'all' && (
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 hover:bg-blue-100">
                <Briefcase size={12} className="mr-1" />
                {getProjectName()}
              </Badge>
            )}
            {selectedEpicId !== 'all' && (
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100 hover:bg-purple-100">
                <ListTodo size={12} className="mr-1" />
                {getEpicName()}
              </Badge>
            )}
            {selectedSprintId !== 'all' && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 hover:bg-green-100">
                <ListCheck size={12} className="mr-1" />
                {getSprintName()}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextBreadcrumb;
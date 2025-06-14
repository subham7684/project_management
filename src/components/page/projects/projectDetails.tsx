"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Calendar, 
  ArrowLeft, 
  Shield, 
  Plus, 
  X, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle,
  AlertCircle,
  MenuSquare,
  BarChart2,
  UserPlus,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { useAppTheme } from '@/context/ThemeContext';
import { useProjectDetails } from '@/hooks/useProjectDetails'; // Import your custom hook
import UserSelectionModal from "@/components/modals/userSelection";
import ConfirmDialog from "@/components/dialogues/confirm";
import Spinner from "@/components/spinners";
import ProjectService from "@/services/project";
import { Project, Ticket, Sprint, Epic, User } from "@/types/interfaces";
import { toast } from "react-hot-toast";
import { fetchProjectDetails } from "@/store/slices/projectDetailsSlice";

// Extended interfaces to match actual data structure
interface ExtendedProject extends Project {
  owner_id?: string;
  _id?: string;
}

interface ExtendedUser extends User {
  id?: string;
}

interface ExtendedTicket extends Ticket {
  _id?: string;
}

interface ExtendedSprint extends Sprint {
  _id?: string;
}

interface ExtendedEpic extends Epic {
  _id?: string;
}

interface ProjectDetailsProps {
  projectId: string;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ projectId }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Use the custom hook to get project details
  const { project: currentProject, sprints: projectSprints, epics: projectEpics, tickets: projectTickets, loading, error } = 
    useProjectDetails(projectId);
    
  const { user } = useAppSelector((state) => state.auth) as { user: ExtendedUser };
  const { userList } = useAppSelector((state) => state.public_user);
  const { uiColors, themeColors } = useAppTheme();
  
  // UI state
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Loading states
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRemovingUser, setIsRemovingUser] = useState<string | null>(null);
  
  // Safely cast to extended types to handle additional properties
  const project = currentProject as ExtendedProject | null;
  const sprints = projectSprints as ExtendedSprint[];
  const epics = projectEpics as ExtendedEpic[];
  const tickets = projectTickets as ExtendedTicket[];
  
  // Check permissions
  const isOwner = project?.owner_id === user?.id || project?.owner_id === user?._id;
  const isAdmin = project?.admin_users?.includes(user?.id || '') || project?.admin_users?.includes(user?._id || '');
  const canManageUsers = isOwner || isAdmin;
  const canEdit = isOwner || isAdmin;
  const canDelete = isOwner;
  
  // Add users to project
  const handleAddUsers = async (selectedUsers: Array<{id: string, isAdmin: boolean}>) => {
    try {
      const promises = selectedUsers.map(user => 
        ProjectService.addUserToProject(projectId, user.id, user.isAdmin)
      );
      
      await Promise.all(promises);
      setShowAddUserModal(false);
      
      // Show success toast
      toast.success(`${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''} added to project`);
      
      // Refresh project details
      dispatch(fetchProjectDetails(projectId));
    } catch (error) {
      console.error('Error adding users to project:', error);
      toast.error('Failed to add users to project');
    }
  };
  
  // Remove user from project
  const handleRemoveUser = async (userId: string) => {
    try {
      setIsRemovingUser(userId);
      await ProjectService.removeUserFromProject(projectId, userId);
      
      // Show success toast
      toast.success('User removed from project');
      
      // Refresh project details
      dispatch(fetchProjectDetails(projectId));
    } catch (error) {
      console.error('Error removing user from project:', error);
      toast.error('Failed to remove user from project');
    } finally {
      setIsRemovingUser(null);
    }
  };
  
  // Delete project
  const handleDeleteProject = async () => {
    try {
      setIsDeleting(true);
      await ProjectService.deleteProject(projectId);
      
      // Show success toast
      toast.success('Project deleted successfully');
      
      // Redirect to projects list
      router.push('/dashboard/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Spinner />
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center h-[calc(100vh-6rem)] ${uiColors.pageBg}`}>
        <AlertCircle className={`h-16 w-16 ${themeColors.iconStroke} mb-4`} />
        <h2 className={`text-2xl font-bold ${uiColors.primaryText} mb-2`}>Error Loading Project</h2>
        <p className={uiColors.secondaryText}>{error}</p>
        <button 
          onClick={() => router.push('/dashboard/projects')}
          className={`mt-6 px-4 py-2 ${themeColors.buttonBg} ${themeColors.buttonText} rounded-md ${themeColors.buttonHoverBg} transition-colors`}
        >
          Back to Projects
        </button>
      </div>
    );
  }
  
  // No project found
  if (!project) {
    return (
      <div className={`flex flex-col items-center justify-center h-[calc(100vh-6rem)] ${uiColors.pageBg}`}>
        <AlertCircle className={`h-16 w-16 text-yellow-500 mb-4`} />
        <h2 className={`text-2xl font-bold ${uiColors.primaryText} mb-2`}>Project Not Found</h2>
        <p className={uiColors.secondaryText}>The project youre looking for doesnt exist or you dont have access to it.</p>
        <button 
          onClick={() => router.push('/dashboard/projects')}
          className={`mt-6 px-4 py-2 ${themeColors.buttonBg} ${themeColors.buttonText} rounded-md ${themeColors.buttonHoverBg} transition-colors`}
        >
          Back to Projects
        </button>
      </div>
    );
  }
  
  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'Planned': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Calculate metrics
  const completedTickets = tickets.filter(ticket => ticket.status === 'Done').length;
  const inProgressTickets = tickets.filter(ticket => ticket.status === 'In Progress').length;
  const openTickets = tickets.filter(ticket => ticket.status === 'Open').length;
  const reviewTickets = tickets.filter(ticket => ticket.status === 'Review').length;
  // For blocked tickets, we need to check if it exists in the status type
  const blockedTickets = tickets.filter(ticket => ticket.status === 'Blocked' as unknown).length;
  const activeSprintCount = sprints.filter(sprint => sprint.status === 'Active').length;
  
  // Get user info by ID
  const getUserById = (id: string) => {
    // Find user in the userList
    const foundUser = userList.find(u => u._id === id || u._id === id);
    
    if (foundUser) {
      return {
        id,
        name: foundUser.full_name || foundUser.email || `User ${id.substring(0, 5)}`,
        email: foundUser.email,
        avatar: null 
      };
    }
    
    // Fallback if user not found
    return {
      id,
      name: `User ${id.substring(0, 5)}`,
      email: null,
      avatar: null 
    };
  };
  
  return (
    <div className={`container mx-auto px-4 py-6 max-w-7xl ${uiColors.pageBg}`}>
      {/* Back button and project title row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => router.push('/dashboard/projects')}
            className={`mr-4 p-2 rounded-full ${uiColors.hoverBg} transition-colors`}
            aria-label="Back to projects"
          >
            <ArrowLeft className={`h-5 w-5 ${themeColors.iconStroke}`} />
          </button>
          <h1 className={`text-2xl md:text-3xl font-bold ${uiColors.primaryText} truncate`}>
            {project.name}
          </h1>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center space-x-3">
          {canEdit && (
            <button 
              onClick={() => router.push(`/dashboard/projects/edit/${projectId}`)}
              className={`flex items-center px-3 py-1.5 text-sm ${uiColors.softBg} ${uiColors.hoverBg} ${uiColors.secondaryText} rounded-md transition-colors`}
            >
              <Edit className="h-4 w-4 mr-1.5" />
              Edit
            </button>
          )}
          
          {canDelete && (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md transition-colors"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Spinner className="mr-1.5" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1.5" />
              )}
              Delete
            </button>
          )}
        </div>
      </div>
      
      {/* Project info card */}
      <div className={`${uiColors.cardBg} rounded-xl shadow-sm border ${uiColors.borderColor} mb-8`}>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            {/* Project details */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                
                <span className={`flex items-center ${uiColors.mutedText} text-sm`}>
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDate(project.deadline)}
                </span>
                
                <span className={`flex items-center ${uiColors.mutedText} text-sm`}>
                  <Users className="h-4 w-4 mr-1" />
                  {project.members?.length || 0} Members
                </span>
              </div>
              
              <p className={`${uiColors.secondaryText} mb-4`}>
                {project.description || "No description provided."}
              </p>
              
              {/* Progress bar */}
              <div className="mb-2">
                <div className="flex justify-between mb-1">
                  <span className={`text-sm font-medium ${uiColors.secondaryText}`}>Progress</span>
                  <span className={`text-sm font-medium ${uiColors.secondaryText}`}>{project.progress || 0}%</span>
                </div>
                <div className={`w-full ${uiColors.softBg} rounded-full h-2`}>
                  <div 
                    className={`${themeColors.buttonBg} h-2 rounded-full`} 
                    style={{ width: `${project.progress || 0}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Key stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className={`${uiColors.softBg} p-3 rounded-lg`}>
                  <p className={`text-xs ${uiColors.mutedText} mb-1`}>Sprints</p>
                  <p className={`text-xl font-semibold ${uiColors.primaryText}`}>{sprints.length}</p>
                </div>
                <div className={`${uiColors.softBg} p-3 rounded-lg`}>
                  <p className={`text-xs ${uiColors.mutedText} mb-1`}>Tickets</p>
                  <p className={`text-xl font-semibold ${uiColors.primaryText}`}>{tickets.length}</p>
                </div>
                <div className={`${uiColors.softBg} p-3 rounded-lg`}>
                  <p className={`text-xs ${uiColors.mutedText} mb-1`}>Epics</p>
                  <p className={`text-xl font-semibold ${uiColors.primaryText}`}>{epics.length}</p>
                </div>
                <div className={`${uiColors.softBg} p-3 rounded-lg`}>
                  <p className={`text-xs ${uiColors.mutedText} mb-1`}>Completed</p>
                  <p className={`text-xl font-semibold ${uiColors.primaryText}`}>{completedTickets}</p>
                </div>
              </div>
            </div>
            
            {/* Team members section */}
            <div className="md:w-1/3 lg:w-1/4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-medium ${uiColors.primaryText}`}>Team Members</h3>
                {canManageUsers && (
                  <button 
                    onClick={() => setShowAddUserModal(true)}
                    className={`p-1 rounded-full ${uiColors.hoverBg}`}
                    aria-label="Add team member"
                    title="Add team member"
                  >
                    <UserPlus className={`h-4 w-4 ${themeColors.iconStroke}`} />
                  </button>
                )}
              </div>
              
              <div className={`${uiColors.softBg} rounded-lg p-3 flex-1 max-h-48 overflow-y-auto`}>
                {project.members && project.members.length > 0 ? (
                  <ul className="space-y-2 text-sm">
                    {project.members.map((memberId) => {
                      const isAdmin = project.admin_users?.includes(memberId);
                      const isProjectOwner = project.owner_id === memberId;
                      const userDetails = getUserById(memberId);
                      
                      return (
                        <li key={memberId} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs ${uiColors.primaryText} mr-2`}>
                              {userDetails.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className={uiColors.primaryText}>{userDetails.name}</span>
                              <div className="flex items-center">
                                {isAdmin && (
                                  <Shield size={12} className={`mr-1.5 ${themeColors.iconStroke}`} />
                                )}
                                {isProjectOwner && (
                                  <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Owner</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {canManageUsers && !isProjectOwner && 
                           memberId !== user?.id && memberId !== user?._id && (
                            <button 
                              onClick={() => handleRemoveUser(memberId)}
                              className="p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                              disabled={isRemovingUser === memberId}
                              title="Remove user"
                            >
                              {isRemovingUser === memberId ? (
                                <Spinner className="h-3 w-3" />
                              ) : (
                                <X size={14} />
                              )}
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className={`text-sm ${uiColors.mutedText} italic`}>No team members yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs navigation */}
      <div className={`flex border-b ${uiColors.borderColor} mb-6 overflow-x-auto`}>
        <button
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
            activeTab === "overview"
              ? `${themeColors.accentText} border-b-2 ${themeColors.borderColor}`
              : `${uiColors.mutedText} hover:${uiColors.secondaryText}`
          }`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
            activeTab === "sprints"
              ? `${themeColors.accentText} border-b-2 ${themeColors.borderColor}`
              : `${uiColors.mutedText} hover:${uiColors.secondaryText}`
          }`}
          onClick={() => setActiveTab("sprints")}
        >
          Sprints
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
            activeTab === "tickets"
              ? `${themeColors.accentText} border-b-2 ${themeColors.borderColor}`
              : `${uiColors.mutedText} hover:${uiColors.secondaryText}`
          }`}
          onClick={() => setActiveTab("tickets")}
        >
          Tickets
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
            activeTab === "analytics"
              ? `${themeColors.accentText} border-b-2 ${themeColors.borderColor}`
              : `${uiColors.mutedText} hover:${uiColors.secondaryText}`
          }`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
      </div>
      
      {/* Tab content */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent activity */}
            <div className={`${uiColors.cardBg} rounded-xl shadow-sm border ${uiColors.borderColor} p-5`}>
              <h3 className={`font-medium ${uiColors.primaryText} mb-4 flex items-center`}>
                <MenuSquare className={`h-4 w-4 mr-1.5 ${themeColors.iconStroke}`} />
                Recent Activity
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className={`w-8 h-8 rounded-full ${themeColors.highlightBg} flex items-center justify-center mr-3 mt-0.5`}>
                    <CheckCircle className={`h-4 w-4 ${themeColors.iconStroke}`} />
                  </div>
                  <div>
                    <p className={`text-sm ${uiColors.primaryText}`}>
                      Project <span className="font-medium">{project.name}</span> was created
                    </p>
                    <p className={`text-xs ${uiColors.mutedText} mt-1`}>{formatDate(project.created_at)}</p>
                  </div>
                </div>
                
                {/* Placeholder activity items - would come from actual activity data */}
                {project.updated_at !== project.created_at && (
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3 mt-0.5">
                      <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className={`text-sm ${uiColors.primaryText}`}>
                        Project was updated
                      </p>
                      <p className={`text-xs ${uiColors.mutedText} mt-1`}>{formatDate(project.updated_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Quick stats */}
            <div className={`${uiColors.cardBg} rounded-xl shadow-sm border ${uiColors.borderColor} p-5`}>
              <h3 className={`font-medium ${uiColors.primaryText} mb-4 flex items-center`}>
                <BarChart2 className={`h-4 w-4 mr-1.5 ${themeColors.iconStroke}`} />
                Project Statistics
              </h3>
              
              <div className="space-y-4">
                {/* Stat rows */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs ${uiColors.mutedText}`}>Open Tickets</p>
                    <p className={`text-lg font-semibold ${uiColors.primaryText}`}>{openTickets}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${uiColors.mutedText}`}>Completed Tickets</p>
                    <p className={`text-lg font-semibold ${uiColors.primaryText}`}>{completedTickets}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs ${uiColors.mutedText}`}>Active Sprints</p>
                    <p className={`text-lg font-semibold ${uiColors.primaryText}`}>{activeSprintCount}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${uiColors.mutedText}`}>Team Members</p>
                    <p className={`text-lg font-semibold ${uiColors.primaryText}`}>{project.members?.length || 0}</p>
                  </div>
                </div>
                
                {/* Ticket status distribution */}
                {tickets.length > 0 && (
                  <div>
                    <p className={`text-xs ${uiColors.mutedText} mb-1`}>Ticket Distribution</p>
                    <div className={`flex h-4 overflow-hidden rounded ${uiColors.softBg}`}>
                      {/* Only add the status bars if there are tickets */}
                      {completedTickets > 0 && (
                        <div 
                          className="bg-green-500 h-full" 
                          style={{ width: `${(completedTickets / tickets.length) * 100}%` }}
                          title={`${completedTickets} completed (${Math.round((completedTickets / tickets.length) * 100)}%)`}
                        ></div>
                      )}
                      {inProgressTickets > 0 && (
                        <div 
                          className="bg-yellow-500 h-full" 
                          style={{ width: `${(inProgressTickets / tickets.length) * 100}%` }}
                          title={`${inProgressTickets} in progress (${Math.round((inProgressTickets / tickets.length) * 100)}%)`}
                        ></div>
                      )}
                      {reviewTickets > 0 && (
                        <div 
                          className="bg-purple-500 h-full" 
                          style={{ width: `${(reviewTickets / tickets.length) * 100}%` }}
                          title={`${reviewTickets} in review (${Math.round((reviewTickets / tickets.length) * 100)}%)`}
                        ></div>
                      )}
                      {openTickets > 0 && (
                        <div 
                          className="bg-blue-500 h-full" 
                          style={{ width: `${(openTickets / tickets.length) * 100}%` }}
                          title={`${openTickets} open (${Math.round((openTickets / tickets.length) * 100)}%)`}
                        ></div>
                      )}
                      {blockedTickets > 0 && (
                        <div 
                          className="bg-red-500 h-full" 
                          style={{ width: `${(blockedTickets / tickets.length) * 100}%` }}
                          title={`${blockedTickets} blocked (${Math.round((blockedTickets / tickets.length) * 100)}%)`}
                        ></div>
                      )}
                    </div>
                    <div className="flex flex-wrap text-xs mt-1.5 gap-x-4 gap-y-1">
                      {completedTickets > 0 && (
                        <span className="text-green-600 dark:text-green-400">Done ({Math.round((completedTickets / tickets.length) * 100)}%)</span>
                      )}
                      {inProgressTickets > 0 && (
                        <span className="text-yellow-600 dark:text-yellow-400">In Progress ({Math.round((inProgressTickets / tickets.length) * 100)}%)</span>
                      )}
                      {reviewTickets > 0 && (
                        <span className="text-purple-600 dark:text-purple-400">Review ({Math.round((reviewTickets / tickets.length) * 100)}%)</span>
                      )}
                      {openTickets > 0 && (
                        <span className="text-blue-600 dark:text-blue-400">Open ({Math.round((openTickets / tickets.length) * 100)}%)</span>
                      )}
                      {blockedTickets > 0 && (
                        <span className="text-red-600 dark:text-red-400">Blocked ({Math.round((blockedTickets / tickets.length) * 100)}%)</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "sprints" && (
          <div className={`${uiColors.cardBg} rounded-xl shadow-sm border ${uiColors.borderColor} p-5`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`font-medium ${uiColors.primaryText}`}>Project Sprints</h3>
              {canEdit && (
                <button 
                  className={`px-3 py-1.5 text-sm ${themeColors.buttonBg} ${themeColors.buttonHoverBg} ${themeColors.buttonText} rounded-md transition-colors flex items-center`}
                  onClick={() => router.push(`/dashboard/projects/${projectId}/sprints/new`)}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  New Sprint
                </button>
              )}
            </div>
            
            {sprints.length > 0 ? (
              <div className="space-y-4">
                {sprints.map(sprint => (
                  <div 
                    key={sprint.id || sprint._id} 
                    className={`p-4 border ${uiColors.borderColor} rounded-lg hover:shadow-sm transition-shadow cursor-pointer`}
                    onClick={() => router.push(`/dashboard/sprints/${sprint.id || sprint._id}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className={`font-medium ${uiColors.primaryText}`}>{sprint.name}</h4>
                        <div className="flex items-center mt-1">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(sprint.status)}`}>
                            {sprint.status}
                          </span>
                          <span className={`ml-2 text-xs ${uiColors.mutedText}`}>
                            {sprint.progress || 0}% complete
                          </span>
                        </div>
                      </div>
                      <div className={`text-xs ${uiColors.mutedText} text-right`}>
                        <div className="flex items-center mb-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          <span>{sprint.members?.length || 0} members</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className={`w-full ${uiColors.softBg} rounded-full h-1.5`}>
                        <div 
                          className={`${themeColors.buttonBg} h-1.5 rounded-full`} 
                          style={{ width: `${sprint.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className={`w-16 h-16 rounded-full ${uiColors.softBg} flex items-center justify-center mb-4`}>
                  <Calendar className={`h-8 w-8 ${themeColors.iconStroke}`} />
                </div>
                <p className={`${uiColors.secondaryText} text-center mb-2`}>No sprints found</p>
                <p className={`${uiColors.mutedText} text-sm text-center max-w-md`}>
                  Create your first sprint to organize your work in time-boxed iterations.
                </p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === "tickets" && (
          <div className={`${uiColors.cardBg} rounded-xl shadow-sm border ${uiColors.borderColor} p-5`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`font-medium ${uiColors.primaryText}`}>Project Tickets</h3>
              {canEdit && (
                <button 
                  className={`px-3 py-1.5 text-sm ${themeColors.buttonBg} ${themeColors.buttonHoverBg} ${themeColors.buttonText} rounded-md transition-colors flex items-center`}
                  onClick={() => router.push(`/dashboard/tickets/new?projectId=${projectId}`)}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  New Ticket
                </button>
              )}
            </div>
            
            {tickets.length > 0 ? (
              <div className="space-y-4">
                {tickets.map(ticket => (
                  <div 
                    key={ticket.id || ticket._id} 
                    className={`p-4 border ${uiColors.borderColor} rounded-lg hover:shadow-sm transition-shadow cursor-pointer`}
                    onClick={() => router.push(`/dashboard/tickets/${ticket.id || ticket._id}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0 mr-4">
                        <h4 className={`font-medium ${uiColors.primaryText} truncate`}>{ticket.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400`}>
                            {ticket.priority}
                          </span>
                          {ticket.tags && ticket.tags.length > 0 && ticket.tags.slice(0, 2).map(tag => (
                            <span 
                              key={tag}
                              className={`px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200`}
                            >
                              {tag}
                            </span>
                          ))}
                          {ticket.tags && ticket.tags.length > 2 && (
                            <span className={`text-xs ${uiColors.mutedText}`}>
                              +{ticket.tags.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {ticket.due_date && (
                          <span className={`flex items-center text-xs ${
                            new Date(ticket.due_date) < new Date() && ticket.status !== 'Done'
                              ? 'text-red-600 dark:text-red-400'
                              : uiColors.mutedText
                          }`}>
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(ticket.due_date)}
                          </span>
                        )}
                        {ticket.assignee_id && (
                          <span className={`flex items-center text-xs ${uiColors.mutedText} mt-1`}>
                            <Users className="h-3 w-3 mr-1" />
                            {getUserById(ticket.assignee_id).name}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {ticket.description && (
                      <p className={`text-sm ${uiColors.mutedText} line-clamp-2 mt-2`}>
                        {ticket.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className={`w-16 h-16 rounded-full ${uiColors.softBg} flex items-center justify-center mb-4`}>
                  <MenuSquare className={`h-8 w-8 ${themeColors.iconStroke}`} />
                </div>
                <p className={`${uiColors.secondaryText} text-center mb-2`}>No tickets found</p>
                <p className={`${uiColors.mutedText} text-sm text-center max-w-md`}>
                  Create your first ticket to start tracking work items for this project.
                </p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === "analytics" && (
          <div className={`${uiColors.cardBg} rounded-xl shadow-sm border ${uiColors.borderColor} p-5`}>
            <h3 className={`font-medium ${uiColors.primaryText} mb-4`}>Project Analytics</h3>
            
            {tickets.length > 0 ? (
              <div className="space-y-6">
                {/* Ticket Status Analytics */}
                <div>
                  <h4 className={`text-sm font-medium ${uiColors.secondaryText} mb-3`}>Ticket Status Distribution</h4>
                  <div className={`w-full ${uiColors.softBg} rounded-lg h-8 overflow-hidden flex`}>
                    {/* Calculate percentages */}
                    {completedTickets > 0 && (
                      <div 
                        className="bg-green-500 h-full" 
                        style={{ width: `${(completedTickets / tickets.length) * 100}%` }}
                        title={`${completedTickets} completed (${Math.round((completedTickets / tickets.length) * 100)}%)`}
                      ></div>
                    )}
                    {inProgressTickets > 0 && (
                      <div 
                        className="bg-yellow-500 h-full" 
                        style={{ width: `${(inProgressTickets / tickets.length) * 100}%` }}
                        title={`${inProgressTickets} in progress (${Math.round((inProgressTickets / tickets.length) * 100)}%)`}
                      ></div>
                    )}
                    {reviewTickets > 0 && (
                      <div 
                        className="bg-purple-500 h-full" 
                        style={{ width: `${(reviewTickets / tickets.length) * 100}%` }}
                        title={`${reviewTickets} in review (${Math.round((reviewTickets / tickets.length) * 100)}%)`}
                      ></div>
                    )}
                    {openTickets > 0 && (
                      <div 
                        className="bg-blue-500 h-full" 
                        style={{ width: `${(openTickets / tickets.length) * 100}%` }}
                        title={`${openTickets} open (${Math.round((openTickets / tickets.length) * 100)}%)`}
                      ></div>
                    )}
                  </div>
                  <div className="flex flex-wrap mt-2 gap-x-4 gap-y-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-sm bg-blue-500 mr-1.5"></div>
                      <span className={`text-xs ${uiColors.mutedText}`}>Open</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-sm bg-yellow-500 mr-1.5"></div>
                      <span className={`text-xs ${uiColors.mutedText}`}>In Progress</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-sm bg-purple-500 mr-1.5"></div>
                      <span className={`text-xs ${uiColors.mutedText}`}>Review</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-sm bg-green-500 mr-1.5"></div>
                      <span className={`text-xs ${uiColors.mutedText}`}>Done</span>
                    </div>
                  </div>
                </div>
                
                {/* Priority Distribution */}
                <div>
                  <h4 className={`text-sm font-medium ${uiColors.secondaryText} mb-3`}>Ticket Priority Distribution</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['High', 'Medium', 'Low'].map(priority => {
                      const count = tickets.filter(t => t.priority === priority).length;
                      const percentage = Math.round((count / tickets.length) * 100);
                      return (
                        <div key={priority} className={`${uiColors.softBg} p-4 rounded-lg`}>
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-sm font-medium ${uiColors.primaryText}`}>{priority}</span>
                            <span className={`text-sm ${uiColors.mutedText}`}>{percentage}%</span>
                          </div>
                          <div className={`w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full`}>
                            <div 
                              className={`${
                                priority === 'High' 
                                  ? 'bg-red-500' 
                                  : priority === 'Medium' 
                                    ? 'bg-yellow-500' 
                                    : 'bg-green-500'
                              } h-2 rounded-full`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <p className={`text-xs ${uiColors.mutedText} mt-1`}>{count} tickets</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Project Timeline */}
                <div>
                  <h4 className={`text-sm font-medium ${uiColors.secondaryText} mb-3`}>Project Timeline</h4>
                  {project.deadline ? (
                    <div>
                      <div className="flex justify-between mb-2 text-xs">
                        <span className={uiColors.mutedText}>Project Created</span>
                        <span className={uiColors.mutedText}>Deadline</span>
                      </div>
                      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div 
                          className={`absolute h-2 ${themeColors.buttonBg} rounded-full`}
                          style={{ 
                            width: `${Math.min(project.progress || 0, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs">
                        <span className={uiColors.mutedText}>{formatDate(project.created_at)}</span>
                        <span className={uiColors.mutedText}>{formatDate(project.deadline)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className={`text-sm ${uiColors.mutedText}`}>No deadline has been set for this project.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className={`w-16 h-16 rounded-full ${uiColors.softBg} flex items-center justify-center mb-4`}>
                  <BarChart2 className={`h-8 w-8 ${themeColors.iconStroke}`} />
                </div>
                <p className={`${uiColors.secondaryText} text-center mb-2`}>No data to analyze</p>
                <p className={`${uiColors.mutedText} text-sm text-center max-w-md`}>
                  Analytics will be available once you add tickets to this project.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Modals */}
      {showAddUserModal && (
        <UserSelectionModal
          title="Add Members to Project"
          onClose={() => setShowAddUserModal(false)}
          onSubmit={handleAddUsers}
          excludeUserIds={project.members || []}
          allowAdmin={true}
        />
      )}
      
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Project"
          message={`Are you sure you want to delete project "${project.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          confirmVariant="danger"
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteProject}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}

export default ProjectDetails;
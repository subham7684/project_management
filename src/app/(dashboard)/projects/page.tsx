"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  CalendarDays,
  FolderKanban,
  Trash2,
  Users,
  Eye,
  Edit,
  Clock,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Shield
} from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "../../../lib/hooks/redux";
import { 
  fetchProjects, 
  createProject, 
  deleteProject, 
  setPagination 
} from "../../../store/slices/projectSlice";
import { Project } from "../../../types/interfaces";
import ProjectCreateModal from "../../../components/modals/addProject";
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAppTheme } from '@/context/ThemeContext';

// Loading Skeleton component for projects
const ProjectSkeleton = () => {
  const { uiColors } = useAppTheme();
  
  return (
    <div className={`${uiColors.cardBg} p-5 rounded-xl shadow-sm border ${uiColors.borderColor} mb-4 animate-pulse`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
        <div className="w-full">
          <div className={`h-6 ${uiColors.softBg} rounded-md w-40 mb-3`}></div>
          <div className={`h-4 ${uiColors.softBg} rounded-md w-full max-w-2xl mb-2`}></div>
          <div className={`h-4 ${uiColors.softBg} rounded-md w-5/6 max-w-2xl`}></div>
        </div>
        <div className="flex items-center space-x-2 mt-3 lg:mt-0">
          <div className={`w-8 h-8 ${uiColors.softBg} rounded-lg`}></div>
          <div className={`w-8 h-8 ${uiColors.softBg} rounded-lg`}></div>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex justify-between mb-2">
          <div className={`h-4 ${uiColors.softBg} rounded-md w-24`}></div>
          <div className={`h-4 ${uiColors.softBg} rounded-md w-12`}></div>
        </div>
        <div className={`w-full ${uiColors.softBg} rounded-full h-1.5`}>
          <div className={`h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 w-2/3`}></div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex space-x-6">
          <div className={`h-4 ${uiColors.softBg} rounded-md w-28`}></div>
          <div className={`h-4 ${uiColors.softBg} rounded-md w-24`}></div>
        </div>
        <div className={`h-4 ${uiColors.softBg} rounded-md w-36`}></div>
      </div>
    </div>
  );
};

// Empty state component
const EmptyState = ({ onCreateClick }: { onCreateClick: () => void }) => {
  const { uiColors, themeColors } = useAppTheme();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${uiColors.cardBg} p-8 rounded-xl shadow-sm border ${uiColors.borderColor} text-center`}
    >
      <FolderKanban size={64} className={`mx-auto ${uiColors.mutedText} mb-4`} />
      <h3 className={`text-xl font-medium ${uiColors.primaryText} mb-2`}>No projects found</h3>
      <p className={`${uiColors.secondaryText} mb-6`}>
        Get started by creating your first project
      </p>
      <button
        onClick={onCreateClick}
        className={`inline-flex items-center px-4 py-2 ${themeColors.buttonBg} ${themeColors.buttonText} hover:${themeColors.buttonHoverBg} rounded-lg transition-all duration-200 shadow-sm`}
      >
        <Plus size={18} className="mr-2" />
        <span>Create Project</span>
      </button>
    </motion.div>
  );
};

// Error state component
const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => {
  const { uiColors, themeColors } = useAppTheme();
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${uiColors.cardBg} p-8 rounded-xl shadow-sm border border-red-200 dark:border-red-900 text-center`}
    >
      <AlertTriangle size={64} className="mx-auto text-red-500 mb-4" />
      <h3 className={`text-xl font-medium ${uiColors.primaryText} mb-2`}>Something went wrong</h3>
      <p className={`${uiColors.secondaryText} mb-6`}>
        {error || "There was an error loading projects. Please try again."}
      </p>
      <button
        onClick={onRetry}
        className={`inline-flex items-center px-4 py-2 ${themeColors.buttonBg} ${themeColors.buttonText} hover:${themeColors.buttonHoverBg} rounded-lg transition-colors duration-200 shadow-sm`}
      >
        Try Again
      </button>
    </motion.div>
  );
};

// Main Projects Page component
const ProjectsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { projects, loading, error, pagination } = useAppSelector((state) => state.projects);
  const { uiColors, themeColors } = useAppTheme();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch projects with current filters
  const fetchProjectsWithFilters = useCallback(() => {
    dispatch(
      fetchProjects({
        skip: pagination.skip,
        limit: pagination.limit,
        query: debouncedSearchTerm || undefined,
        sort_field: sortField,
        sort_order: sortOrder,
        status: statusFilter === "all" ? undefined : statusFilter,
      })
    );
  }, [dispatch, debouncedSearchTerm, sortField, sortOrder, statusFilter, pagination]);

  // Initial fetch and when filters change
  useEffect(() => {
    fetchProjectsWithFilters();
  }, [fetchProjectsWithFilters]);

  // Apply client-side filtering
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    
    return projects.filter((project: Project) => {
      // Filter by search term
      const matchesSearch = !searchTerm || 
        (project.name?.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (project.description?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by status
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  // Change page
  const handlePageChange = (direction: 'next' | 'prev') => {
    const newSkip = direction === 'next' 
      ? pagination.skip + pagination.limit 
      : Math.max(0, pagination.skip - pagination.limit);
    
    dispatch(setPagination({ ...pagination, skip: newSkip }));
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 1 ? -1 : 1);
    } else {
      setSortField(field);
      setSortOrder(1);
    }
  };

  // Format date nicely
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "No deadline";
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return new Date(dateStr).toLocaleDateString("en-US", options);
  };

  // Delete a project
  const handleDeleteProject = (projectId: string) => {
    try {
      if (window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
        dispatch(deleteProject(projectId)).unwrap()
          .then(() => {
            toast.success("Project deleted successfully");
          })
          .catch((err) => {
            toast.error(typeof err === 'string' ? err : "Failed to delete project");
          });
      }
    } catch (error) {
      console.error("Delete project error:", error);
      toast.error("An error occurred while deleting the project");
    }
  };

  // Create a new project
  const handleSubmitNewProject = (data: Partial<Project>) => {
    try {
      dispatch(createProject(data)).unwrap()
        .then(() => {
          setIsModalOpen(false);
          toast.success("Project created successfully");
        })
        .catch((err) => {
          toast.error(typeof err === 'string' ? err : "Failed to create project");
        });
    } catch (error) {
      console.error("Create project error:", error);
      toast.error("An error occurred while creating the project");
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "On Hold":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "Planning":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "Cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Get progress bar color based on status and progress
  const getProgressBarColor = (status: string, progress: number) => {
    if (status === "Completed") return uiColors.successBg;
    if (status === "On Hold") return uiColors.warningBg;
    if (status === "Cancelled") return "bg-gray-500 dark:bg-gray-600";
    
    // Active or Planning status
    if (progress < 25) return "bg-red-500 dark:bg-red-600";
    if (progress < 75) return "bg-amber-500 dark:bg-amber-600";
    return "bg-green-500 dark:bg-green-600";
  };

  // Project card component
  const ProjectCard = ({ project }: { project: Project }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${uiColors.cardBg} p-5 rounded-xl shadow-sm border ${uiColors.borderColor} hover:shadow-md transition-all duration-200 mb-4`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-3">
        <div>
          <div className="flex items-center">
            <Link href={`/projects/${project.id}`} className={`text-lg font-semibold ${themeColors.linkText} hover:${themeColors.linkHoverText}`}>
              {project.name}
            </Link>
            <span className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </div>
          <p className={`${uiColors.secondaryText} mt-1 max-w-2xl line-clamp-2 text-sm`}>
            {project.description || "No description provided"}
          </p>
        </div>
        <div className="flex items-center space-x-1 mt-3 lg:mt-0">
          <Link 
            href={`/projects/${project.id}`} 
            className={`p-2 rounded-lg ${uiColors.softBg} hover:${uiColors.hoverBg} transition-colors duration-200 tooltip-trigger`}
          >
            <Eye size={16} className={uiColors.secondaryText} />
            <span className="tooltip">View Project</span>
          </Link>
          <Link 
            href={`/projects/${project.id}/edit`} 
            className={`p-2 rounded-lg ${uiColors.softBg} hover:${uiColors.hoverBg} transition-colors duration-200 tooltip-trigger`}
          >
            <Edit size={16} className={uiColors.secondaryText} />
            <span className="tooltip">Edit Project</span>
          </Link>
          <button
            onClick={() => handleDeleteProject(project.id)}
            className={`p-2 rounded-lg hover:${uiColors.hoverBg} transition-colors duration-200 tooltip-trigger`}
          >
            <Trash2 size={16} className="text-red-500 dark:text-red-400" />
            <span className="tooltip">Delete Project</span>
          </button>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex justify-between mb-1.5">
          <span className={`text-xs ${uiColors.mutedText}`}>Progress</span>
          <span className={`text-xs font-medium ${uiColors.secondaryText}`}>{project.progress}%</span>
        </div>
        <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5`}>
          <div
            className={`h-1.5 rounded-full ${getProgressBarColor(project.status, project.progress || 0)}`}
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0">
          <div className="flex items-center">
            <CalendarDays size={14} className={`${uiColors.mutedText} mr-1.5`} />
            <span className={`text-xs ${uiColors.secondaryText}`}>
              {project.deadline ? formatDate(project.deadline) : "No deadline"}
            </span>
          </div>
          <div className="flex items-center">
            <Users size={14} className={`${uiColors.mutedText} mr-1.5`} />
            <span className={`text-xs ${uiColors.secondaryText}`}>
              {project.members?.length || 0} members
            </span>
          </div>
          {project.admin_users && project.admin_users.length > 0 && (
            <div className="flex items-center">
              <Shield size={14} className={`${themeColors.accentText} mr-1.5`} />
              <span className={`text-xs ${uiColors.secondaryText}`}>
                {project.admin_users.length} {project.admin_users.length === 1 ? 'admin' : 'admins'}
              </span>
            </div>
          )}
        </div>
        <div className={`text-xs ${uiColors.mutedText} flex items-center`}>
          <Clock size={12} className="mr-1" />
          Updated: {formatDate(project.updated_at)}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className={`text-2xl font-bold ${uiColors.primaryText}`}>Projects</h1>
          <p className={`${uiColors.mutedText} mt-1 text-sm`}>Manage your projects and track progress</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center px-4 py-2 ${themeColors.buttonBg} ${themeColors.buttonText} hover:${themeColors.buttonHoverBg} rounded-lg transition-colors duration-200 shadow-sm`}
        >
          <Plus size={16} className="mr-2" />
          <span>New Project</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className={`${uiColors.cardBg} p-4 rounded-xl shadow-sm border ${uiColors.borderColor} mb-5`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-2/3 lg:w-1/2">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${uiColors.mutedText}`} size={16} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-9 py-2 pr-4 w-full rounded-lg border ${uiColors.borderColor} ${uiColors.inputBg} ${uiColors.inputText} focus:outline-none focus:ring-2 ${themeColors.focusRing} transition-all duration-200 text-sm`}
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className={`flex items-center py-2 px-3 rounded-lg border ${uiColors.borderColor} ${uiColors.cardBg} ${uiColors.secondaryText} hover:${uiColors.hoverBg} transition-colors duration-200 text-sm`}
            >
              <Filter size={14} className="mr-2" />
              <span>Filters</span>
            </button>
            
            {isFilterMenuOpen && (
              <div className={`absolute z-10 mt-2 w-48 rounded-md shadow-lg ${uiColors.cardBg} border ${uiColors.borderColor}`}>
                <div className={`py-1 divide-y ${uiColors.divider}`}>
                  <div className="px-4 py-2">
                    <label className={`text-xs font-medium ${uiColors.secondaryText}`}>Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className={`mt-1 py-1.5 px-3 w-full rounded-lg border ${uiColors.borderColor} ${uiColors.inputBg} ${uiColors.inputText} focus:outline-none focus:ring-2 ${themeColors.focusRing} transition-all duration-200 text-sm`}
                    >
                      <option value="all">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Planning">Planning</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="px-4 py-2">
                    <label className={`text-xs font-medium ${uiColors.secondaryText}`}>Sort by</label>
                    <div className="mt-1 space-y-1">
                      <button
                        type="button"
                        onClick={() => handleSort("name")}
                        className={`flex items-center justify-between w-full text-left text-xs py-1 px-2 rounded hover:${uiColors.hoverBg} ${
                          sortField === "name" ? `${themeColors.linkText} font-medium` : uiColors.secondaryText
                        }`}
                      >
                        <span>Project Name</span>
                        {sortField === "name" && (
                          <ArrowUpDown size={12} className={sortOrder === 1 ? "transform rotate-180" : ""} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSort("updated_at")}
                        className={`flex items-center justify-between w-full text-left text-xs py-1 px-2 rounded hover:${uiColors.hoverBg} ${
                          sortField === "updated_at" ? `${themeColors.linkText} font-medium` : uiColors.secondaryText
                        }`}
                      >
                        <span>Last Updated</span>
                        {sortField === "updated_at" && (
                          <ArrowUpDown size={12} className={sortOrder === 1 ? "transform rotate-180" : ""} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSort("progress")}
                        className={`flex items-center justify-between w-full text-left text-xs py-1 px-2 rounded hover:${uiColors.hoverBg} ${
                          sortField === "progress" ? `${themeColors.linkText} font-medium` : uiColors.secondaryText
                        }`}
                      >
                        <span>Progress</span>
                        {sortField === "progress" && (
                          <ArrowUpDown size={12} className={sortOrder === 1 ? "transform rotate-180" : ""} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="relative">
        {error ? (
          <ErrorState error={error} onRetry={fetchProjectsWithFilters} />
        ) : loading ? (
          <>
            <ProjectSkeleton />
            <ProjectSkeleton />
            <ProjectSkeleton />
          </>
        ) : filteredProjects.length > 0 ? (
          <AnimatePresence>
            {filteredProjects.map((project: Project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </AnimatePresence>
        ) : (
          <EmptyState onCreateClick={() => setIsModalOpen(true)} />
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && filteredProjects.length > 0 && (
        <div className="flex justify-between items-center mt-5">
          <button
            type="button"
            onClick={() => handlePageChange('prev')}
            disabled={pagination.skip === 0}
            className={`flex items-center py-1.5 px-3 rounded-lg text-sm ${
              pagination.skip === 0
                ? `bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed`
                : `${uiColors.cardBg} ${uiColors.secondaryText} hover:${uiColors.hoverBg} border ${uiColors.borderColor}`
            }`}
          >
            <ChevronLeft size={14} className="mr-1" />
            Previous
          </button>
          <div className={`text-xs ${uiColors.mutedText}`}>
            Showing {pagination.skip + 1} to {Math.min(pagination.skip + pagination.limit, pagination.skip + filteredProjects.length)}
          </div>
          <button
            type="button"
            onClick={() => handlePageChange('next')}
            disabled={filteredProjects.length < pagination.limit}
            className={`flex items-center py-1.5 px-3 rounded-lg text-sm ${
              filteredProjects.length < pagination.limit
                ? `bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed`
                : `${uiColors.cardBg} ${uiColors.secondaryText} hover:${uiColors.hoverBg} border ${uiColors.borderColor}`
            }`}
          >
            Next
            <ChevronRight size={14} className="ml-1" />
          </button>
        </div>
      )}

      {/* Project Create Modal */}
      <ProjectCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitNewProject}
      />
    </div>
  );
};

export default ProjectsPage;
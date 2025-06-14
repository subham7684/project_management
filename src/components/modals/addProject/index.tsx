"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Calendar,
  Check,
  Users,
  Plus,
  Briefcase,
  Loader2,
  Shield,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAppDispatch, useAppSelector } from "../../../lib/hooks/redux";
import { Project, User } from "../../../types/interfaces";
import { fetchPublicUsers } from "../../../store/slices/publicUserSlice";

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Project>) => void;
  initialData?: Partial<Project>;
  isEditing?: boolean;
}

const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}) => {
  const dispatch = useAppDispatch();
  const { userList, loading: usersLoading, loaded } = useAppSelector((state) => state.public_user);
  console.log("User list in page", userList);
  
  const [formData, setFormData] = useState<Partial<Project>>({
    name: "",
    description: "",
    status: "Active",
    deadline: undefined,
    members: [],
    admin_users: [],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [memberInput, setMemberInput] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [adminSelections, setAdminSelections] = useState<Record<string, boolean>>({});

  // Enhanced debug logging
  console.log("Rendering ProjectCreateModal, members:", formData.members);
  console.log("Rendering ProjectCreateModal, admin_users:", formData.admin_users);

  // Memoized fetch users function to prevent recreation on every render
  const fetchUsers = useCallback(() => {
    if (!loaded && !usersLoading) {
      dispatch(fetchPublicUsers());
    }
  }, [dispatch, loaded, usersLoading]);

  // Fetch users once when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, fetchUsers]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Make sure members and admin_users are arrays, even if undefined in initialData
        const members = initialData.members || [];
        const admin_users = initialData.admin_users || [];
        
        console.log("Initializing form with data:", {
          members,
          admin_users
        });
        
        setFormData({
          ...initialData,
          members,
          admin_users
        });
        
        setSelectedDate(initialData.deadline ? new Date(initialData.deadline) : null);
        
        // Set admin selections based on admin_users
        const newAdminSelections: Record<string, boolean> = {};
        if (admin_users && admin_users.length > 0) {
          admin_users.forEach(userId => {
            newAdminSelections[userId] = true;
          });
        }
        setAdminSelections(newAdminSelections);
      } else {
        // Reset all states for a new form
        console.log("Resetting form to default state");
        setFormData({
          name: "",
          description: "",
          status: "Active",
          deadline: undefined,
          members: [],
          admin_users: [],
        });
        setSelectedDate(null);
        setAdminSelections({});
      }
      setErrors({});
      setMemberInput("");
    }
  }, [isOpen, initialData]);

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Handle date change
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setFormData(prevData => ({ 
      ...prevData, 
      deadline: date ? date.toISOString() : undefined 
    }));
    
    // Clear error for deadline field
    if (errors.deadline) {
      setErrors({ ...errors, deadline: "" });
    }
  };

  // Add member from text input
  const handleAddMember = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && memberInput.trim()) {
      e.preventDefault();
      const newMemberId = memberInput.trim();
      
      console.log("Adding member from input:", newMemberId);
      console.log("Current members:", formData.members);
      
      if (!formData.members?.includes(newMemberId)) {
        const updatedMembers = [...(formData.members || []), newMemberId];
        console.log("Updated members:", updatedMembers);
        
        setFormData(prevData => ({ 
          ...prevData, 
          members: updatedMembers
        }));
      } else {
        console.log("Member already exists, not adding duplicate");
      }
      setMemberInput("");
    }
  };

  // Handle member click from text input
  const handleMemberClick = () => {
    if (memberInput.trim()) {
      const newMemberId = memberInput.trim();
      
      console.log("Adding member from click:", newMemberId);
      console.log("Current members:", formData.members);
      
      if (!formData.members?.includes(newMemberId)) {
        const updatedMembers = [...(formData.members || []), newMemberId];
        console.log("Updated members:", updatedMembers);
        
        setFormData(prevData => ({ 
          ...prevData, 
          members: updatedMembers
        }));
      } else {
        console.log("Member already exists, not adding duplicate");
      }
      setMemberInput("");
    }
  };

  // Remove a member
  const handleRemoveMember = (memberId: string) => {
    console.log("Removing member:", memberId);
    console.log("Current members before removal:", formData.members);
    console.log("Current admin_users before removal:", formData.admin_users);
    
    // Create new member array excluding the removed member
    const updatedMembers = (formData.members || []).filter(id => id !== memberId);
    
    // Create new admin_users array excluding the removed member
    const updatedAdmins = (formData.admin_users || []).filter(id => id !== memberId);
    
    console.log("Updated members after removal:", updatedMembers);
    console.log("Updated admin_users after removal:", updatedAdmins);
    
    // Update form data using functional update to ensure we get the latest state
    setFormData(prevData => ({
      ...prevData,
      members: updatedMembers,
      admin_users: updatedAdmins
    }));
    
    // Update admin selections
    const newAdminSelections = { ...adminSelections };
    delete newAdminSelections[memberId];
    setAdminSelections(newAdminSelections);
  };

  // Handle member selection from dropdown
  const handleMemberToggle = (userId: string) => {
    console.log("Member toggle called for:", userId);
    console.log("Current members before toggle:", formData.members);
    
    // Check if this user is already in the members array
    const isCurrentlySelected = (formData.members || []).includes(userId);
    console.log("Is currently selected:", isCurrentlySelected);
    
    if (isCurrentlySelected) {
      // Remove member
      const updatedMembers = (formData.members || []).filter(id => id !== userId);
      const updatedAdmins = (formData.admin_users || []).filter(id => id !== userId);
      
      console.log("Removing member. Updated members:", updatedMembers);
      console.log("Removing member. Updated admins:", updatedAdmins);
      
      // Update form data with new arrays - use functional update
      setFormData(prevData => ({
        ...prevData,
        members: updatedMembers,
        admin_users: updatedAdmins
      }));
      
      // Update admin selections
      const newAdminSelections = { ...adminSelections };
      delete newAdminSelections[userId];
      setAdminSelections(newAdminSelections);
    } else {
      // Add new member
      const updatedMembers = [...(formData.members || []), userId];
      console.log("Adding member. Updated members:", updatedMembers);
      
      // Update form data with new array - use functional update
      setFormData(prevData => ({
        ...prevData,
        members: updatedMembers
      }));
    }
  };

  // Toggle admin status for a member
  const handleAdminToggle = (userId: string) => {
    console.log("Admin toggle called for:", userId);
    console.log("Current admin_users before toggle:", formData.admin_users);
    
    // Check if this user is an admin
    const isCurrentlyAdmin = (formData.admin_users || []).includes(userId);
    console.log("Is currently admin:", isCurrentlyAdmin);
    
    // Create updated admin_users array
    let updatedAdmins;
    
    if (isCurrentlyAdmin) {
      // Remove from admin_users
      updatedAdmins = (formData.admin_users || []).filter(id => id !== userId);
    } else {
      // Add to admin_users
      updatedAdmins = [...(formData.admin_users || []), userId];
    }
    
    console.log("Updated admin_users after toggle:", updatedAdmins);
    
    // Update form data - use functional update
    setFormData(prevData => ({
      ...prevData,
      admin_users: updatedAdmins
    }));
    
    // Update admin selections state
    setAdminSelections(prevSelections => ({
      ...prevSelections,
      [userId]: !isCurrentlyAdmin
    }));
  };

  // Check if a user is selected (in members array)
  const isUserSelected = (userId: string) => {
    const isSelected = formData.members?.includes(userId) || false;
    console.log(`Checking if user ${userId} is selected:`, isSelected);
    return isSelected;
  };
  
  // Check if a user is an admin
  const isUserAdmin = (userId: string) => {
    const isAdmin = formData.admin_users?.includes(userId) || false;
    console.log(`Checking if user ${userId} is admin:`, isAdmin);
    return isAdmin;
  };

  // Find user by ID
  const getUserById = (userId: string): User | undefined => {
    return userList.find(user => user._id === userId);
  };

  // Form validation and submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = "Project name is required";
    }
    
    // If there are errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };

  if (!isOpen) return null;

  // Custom styles for date picker
  const datePickerWrapperClass = `relative w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus-within:ring-2 focus:ring-blue-500 transition-all duration-200`;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {isEditing ? "Edit Project" : "Create New Project"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-4">
            {/* Project Name */}
            <div>
              <label 
                htmlFor="name" 
                className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                placeholder="Enter project name"
                className={`w-full px-3 py-2 rounded-md border ${
                  errors.name
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>
            
            {/* Project Description */}
            <div>
              <label 
                htmlFor="description" 
                className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Enter project description"
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              />
            </div>
            
            {/* Project Status */}
            <div>
              <label 
                htmlFor="status" 
                className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status || "Active"}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              >
                <option value="Active">Active</option>
                <option value="Planning">Planning</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            
            {/* Project Deadline */}
            <div>
              <label 
                htmlFor="deadline" 
                className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Deadline
              </label>
              <div className={datePickerWrapperClass}>
                <DatePicker 
                  selected={selectedDate}
                  onChange={handleDateChange}
                  dateFormat="MMM d, yyyy"
                  minDate={new Date()}
                  placeholderText="Select deadline (optional)"
                  className="w-full px-3 py-2 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100"
                  wrapperClassName="w-full"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
            
            {/* Team Members */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Team Members
              </label>
              
              {/* Display selected members */}
              {formData.members && formData.members.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.members.map((memberId, index) => {
                    const user = getUserById(memberId);
                    const displayName = user ? (user.full_name || user.email) : memberId;
                    const isAdmin = isUserAdmin(memberId);
                    
                    return (
                      <div 
                        key={index}
                        className={`flex items-center gap-1 ${isAdmin ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'} px-2 py-1 rounded-md text-xs`}
                      >
                        <span>{displayName}</span>
                        {isAdmin && (
                          <Shield size={12} className="text-blue-600 dark:text-blue-400 ml-1" />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(memberId)}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 ml-1"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Member input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    id="members"
                    value={memberInput}
                    onChange={(e) => setMemberInput(e.target.value)}
                    onKeyDown={handleAddMember}
                    placeholder="Add member (press Enter)"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  />
                  <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
                <button
                  type="button"
                  onClick={handleMemberClick}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              {/* User selection dropdown */}
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                >
                  {showUserDropdown ? "Hide user list" : "Select from user list"}
                </button>
                
                {showUserDropdown && (
                  <div className="mt-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md max-h-40 overflow-y-auto">
                    {usersLoading ? (
                      <div className="flex items-center justify-center py-3">
                        <Loader2 className="h-4 w-4 text-blue-500 animate-spin mr-2" />
                        <span className="text-gray-500 dark:text-gray-400 text-xs">Loading users...</span>
                      </div>
                    ) : userList && userList.length > 0 ? (
                      userList.map((user) => {
                        // For each user, explicitly calculate selection status
                        const userSelected = isUserSelected(user._id);
                        const userIsAdmin = isUserAdmin(user._id);
                        
                        console.log(`Rendering user ${user._id} (${user.full_name || user.email}), selected: ${userSelected}, admin: ${userIsAdmin}`);
                        
                        return (
                          <div 
                            key={user._id}
                            className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600"
                          >
                            <div className="flex items-center justify-between">
                              <div 
                                className="flex items-center flex-1 cursor-pointer"
                                onClick={() => handleMemberToggle(user._id)}
                              >
                                <div className={`w-4 h-4 flex items-center justify-center rounded border ${
                                  userSelected
                                    ? 'bg-blue-500 border-blue-500'
                                    : 'border-gray-300 dark:border-gray-500'
                                }`}>
                                  {userSelected && (
                                    <Check size={10} className="text-white" />
                                  )}
                                </div>
                                <span className="ml-3 text-xs text-gray-700 dark:text-gray-200">
                                  {user.full_name || user.email}
                                </span>
                              </div>
                              
                              {/* Admin toggle - only shown if user is a member */}
                              {userSelected && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAdminToggle(user._id);
                                  }}
                                  className={`flex items-center justify-center w-5 h-5 rounded ${
                                    userIsAdmin
                                      ? 'bg-blue-100 dark:bg-blue-900/30'
                                      : ''
                                  }`}
                                  title={userIsAdmin 
                                    ? "Remove admin privileges" 
                                    : "Grant admin privileges"}
                                >
                                  <Shield 
                                    size={12} 
                                    className={userIsAdmin
                                      ? 'text-blue-600 dark:text-blue-400'
                                      : 'text-gray-400 dark:text-gray-500 opacity-40'}
                                  />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-xs italic">
                        No users available
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Admin info */}
              {formData.members && formData.members.length > 0 && formData.admin_users && formData.admin_users.length > 0 && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <Shield size={12} className="mr-1" />
                  <span>Users with admin privileges can manage project members and settings</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={usersLoading}
              className={`px-3 py-1.5 rounded-md transition-colors duration-200 shadow-sm flex items-center text-sm ${
                usersLoading 
                  ? 'bg-blue-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {usersLoading ? (
                <>
                  <Loader2 size={16} className="mr-1.5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Briefcase size={16} className="mr-1.5" />
                  {isEditing ? "Update Project" : "Create Project"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectCreateModal;
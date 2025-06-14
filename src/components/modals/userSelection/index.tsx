"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Search, Shield } from "lucide-react";
import { useAppSelector } from "@/lib/hooks/redux";
import Spinner from "@/components/spinners/ticketPage";
import { useAppTheme } from "@/context/ThemeContext";

interface SelectedUser {
  id: string;
  isAdmin: boolean;
}

interface UserSelectionModalProps {
  title: string;
  onClose: () => void;
  onSubmit: (selectedUsers: SelectedUser[]) => void;
  excludeUserIds?: string[];
  allowAdmin?: boolean;
  maxSelection?: number;
  isLoading?: boolean;
}

const UserSelectionModal: React.FC<UserSelectionModalProps> = ({
  title,
  onClose,
  onSubmit,
  excludeUserIds = [],
  allowAdmin = false,
  maxSelection,
  isLoading = false,
}) => {
  const { userList } = useAppSelector((state) => state.public_user);
  const { uiColors, themeColors } = useAppTheme();
  
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [adminRoles, setAdminRoles] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  // Filter users based on search and excludeUserIds
  const filteredUsers = userList.filter(user => {
    // Skip users that are already in the excludeUserIds list
    if (excludeUserIds.includes(user._id) || (user._id && excludeUserIds.includes(user._id))) {
      return false;
    }
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const fullName = user.full_name?.toLowerCase() || "";
      const email = user.email.toLowerCase();
      return fullName.includes(searchLower) || email.includes(searchLower);
    }
    
    return true;
  });

  const handleSelectUser = (userId: string) => {
    // If maxSelection is set and we're already at the limit and trying to add a new user, return
    if (maxSelection && Object.keys(selected).filter(id => selected[id]).length >= maxSelection && !selected[userId]) {
      return;
    }
    
    setSelected(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleToggleAdmin = (userId: string, e: React.MouseEvent) => {
    // Stop propagation to prevent the row click from toggling selection
    e.stopPropagation();
    
    setAdminRoles(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Create array of selected users with their admin status
      const selectedUsers = Object.keys(selected)
        .filter(userId => selected[userId])
        .map(userId => ({
          id: userId,
          isAdmin: allowAdmin ? adminRoles[userId] || false : false
        }));
      
      await onSubmit(selectedUsers);
    } catch (error) {
      console.error("Error submitting user selection:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // When modal closes, reset state
  useEffect(() => {
    return () => {
      setSelected({});
      setAdminRoles({});
      setSearch("");
    };
  }, []);

  // Calculate selection count
  const selectedCount = Object.values(selected).filter(Boolean).length;
  const isMaxReached = maxSelection ? selectedCount >= maxSelection : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-lg ${uiColors.cardBg} shadow-xl`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`text-lg font-semibold ${uiColors.primaryText}`}>{title}</h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-full ${uiColors.hoverBg} transition-colors`}
            aria-label="Close"
          >
            <X className={`h-5 w-5 ${themeColors.iconStroke}`} />
          </button>
        </div>
        
        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className={`flex items-center ${uiColors.inputBg} rounded-md border ${uiColors.borderColor} px-3 py-2`}>
            <Search className={`h-4 w-4 ${uiColors.mutedText} mr-2`} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              className={`bg-transparent w-full ${uiColors.inputText} placeholder:${uiColors.mutedText} focus:outline-none`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {maxSelection && (
            <p className={`mt-2 text-xs ${uiColors.mutedText}`}>
              {selectedCount}/{maxSelection} users selected
            </p>
          )}
        </div>
        
        {/* User list */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 13rem)" }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className={`py-10 text-center ${uiColors.mutedText}`}>
              {search ? "No users found matching your search." : "No users available."}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => {
                const userId = user._id || user._id;
                const isSelected = selected[userId] || false;
                const isAdmin = adminRoles[userId] || false;
                
                return (
                  <li 
                    key={userId}
                    className={`flex items-center justify-between p-4 hover:${uiColors.softBg} transition-colors cursor-pointer ${isSelected ? `${uiColors.softBg}` : ""}`}
                    onClick={() => handleSelectUser(userId)}
                  >
                    <div className="flex items-center">
                      {/* Selection checkbox */}
                      <div 
                        className={`w-5 h-5 flex items-center justify-center rounded border ${
                          isSelected 
                            ? `${themeColors.buttonBg} border-transparent` 
                            : `${uiColors.borderColor} ${isMaxReached ? 'bg-gray-100 dark:bg-gray-800' : ''}`
                        } mr-3`}
                      >
                        {isSelected && <Check className={`h-3.5 w-3.5 text-white`} />}
                      </div>
                      
                      {/* User avatar/initial */}
                      <div className={`w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm ${uiColors.primaryText} mr-3`}>
                        {user.full_name 
                          ? user.full_name.charAt(0).toUpperCase() 
                          : user.email.charAt(0).toUpperCase()}
                      </div>
                      
                      {/* User info */}
                      <div>
                        {user.full_name && (
                          <div className={`font-medium ${uiColors.primaryText}`}>{user.full_name}</div>
                        )}
                        <div className={`text-sm ${uiColors.mutedText}`}>{user.email}</div>
                      </div>
                    </div>
                    
                    {/* Admin toggle */}
                    {allowAdmin && isSelected && (
                      <button
                        className={`flex items-center px-2 py-1 text-xs rounded ${
                          isAdmin 
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' 
                            : `${uiColors.softBg} ${uiColors.mutedText}`
                        }`}
                        onClick={(e) => handleToggleAdmin(userId, e)}
                      >
                        <Shield className={`h-3 w-3 mr-1 ${isAdmin ? 'opacity-100' : 'opacity-50'}`} />
                        Admin
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        
        {/* Footer with actions */}
        <div className="flex justify-end items-center gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            className={`px-4 py-2 rounded-md ${uiColors.softBg} ${uiColors.secondaryText} hover:${uiColors.hoverBg} transition-colors`}
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded-md ${themeColors.buttonBg} ${themeColors.buttonHoverBg} ${themeColors.buttonText} transition-colors flex items-center ${selectedCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleSubmit}
            disabled={selectedCount === 0 || submitting}
          >
            {submitting ? (
              <>
                <Spinner />
                Adding...
              </>
            ) : (
              `Add ${selectedCount > 0 ? `(${selectedCount})` : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSelectionModal;
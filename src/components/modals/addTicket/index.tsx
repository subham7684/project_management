"use client";

import React, { useState, useRef } from "react";
import { X, Upload, Tag as TagIcon, Plus } from "lucide-react";

// Define a type for the status values to match the modal component
type TicketStatus = "Open" | "In Progress" | "Review" | "Done";
type TicketPriority = "Low" | "Medium" | "High" | "Critical";
type TicketSeverity = "Low" | "Medium" | "High";

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    severity: TicketSeverity;
    due_date: string;
    tags: string[];
    attachments: File[];
  }) => void;
}

const statusOptions: TicketStatus[] = ["Open", "In Progress", "Review", "Done"];
const priorityOptions: TicketPriority[] = ["Low", "Medium", "High", "Critical"];
const severityOptions: TicketSeverity[] = ["Low", "Medium", "High"];

const TicketCreateModal: React.FC<TicketModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Open" as TicketStatus,
    priority: "Medium" as TicketPriority,
    severity: "Low" as TicketSeverity,
    due_date: "",
    tags: [] as string[],
    attachments: [] as File[]
  });
  const [tagInput, setTagInput] = useState("");

  if (!isOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset the form
    setFormData({
      title: "",
      description: "",
      status: "Open" as TicketStatus,
      priority: "Medium" as TicketPriority,
      severity: "Low" as TicketSeverity,
      due_date: "",
      tags: [],
      attachments: []
    });
    setTagInput("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles]
      }));
    }
  };

  const handleRemoveFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput("");
    }
  };

  const handleTagClick = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto w-full max-w-2xl z-10 border border-slate-200 dark:border-slate-700">
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Create New Ticket</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter ticket title"
              required
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5"
            />
          </div>
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={5}
              placeholder="Describe the issue in detail"
              required
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5"
            ></textarea>
          </div>
          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {formData.tags.map((tag) => (
                <div 
                  key={tag} 
                  className="flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 px-2 py-1 rounded-md text-xs border border-indigo-200 dark:border-indigo-800/50"
                >
                  <TagIcon className="h-3 w-3" />
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags (press Enter)"
                className="flex-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5"
              />
              <button
                type="button"
                onClick={handleTagClick}
                className="px-3 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
          {/* Status, Priority, Severity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5"
              >
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Severity
              </label>
              <select
                id="severity"
                name="severity"
                value={formData.severity}
                onChange={handleInputChange}
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5"
              >
                {severityOptions.map((severity) => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Due Date */}
          <div>
            <label htmlFor="due_date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleInputChange}
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5"
            />
          </div>
          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Attachments
            </label>
            {formData.attachments.length > 0 && (
              <div className="mb-3 space-y-2">
                {formData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 p-2 rounded-md text-sm">
                    <div className="flex items-center">
                      <div className="w-8 h-8 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-md mr-2 text-xs font-medium">
                        {file.name.split(".").pop()?.toUpperCase() || "FILE"}
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-slate-100 font-medium truncate max-w-[200px]">
                          {file.name}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors text-center"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                className="hidden"
              />
              <Upload className="h-6 w-6 mx-auto text-slate-400 dark:text-slate-500 mb-2" />
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                Click to upload or drag files here
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Support for images, documents, and other file types
              </p>
            </div>
          </div>
          {/* Footer */}
          <div className="sticky bottom-0 pt-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors duration-200"
              >
                Create Ticket
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketCreateModal;
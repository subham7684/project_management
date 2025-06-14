"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  GitPullRequest,
  Plus,
  Search,
  MoreHorizontal,
  CheckCircle2,
  Users,
  ListFilter,
  FolderKanban,
} from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "../../../lib/hooks/redux";
import { fetchSprints, createSprint } from "../../../store/slices/sprintSlice";
import Spinner from "../../../components/spinners/ticketPage";
import { Sprint } from "../../../types/interfaces";

const SprintsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { sprints, loading } = useAppSelector((state) => state.sprints);
  
  // Local state for search; add more states for filtering/sorting if needed
  const [searchTerm, setSearchTerm] = useState("");
  // (You can add filter/sort states if your API supports them)

  // Fetch sprints on mount (or when parameters change)
  useEffect(() => {
    dispatch(fetchSprints({ skip: 0, limit: 10 }));
  }, [dispatch]);

  // Format date string into a readable format
  const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  // Optionally, filter sprints locally by searchTerm
  const filteredSprints = sprints.filter((sprint: Sprint) =>
    sprint.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Sprints</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search sprints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-2 pr-4 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          <button
            onClick={() => dispatch(createSprint({ /* data for a new sprint */ }))}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus size={18} />
            <span>New Sprint</span>
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-gray-500 dark:text-gray-400 font-medium">Filter by:</span>
          <button className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg flex items-center gap-2">
            <ListFilter size={16} />
            <span>Status</span>
          </button>
          <button className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg flex items-center gap-2">
            <Calendar size={16} />
            <span>Date</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            Showing <span className="font-medium text-gray-800 dark:text-white">{sprints.length}</span> sprints
          </span>
        </div>
      </div>

      {/* Sprints List with Inline Spinner */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50">
            <Spinner />
          </div>
        )}
        <div className="p-6 grid grid-cols-1 gap-6">
          {filteredSprints.length > 0 ? (
            filteredSprints.map((sprint: Sprint) => (
              <div
                key={sprint.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div
                      className={`p-3 rounded-xl ${
                        sprint.status === "Active"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                          : sprint.status === "Completed"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      <GitPullRequest size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                        <Link href={`/sprints/${sprint.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {sprint.name}
                        </Link>
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-between lg:justify-end items-center gap-4 lg:gap-6">
                    {/* Progress Section */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span
                          className={`text-sm font-medium ${
                            sprint.status === "Active"
                              ? "text-green-600 dark:text-green-400"
                              : sprint.status === "Completed"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {sprint.status}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          • {sprint.progress}% complete
                        </span>
                      </div>
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            sprint.status === "Active"
                              ? "bg-green-500"
                              : sprint.status === "Completed"
                              ? "bg-blue-500"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${sprint.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    {/* Stats Section */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={18} className="text-green-500 dark:text-green-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {/* Optionally show completed vs. total tickets */}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users size={18} className="text-blue-500 dark:text-blue-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {sprint.members.length} members
                        </span>
                      </div>
                    </div>
                    {/* Actions Section */}
                    <div className="flex items-center">
                      <button
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        // Optionally add delete functionality:
                        // onClick={() => dispatch(deleteSprint(sprint.id))}
                      >
                        <MoreHorizontal size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center">
              <FolderKanban size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-1">No sprints found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center mt-8">
        <div className="flex items-center space-x-1">
          <button className="px-3 py-1.5 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Previous
          </button>
          <button className="px-3 py-1.5 rounded-md bg-blue-600 text-white font-medium">
            1
          </button>
          <button className="px-3 py-1.5 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            2
          </button>
          <button className="px-3 py-1.5 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            3
          </button>
          <button className="px-3 py-1.5 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SprintsPage;

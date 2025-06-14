// TicketsPage.jsx (renamed to .tsx)
"use client";

import React, { useState, useEffect } from "react";
import {
  Ticket as TicketIcon,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  User2,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  ArrowRightCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  LucideIcon
} from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "../../../lib/hooks/redux";
import { fetchTickets, createTicket, deleteTicket } from "../../../store/slices/ticketSlice";
import { Ticket } from "../../../types/interfaces";
import TicketCreateModal from "../../../components/modals/addTicket";
import Spinner from "../../../components/spinners/ticketPage";

// Helper function to convert a File to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const TicketsPage = () => {
  const dispatch = useAppDispatch();
  const { tickets, pagination, loading, error } = useAppSelector((state) => state.tickets);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Sorting state
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<number>(1); // 1 = ascending, -1 = descending
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const CurrentUser = useAppSelector((state) => state.auth.user);

  // Fetch tickets when parameters change
  useEffect(() => {
    dispatch(
      fetchTickets({
        skip: (page - 1) * pageSize,
        limit: pageSize,
        query: searchQuery || undefined,
        sort_field: sortField,
        sort_order: sortOrder,
        status: selectedFilter === "all" ? undefined : selectedFilter
      })
    );
  }, [dispatch, searchQuery, sortField, sortOrder, selectedFilter, page, pageSize]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric"
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Low":
        return "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400 border border-sky-200 dark:border-sky-800/50";
      case "Medium":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50";
      case "High":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50";
      case "Critical":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
    }
  };

  const getStatusIcon = (status: string): LucideIcon => {
    switch (status) {
      case "Open":
        return AlertCircle;
      case "In Progress":
        return ArrowRightCircle;
      case "Review":
        return Clock;
      case "Done":
        return CheckCircle;
      default:
        return AlertCircle;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Open":
        return "text-sky-600 dark:text-sky-400";
      case "In Progress":
        return "text-amber-600 dark:text-amber-400";
      case "Review":
        return "text-violet-600 dark:text-violet-400";
      case "Done":
        return "text-emerald-600 dark:text-emerald-400";
      default:
        return "text-slate-600 dark:text-slate-400";
    }
  };

  // Sorting handler – toggles sort order if same field or sets new field
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 1 ? -1 : 1);
    } else {
      setSortField(field);
      setSortOrder(1);
    }
    setPage(1); // Reset to first page on sort change
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Delete handler for a ticket
  const handleDeleteTicket = (ticketId: string) => {
    if (window.confirm("Are you sure you want to delete this ticket?")) {
      dispatch(deleteTicket(ticketId));
    }
  };

  // Handle new ticket submission from the modal (attachments conversion included)
  const handleSubmitNewTicket = async (data: {
    title: string;
    description: string;
    status: "Open" | "In Progress" | "Review" | "Done";
    priority: string;
    severity: string;
    due_date: string;
    tags: string[];
    attachments: File[];
  }) => {
    let base64Attachments: string[] = [];
    try {
      base64Attachments = await Promise.all(data.attachments.map(fileToBase64));
    } catch (error) {
      console.error("Error converting files:", error);
    }

    const payload: Partial<Ticket> = {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      severity: data.severity,
      reporter_id: CurrentUser?.id || "current-user",
      assignee_id: null,
      due_date: data.due_date || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: data.tags,
      attachments: base64Attachments,
      related_tickets: [],
      watchers: []
    };
    dispatch(createTicket(payload));
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <TicketIcon className="h-6 w-6 text-indigo-500" />
            Tickets
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage and track your project tickets
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1); // Reset to first page on search
              }}
              placeholder="Search tickets..."
              className="pl-9 py-2 pr-4 w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm shadow-sm"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 h-10 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium shadow-sm"
          >
            <Plus size={16} />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 mb-4 text-sm rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/30">
          <p className="font-medium">Error loading tickets</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide border-b border-slate-200 dark:border-slate-700">
        {["all", "Open", "In Progress", "Review", "Done"].map((status) => (
          <button
            key={status}
            onClick={() => {
              setSelectedFilter(status);
              setPage(1); // Reset to first page on filter change
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap
              ${selectedFilter === status
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
              }`}
          >
            {status === "all" ? "All Tickets" : status}
          </button>
        ))}
      </div>

      {/* Advanced Filters */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            <Filter size={14} />
            <span>Filter</span>
          </button>
          <button 
            className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            onClick={() => handleSort(sortField || 'updated_at')}
          >
            <ArrowUpDown size={14} />
            <span>Sort: {sortField || 'Default'} {sortOrder === 1 ? '↑' : '↓'}</span>
          </button>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Showing <span className="font-medium text-slate-800 dark:text-white">{tickets.length}</span> of <span className="font-medium text-slate-800 dark:text-white">{pagination.total}</span> tickets
        </div>
      </div>

      {/* Tickets List with Spinner Overlay */}
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("title")}
                >
                  <div className="flex items-center gap-1">
                    <span>Ticket</span>
                    {sortField === "title" && (
                      <ArrowUpDown 
                        className="h-3 w-3" 
                        style={{ transform: sortOrder === -1 ? 'rotate(180deg)' : 'none' }}
                      />
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    {sortField === "status" && (
                      <ArrowUpDown 
                        className="h-3 w-3" 
                        style={{ transform: sortOrder === -1 ? 'rotate(180deg)' : 'none' }}
                      />
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("priority")}
                >
                  <div className="flex items-center gap-1">
                    <span>Priority</span>
                    {sortField === "priority" && (
                      <ArrowUpDown 
                        className="h-3 w-3" 
                        style={{ transform: sortOrder === -1 ? 'rotate(180deg)' : 'none' }}
                      />
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hidden md:table-cell"
                  onClick={() => handleSort("assignee_id")}
                >
                  <div className="flex items-center gap-1">
                    <span>Assignee</span>
                    {sortField === "assignee_id" && (
                      <ArrowUpDown 
                        className="h-3 w-3" 
                        style={{ transform: sortOrder === -1 ? 'rotate(180deg)' : 'none' }}
                      />
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hidden lg:table-cell"
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center gap-1">
                    <span>Created</span>
                    {sortField === "created_at" && (
                      <ArrowUpDown 
                        className="h-3 w-3" 
                        style={{ transform: sortOrder === -1 ? 'rotate(180deg)' : 'none' }}
                      />
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hidden lg:table-cell"
                  onClick={() => handleSort("due_date")}
                >
                  <div className="flex items-center gap-1">
                    <span>Due</span>
                    {sortField === "due_date" && (
                      <ArrowUpDown 
                        className="h-3 w-3" 
                        style={{ transform: sortOrder === -1 ? 'rotate(180deg)' : 'none' }}
                      />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {tickets.length > 0 ? (
                tickets.map((ticket: Ticket) => {
                  const StatusIcon = getStatusIcon(ticket.status);
                  return (
                    <tr
                      key={ticket.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <TicketIcon size={14} className="text-slate-400 mr-1.5 flex-shrink-0" />
                            <Link
                              href={`/tickets/${ticket.id}`}
                              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium text-sm truncate max-w-[180px]"
                            >
                              {ticket.id.substring(0, 8)}...
                            </Link>
                          </div>
                          <p className="text-slate-900 dark:text-white mt-1 text-sm font-medium truncate max-w-[200px]">
                            {ticket.title}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {ticket.tags && ticket.tags.length > 0 ? (
                              <>
                                {ticket.tags.slice(0, 2).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {ticket.tags.length > 2 && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                    +{ticket.tags.length - 2}
                                  </span>
                                )}
                              </>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <StatusIcon size={14} className={`${getStatusStyle(ticket.status)} mr-1.5 flex-shrink-0`} />
                          <span className={`${getStatusStyle(ticket.status)} font-medium text-xs`}>
                            {ticket.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-300 mr-1.5 flex-shrink-0">
                            <User2 size={12} />
                          </div>
                          <span className="text-slate-900 dark:text-white text-xs truncate max-w-[100px]">
                            {ticket.assignee_id || "Unassigned"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs hidden lg:table-cell">
                        {formatDate(ticket.created_at)}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {ticket.due_date ? (
                          <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs">
                            <CalendarDays size={12} className="mr-1 flex-shrink-0" />
                            <span>{formatDate(ticket.due_date)}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleDeleteTicket(ticket.id)}
                            className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                            aria-label="Delete ticket"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button 
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                            aria-label="More options"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <TicketIcon size={24} className="text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="mb-2">No tickets found matching your criteria.</p>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium shadow-sm text-sm"
                      >
                        Create a new ticket
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <Spinner />
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 pb-4">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Showing <span className="font-medium">{pagination.total === 0 ? 0 : ((page - 1) * pageSize) + 1}</span> to{" "}
          <span className="font-medium">{Math.min(page * pageSize, pagination.total)}</span> of{" "}
          <span className="font-medium">{pagination.total}</span> tickets
        </div>
        <div className="flex justify-center">
          <nav className="inline-flex rounded-md overflow-hidden text-sm shadow-sm" aria-label="Pagination">
            <button 
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft size={14} />
              <span className="hidden sm:inline">Previous</span>
            </button>
            
            {/* Page buttons */}
            {Array.from({ length: Math.min(pagination.pageCount, 5) }, (_, i) => {
              // Show current page and 2 pages before and after
              let pageNum;
              
              if (pagination.pageCount <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= pagination.pageCount - 2) {
                pageNum = pagination.pageCount - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1.5 border ${
                    page === pageNum
                      ? "border-indigo-600 bg-indigo-600 text-white font-medium"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  } hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button 
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= pagination.pageCount}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={14} />
            </button>
          </nav>
        </div>
      </div>

      {/* New Ticket Modal */}
      <TicketCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitNewTicket}
      />
    </div>
  );
};

export default TicketsPage;
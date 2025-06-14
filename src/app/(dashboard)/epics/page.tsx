"use client";

import { useEffect, useState } from "react";
import {
	Plus,
	Search,
	Filter,
	ArrowUpRight,
	Clock,
	CheckCircle,
	AlertCircle,
	Users,
	CalendarDays,
	ListTodo,
	MoreHorizontal,
	GitPullRequest,
	Ticket,
} from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { fetchEpics } from "@/store/slices/epicSlice";

export default function EpicsPage() {
	const dispatch = useAppDispatch();
  const { epics } = useAppSelector(state => state.epics);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [priorityFilter, setPriorityFilter] = useState<string>("all");
	useEffect(() => {
    dispatch(fetchEpics({ skip: 0, limit: 20 }));
  }, [dispatch]);

	// const [epics] = useState<Epic[]>([
	// 	{
	// 		id: 1,
	// 		name: "User Authentication Flow",
	// 		description:
	// 			"Implement comprehensive user authentication including OAuth providers, MFA and password recovery",
	// 		status: "In Progress",
	// 		priority: "High",
	// 		progress: 60,
	// 		deadline: "Mar 30, 2025",
	// 		assignedTo: "John Doe",
	// 		sprint: "Sprint 12",
	// 		tickets: 8,
	// 		lastUpdated: "Today",
	// 		project: "Customer Portal Redesign",
	// 	},
	// 	{
	// 		id: 2,
	// 		name: "Payment Processing System",
	// 		description:
	// 			"Integrate payment gateways, subscription management and invoicing functionality",
	// 		status: "Planned",
	// 		priority: "High",
	// 		progress: 0,
	// 		deadline: "May 15, 2025",
	// 		assignedTo: "Sarah Smith",
	// 		sprint: "Sprint 14",
	// 		tickets: 12,
	// 		lastUpdated: "Yesterday",
	// 		project: "Customer Portal Redesign",
	// 	},
	// 	{
	// 		id: 3,
	// 		name: "Data Visualization Dashboard",
	// 		description:
	// 			"Create interactive charts and reports for customer usage analytics",
	// 		status: "In Progress",
	// 		priority: "Medium",
	// 		progress: 45,
	// 		deadline: "Apr 10, 2025",
	// 		assignedTo: "Mike Johnson",
	// 		sprint: "Sprint 12",
	// 		tickets: 6,
	// 		lastUpdated: "2 days ago",
	// 		project: "Analytics Dashboard",
	// 	},
	// 	{
	// 		id: 4,
	// 		name: "Mobile App Navigation",
	// 		description:
	// 			"Redesign navigation and implement drawer menu with quick actions",
	// 		status: "Completed",
	// 		priority: "Medium",
	// 		progress: 100,
	// 		deadline: "Feb 28, 2025",
	// 		assignedTo: "Emma Wilson",
	// 		sprint: "Sprint 11",
	// 		tickets: 5,
	// 		lastUpdated: "1 week ago",
	// 		project: "Mobile App v2.0",
	// 	},
	// 	{
	// 		id: 5,
	// 		name: "API Rate Limiting",
	// 		description:
	// 			"Implement rate limiting and throttling for all API endpoints",
	// 		status: "Blocked",
	// 		priority: "High",
	// 		progress: 30,
	// 		deadline: "Mar 25, 2025",
	// 		assignedTo: "David Brown",
	// 		sprint: "Sprint 12",
	// 		tickets: 4,
	// 		lastUpdated: "3 days ago",
	// 		project: "API Integration Layer",
	// 	},
	// 	{
	// 		id: 6,
	// 		name: "Notification System",
	// 		description:
	// 			"Build a centralized notification system with email, push and in-app alerts",
	// 		status: "In Progress",
	// 		priority: "Low",
	// 		progress: 25,
	// 		deadline: "Apr 30, 2025",
	// 		assignedTo: "Lisa Taylor",
	// 		sprint: "Sprint 13",
	// 		tickets: 7,
	// 		lastUpdated: "Yesterday",
	// 		project: "Customer Portal Redesign",
	// 	},
	// ]);

	const filteredEpics = epics.filter((epic) => {
		const matchesSearch =
			epic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			epic.description.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus =
			statusFilter === "all" || epic.status === statusFilter;
		const matchesPriority =
			priorityFilter === "all" || epic.priority === priorityFilter;
		return matchesSearch && matchesStatus && matchesPriority;
	});

	const inProgressEpics = filteredEpics.filter(
		(e) => e.status === "In Progress"
	).length;
	const completedEpics = filteredEpics.filter(
		(e) => e.status === "Completed"
	).length;
	const blockedEpics = filteredEpics.filter(
		(e) => e.status === "Blocked"
	).length;
	const plannedEpics = filteredEpics.filter(
		(e) => e.status === "Planned"
	).length;

	const getStatusColor = (status: string) => {
		switch (status) {
			case "In Progress":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
			case "Completed":
				return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
			case "Blocked":
				return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
			case "Planned":
				return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
		}
	};

	const getPriorityDetails = (priority: string) => {
		switch (priority) {
			case "High":
				return {
					color: "text-red-600 dark:text-red-400",
					bgColor: "bg-red-100 dark:bg-red-900/30",
					label: "High Priority",
				};
			case "Medium":
				return {
					color: "text-amber-600 dark:text-amber-400",
					bgColor: "bg-amber-100 dark:bg-amber-900/30",
					label: "Medium Priority",
				};
			case "Low":
				return {
					color: "text-green-600 dark:text-green-400",
					bgColor: "bg-green-100 dark:bg-green-900/30",
					label: "Low Priority",
				};
			default:
				return {
					color: "text-gray-600 dark:text-gray-400",
					bgColor: "bg-gray-100 dark:bg-gray-700",
					label: "Not Set",
				};
		}
	};

	return (
		<div className="space-y-6 p-4">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold text-gray-800 dark:text-white">
					Epics
				</h1>
				<button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-sm">
					<Plus size={18} className="mr-2" />
					<span>New Epic</span>
				</button>
			</div>

			{/* Epic Metrics */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
					<div className="flex items-start justify-between">
						<div>
							<p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
								In Progress
							</p>
							<p className="text-3xl font-bold mt-2 text-gray-800 dark:text-white">
								{inProgressEpics}
							</p>
						</div>
						<span className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
							<GitPullRequest size={24} />
						</span>
					</div>
					<div className="mt-4 flex items-center text-xs text-blue-600 dark:text-blue-400 font-medium">
						<ArrowUpRight size={14} className="mr-1" />
						<span>2 started this sprint</span>
					</div>
				</div>

				<div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
					<div className="flex items-start justify-between">
						<div>
							<p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
								Completed
							</p>
							<p className="text-3xl font-bold mt-2 text-gray-800 dark:text-white">
								{completedEpics}
							</p>
						</div>
						<span className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
							<CheckCircle size={24} />
						</span>
					</div>
					<div className="mt-4 flex items-center text-xs text-green-600 dark:text-green-400 font-medium">
						<CheckCircle size={14} className="mr-1" />
						<span>1 completed this sprint</span>
					</div>
				</div>

				<div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
					<div className="flex items-start justify-between">
						<div>
							<p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
								Blocked
							</p>
							<p className="text-3xl font-bold mt-2 text-gray-800 dark:text-white">
								{blockedEpics}
							</p>
						</div>
						<span className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
							<AlertCircle size={24} />
						</span>
					</div>
					<div className="mt-4 flex items-center text-xs text-red-600 dark:text-red-400 font-medium">
						<Clock size={14} className="mr-1" />
						<span>Needs attention</span>
					</div>
				</div>

				<div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
					<div className="flex items-start justify-between">
						<div>
							<p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
								Planned
							</p>
							<p className="text-3xl font-bold mt-2 text-gray-800 dark:text-white">
								{plannedEpics}
							</p>
						</div>
						<span className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
							<ListTodo size={24} />
						</span>
					</div>
					<div className="mt-4 flex items-center text-xs text-purple-600 dark:text-purple-400 font-medium">
						<CalendarDays size={14} className="mr-1" />
						<span>Upcoming in next sprint</span>
					</div>
				</div>
			</div>

			{/* Search and Filters */}
			<div className="flex flex-col md:flex-row gap-4">
				<div className="relative w-full md:w-2/3 lg:w-1/2">
					<Search
						className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
						size={18}
					/>
					<input
						type="text"
						placeholder="Search epics..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10 py-2 pr-4 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
					/>
				</div>

				<div className="flex items-center space-x-3">
					<div className="flex items-center">
						<Filter
							size={16}
							className="text-gray-500 dark:text-gray-400 mr-2"
						/>
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-500 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
						>
							<option value="all">All Statuses</option>
							<option value="In Progress">In Progress</option>
							<option value="Completed">Completed</option>
							<option value="Blocked">Blocked</option>
							<option value="Planned">Planned</option>
						</select>
					</div>

					<select
						value={priorityFilter}
						onChange={(e) => setPriorityFilter(e.target.value)}
						className="py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-500 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
					>
						<option value="all">All Priorities</option>
						<option value="High">High</option>
						<option value="Medium">Medium</option>
						<option value="Low">Low</option>
					</select>
				</div>
			</div>

			{/* Epics List */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredEpics.map((epic) => (
					<Link key={epic.id} href={`/epics/${epic.id}`}>
						<div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
							<div className="flex justify-between items-start">
								<h2 className="text-xl font-bold text-gray-800 dark:text-white pr-2">
									{epic.title}
								</h2>
								<div
									className={`px-2 py-1 rounded flex-shrink-0 ${getStatusColor(
										epic.status
									)}`}
								>
									{epic.status}
								</div>
							</div>

							<p className="mt-2 text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
								{epic.description}
							</p>

							{/* Priority badge - moved up for better visibility */}
							<div className="mt-3">
								{(() => {
									const { label, bgColor, color } = getPriorityDetails(
										epic.priority
									);
									return (
										<span
											className={`text-xs font-medium px-2 py-1 rounded inline-block ${bgColor} ${color}`}
										>
											{label}
										</span>
									);
								})()}
							</div>

							{/* Card footer with metrics and details */}
							<div className="mt-4 grid grid-cols-2 gap-2">
								<div className="flex items-center">
									<Ticket
										size={16}
										className="text-gray-500 dark:text-gray-400 mr-1 flex-shrink-0"
									/>
									<span className="text-gray-700 dark:text-gray-300 text-sm truncate">
										{epic.ticket_ids?.length} Tickets
									</span>
								</div>

								<div className="flex items-center">
									<CalendarDays
										size={16}
										className="text-gray-500 dark:text-gray-400 mr-1 flex-shrink-0"
									/>
									<span className="text-gray-700 dark:text-gray-300 text-sm truncate">
										{epic.deadline}
									</span>
								</div>

								<div className="flex items-center">
									<Users
										size={16}
										className="text-gray-500 dark:text-gray-400 mr-1 flex-shrink-0"
									/>
									<span className="text-gray-700 dark:text-gray-300 text-sm truncate">
										{epic.assigned_to}
									</span>
								</div>

								<div className="flex items-center justify-end">
									<span className="text-gray-700 dark:text-gray-300 text-sm">
										{epic.sprint_id}
									</span>
									<MoreHorizontal
										size={16}
										className="ml-2 text-gray-500 dark:text-gray-400 flex-shrink-0"
									/>
								</div>
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}

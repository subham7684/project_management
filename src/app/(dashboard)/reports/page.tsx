"use client";

import React, { useEffect, useState, MouseEvent } from "react";
import {
  fetchFullReport,
  fetchWeeklyTicketTrend,
  fetchTicketsByType,
  fetchTicketPriorityTrend,
  fetchDeveloperProductivity,
  fetchWorkloadDistribution,
} from "../../../store/slices/reportSlice";

// Import components
import MetricCard from "./artifacts/MetricCard";
import TabSwitcher from "./artifacts/TabSwitcher";
import PieChartCard from "./artifacts/PieChartCard";
import BarChartCard from "./artifacts/BarChartCard";
import AreaChartCard from "./artifacts/AreaChartCard";
import LineChartCard from "./artifacts/LineChartCard";
import SummaryInsight from "./artifacts/SummaryInsight";

import {
  Calendar,
  Ticket,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  Download,
  Layers,
  Activity,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";

// Define type for tab and date range
type TabType = "overview" | "tickets" | "sprints" | "team";
type DateRangeType = "last7days" | "last30days" | "last90days" | "thisYear" | "custom";

// Define types for report tabs
interface ReportTab {
  id: TabType;
  name: string;
  description: string;
}

// Define types for date range options
interface DateRangeOption {
  id: DateRangeType;
  name: string;
}

export default function ReportsPage() {
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [dateRange, setDateRange] = useState<DateRangeType>("last30days");

  // Get data from Redux store
  const fullReport = useAppSelector((state) => state.report.fullReport);
  const weeklyTicketTrend = useAppSelector((state) => state.report.weeklyTicketTrend);
  const ticketsByType = useAppSelector((state) => state.report.ticketsByType);
  const ticketPriorityTrend = useAppSelector((state) => state.report.ticketPriorityTrend);
  const developerProductivity = useAppSelector((state) => state.report.developerProductivity);
  const workloadDistribution = useAppSelector((state) => state.report.workloadDistribution);
  const loading = useAppSelector((state) => state.report.loading);
  const error = useAppSelector((state) => state.report.error);

  // Define report types for tab switching
  const reportTypes: ReportTab[] = [
    { id: "overview", name: "Overview", description: "General metrics about tickets, projects, and team performance" },
    { id: "tickets", name: "Tickets", description: "Detailed analysis of ticket creation, resolution, and backlogs" },
    { id: "sprints", name: "Sprints", description: "Sprint completion rates, velocity, and burndown charts" },
    { id: "team", name: "Team", description: "Team performance, workload distribution, and activity" }
  ];

  // Define date range options
  const dateRanges: DateRangeOption[] = [
    { id: "last7days", name: "Last 7 days" },
    { id: "last30days", name: "Last 30 days" },
    { id: "last90days", name: "Last 90 days" },
    { id: "thisYear", name: "This year" },
    { id: "custom", name: "Custom range" }
  ];

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // First fetch the full report as it contains most of the necessary data
        await dispatch(fetchFullReport()).unwrap();
        
        // Then fetch the rest of the data in parallel
        await Promise.all([
          dispatch(fetchWeeklyTicketTrend()),
          dispatch(fetchTicketsByType()),
          dispatch(fetchTicketPriorityTrend()),
          dispatch(fetchDeveloperProductivity()),
          dispatch(fetchWorkloadDistribution())
        ]);
      } catch (err) {
        console.error("Error fetching report data:", err);
      }
    };

    fetchData();
  }, [dispatch, dateRange]); // Re-fetch when date range changes

  // Handle date range change
  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateRange(e.target.value as DateRangeType);
    // Date range filtering would be handled on the server side
    // We'll just re-fetch data when the range changes
  };

  // Handle export button click
  const handleExport = () => {
    // You could implement PDF or CSV export here
    console.log("Export data for range:", dateRange);
    // For now, just show an alert
    alert("Export functionality will be implemented in the next sprint");
  };

  // Display error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error Loading Reports</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Loading state
  if (loading || !fullReport) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading reports...</span>
      </div>
    );
  }

  // Render metric cards based on the active tab
  const renderMetricCards = () => {
    switch (activeTab) {
      case "overview":
        return (
          <>
            <MetricCard
              title="Total Tickets"
              value={fullReport.totalTickets}
              icon={<Ticket size={24} className="text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg" />}
              trend={<><ArrowUpRight size={14} className="mr-1" /> {fullReport.trends.totalTicketsDelta}</>}
              trendColor="text-green-600 dark:text-green-400"
            />
            
            <MetricCard
              title="Completion Rate"
              value={`${fullReport.completionRate}%`}
              icon={<CheckCircle2 size={24} className="text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 p-3 rounded-lg" />}
              trend={<><ArrowUpRight size={14} className="mr-1" /> {fullReport.trends.completionRateDelta}</>}
              trendColor="text-green-600 dark:text-green-400"
            />
            
            <MetricCard
              title="Average Resolution"
              value={fullReport.averageResolutionTime}
              icon={<Clock size={24} className="text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg" />}
              trend={<><ArrowDownRight size={14} className="mr-1" /> {fullReport.trends.averageResolutionDelta}</>}
              trendColor="text-red-600 dark:text-red-400"
            />
            
            <MetricCard
              title="Active Users"
              value={fullReport.activeUsers}
              icon={<Users size={24} className="text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg" />}
              trend={<><ArrowUpRight size={14} className="mr-1" /> {fullReport.trends.activeUsersDelta}</>}
              trendColor="text-green-600 dark:text-green-400"
            />
          </>
        );
        
      case "tickets":
        return (
          <>
            <MetricCard
              title="Open Tickets"
              value={fullReport.openTickets}
              icon={<Ticket size={24} className="text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg" />}
              trend={<><ArrowUpRight size={14} className="mr-1" /> {fullReport.trends.openTicketsDelta}</>}
              trendColor="text-red-600 dark:text-red-400"
            />
            
            <MetricCard
              title="Completed Tickets"
              value={fullReport.completedTickets}
              icon={<CheckCircle2 size={24} className="text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 p-3 rounded-lg" />}
              trend={<><ArrowUpRight size={14} className="mr-1" /> {fullReport.trends.completedTicketsDelta}</>}
              trendColor="text-green-600 dark:text-green-400"
            />
            
            <MetricCard
              title="In Progress"
              value={fullReport.inProgressTickets}
              icon={<Activity size={24} className="text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg" />}
              trend={<><ArrowDownRight size={14} className="mr-1" /> {fullReport.trends.inProgressTicketsDelta}</>}
              trendColor="text-blue-600 dark:text-blue-400"
            />
            
            <MetricCard
              title="Blocked Tickets"
              value={fullReport.blockedTickets}
              icon={<AlertCircle size={24} className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg" />}
              trend={<><ArrowDownRight size={14} className="mr-1" /> {fullReport.trends.blockedTicketsDelta}</>}
              trendColor="text-green-600 dark:text-green-400"
            />
          </>
        );
        
      case "sprints":
        return (
          <>
            <MetricCard
              title="Total Sprints"
              value={fullReport.totalSprints}
              icon={<Layers size={24} className="text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg" />}
              trend={fullReport.trends.currentSprintName}
              trendColor="text-blue-600 dark:text-blue-400"
            />
            
            <MetricCard
              title="Completion Rate"
              value={`${fullReport.sprintCompletionRate}%`}
              icon={<CheckCircle2 size={24} className="text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 p-3 rounded-lg" />}
              trend={<><ArrowUpRight size={14} className="mr-1" /> {fullReport.trends.sprintCompletionDelta}</>}
              trendColor="text-green-600 dark:text-green-400"
            />
            
            <MetricCard
              title="Average Velocity"
              value={fullReport.averageVelocity}
              icon={<Zap size={24} className="text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg" />}
              trend={<><ArrowUpRight size={14} className="mr-1" /> {fullReport.trends.velocityDelta}</>}
              trendColor="text-green-600 dark:text-green-400"
            />
            
            <MetricCard
              title="Completed Sprints"
              value={fullReport.completedSprints}
              icon={<CheckCircle2 size={24} className="text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg" />}
              trend={fullReport.trends.completedSprintsContext}
              trendColor="text-purple-600 dark:text-purple-400"
            />
          </>
        );
        
      case "team":
        return (
          <>
            <MetricCard
              title="Team Members"
              value={fullReport.teamMembers}
              icon={<Users size={24} className="text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg" />}
              trend={<><ArrowUpRight size={14} className="mr-1" /> {fullReport.trends.teamMembersDelta}</>}
              trendColor="text-green-600 dark:text-green-400"
            />
            
            <MetricCard
              title="Active Developers"
              value={fullReport.activeDevelopers}
              icon={<Activity size={24} className="text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 p-3 rounded-lg" />}
              trend={fullReport.trends.activeDevsContext}
              trendColor="text-blue-600 dark:text-blue-400"
            />
            
            <MetricCard
              title="Avg. Tickets Per Dev"
              value={fullReport.averageTicketsPerDev}
              icon={<Ticket size={24} className="text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg" />}
              trend={<><ArrowUpRight size={14} className="mr-1" /> {fullReport.trends.avgTicketsPerDevDelta}</>}
              trendColor="text-amber-600 dark:text-amber-400"
            />
            
            <MetricCard
              title="Top Performer"
              value={fullReport.topPerformer}
              icon={<Users size={24} className="text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg" />}
              trend={fullReport.trends.topPerformerTickets}
              trendColor="text-purple-600 dark:text-purple-400"
            />
          </>
        );
        
      default:
        return null;
    }
  };

  // Render charts based on the active tab
  const renderCharts = () => {
    switch (activeTab) {
      case "overview":
        return (
          <>
            <PieChartCard
              title="Ticket Status Distribution"
              data={[
                { name: 'Completed', value: fullReport.completedTickets, color: '#10B981' },
                { name: 'In Progress', value: fullReport.inProgressTickets, color: '#3B82F6' },
                { name: 'Open', value: fullReport.openTickets, color: '#F59E0B' },
                { name: 'Blocked', value: fullReport.blockedTickets, color: '#EF4444' }
              ]}
              tooltipFormatter={(value) => `${value} tickets`}
              customLegend={
                <>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Completed ({fullReport.completedTickets})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">In Progress ({fullReport.inProgressTickets})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Open ({fullReport.openTickets})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Blocked ({fullReport.blockedTickets})</span>
                  </div>
                </>
              }
            />
            
            <BarChartCard
              title="Ticket Trend"
              data={weeklyTicketTrend || []}
              bars={[
                { dataKey: "created", name: "Tickets Created", color: "#3B82F6" },
                { dataKey: "resolved", name: "Tickets Resolved", color: "#10B981" }
              ]}
              controls={
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button className="px-3 py-1 text-sm bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 rounded-md shadow-sm">Weekly</button>
                  <button className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400">Monthly</button>
                </div>
              }
            />
          </>
        );
      
      case "tickets":
        return (
          <>
            <PieChartCard
              title="Tickets by Type"
              data={ticketsByType || []}
              tooltipFormatter={(value) => `${value} tickets`}
            />
            
            <AreaChartCard
              title="Tickets by Priority"
              data={ticketPriorityTrend || []}
              areas={[
                { dataKey: "high", name: "High Priority", stroke: "#EF4444", fill: "#EF4444" },
                { dataKey: "medium", name: "Medium Priority", stroke: "#F59E0B", fill: "#F59E0B" },
                { dataKey: "low", name: "Low Priority", stroke: "#10B981", fill: "#10B981" }
              ]}
              controls={
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button className="px-3 py-1 text-sm bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 rounded-md shadow-sm">Monthly</button>
                  <button className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400">Quarterly</button>
                </div>
              }
            />
          </>
        );
      
      case "sprints":
        return (
          <>
            <BarChartCard
              title="Sprint Velocity"
              data={fullReport.velocityData || []}
              bars={[
                { dataKey: "points", name: "Story Points Completed", color: "#8B5CF6" }
              ]}
            />
            
            <LineChartCard
              title="Sprint Burndown"
              data={fullReport.burndownData || []}
              lines={[
                { dataKey: "ideal", name: "Ideal Burndown", stroke: "#9CA3AF", dashed: true },
                { dataKey: "actual", name: "Actual Burndown", stroke: "#3B82F6" }
              ]}
              controls={
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button className="px-3 py-1 text-sm bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 rounded-md shadow-sm">Current</button>
                  <button className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400">Previous</button>
                </div>
              }
            />
          </>
        );
      
      case "team":
        return (
          <>
            <BarChartCard
              title="Developer Productivity"
              data={developerProductivity || []}
              bars={[
                { dataKey: "tickets", name: "Tickets Completed", color: "#3B82F6" },
                { dataKey: "commits", name: "Commits", color: "#10B981" }
              ]}
            />
            
            <PieChartCard
              title="Workload Distribution"
              data={workloadDistribution || []}
              tooltipFormatter={(value) => `${value}%`}
              controls={
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button className="px-3 py-1 text-sm bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 rounded-md shadow-sm">By Area</button>
                  <button className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400">By Person</button>
                </div>
              }
            />
          </>
        );
      
      default:
        return null;
    }
  };

  // Render summary insights based on the active tab and actual data
  const renderSummary = () => {
    const insights = fullReport.summary_insights;
    
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-5">
            <SummaryInsight
              icon={<TrendingUp size={20} />}
              title="Improved Completion Rate"
              description={`The team has increased ticket completion rate by ${insights.improved_completion_rate.percentage}% compared to last month, with most improvements in the ${insights.improved_completion_rate.most_improved_area} area.`}
              iconBg="bg-green-100 dark:bg-green-900/30"
              iconColor="text-green-600 dark:text-green-400"
            />
            
            <SummaryInsight
              icon={<AlertCircle size={20} />}
              title="Resolution Time Alert"
              description={`Average resolution time is ${Math.round(insights.resolution_time_alert.average_resolution_time_seconds / 86400)} days. ${insights.resolution_time_alert.slowest_area} tickets in particular are taking longer to resolve.`}
              iconBg="bg-amber-100 dark:bg-amber-900/30"
              iconColor="text-amber-600 dark:text-amber-400"
            />
            
            <SummaryInsight
              icon={<Users size={20} />}
              title="Team Activity"
              description={`${insights.team_activity.active_users_count} active users this month with ${insights.team_activity.top_contributors.length > 0 ? insights.team_activity.top_contributors.join(' and ') : 'no top contributors'} being the most active contributors.`}
              iconBg="bg-blue-100 dark:bg-blue-900/30"
              iconColor="text-blue-600 dark:text-blue-400"
            />
          </div>
        );
      
      case "tickets":
        return (
          <div className="space-y-5">
            <SummaryInsight
              icon={<AlertCircle size={20} />}
              title="High Priority Tickets"
              description={`There are currently ${ticketPriorityTrend?.[ticketPriorityTrend.length - 1]?.high || 0} high priority tickets this month.`}
              iconBg="bg-red-100 dark:bg-red-900/30"
              iconColor="text-red-600 dark:text-red-400"
            />
            
            <SummaryInsight
              icon={<TrendingUp size={20} />}
              title="Bug Resolution Improved"
              description={`Ticket completion rate has improved by ${insights.improved_completion_rate.percentage}% this month.`}
              iconBg="bg-green-100 dark:bg-green-900/30"
              iconColor="text-green-600 dark:text-green-400"
            />
            
            <SummaryInsight
              icon={<Ticket size={20} />}
              title="Ticket Type Breakdown"
              description={`${ticketsByType?.[0]?.name || 'Feature'} tickets make up the largest category with ${ticketsByType?.[0]?.value || 0} tickets.`}
              iconBg="bg-blue-100 dark:bg-blue-900/30"
              iconColor="text-blue-600 dark:text-blue-400"
            />
          </div>
        );
      
      case "sprints":
        return (
          <div className="space-y-5">
            <SummaryInsight
              icon={<TrendingUp size={20} />}
              title="Velocity Trend"
              description={`Team velocity is currently ${fullReport.averageVelocity} points on average, showing ${fullReport.trends.velocityDelta}.`}
              iconBg="bg-green-100 dark:bg-green-900/30"
              iconColor="text-green-600 dark:text-green-400"
            />
            
            <SummaryInsight
              icon={<AlertCircle size={20} />}
              title="Sprint Completion"
              description={`The team has completed ${fullReport.completedSprints} sprints with a ${fullReport.sprintCompletionRate}% completion rate.`}
              iconBg="bg-amber-100 dark:bg-amber-900/30"
              iconColor="text-amber-600 dark:text-amber-400"
            />
            
            <SummaryInsight
              icon={<CheckCircle2 size={20} />}
              title="Current Sprint"
              description={`${fullReport.trends.currentSprintName} is in progress with ${fullReport.burndownData?.[0]?.actual || 0} story points remaining.`}
              iconBg="bg-purple-100 dark:bg-purple-900/30"
              iconColor="text-purple-600 dark:text-purple-400"
            />
          </div>
        );
      
      case "team":
        return (
          <div className="space-y-5">
            <SummaryInsight
              icon={<Users size={20} />}
              title="Team Structure"
              description={`The team has ${fullReport.teamMembers} members with ${fullReport.activeDevelopers} active developers.`}
              iconBg="bg-blue-100 dark:bg-blue-900/30"
              iconColor="text-blue-600 dark:text-blue-400"
            />
            
            <SummaryInsight
              icon={<TrendingUp size={20} />}
              title="Productivity Metrics"
              description={`${fullReport.topPerformer} is leading the team with ${fullReport.trends.topPerformerTickets}.`}
              iconBg="bg-green-100 dark:bg-green-900/30"
              iconColor="text-green-600 dark:text-green-400"
            />
            
            <SummaryInsight
              icon={<Activity size={20} />}
              title="Workload Balance"
              description={`${workloadDistribution?.[0]?.name || 'Backend'} team is handling ${workloadDistribution?.[0]?.value || 0}% of all tickets currently.`}
              iconBg="bg-purple-100 dark:bg-purple-900/30"
              iconColor="text-purple-600 dark:text-purple-400"
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Reports & Analytics</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative inline-block">
            <select 
              value={dateRange}
              onChange={handleDateRangeChange}
              className="pl-4 pr-8 py-2 appearance-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              {dateRanges.map(range => (
                <option key={range.id} value={range.id}>{range.name}</option>
              ))}
            </select>
            <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>
          
          <button 
            onClick={handleExport} 
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>
      
      {/* Report Type Tabs */}
      <TabSwitcher 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        tabs={reportTypes} 
      />
      
      {/* Tab Description */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {reportTypes.find(type => type.id === activeTab)?.description}
      </div>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderMetricCards()}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderCharts()}
      </div>
      
      {/* Report Summary */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Summary Insights</h2>
        
        {renderSummary()}
        
        <div className="mt-8">
          <Link 
            href={`/reports/${activeTab}/details`}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            View detailed {activeTab} analysis →
          </Link>
        </div>
      </div>
    </div>
  )};
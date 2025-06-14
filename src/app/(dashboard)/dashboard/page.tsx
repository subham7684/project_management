"use client";

import { useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  Users, 
  FolderKanban, 
  GitPullRequest,
  Activity,
  ArrowUpRight,
  Ticket,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area
} from 'recharts';

export default function DashboardPage() {
  const [metrics] = useState({
    activeTickets: 24,
    completedTickets: 156,
    currentSprint: "Sprint 12",
    openProjects: 7,
    teamMembers: 16,
    upcomingDeadlines: 3,
  });

  const [recentActivity] = useState([
    { id: 1, type: "ticket", title: "Fix login page responsiveness", user: "John Doe", time: "2 hours ago", status: "In Progress" },
    { id: 2, type: "comment", title: "Added clarification on API docs", user: "Sarah Smith", time: "4 hours ago", status: "" },
    { id: 3, type: "ticket", title: "Implement dark mode toggle", user: "Mike Johnson", time: "Yesterday", status: "Completed" },
    { id: 4, type: "sprint", title: "Sprint 11 completed", user: "Team", time: "2 days ago", status: "Closed" },
    { id: 5, type: "project", title: "New project: Mobile App redesign", user: "Management", time: "3 days ago", status: "New" },
  ]);

  // Professional-looking data for enhanced chart
  // Monthly view data
  const [monthlyTicketData] = useState([
    { 
      name: 'Jan', 
      newTickets: 45, 
      inProgress: 35, 
      completed: 68, 
      completionRate: 75,
      avgResolutionTime: 3.5,
      backlog: 54
    },
    { 
      name: 'Feb', 
      newTickets: 58, 
      inProgress: 48, 
      completed: 73, 
      completionRate: 79,
      avgResolutionTime: 3.2,
      backlog: 62
    },
    { 
      name: 'Mar', 
      newTickets: 62, 
      inProgress: 52, 
      completed: 79, 
      completionRate: 82,
      avgResolutionTime: 2.9,
      backlog: 65
    },
    { 
      name: 'Apr', 
      newTickets: 49, 
      inProgress: 38, 
      completed: 62, 
      completionRate: 73,
      avgResolutionTime: 3.3,
      backlog: 58
    },
    { 
      name: 'May', 
      newTickets: 55, 
      inProgress: 42, 
      completed: 71, 
      completionRate: 78,
      avgResolutionTime: 3.0,
      backlog: 60
    },
    { 
      name: 'Jun', 
      newTickets: 60, 
      inProgress: 47, 
      completed: 82, 
      completionRate: 85,
      avgResolutionTime: 2.7,
      backlog: 52
    },
  ]);

  // Weekly view data
  const [weeklyTicketData] = useState([
    { name: 'Week 1', newTickets: 15, inProgress: 12, completed: 18, completionRate: 72, avgResolutionTime: 3.8, backlog: 20 },
    { name: 'Week 2', newTickets: 18, inProgress: 14, completed: 22, completionRate: 76, avgResolutionTime: 3.5, backlog: 22 },
    { name: 'Week 3', newTickets: 14, inProgress: 11, completed: 16, completionRate: 70, avgResolutionTime: 3.7, backlog: 24 },
    { name: 'Week 4', newTickets: 19, inProgress: 15, completed: 23, completionRate: 78, avgResolutionTime: 3.2, backlog: 21 }
  ]);

  // Yearly view data
  const [yearlyTicketData] = useState([
    { name: '2020', newTickets: 580, inProgress: 0, completed: 520, completionRate: 68, avgResolutionTime: 4.2, backlog: 180 },
    { name: '2021', newTickets: 720, inProgress: 0, completed: 670, completionRate: 72, avgResolutionTime: 3.9, backlog: 230 },
    { name: '2022', newTickets: 850, inProgress: 0, completed: 810, completionRate: 76, avgResolutionTime: 3.6, backlog: 270 },
    { name: '2023', newTickets: 920, inProgress: 0, completed: 890, completionRate: 80, avgResolutionTime: 3.3, backlog: 300 },
    { name: '2024', newTickets: 350, inProgress: 210, completed: 420, completionRate: 83, avgResolutionTime: 3.0, backlog: 220 }
  ]);

  // State for active time period
  const [activeTimePeriod, setActiveTimePeriod] = useState('month');

  // Determine which data to show based on active time period
  const getActiveData = () => {
    switch (activeTimePeriod) {
      case 'week':
        return weeklyTicketData;
      case 'year':
        return yearlyTicketData;
      case 'month':
      default:
        return monthlyTicketData;
    }
  };

  // Professional color palette
  const colors = {
    newTickets: "#4F46E5", // indigo-600
    inProgress: "#F59E0B", // amber-500
    completed: "#10B981", // emerald-500
    completionRate: "#6366F1", // indigo-500
    avgResolutionTime: "#EC4899", // pink-500
    backlog: "#6B7280", // gray-500
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <div className="flex space-x-3 items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">Last updated: Today, 10:30 AM</span>
          <button className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors duration-200">
            <Activity size={16} />
          </button>
        </div>
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Tickets</p>
              <p className="text-3xl font-bold mt-2 text-gray-800 dark:text-white">{metrics.activeTickets}</p>
            </div>
            <span className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Ticket size={24} />
            </span>
          </div>
          <div className="mt-4 flex items-center text-xs text-green-600 dark:text-green-400 font-medium">
            <ArrowUpRight size={14} className="mr-1" />
            <span>5% from last week</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Current Sprint</p>
              <p className="text-3xl font-bold mt-2 text-gray-800 dark:text-white">{metrics.currentSprint}</p>
            </div>
            <span className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
              <GitPullRequest size={24} />
            </span>
          </div>
          <div className="mt-4 flex items-center text-xs text-amber-600 dark:text-amber-400 font-medium">
            <Clock size={14} className="mr-1" />
            <span>7 days remaining</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Open Projects</p>
              <p className="text-3xl font-bold mt-2 text-gray-800 dark:text-white">{metrics.openProjects}</p>
            </div>
            <span className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <FolderKanban size={24} />
            </span>
          </div>
          <div className="mt-4 flex items-center text-xs text-green-600 dark:text-green-400 font-medium">
            <CheckCircle size={14} className="mr-1" />
            <span>2 completed this month</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Team Members</p>
              <p className="text-3xl font-bold mt-2 text-gray-800 dark:text-white">{metrics.teamMembers}</p>
            </div>
            <span className="p-3 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg">
              <Users size={24} />
            </span>
          </div>
          <div className="mt-4 flex items-center text-xs text-green-600 dark:text-green-400 font-medium">
            <ArrowUpRight size={14} className="mr-1" />
            <span>3 new this month</span>
          </div>
        </div>
      </div>
      
      {/* Charts and Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Ticket Status Overview</h2>
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button 
                onClick={() => setActiveTimePeriod('week')} 
                className={`px-3 py-1 text-sm ${activeTimePeriod === 'week' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 rounded-md shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400'}`}
              >
                Week
              </button>
              <button 
                onClick={() => setActiveTimePeriod('month')} 
                className={`px-3 py-1 text-sm ${activeTimePeriod === 'month' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 rounded-md shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400'}`}
              >
                Month
              </button>
              <button 
                onClick={() => setActiveTimePeriod('year')} 
                className={`px-3 py-1 text-sm ${activeTimePeriod === 'year' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 rounded-md shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400'}`}
              >
                Year
              </button>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={getActiveData()}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" /> {/* gray-300 */}
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6b7280' }} /* gray-500 */
                  axisLine={{ stroke: '#d1d5db' }} /* gray-300 */
                />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  tick={{ fill: '#6b7280' }} /* gray-500 */
                  axisLine={{ stroke: '#d1d5db' }} /* gray-300 */
                  label={{ value: 'Tickets', angle: -90, position: 'insideLeft', fill: '#6b7280', offset: -5 }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tick={{ fill: '#6b7280' }} /* gray-500 */
                  axisLine={{ stroke: '#d1d5db' }} /* gray-300 */
                  domain={[0, 100]}
                  label={{ value: 'Rate (%)', angle: 90, position: 'insideRight', fill: '#6b7280', offset: 0 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderColor: '#e5e7eb', 
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontFamily: 'sans-serif'
                  }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '0.25rem' }}
                />
                <Legend 
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{ paddingTop: '10px' }}
                />
                
                {/* Main bars for ticket counts */}
                <Bar 
                  yAxisId="left" 
                  dataKey="newTickets" 
                  name="New Tickets" 
                  fill={colors.newTickets} 
                  barSize={activeTimePeriod === 'year' ? 40 : 20} 
                  radius={[4, 4, 0, 0]}
                />
                {activeTimePeriod !== 'year' && (
                  <Bar 
                    yAxisId="left" 
                    dataKey="inProgress" 
                    name="In Progress" 
                    fill={colors.inProgress} 
                    barSize={20} 
                    radius={[4, 4, 0, 0]}
                  />
                )}
                <Bar 
                  yAxisId="left" 
                  dataKey="completed" 
                  name="Completed" 
                  fill={colors.completed} 
                  barSize={activeTimePeriod === 'year' ? 40 : 20} 
                  radius={[4, 4, 0, 0]}
                />
                
                {/* Area for backlog visualization */}
                <Area 
                  yAxisId="left"
                  type="monotone"
                  dataKey="backlog"
                  name="Backlog"
                  fill={colors.backlog}
                  fillOpacity={0.1}
                  stroke={colors.backlog}
                  strokeWidth={1}
                />
                
                {/* Lines for rates and metrics */}
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="completionRate" 
                  name="Completion Rate (%)" 
                  stroke={colors.completionRate} 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="avgResolutionTime" 
                  name="Avg Resolution Time (days)" 
                  stroke={colors.avgResolutionTime} 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  strokeDasharray="5 5"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">New vs Completed</p>
              <div className="flex justify-center items-center mt-1">
                <div className="w-3 h-3 rounded-full bg-indigo-600 mr-1"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500 mr-1"></div>
                <p className="text-lg font-bold text-gray-800 dark:text-white">
                  {getActiveData()[getActiveData().length - 1].newTickets} / {getActiveData()[getActiveData().length - 1].completed}
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Backlog</p>
              <div className="flex justify-center items-center mt-1">
                <div className="w-3 h-3 rounded-full bg-gray-500 mr-1"></div>
                <p className="text-lg font-bold text-gray-800 dark:text-white">
                  {getActiveData()[getActiveData().length - 1].backlog} tickets
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion Rate</p>
              <div className="flex justify-center items-center mt-1">
                <div className="w-3 h-3 rounded-full bg-indigo-500 mr-1"></div>
                <p className="text-lg font-bold text-gray-800 dark:text-white">
                  {getActiveData()[getActiveData().length - 1].completionRate}%
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">Upcoming Deadlines</h2>
          <ul className="space-y-4">
            <li className="flex items-start space-x-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                <Clock size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800 dark:text-white">API Integration</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Due in 2 days</p>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div className="bg-red-600 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </li>
            <li className="flex items-start space-x-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                <Clock size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800 dark:text-white">Dashboard Wireframes</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Due in 5 days</p>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>
            </li>
            <li className="flex items-start space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                <Clock size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800 dark:text-white">Sprint Review</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Due in 7 days</p>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Activity</h2>
          <Link 
            href="/activity"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            View All
          </Link>
        </div>
        
        <div className="space-y-5">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 pb-5 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
              <div className={`p-3 rounded-lg ${
                activity.type === 'ticket' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' :
                activity.type === 'comment' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                activity.type === 'sprint' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
              }`}>
                {activity.type === 'ticket' ? <Ticket size={20} /> :
                 activity.type === 'comment' ? <MessageSquare size={20} /> :
                 activity.type === 'sprint' ? <GitPullRequest size={20} /> :
                 <FolderKanban size={20} />}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="font-medium text-gray-800 dark:text-white">{activity.title}</p>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">By {activity.user}</p>
                
                {activity.status && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 mt-2 rounded-full text-xs font-medium ${
                    activity.status === 'In Progress' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                    activity.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    activity.status === 'Closed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {activity.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
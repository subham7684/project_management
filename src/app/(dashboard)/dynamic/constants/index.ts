// constants.ts
export const COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#6366F1', // indigo-500
  '#EF4444', // red-500
  '#14B8A6', // teal-500
  '#F97316', // orange-500
  '#0EA5E9', // sky-500
  '#84CC16'  // lime-500
];

export const DARK_COLORS = [
  '#60A5FA', // blue-400
  '#34D399', // emerald-400
  '#FBBF24', // amber-400
  '#A78BFA', // violet-400
  '#F472B6', // pink-400
  '#818CF8', // indigo-400
  '#F87171', // red-400
  '#2DD4BF', // teal-400
  '#FB923C', // orange-400
  '#38BDF8', // sky-400
  '#A3E635'  // lime-400
];

export const COLOR_MAP = {
  blue: { 
    bg: 'bg-blue-100', 
    text: 'text-blue-600', 
    darkBg: 'dark:bg-blue-900/30', 
    darkText: 'dark:text-blue-400',
    hover: 'hover:bg-blue-200 dark:hover:bg-blue-800/50',
    border: 'border-blue-200 dark:border-blue-800/50',
    fill: '#3B82F6',
    darkFill: '#60A5FA'
  },
  green: { 
    bg: 'bg-green-100', 
    text: 'text-green-600', 
    darkBg: 'dark:bg-green-900/30', 
    darkText: 'dark:text-green-400',
    hover: 'hover:bg-green-200 dark:hover:bg-green-800/50',
    border: 'border-green-200 dark:border-green-800/50',
    fill: '#10B981',
    darkFill: '#34D399'
  },
  red: { 
    bg: 'bg-red-100', 
    text: 'text-red-600', 
    darkBg: 'dark:bg-red-900/30', 
    darkText: 'dark:text-red-400',
    hover: 'hover:bg-red-200 dark:hover:bg-red-800/50',
    border: 'border-red-200 dark:border-red-800/50',
    fill: '#EF4444',
    darkFill: '#F87171'
  },
  amber: { 
    bg: 'bg-amber-100', 
    text: 'text-amber-600', 
    darkBg: 'dark:bg-amber-900/30', 
    darkText: 'dark:text-amber-400',
    hover: 'hover:bg-amber-200 dark:hover:bg-amber-800/50',
    border: 'border-amber-200 dark:border-amber-800/50',
    fill: '#F59E0B',
    darkFill: '#FBBF24'
  },
  purple: { 
    bg: 'bg-purple-100', 
    text: 'text-purple-600', 
    darkBg: 'dark:bg-purple-900/30', 
    darkText: 'dark:text-purple-400',
    hover: 'hover:bg-purple-200 dark:hover:bg-purple-800/50',
    border: 'border-purple-200 dark:border-purple-800/50',
    fill: '#9333EA',
    darkFill: '#A855F7'
  },
  indigo: { 
    bg: 'bg-indigo-100', 
    text: 'text-indigo-600', 
    darkBg: 'dark:bg-indigo-900/30', 
    darkText: 'dark:text-indigo-400',
    hover: 'hover:bg-indigo-200 dark:hover:bg-indigo-800/50',
    border: 'border-indigo-200 dark:border-indigo-800/50',
    fill: '#6366F1',
    darkFill: '#818CF8'
  },
  teal: { 
    bg: 'bg-teal-100', 
    text: 'text-teal-600', 
    darkBg: 'dark:bg-teal-900/30', 
    darkText: 'dark:text-teal-400',
    hover: 'hover:bg-teal-200 dark:hover:bg-teal-800/50',
    border: 'border-teal-200 dark:border-teal-800/50',
    fill: '#14B8A6',
    darkFill: '#2DD4BF'
  },
  gray: { 
    bg: 'bg-gray-100', 
    text: 'text-gray-600', 
    darkBg: 'dark:bg-gray-700/50', 
    darkText: 'dark:text-gray-300',
    hover: 'hover:bg-gray-200 dark:hover:bg-gray-600/50',
    border: 'border-gray-200 dark:border-gray-700',
    fill: '#6B7280',
    darkFill: '#9CA3AF'
  }
};

export const THEME = {
  card: {
    base: 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700',
    header: 'px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-700 dark:bg-gray-750',
    body: 'p-4',
    hover: 'hover:shadow-md transition-shadow duration-300'
  },
  button: {
    primary: 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition-colors',
    secondary: 'px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md shadow-sm transition-colors',
    icon: 'p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
  },
  input: {
    base: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100',
    label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
  },
  text: {
    base: 'text-gray-800 dark:text-gray-200',
    muted: 'text-gray-500 dark:text-gray-400',
    heading: 'text-xl font-semibold text-gray-800 dark:text-white'
  },
  badge: {
    base: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    yellow: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
  },
  chart: {
    container: 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden',
    header: 'px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-700 dark:bg-gray-750',
    body: 'p-4 h-80'
  }
};

export const EXAMPLE_QUERIES = [
  'Show me all open tickets',
  'How many tickets are assigned to each user?',
  'List high priority tickets due this month',
  'Show me tickets created in the last 7 days',
  'Count tickets by status',
  'Which users have the most assigned tickets?',
  'Show me all comments on ticket #1234',
  'What is the average response time for high priority tickets?'
];
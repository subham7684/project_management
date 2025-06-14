import React from 'react';
import { motion } from 'framer-motion';
import { formatFieldName } from '../../processing';
import { Tag, Info } from 'lucide-react';
import { CardViewProps } from '../types';

/**
 * Component for displaying data in card format with improved styling
 */
const CardView: React.FC<CardViewProps> = ({ currentItems, fields }) => {
  if (!currentItems || !Array.isArray(currentItems) || currentItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-xs text-gray-500 dark:text-gray-400">No data available for card view</p>
      </div>
    );
  }

  // Handle special case: query results with nested tickets
  let itemsToDisplay = currentItems;
  
  // If we have results with nested ticket arrays, flatten them
  const hasNestedTickets = currentItems.some(item => 
    item && 
    typeof item === 'object' && 
    Array.isArray(item.tickets) && 
    item.tickets.length > 0
  );
  
  if (hasNestedTickets) {
    itemsToDisplay = [];
    currentItems.forEach(item => {
      if (item && typeof item === 'object' && Array.isArray(item.tickets)) {
        // Add count information to each ticket
        const ticketsWithCount = item.tickets.map(ticket => ({
          ...ticket,
          _total_count: item.count || 0
        }));
        itemsToDisplay.push(...ticketsWithCount);
      } else {
        itemsToDisplay.push(item);
      }
    });
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } }
  };

  const getStatusClass = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'open') return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (statusLower === 'done' || statusLower === 'completed') return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    if (statusLower === 'closed') return 'bg-gray-500 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    if (statusLower === 'in progress') return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    if (statusLower === 'blocked') return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getPriorityClass = (priority: string): string => {
    const priorityLower = priority.toLowerCase();
    if (priorityLower === 'high') return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    if (priorityLower === 'medium') return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  };

  // Function to format field values including nested objects
  const formatCardFieldValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">—</span>;
    }
    
    // Handle nested objects
    if (typeof value === 'object' && value !== null) {
      // Special case for date objects in _id
      if ('year' in value && 'month' in value) {
        const year = value.year;
        const month = value.month - 1; // JS months are 0-indexed
        const day = value.day || 1;
        const date = new Date(year, month, day);
        return <span>{date.toLocaleDateString()}</span>;
      }
      
      // For arrays
      if (Array.isArray(value)) {
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((item, i) => (
              <span key={i} className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {typeof item === 'object' ? (item === null ? '—' : JSON.stringify(item)) : String(item)}
              </span>
            ))}
          </div>
        );
      }
      
      // For other objects
      return (
        <div className="text-xs">
          {Object.entries(value).map(([key, val], i) => (
            <div key={i} className="flex justify-between py-0.5">
              <span className="text-gray-500 dark:text-gray-400">{formatFieldName(key)}:</span>
              <span className="text-gray-700 dark:text-gray-300">
                {typeof val === 'object' ? (val === null ? '—' : JSON.stringify(val)) : String(val)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    
    // For regular values
    return <span>{String(value)}</span>;
  };

  // Format dates nicely
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString();
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {itemsToDisplay.map((item, index) => {
        // Skip rendering the tickets field to avoid duplication
        const fieldsToSkip = ['tickets', 'id', '_id', 'title', 'name', 'description', 'status', 'priority', 'tags', 'total_tickets', 'attachments'];
        return (
        <motion.div 
          key={index} 
          variants={itemVariants}
          whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)" }}
          transition={{ duration: 0.15 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 h-full overflow-hidden">
            <div className="px-2.5 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-500 dark:bg-gray-750">
              {/* Show title if available */}
              {item.title && (
                <p className="text-sm font-medium text-gray-800 dark:text-white mb-1 truncate">
                  {item.title}
                </p>
              )}
              
              {/* ID section */}
              {item._id && (
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                  {typeof item._id === 'object' ? formatCardFieldValue(item._id) : item._id}
                </p>
              )}
              {/* {item.id && !item._id && (
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                  {item.id}
                </p>
              )} */}
              
              {/* Show total count if available (from nested query results) */}
              {item._total_count !== undefined && (
                <div className="mt-1 inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  Total count: {item._total_count}
                </div>
              )}
            </div>
            
            <div className="p-2.5">
              {item.description && (
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                  {item.description}
                </p>
              )}
              
              {/* Status and priority badges */}
              {(item.status || item.priority) && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.status && (
                    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ${getStatusClass(item.status)}`}>
                      {typeof item.status === 'object' ? formatCardFieldValue(item.status) : item.status}
                    </span>
                  )}
                  
                  {item.priority && (
                    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ${getPriorityClass(typeof item.priority === 'string' ? item.priority : String(item.priority))}`}>
                      {typeof item.priority === 'object' ? formatCardFieldValue(item.priority) : item.priority}
                    </span>
                  )}
                </div>
              )}
              
              {/* Due date if available */}
              {item.due_date && (
                <div className="flex items-center justify-between mb-2 bg-gray-50 dark:bg-gray-700/50 p-1.5 rounded text-xs">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Due Date:</span>
                  <span className="font-medium text-blue-700 dark:text-blue-400">{formatDate(item.due_date)}</span>
                </div>
              )}
              
              {/* Handle count field specially if present (from aggregation results) */}
              {item.count !== undefined && !hasNestedTickets && (
                <div className="flex items-center justify-between mb-2 bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded text-xs">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Count:</span>
                  <span className="font-bold text-blue-700 dark:text-blue-400">{item.count}</span>
                </div>
              )}
              
              {/* Tags */}
              {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  <div className="w-full flex items-center gap-0.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <Tag size={10} />
                    <span>Tags:</span>
                  </div>
                  {item.tags.map((tag: string, i: number) => (
                    <span key={i} className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {typeof tag === 'object' ? JSON.stringify(tag) : tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Other fields */}
              <div className="space-y-1.5 text-xs mt-2">
                {Object.keys(item)
                  .filter(key => 
                    !fieldsToSkip.includes(key) && 
                    !key.startsWith('_') && // Skip internal fields
                    item[key] !== undefined && 
                    item[key] !== null
                  )
                  .map(key => {
                    const fieldType = fields.find(f => f.key === key)?.type || 'text';
                    const formattedKey = formatFieldName(key);
                    
                    return (
                      <div key={key} className="flex justify-between pt-1.5 border-t border-gray-100 dark:border-gray-700">
                        <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">{formattedKey}</dt>
                        <dd className="text-right text-xs text-gray-800 dark:text-gray-200">
                          {formatCardFieldValue(item[key])}
                        </dd>
                      </div>
                    );
                  })
                }
              </div>
              
              {/* If no additional fields displayed */}
              {Object.keys(item).filter(key => 
                !fieldsToSkip.includes(key) && 
                !key.startsWith('_') &&
                item[key] !== undefined && 
                item[key] !== null
              ).length === 0 && !item.description && !item.tags && !item.status && !item.priority && (
                <div className="flex items-center justify-center py-2 text-gray-400 text-xs">
                  <Info size={12} className="mr-1" />
                  <span>No additional details</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )})}
    </motion.div>
  );
};

export default CardView;
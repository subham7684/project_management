import React from 'react';
import { 
  Layers, 
  Ticket, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Users,
  Briefcase,
  MessageSquare,
  FileCheck,
  Calendar,
  Database,
  Zap,
  PieChart
} from 'lucide-react';
import { formatFieldName } from '../../processing';
import { motion } from 'framer-motion';
import { SummaryMetricsProps } from '../types';
import { COLOR_MAP } from '../../constants';

interface MetricItem {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: keyof typeof COLOR_MAP;
  subtext?: string;
}

/**
 * Enhanced component for displaying summary metrics from query results with improved styling
 */
const SummaryMetrics: React.FC<SummaryMetricsProps> = ({ queryResult, getCollectionFromQuery }) => {
  const getSummaryMetrics = (): MetricItem[] | null => {
    if (!queryResult?.results || !Array.isArray(queryResult.results) || queryResult.results.length === 0) {
      return null;
    }

    // Calculate query execution time if available
    const executionTimeMetric = queryResult.metadata?.executionTime ? {
      label: 'Query Time',
      value: `${queryResult.metadata.executionTime.toFixed(2)}ms`,
      icon: Zap,
      color: 'amber',
      subtext: 'Execution speed'
    } : null;

    // For count-based results with explicit count field
    if (queryResult.results.some(r => r && typeof r === 'object' && r.count !== undefined)) {
      // Check if this is an aggregation result with _id field for grouping
      const hasAggregation = queryResult.results.some(r => r && typeof r === 'object' && r._id !== undefined);
      
      if (hasAggregation) {
        // This is a grouped aggregation result (like counts by status)
        // Create individual metrics for each status/group
        const metrics: MetricItem[] = queryResult.results
          .filter(item => item && typeof item === 'object')
          .map((item, index) => {
            // Use _id as the label since it contains the group name (like 'Open', 'In Progress', etc)
            let label = 'Unknown';
            if (item._id === null) {
              label = 'Unassigned';
            } else if (typeof item._id === 'string') {
              label = item._id;
            } else if (typeof item._id === 'object' && item._id !== null) {
              // Handle the case where _id is an object (composite key)
              label = Object.values(item._id).join(', ');
            } else {
              label = `Group ${index + 1}`;
            }
            
            // Determine appropriate icon and color based on the label
            let icon: React.ElementType = Activity;
            let color: keyof typeof COLOR_MAP = 'blue';
            
            if (typeof label === 'string') {
              const lowerLabel = label.toLowerCase();
              
              // Assign appropriate icon and color based on status
              if (lowerLabel === 'open') {
                icon = Ticket;
                color = 'green';
              } else if (lowerLabel === 'in progress' || lowerLabel === 'ongoing') {
                icon = Clock;
                color = 'blue';
              } else if (lowerLabel === 'closed' || lowerLabel === 'done' || lowerLabel === 'completed') {
                icon = CheckCircle;
                color = 'gray';
              } else if (lowerLabel === 'review' || lowerLabel === 'pending') {
                icon = Activity;
                color = 'purple';
              } else if (lowerLabel === 'high' || lowerLabel === 'critical' || lowerLabel === 'urgent') {
                icon = AlertTriangle;
                color = 'red';
              } else if (lowerLabel === 'low') {
                icon = CheckCircle;
                color = 'green';
              } else if (lowerLabel === 'medium' || lowerLabel === 'normal') {
                icon = Clock;
                color = 'amber';
              }
            }
            
            return {
              label,
              value: typeof item.count === 'number' ? item.count : 0,
              icon,
              color,
              subtext: item._id_field ? formatFieldName(item._id_field) : undefined
            };
          });
          
        // Add total if we have multiple metrics
        if (metrics.length > 1) {
          const totalCount = metrics.reduce((sum, item) => {
            return sum + (typeof item.value === 'number' ? item.value : 0);
          }, 0);
          
          metrics.unshift({
            label: 'Total',
            value: totalCount,
            icon: PieChart,
            color: 'indigo',
            subtext: `Across ${metrics.length} categories`
          });
        }
        
        // Add execution time if available
        if (executionTimeMetric) {
          metrics.push(executionTimeMetric);
        }
        
        return metrics;
      }
      
      // Regular count results without _id field
      const metrics: MetricItem[] = queryResult.results
        .filter(item => item && typeof item === 'object')
        .map(item => ({
          label: typeof item.collection === 'string' 
            ? formatFieldName(item.collection) 
            : typeof item.name === 'string'
              ? formatFieldName(item.name)
              : 'Count',
          value: typeof item.count === 'number' ? item.count : 0,
          icon: getIconForCollection(typeof item.collection === 'string' ? item.collection : undefined),
          color: getColorForCollection(typeof item.collection === 'string' ? item.collection : undefined),
          subtext: item.filter_field ? `Filtered by ${formatFieldName(item.filter_field)}` : undefined
        }));
        
      // Add execution time if available
      if (executionTimeMetric) {
        metrics.push(executionTimeMetric);
      }
      
      return metrics;
    }

    // For regular results
    const totalItems = queryResult.results.length;
    const collection = getCollectionFromQuery();
    
    const metrics: MetricItem[] = [{
      label: collection ? `Total ${formatFieldName(collection)}` : 'Total Results', 
      value: totalItems, 
      icon: collection ? getIconForCollection(collection) : Layers,
      color: collection ? getColorForCollection(collection) : 'blue',
      subtext: queryResult.metadata?.queryTime ? `As of ${new Date(queryResult.metadata.queryTime).toLocaleString()}` : undefined
    }];

    // Add collection-specific metrics
    if (collection === 'tickets') {
      // Check if results have status field
      if (queryResult.results.some(r => r && r.status)) {
        const openCount = queryResult.results.filter(r => r && typeof r.status === 'string' && r.status.toLowerCase() === 'open').length;
        const inProgressCount = queryResult.results.filter(r => r && typeof r.status === 'string' && 
          (r.status.toLowerCase() === 'in progress' || r.status.toLowerCase() === 'in-progress')).length;
        const closedCount = queryResult.results.filter(r => r && typeof r.status === 'string' && r.status.toLowerCase() === 'closed').length;
        
        if (openCount > 0) metrics.push({ 
          label: 'Open', 
          value: openCount, 
          icon: Ticket, 
          color: 'green',
          subtext: `${Math.round((openCount / totalItems) * 100)}% of total` 
        });
        
        if (inProgressCount > 0) metrics.push({ 
          label: 'In Progress', 
          value: inProgressCount, 
          icon: Clock, 
          color: 'blue',
          subtext: `${Math.round((inProgressCount / totalItems) * 100)}% of total`
        });
        
        if (closedCount > 0) metrics.push({ 
          label: 'Closed', 
          value: closedCount, 
          icon: CheckCircle, 
          color: 'gray',
          subtext: `${Math.round((closedCount / totalItems) * 100)}% of total`
        });
      }
      
      // Check if results have priority field
      if (queryResult.results.some(r => r && r.priority)) {
        const highPriorityCount = queryResult.results.filter(r => r && typeof r.priority === 'string' && r.priority.toLowerCase() === 'high').length;
        if (highPriorityCount > 0) {
          metrics.push({ 
            label: 'High Priority', 
            value: highPriorityCount, 
            icon: AlertTriangle, 
            color: 'red',
            subtext: `${Math.round((highPriorityCount / totalItems) * 100)}% of total`
          });
        }
      }
    } else if (collection === 'users') {
      // Add some user-specific metrics if available
      const activeUserCount = queryResult.results.filter(r => r && typeof r.status === 'string' && r.status.toLowerCase() === 'active').length;
      if (activeUserCount > 0) {
        metrics.push({ 
          label: 'Active Users', 
          value: activeUserCount, 
          icon: Users, 
          color: 'green',
          subtext: `${Math.round((activeUserCount / totalItems) * 100)}% of total`
        });
      }
    }

    // Add collection metric if it wasn't the primary metric
    if (collection && metrics.length === 1) {
      metrics.push({ 
        label: formatFieldName(collection), 
        value: totalItems, 
        icon: Database,
        color: 'indigo'
      });
    }
    
    // Add execution time if available
    if (executionTimeMetric) {
      metrics.push(executionTimeMetric);
    }

    return metrics;
  };

  // Helper to get icon based on collection name
  const getIconForCollection = (collection?: string): React.ElementType => {
    if (!collection) return Activity;
    
    const lowerCollection = typeof collection === 'string' ? collection.toLowerCase() : '';
    if (lowerCollection === 'tickets') return Ticket;
    if (lowerCollection === 'users') return Users;
    if (lowerCollection === 'comments') return MessageSquare;
    if (lowerCollection === 'projects') return Briefcase;
    if (lowerCollection === 'sprints') return Calendar;
    if (lowerCollection === 'tasks') return FileCheck;
    return Activity;
  };

  // Helper to get color based on collection name
  const getColorForCollection = (collection?: string): keyof typeof COLOR_MAP => {
    if (!collection) return 'blue';
    
    const lowerCollection = typeof collection === 'string' ? collection.toLowerCase() : '';
    if (lowerCollection === 'tickets') return 'blue';
    if (lowerCollection === 'users') return 'indigo';
    if (lowerCollection === 'comments') return 'purple';
    if (lowerCollection === 'projects') return 'amber';
    if (lowerCollection === 'sprints') return 'green';
    if (lowerCollection === 'tasks') return 'teal';
    return 'blue';
  };

  const metrics = getSummaryMetrics();
  
  if (!metrics) return null;

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
    hidden: { y: 5, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.2 } }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon;
        const colorInfo = COLOR_MAP[metric.color];
        const colorClasses = `${colorInfo.bg} ${colorInfo.text} ${colorInfo.darkBg} ${colorInfo.darkText}`;
        
        return (
          <motion.div 
            key={index} 
            className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow transition-shadow"
            variants={itemVariants}
            whileHover={{ y: -1, transition: { duration: 0.15 } }}
          >
            <div className="p-3">
              <div className="flex items-center">
                <div className="mr-3">
                  <span className={`inline-flex p-2 rounded-md ${colorClasses}`}>
                    <IconComponent size={16} />
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{metric.label}</p>
                  <p className="text-lg font-bold mt-0.5 text-gray-800 dark:text-white">
                    {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                  </p>
                  {metric.subtext && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{metric.subtext}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default SummaryMetrics;
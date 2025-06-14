import React from 'react';
import { Database, Hash, GitBranch, ArrowRightLeft, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { QueryInfoProps } from '../types';
import { COLOR_MAP, THEME } from '../../constants';

/**
 * Component for displaying query information with improved styling
 */
const QueryInfo: React.FC<QueryInfoProps> = ({ queryResult }) => {
  if (!queryResult) return null;

  const getCollection = (): string => {
    if (Array.isArray(queryResult.query)) {
      const collections = queryResult.query
        .filter(q => q && typeof q === 'object' && q.collection)
        .map(q => q.collection);
      
      return collections.length > 0 ? collections.join(', ') : 'Multiple';
    }
    
    return queryResult.query?.collection || 'Multiple';
  };

  const getResultsCount = (): string => {
    if (!queryResult.results) return 'N/A';
    if (!Array.isArray(queryResult.results)) return 'N/A';
    return queryResult.results.length.toLocaleString();
  };

  const getQueryType = (): string => {
    if (Array.isArray(queryResult.query)) {
      return 'Multiple Queries';
    }
    
    if (queryResult.query && typeof queryResult.query === 'object') {
      if ('filter' in queryResult.query) return 'Filter';
      if ('aggregation' in queryResult.query) return 'Aggregation';
      if ('sort' in queryResult.query) return 'Sorted Query';
      if ('projection' in queryResult.query) return 'Projection';
    }
    
    return 'Standard Query';
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3,
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const metrics = [
    { 
      label: 'Collection', 
      value: getCollection(), 
      icon: Database,
      colorKey: 'purple' as keyof typeof COLOR_MAP
    },
    { 
      label: 'Results Count', 
      value: getResultsCount(), 
      icon: Hash,
      colorKey: 'blue' as keyof typeof COLOR_MAP
    },
    { 
      label: 'Query Type', 
      value: getQueryType(), 
      icon: GitBranch,
      colorKey: 'amber' as keyof typeof COLOR_MAP
    }
  ];

  // Only add execution time if it exists
  if (queryResult.metadata?.executionTime) {
    metrics.push({
      label: 'Execution Time',
      value: `${queryResult.metadata.executionTime.toFixed(2)}ms`,
      icon: Clock,
      colorKey: 'green' as keyof typeof COLOR_MAP
    });
  }

  return (
    <motion.div 
      className="mt-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h3 className={`${THEME.text.heading} mb-3 flex items-center gap-2`}>
        <ArrowRightLeft size={18} className={THEME.text.muted} />
        Query Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          const colorInfo = COLOR_MAP[metric.colorKey];
          const colorClasses = `${colorInfo.bg} ${colorInfo.text} ${colorInfo.darkBg} ${colorInfo.darkText}`;
          
          return (
            <motion.div 
              key={index} 
              className={`${THEME.card.base} flex items-center ${THEME.card.hover}`}
              variants={itemVariants}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              <div className={`rounded-lg p-2.5 mr-3 ${colorClasses}`}>
                <IconComponent size={18} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {metric.label}
                </p>
                <p className="text-base font-semibold mt-1 text-gray-800 dark:text-white">
                  {metric.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default QueryInfo;
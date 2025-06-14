import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ArrowRight, Tag } from 'lucide-react';
import { ExampleQueriesProps } from '../types';

/**
 * Enhanced component to display example queries with category organization and improved visual feedback
 */
const ExampleQueries: React.FC<ExampleQueriesProps> = ({ examples, onExampleClick }) => {
  // Group examples by category if they contain a category indicator
  // Format: "Category: Example query"
  const categorizedExamples: Record<string, string[]> = {};
  const uncategorizedExamples: string[] = [];

  examples.forEach(example => {
    const colonIndex = example.indexOf(':');
    if (colonIndex > 0) {
      const category = example.substring(0, colonIndex).trim();
      const query = example.substring(colonIndex + 1).trim();
      
      if (!categorizedExamples[category]) {
        categorizedExamples[category] = [];
      }
      categorizedExamples[category].push(query);
    } else {
      uncategorizedExamples.push(example);
    }
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.2,
        staggerChildren: 0.03
      }
    },
    exit: { 
      opacity: 0, 
      y: -5,
      transition: { duration: 0.15 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -2 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 500, damping: 25 }
    }
  };

  const getCategoryIcon = (category: string) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('count') || lowerCategory.includes('number')) return 'number';
    if (lowerCategory.includes('status')) return 'status';
    if (lowerCategory.includes('date') || lowerCategory.includes('time')) return 'date';
    if (lowerCategory.includes('user') || lowerCategory.includes('people')) return 'user';
    return 'default';
  };

  return (
    <motion.div 
      className="absolute mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10 overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="py-2 px-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Lightbulb size={14} className="text-amber-500 dark:text-amber-400" />
          <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300">Example Queries</h3>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">{examples.length} examples</span>
      </div>
      
      <div className="max-h-72 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {/* Render categorized examples */}
        {Object.keys(categorizedExamples).map(category => (
          <div key={category} className="mb-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5">
              <Tag size={12} className="text-gray-400 dark:text-gray-500" />
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {category}
              </h4>
            </div>
            <div className="space-y-0.5">
              {categorizedExamples[category].map((example, index) => (
                <motion.button
                  key={`${category}-${index}`}
                  variants={itemVariants}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 rounded transition-colors flex items-center justify-between group"
                  onClick={() => onExampleClick(example)}
                  whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.08)' }}
                >
                  <span className="pr-2">{example}</span>
                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
                </motion.button>
              ))}
            </div>
          </div>
        ))}
        
        {/* Render uncategorized examples */}
        {uncategorizedExamples.length > 0 && (
          <div>
            {Object.keys(categorizedExamples).length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5">
                <Tag size={12} className="text-gray-400 dark:text-gray-500" />
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  General
                </h4>
              </div>
            )}
            <div className="space-y-0.5">
              {uncategorizedExamples.map((example, index) => (
                <motion.button
                  key={index}
                  variants={itemVariants}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 rounded transition-colors flex items-center justify-between group"
                  onClick={() => onExampleClick(example)}
                  whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.08)' }}
                >
                  <span className="pr-2">{example}</span>
                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="py-2 px-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Click any example to use it as your query
        </p>
      </div>
    </motion.div>
  );
};

export default ExampleQueries;
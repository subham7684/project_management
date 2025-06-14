import React, { useState } from 'react';
import { Clipboard, CheckCheck, Code } from 'lucide-react';
import { motion } from 'framer-motion';
import { JsonViewProps } from '../types';
// import { THEME } from '../../constants';

/**
 * Component for displaying raw JSON data with refined styling and micro-interactions
 */
const JsonView: React.FC<JsonViewProps> = ({ queryResult }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!queryResult) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  const copyJsonToClipboard = (): void => {
    navigator.clipboard.writeText(JSON.stringify(queryResult, null, 2))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(err => {
        console.error('Failed to copy JSON to clipboard:', err);
      });
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <div className="flex justify-between items-center px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
        <div className="flex items-center gap-1.5">
          <Code size={14} className="text-blue-500 dark:text-blue-400" />
          <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300">JSON Response</h3>
        </div>
        
        <motion.button 
          onClick={copyJsonToClipboard}
          className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${copied ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {copied ? (
            <>
              <CheckCheck size={12} className="text-green-500" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Clipboard size={12} className="text-blue-500" />
              <span>Copy</span>
            </>
          )}
        </motion.button>
      </div>
      
      <div className="overflow-auto max-h-[400px] bg-gray-700 dark:bg-gray-900/50 p-0">
        <pre className="text-xs leading-relaxed text-gray-800 dark:text-gray-200 p-3 m-0 font-mono">
          {JSON.stringify(queryResult, null, 2)}
        </pre>
      </div>
    </motion.div>
  );
};

export default JsonView;
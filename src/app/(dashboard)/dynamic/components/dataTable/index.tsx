import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown, Search, X, Filter, SortAsc, SortDesc } from 'lucide-react';
import { formatFieldName, formatFieldValue } from '../../processing';
import { motion, AnimatePresence } from 'framer-motion';
import { DataTableProps } from '../types';

/**
 * Enhanced component for displaying data in a tabular format with improved styling and usability
 */
const DataTable: React.FC<DataTableProps> = ({ 
  currentItems, 
  processedData, 
  fields, 
  sortField, 
  sortDirection,
  currentPage, 
  itemsPerPage, 
  onSort, 
  onPageChange 
}) => {
  const excludedFieldKeys = ['attachments'];
  const filteredFields = fields.filter(field => !excludedFieldKeys.includes(field.key));
  // Local state for enhanced features
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => filteredFields.map(field => field.key));
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState<boolean>(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [filteredData, setFilteredData] = useState<Record<string, any>[]>(processedData);
  
  // Update filtered data when processedData or search changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredData(processedData);
      return;
    }
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = processedData.filter(row => {
      return Object.entries(row).some(([key, value]) => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(lowerCaseQuery);
      });
    });
    
    setFilteredData(filtered);
  }, [processedData, searchQuery]);
  
  // Calculate current items to display based on filtered data
  const displayItems = !searchQuery.trim() ? currentItems : filteredData.slice(
    currentPage * itemsPerPage, 
    (currentPage + 1) * itemsPerPage
  );
  
  // Function to toggle column visibility
  const toggleColumnVisibility = (key: string) => {
    setVisibleColumns(prev => {
      if (prev.includes(key)) {
        return prev.filter(k => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };
  
  // Empty state handling
  if (!displayItems || !Array.isArray(displayItems) || displayItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-56 py-12 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-md">
        <div className="text-gray-400 dark:text-gray-500 mb-3">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 10H19M5 18H19M5 14H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M4 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7"/>
          </svg>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center font-medium">No data available</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1 max-w-md">
          {searchQuery ? 'Try adjusting your search criteria' : 'There are no records to display'}
        </p>
      </div>
    );
  }

  // Animation variants for rows
  const tableRowVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: {
        delay: i * 0.03,
        duration: 0.2,
        ease: "easeOut"
      }
    }),
    hover: {
      backgroundColor: "rgba(243, 244, 246, 0.7)",
      transition: {
        duration: 0.1
      }
    }
  };

  return (
    <div className="overflow-hidden flex flex-col h-full">
      {/* Table toolbar */}
      <div className="px-3 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search data..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 w-full text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchQuery && (
            <button 
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" 
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Column visibility toggle */}
          <div className="relative">
            <button 
              onClick={() => setIsColumnSettingsOpen(!isColumnSettingsOpen)}
              className="px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-1"
            >
              <Filter size={14} />
              <span className="hidden sm:inline">Columns</span>
            </button>
            
            <AnimatePresence>
              {isColumnSettingsOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-1 w-56 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-10"
                >
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300">Toggle Columns</h3>
                  </div>
                  <div className="p-1 max-h-60 overflow-y-auto">
                    {filteredFields?.map((field) => (
                      <label key={field.key} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={visibleColumns.includes(field.key)} 
                          onChange={() => toggleColumnVisibility(field.key)} 
                          className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">{field.displayName}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Sort direction toggle */}
          <button
            onClick={() => sortField && onSort(sortField)}
            disabled={!sortField}
            className="px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            title={sortField ? `Currently sorted by ${formatFieldName(sortField)} (${sortDirection})` : 'No sort applied'}
          >
            {sortDirection === 'asc' ? (
              <SortAsc size={14} className="text-blue-500" />
            ) : (
              <SortDesc size={14} className="text-blue-500" />
            )}
            <span className="hidden sm:inline">Sort</span>
          </button>
        </div>
      </div>

      {/* Data table */}
      <div className="overflow-auto flex-grow relative">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
            <tr>
              {filteredFields?.filter(field => visibleColumns.includes(field.key)).map((field) => (
                <th 
                  key={field.key} 
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" 
                  onClick={() => field.sortable !== false && onSort(field.key)}
                >
                  <div className="flex items-center gap-1">
                    <span>{field.displayName}</span>
                    {field.sortable !== false && (
                      <span className="inline-flex">
                        {sortField === field.key ? (
                          <ArrowUpDown size={14} className="text-blue-500 dark:text-blue-400" />
                        ) : (
                          <ArrowUpDown size={14} className="text-gray-400 opacity-40" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {displayItems.map((row, rowIndex) => (
              <motion.tr 
                key={rowIndex} 
                className={`hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${rowIndex === hoveredRow ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}
                custom={rowIndex}
                initial="hidden"
                animate="visible"
                variants={tableRowVariants}
                onMouseEnter={() => setHoveredRow(rowIndex)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {filteredFields
                  ?.filter(field => visibleColumns.includes(field.key))
                  ?.map((field) => (
                    <td key={`${rowIndex}-${field.key}`} className="px-3 py-2 whitespace-normal break-words text-xs text-gray-700 dark:text-gray-200">
                      {formatFieldValue(row[field.key], field.type)}
                    </td>
                  ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {filteredData.length > itemsPerPage && (
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">{filteredData.length > 0 ? currentPage * itemsPerPage + 1 : 0}</span>
            <span> - </span>
            <span className="font-medium">{Math.min((currentPage + 1) * itemsPerPage, filteredData.length)}</span>
            <span> of </span>
            <span className="font-medium">{filteredData.length}</span>
            <span> {searchQuery ? '(filtered)' : ''}</span>
          </div>
          <div className="flex items-center space-x-1">
            <button 
              className="p-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              onClick={() => onPageChange(Math.max(0, currentPage - 1))} 
              disabled={currentPage === 0}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="flex items-center px-2">
              {/* Page number indicators - show first, current-1, current, current+1, last */}
              {Array.from({ length: Math.min(5, Math.ceil(filteredData.length / itemsPerPage)) }).map((_, index) => {
                let pageNumber: number;
                const totalPages = Math.ceil(filteredData.length / itemsPerPage);
                
                // Logic to determine which page numbers to show
                if (totalPages <= 5) {
                  // If 5 or fewer pages, show all
                  pageNumber = index;
                } else if (currentPage < 2) {
                  // Near start
                  if (index < 3) {
                    pageNumber = index;
                  } else if (index === 3) {
                    return (
                      <span key="ellipsis1" className="text-xs text-gray-400 mx-1">...</span>
                    );
                  } else {
                    pageNumber = totalPages - 1;
                  }
                } else if (currentPage > totalPages - 3) {
                  // Near end
                  if (index === 0) {
                    pageNumber = 0;
                  } else if (index === 1) {
                    return (
                      <span key="ellipsis2" className="text-xs text-gray-400 mx-1">...</span>
                    );
                  } else {
                    pageNumber = totalPages - (5 - index);
                  }
                } else {
                  // Middle
                  if (index === 0) {
                    pageNumber = 0;
                  } else if (index === 1) {
                    return (
                      <span key="ellipsis3" className="text-xs text-gray-400 mx-1">...</span>
                    );
                  } else if (index === 4) {
                    return (
                      <span key="ellipsis4" className="text-xs text-gray-400 mx-1">...</span>
                    );
                  } else {
                    pageNumber = currentPage + (index - 2);
                  }
                }
                
                return (
                  <button
                    key={`page-${pageNumber}`}
                    onClick={() => onPageChange(pageNumber)}
                    className={`w-6 h-6 text-xs flex items-center justify-center rounded transition-colors ${
                      currentPage === pageNumber 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNumber + 1}
                  </button>
                );
              })}
            </div>
            
            <button 
              className="p-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              onClick={() => onPageChange(Math.min(Math.ceil(filteredData.length / itemsPerPage) - 1, currentPage + 1))} 
              disabled={currentPage >= Math.ceil(filteredData.length / itemsPerPage) - 1}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
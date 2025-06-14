"use client"

import React, { useState, useEffect, useMemo, useRef, JSX } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Send,
  Loader2,
  TableIcon,
  BarChart2,
  Layers,
  AlertCircle,
  X,
  ChevronRight,
  Lightbulb,
  History,
  FileType
} from 'lucide-react';
import { getHeaders } from '@/services/network/getHeaders';
import { ENDPOINTS } from '@/services/network/endpoints';
import api from "@/services/axiosInstance";

// Redux imports
import { fetchVisualizationRecommendation, clearVisualizationData } from '@/store/slices/visualisationSlice';

// Import components
import DataTable from './components/dataTable';
import CardView from './components/cardView';
import VisualizationView from './components/Visualisation';
import SummaryMetrics from './components/Metrixes';
import ExampleQueries from './components/exampleQueries';

// Constants and types
import { EXAMPLE_QUERIES } from './constants';
import { analyzeFields, getCollectionFromQuery } from './processing';
import { Field, QueryResult, ViewOption } from './components/types';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';

export default function NLPQueryInterface(): JSX.Element {
  const dispatch = useAppDispatch();
  const queryInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Redux state
  const { visualizationData, loading: isLoadingViz } = useAppSelector(
    (state) => state?.api_visual
  );

  // Local state
  const [question, setQuestion] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [itemsPerPage] = useState<number>(10);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showExamples, setShowExamples] = useState<boolean>(false);
  const [showAdvancedViews, setShowAdvancedViews] = useState<boolean>(false);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [showQueryHistory, setShowQueryHistory] = useState<boolean>(false);
  const [activeAdvancedTab, setActiveAdvancedTab] = useState<string>("visualization");
  
  // Auto-resize textarea
  const [textareaHeight, setTextareaHeight] = useState<number>(42); // Default height
  
  const resizeTextarea = (): void => {
    if (queryInputRef.current) {
      queryInputRef.current.style.height = 'auto';
      queryInputRef.current.style.height = `${queryInputRef.current.scrollHeight}px`;
      setTextareaHeight(Math.max(42, queryInputRef.current.scrollHeight));
    }
  };
  
  useEffect(() => {
    resizeTextarea();
  }, [question]);

  // Process query results when they change to determine optimal visualization
  useEffect(() => {
    if (!queryResult?.results) return;
    
    try {
      let extractedFields: Field[] = [];
      
      // Safely check for array results
      const isResultsArray = Array.isArray(queryResult.results);
      
      // Detect if we have a count query result
      const hasCountResults = isResultsArray && 
        queryResult.results.some(r => r && typeof r === 'object' && r.count !== undefined);
      
      // Detect if we have a simple projection or filtered collection
      const isProjection = !hasCountResults && 
        isResultsArray && 
        queryResult.results.length > 0 &&
        typeof queryResult.results[0] === 'object';

      // Extract fields for further analysis
      if (isProjection) {
        extractedFields = analyzeFields(queryResult.results);
        setFields(extractedFields);
      }
      
      // Reset to first page when results change
      setCurrentPage(0);
      
      // Get visualization recommendation from the API
      getVisualizationSuggestion();
    } catch (error) {
      console.error('Error processing query results', error);
      setErrorMessage('Error processing results. Please try a different query.');
    }
  }, [queryResult]);

  // Function to get visualization suggestion via Redux
  const getVisualizationSuggestion = (): void => {
    if (!queryResult) return;
    
    // Dispatch the Redux action to fetch visualization recommendation
    dispatch(fetchVisualizationRecommendation({
      queryResult,
      question
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setQuestion(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!question.trim() || isSubmitting) return;
  
    setIsSubmitting(true);
    setErrorMessage('');
    setShowExamples(false);
    setShowQueryHistory(false);
    
    // Clear any previous visualization data when submitting a new query
    dispatch(clearVisualizationData());
    
    try {
      const headers = getHeaders();
      const response = await api.post(
        `${ENDPOINTS.NLP_QUERY}/nlp-query`,
        { question: question.trim() },
        { headers }
      );
  
      // Validate response
      if (!response.data) {
        throw new Error('Empty response received');
      }
      
      setQueryResult(response.data);
      setCurrentPage(0);
      setShowAdvancedViews(false);
      
      // Add to query history
      setQueryHistory(prevHistory => {
        // Limit history to 10 items and avoid duplicates
        const newHistory = [question.trim(), ...prevHistory.filter(q => q !== question.trim())];
        return newHistory.slice(0, 10);
      });
    } catch (error: unknown) {
      console.error('Error submitting query:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data)
          ? String(error.response.data.detail)
          : 'An unknown error occurred';
      setErrorMessage(`Query error: ${errorMessage}`);
      setQueryResult(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearQuery = (): void => {
    setQuestion('');
    if (queryInputRef.current) {
      queryInputRef.current.focus();
    }
  };

  const handleExampleClick = (example: string): void => {
    setQuestion(example);
    setShowExamples(false);
    
    // Focus the input after selecting an example
    setTimeout(() => {
      if (queryInputRef.current) {
        queryInputRef.current.focus();
      }
    }, 50);
  };
  
  const handleHistoryClick = (historyItem: string): void => {
    setQuestion(historyItem);
    setShowQueryHistory(false);
    
    // Focus the input after selecting a history item
    setTimeout(() => {
      if (queryInputRef.current) {
        queryInputRef.current.focus();
      }
    }, 50);
  };

  const handleSort = (field: string): void => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Update the bestVisualizationType function in paste-4.txt
const bestVisualizationType = useMemo(() => {
  // If we have a recommendation from the visualization service, use it
  if (visualizationData?.visualizationType) {
    return visualizationData.visualizationType;
  }
  
  // Otherwise, fall back to our original logic
  if (!queryResult?.results || !Array.isArray(queryResult.results)) return 'none';
  
  // Check for special case of time series data that should be a combo chart
  const isTimeSeriesData = queryResult.results.some(r => 
    r && typeof r === 'object' && 
    ((r._id && typeof r._id === 'object' && (r._id.year || r._id.month || r._id.date)) ||
     (r.year && r.month))
  );
  
  const hasMultipleMetrics = queryResult.results.some(r => 
    r && typeof r === 'object' &&
    Object.keys(r).filter(key => typeof r[key] === 'number').length >= 2
  );
  
  // For time series with multiple metrics, use combo chart
  if (isTimeSeriesData && hasMultipleMetrics) {
    return 'comboChart';
  }
  
  // For count-based results with few categories (<=7) - good for pie charts
  const hasCountResults = queryResult.results.some(r => 
    r && typeof r === 'object' && 
    ((r._id !== undefined && r.count !== undefined) || 
     (r.percentage !== undefined) ||
     (r.label !== undefined && r.value !== undefined))
  );
     
  const hasFewCategories = queryResult.results.length <= 7;
  
  // For distribution/percentage questions, prefer pie charts
  const isDistributionQuestion = question.toLowerCase().includes('distribution') || 
    question.toLowerCase().includes('percentage') ||
    question.toLowerCase().includes('breakdown');
    
  if (hasCountResults && hasFewCategories && isDistributionQuestion) {
    return 'pieChart';
  }
  
  // For count queries with multiple categories, prefer bar charts
  if (hasCountResults) {
    return 'barChart';
  }
  
  // For single aggregation result with count/value data
  // Use a bar chart even if there's only one row
  if (queryResult.results.length === 1 && 
      typeof queryResult.results[0] === 'object' &&
      (queryResult.results[0].count !== undefined || 
       queryResult.results[0].value !== undefined ||
       queryResult.results[0].percentage !== undefined)) {
    return 'barChart';
  }
  
  // For very small result sets of detailed items
  if (queryResult.results.length <= 3) {
    return 'cards';
  }
  
  const hasDateFields = fields.some(f => 
    f.key === 'due_date' || 
    f.key.includes('_at') || 
    f.key.includes('date')
  );
  if (hasDateFields) return 'timeline';
  
  const hasNumericFields = fields.some(f => f.type === 'number');
  if (hasNumericFields && queryResult.results.length <= 10) return 'barChart';
  
  return queryResult.results.length > 10 ? 'table' : 'cards';
}, [queryResult, fields, visualizationData, question]);

  const preprocessQueryResults = (results: any[]): any[] => {
    if (!Array.isArray(results) || results.length === 0) {
      return results;
    }
    
    const hasNestedTickets = results.some(
      item => item && typeof item === 'object' && Array.isArray(item.tickets) && item.tickets.length > 0
    );
    
    if (hasNestedTickets) {
      let processedResults: any[] = [];
      
      results.forEach(item => {
        if (item && typeof item === 'object' && Array.isArray(item.tickets)) {
          const ticketsWithMeta = item.tickets.map((ticket: any) => ({
            ...ticket,
            _total_count: item.count || 0,
            _group_id: item._id
          }));
          
          processedResults.push(...ticketsWithMeta);
        } else {
          processedResults.push(item);
        }
      });
      
      return processedResults;
    }
    
    return results;
  };

  const processedData = useMemo(() => {
    if (!queryResult?.results || !Array.isArray(queryResult.results) || queryResult.results.length === 0) {
      return [];
    }
    
    // Pre-process the results to handle nested structures
    const preprocessedResults = preprocessQueryResults(queryResult.results);
    
    const sorted = [...preprocessedResults];
    
    // Only sort if there's a sortField and the data is sortable
    if (sortField && sorted.length > 0 && typeof sorted[0] === 'object') {
      sorted.sort((a, b) => {
        // Handle null/undefined objects
        if (!a || !b) return 0;
        
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        // Handle null/undefined values
        if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? -1 : 1;
        if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? 1 : -1;
        
        // String comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        
        // Number/boolean/default comparison
        return sortDirection === 'asc' ? (aValue < bValue ? -1 : 1) : (bValue < aValue ? -1 : 1);
      });
    }
    
    return sorted;
  }, [queryResult, sortField, sortDirection]);

  const currentItems = useMemo(() => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return processedData.slice(start, end);
  }, [processedData, currentPage, itemsPerPage]);

  // Animation variants
  const contentVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } }
  };

  const errorVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.2 } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.15 } }
  };

  // Available views for advanced mode
  const viewOptions: ViewOption[] = [
    { id: "visualization", name: "Visualization", icon: <BarChart2 size={16} /> },
    { id: "table", name: "Table", icon: <TableIcon size={16} /> },
    { id: "cards", name: "Cards", icon: <Layers size={16} /> }
  ];

  const renderOptimalView = (): JSX.Element => {
    // Show loading state while fetching visualization recommendation
    if (isLoadingViz) {
      return (
        <div className="flex items-center justify-center h-48 bg-white dark:bg-gray-800/30 rounded-md">
          <div className="flex flex-col items-center">
            <Loader2 className="h-6 w-6 text-blue-500 animate-spin mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Analyzing data for best visualization...
            </p>
          </div>
        </div>
      );
    }
  
    // If we don't have visualization data yet, show a placeholder
    if (!visualizationData) {
      return (
        <div className="flex items-center justify-center h-48 bg-white dark:bg-gray-800/30 rounded-md">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {queryResult ? "Processing data visualization..." : "No data to visualize"}
          </p>
        </div>
      );
    }
    
    // Get visualization configs from the recommendation
    const vizConfig = visualizationData.config || {};
    const vizTitle = visualizationData.title;
    const vizType = visualizationData.visualizationType;
  
    // Handle different visualization types
    switch (vizType) {
      case 'barChart':
        return (
          <div className="p-2">
            <VisualizationView 
              queryResult={queryResult}
              visualizationType="barChart"
              fields={fields}
              config={vizConfig}
              title={vizTitle}
              question={question}
            />
          </div>
        );
        
      case 'pieChart':
        return (
          <div className="p-2">
            <VisualizationView 
              queryResult={queryResult}
              visualizationType="pieChart"
              fields={fields}
              config={vizConfig}
              title={vizTitle}
              question={question}
            />
          </div>
        );
        
      case 'countChart':
      case 'singleMetric':
        return (
          <div className="p-2">
            <VisualizationView 
              queryResult={queryResult}
              visualizationType="countChart"
              fields={fields}
              config={vizConfig}
              title={vizTitle}
              question={question}
            />
          </div>
        );
        
      case 'timelineChart':
        return (
          <div className="p-2">
            <VisualizationView 
              queryResult={queryResult}
              visualizationType="timelineChart"
              fields={fields}
              config={vizConfig}
              title={vizTitle}
              question={question}
            />
          </div>
        );
        
      case 'distribution':
        return (
          <div className="p-2">
            <VisualizationView 
              queryResult={queryResult}
              visualizationType="distribution"
              fields={fields}
              config={vizConfig}
              title={vizTitle}
              question={question}
            />
          </div>
        );
        
      case 'cards':
        return (
          <div className="p-2">
            <CardView 
              currentItems={currentItems}
              fields={fields}
            />
          </div>
        );
        
      case 'table':
        return (
          <DataTable 
            currentItems={currentItems}
            processedData={processedData}
            fields={fields}
            sortField={sortField}
            sortDirection={sortDirection}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onSort={handleSort}
            onPageChange={setCurrentPage}
          />
        );
        
      default:
        // If we have a visualization type but it's not one we specifically handle,
        // pass it to VisualizationView anyway - it might know how to handle it
        if (vizType && vizType !== 'none') {
          return (
            <div className="p-2">
              <VisualizationView 
                queryResult={queryResult}
                visualizationType={vizType}
                fields={fields}
                config={vizConfig}
                title={vizTitle}
                question={question}
              />
            </div>
          );
        }
        
        // If all else fails, default to table view
        return (
          <DataTable 
            currentItems={currentItems}
            processedData={processedData}
            fields={fields}
            sortField={sortField}
            sortDirection={sortDirection}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onSort={handleSort}
            onPageChange={setCurrentPage}
          />
        );
    }
  };

  const renderAdvancedView = (): JSX.Element => {
    // Get visualization configs from the recommendation
    const vizConfig = visualizationData?.config || {};
    const vizTitle = visualizationData?.title;
  
    switch (activeAdvancedTab) {
      case 'visualization':
        return (
          <div className="p-2">
            <VisualizationView 
              queryResult={queryResult}
              visualizationType={bestVisualizationType === 'none' ? 'auto' : bestVisualizationType}
              fields={fields}
              config={vizConfig}
              title={vizTitle}
              question={question}
            />
          </div>
        );
      case 'table':
        return (
          <DataTable 
            currentItems={currentItems}
            processedData={processedData}
            fields={fields}
            sortField={sortField}
            sortDirection={sortDirection}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onSort={handleSort}
            onPageChange={setCurrentPage}
          />
        );
      case 'cards':
        return (
          <div className="p-2">
            <CardView 
              currentItems={currentItems}
              fields={fields}
            />
          </div>
        );
      default:
        return null;
    }
  };

  // History view component
  const HistoryDropdown = ({ onSelect }: { onSelect: (query: string) => void }): JSX.Element => {
    if (queryHistory.length === 0) {
      return (
        <motion.div 
          className="absolute right-0 left-0 top-full mt-1 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
        >
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            <History className="h-5 w-5 mx-auto mb-2 opacity-50" />
            <p>No recent queries</p>
          </div>
        </motion.div>
      );
    }
    
    return (
      <motion.div 
        className="absolute right-0 left-0 top-full mt-1 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.15 }}
      >
        <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300">Recent Queries</h3>
          <button 
            onClick={() => setShowQueryHistory(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
        <ul className="max-h-64 overflow-y-auto">
          {queryHistory.map((item, idx) => (
            <li key={idx}>
              <button
                onClick={() => onSelect(item)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors flex items-start"
              >
                <Search className="h-3.5 w-3.5 mt-0.5 mr-2 flex-shrink-0 text-gray-400" />
                <span className="truncate">{item}</span>
              </button>
            </li>
          ))}
        </ul>
      </motion.div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
      <motion.div 
        className="mb-4"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Query Me</h1>
        
        <div className="relative">
          <div className="flex shadow-sm rounded-md overflow-hidden">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <textarea 
                ref={queryInputRef}
                className="w-full pl-10 pr-16 py-2.5 text-sm border-0 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-l-md resize-none"
                placeholder="Ask me something....."
                value={question}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={1}
                style={{ 
                  minHeight: '42px', 
                  height: `${textareaHeight}px`,
                  maxHeight: '120px'
                }}
              />
              
              <div className="absolute right-2.5 top-2.5 flex space-x-1.5">
                {question && (
                  <button 
                    onClick={handleClearQuery}
                    className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Clear query"
                  >
                    <X size={14} />
                  </button>
                )}
                
                <button 
                  onClick={() => {
                    setShowQueryHistory(!showQueryHistory);
                    setShowExamples(false);
                  }}
                  className={`p-0.5 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    showQueryHistory 
                      ? 'text-blue-500 dark:text-blue-400' 
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                  }`}
                  aria-label="Show history"
                >
                  <History size={14} />
                </button>
                
                <button 
                  onClick={() => {
                    setShowExamples(!showExamples);
                    setShowQueryHistory(false);
                  }}
                  className={`p-0.5 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    showExamples 
                      ? 'text-blue-500 dark:text-blue-400' 
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                  }`}
                  aria-label="Show examples"
                >
                  <Lightbulb size={14} />
                </button>
              </div>
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || !question.trim()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-r-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">Ask</span>
            </button>
          </div>
          
          {/* Example queries dropdown */}
          <AnimatePresence>
            {showExamples && (
              <ExampleQueries 
                examples={EXAMPLE_QUERIES} 
                onExampleClick={handleExampleClick} 
              />
            )}
          </AnimatePresence>
          
          {/* Query history dropdown */}
          <AnimatePresence>
            {showQueryHistory && (
              <HistoryDropdown onSelect={handleHistoryClick} />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {errorMessage && (
          <motion.div 
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-2.5 mb-3"
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex">
              <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 dark:text-red-400">{errorMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {queryResult && (
          <motion.div
            key="results"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -5 }}
          >
            {/* Summary metrics */}
            <SummaryMetrics 
              queryResult={queryResult} 
              getCollectionFromQuery={() => getCollectionFromQuery(queryResult)} 
            />

            <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between p-2.5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center">
                  <FileType size={16} className="mr-1.5 text-blue-500 dark:text-blue-400" />
                  {Array.isArray(queryResult.results) ? `${queryResult.results.length} Result${queryResult.results.length !== 1 ? 's' : ''}` : 'Results'}
                </h2>
                <button 
                  onClick={() => setShowAdvancedViews(!showAdvancedViews)}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-medium rounded-md shadow-sm transition-colors flex items-center gap-1"
                >
                  <span>{showAdvancedViews ? 'Simple View' : 'Advanced Views'}</span>
                  <ChevronRight size={14} className={`transform transition-transform ${showAdvancedViews ? 'rotate-90' : ''}`} />
                </button>
              </div>

              {showAdvancedViews ? (
                <>
                  <div className="flex overflow-x-auto no-scrollbar border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                    {viewOptions.map(option => (
                      <button 
                        key={option.id} 
                        onClick={() => setActiveAdvancedTab(option.id)} 
                        className={`whitespace-nowrap px-3 py-2 mr-1 text-xs font-medium rounded-t-md transition-colors ${
                          activeAdvancedTab === option.id 
                            ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 border-t border-l border-r border-gray-200 dark:border-gray-700 border-b-transparent' 
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {option.icon}
                          <span>{option.name}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={activeAdvancedTab} 
                      initial={{ opacity: 0, y: 3 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -3 }} 
                      transition={{ duration: 0.2 }}
                    >
                      {renderAdvancedView()}
                    </motion.div>
                  </AnimatePresence>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  {renderOptimalView()}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {!queryResult && !errorMessage && !isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 dark:bg-gray-800/30 rounded-md border border-gray-200 dark:border-gray-700 text-center"
          >
            <div className="mb-3 text-gray-400 dark:text-gray-500">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Start exploring your data</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-4">
              Ask questions about your data to get insights. Try asking about counts, trends, relationships, or use the examples for ideas.
            </p>
            <button
              onClick={() => setShowExamples(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Lightbulb size={16} />
              <span>See Example Queries</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
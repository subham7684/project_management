"use client"
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  ComposedChart,
  Line,
} from 'recharts';
import { formatFieldName } from '../../processing';
import { motion } from 'framer-motion';
import { VisualizationViewProps, ChartDataItem } from '../types';
import { COLORS, DARK_COLORS } from '../../constants';
import { Calendar, BarChart2, PieChart as PieChartIcon, Clock } from 'lucide-react';

/**
 * Enhanced component for rendering different types of visualizations based on API recommendations
 * with improved handling of complex nested objects
 */
const VisualizationView: React.FC<VisualizationViewProps> = ({ 
  queryResult, 
  visualizationType, 
  fields,
  config = {},
  title,
  question
}) => {
  console.log("VisualizationView props:", { visualizationType, config, title, question });
  console.log("QueryResult:", queryResult);

  // First check for empty or invalid results
  if (!queryResult?.results || !Array.isArray(queryResult.results) || queryResult.results.length === 0) {
    if (queryResult?.error) {
      return (
        <div className="flex flex-col items-center justify-center h-40 p-4">
          <p className="text-sm text-red-500 dark:text-red-400 mb-2">Error processing query:</p>
          <p className="text-xs text-gray-700 dark:text-gray-300 text-center">{queryResult.error}</p>
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-sm text-gray-500 dark:text-gray-400">No data available for visualization</p>
      </div>
    );
  }

  // Check for dark mode
  const isDarkMode = 
    (typeof window !== "undefined" && window?.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) || 
    (typeof document !== "undefined" && document.documentElement.classList.contains('dark'));
  
  // Get colors based on dark mode
  const colors = isDarkMode ? DARK_COLORS : COLORS;

  // Simple helper to format values for display
  const formatValue = (value: any) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return String(value);
  };

  // Helper function to extract a value from a nested object path (e.g. "_id.tag")
  const extractNestedValue = (obj: any, path: string) => {
    if (!path) return undefined;
    
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return undefined;
      }
      current = current[part];
    }
    
    return current;
  };
  
  // Helper function to get a readable label from an item
  const getReadableLabel = (item: any, labelField: string) => {
    if (!labelField) return "Unknown";
    
    // Try to extract the value using the field path
    const value = extractNestedValue(item, labelField);
    
    // If it's a simple value, return it
    if (value === null) return "Null";
    if (value === undefined) return "Unknown";
    if (typeof value !== 'object') return String(value);
    
    // If it's an object, try to create a readable representation
    if (Object.keys(value).length === 0) return "Empty";
    
    return Object.entries(value)
      .map(([k, v]) => `${formatFieldName(k)}: ${v}`)
      .join(", ");
  };

  // BARCHART VISUALIZATION
  if (visualizationType === 'barChart') {
    console.log("Rendering barChart visualization");
    
    // Check if we have grouped data with complex _id objects
    const hasComplexGrouping = queryResult.results.some(r => 
      r && typeof r === 'object' && r._id && typeof r._id === 'object'
    );
    
    // Detect if this is a collection count result or a grouped result
    const hasCollectionCounts = queryResult.results.some(r => 
      r && typeof r === 'object' && r.collection && r.count !== undefined);
    
    // Detect relational data format (e.g., tickets per user)
    const hasRelationalGrouping = queryResult.results.some(r => 
      r && typeof r === 'object' && 
      (r.user_name !== undefined || r.total_tickets_assigned !== undefined || 
       (r._id !== undefined && (r.count !== undefined || r.value !== undefined)))
    );
    
    let chartData: ChartDataItem[];
    let groupBy: string = config.groupBy || '';
    let stackBy: string = config.colorBy || '';
    
    if (hasComplexGrouping) {
      // Handle complex nested objects in _id field
      // This often happens with multi-level grouping like status and tag
      console.log("Processing complex grouped data");
      
      // Determine the groupBy and stackBy fields
      if (!groupBy && config.groupBy) {
        groupBy = config.groupBy;
      } else if (!groupBy) {
        // Try to find appropriate grouping fields from the first result
        const firstItem = queryResult.results[0];
        if (firstItem && firstItem._id && typeof firstItem._id === 'object') {
          const keys = Object.keys(firstItem._id);
          if (keys.length >= 2) {
            // Use first field for grouping, second for stacking
            groupBy = `_id.${keys[1]}`;  // e.g., _id.tag
            stackBy = `_id.${keys[0]}`;  // e.g., _id.status
          } else if (keys.length === 1) {
            groupBy = `_id.${keys[0]}`;
          }
        }
      }
      
      if (!stackBy && config.colorBy) {
        stackBy = config.colorBy;
      }
      
      console.log("Using groupBy:", groupBy, "stackBy:", stackBy);
      
      // Create a map to organize data by group and stack
      const groupedData: Record<string, Record<string, number>> = {};
      const stackValues: Set<string> = new Set();
      
      // First pass: organize data and collect unique stack values
      queryResult.results.forEach(item => {
        // Use getReadableLabel to get formatted group and stack values
        const groupValue = getReadableLabel(item, groupBy);
        const stackValue = stackBy ? getReadableLabel(item, stackBy) : 'Value';
        const countValue = item.count || item.value || 0;
        
        if (!groupedData[groupValue]) {
          groupedData[groupValue] = {};
        }
        
        groupedData[groupValue][stackValue] = (groupedData[groupValue][stackValue] || 0) + countValue;
        stackValues.add(stackValue);
      });
      
      // Convert the grouped data into chart format
      chartData = Object.entries(groupedData).map(([groupName, stackData]) => {
        const result: any = { name: groupName };
        
        // Add properties for each stack
        Array.from(stackValues).forEach(stackValue => {
          result[stackValue] = stackData[stackValue] || 0;
        });
        
        return result;
      });
      
      // Sort data if needed
      if (chartData.length > 1) {
        // Sort by total value for each group
        chartData.sort((a, b) => {
          const totalA = Array.from(stackValues).reduce((sum, key) => sum + (a[key] || 0), 0);
          const totalB = Array.from(stackValues).reduce((sum, key) => sum + (b[key] || 0), 0);
          return totalB - totalA; // Sort descending
        });
      }
      
      // Prepare the stack array for rendering bars
      const stacks = Array.from(stackValues).map((stackValue, index) => ({
        key: stackValue,
        color: colors[index % colors.length]
      }));
      
      console.log("Prepared stack data:", stacks);
      console.log("Prepared chart data:", chartData);
      
      // Get total for summary
      const totalValue = chartData.reduce((sum, item) => {
        return sum + Array.from(stackValues).reduce((subSum, key) => subSum + (item[key] || 0), 0);
      }, 0);
      
      // Use provided title or default
      const chartTitle = title || "Data Comparison";
      
      return (
        <motion.div 
          className="grid grid-cols-1 gap-3"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-2">
                  <BarChart2 size={16} className="text-blue-500 dark:text-blue-400" />
                  {chartTitle}
                </h2>
                <span className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-1 font-medium">
                  {totalValue.toLocaleString()} total
                </span>
              </div>
            </div>
            
            <div className="p-3 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 16, right: 24, left: 16, bottom: 32 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#E5E7EB"} opacity={0.4} />
                  <XAxis 
                    dataKey="name" 
                    angle={chartData.length > 3 ? -45 : 0} 
                    textAnchor={chartData.length > 3 ? "end" : "middle"} 
                    height={chartData.length > 3 ? 65 : 30} 
                    tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: 10 }}
                  />
                  <YAxis 
                    tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: 10 }}
                  />
                  <RechartsTooltip 
                    formatter={(value: any, name: string) => [formatValue(value), name]}
                  />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                  
                  {stacks.map((stack, index) => (
                    <Bar 
                      key={stack.key} 
                      dataKey={stack.key} 
                      stackId="stack" 
                      fill={stack.color} 
                      name={stack.key}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 flex justify-between text-xs text-gray-600 dark:text-gray-300">
              <span>Total: {totalValue.toLocaleString()}</span>
              <span>Categories: {chartData.length}</span>
            </div>
          </div>
        </motion.div>
      );
    }
    else if (hasRelationalGrouping || hasCollectionCounts) {
      // Handle standard grouping formats
      // Determine appropriate fields to group by and aggregate
      const groupByField = config.groupBy || '_id';
      const valueField = config.aggregateField || 'count';
      
      chartData = queryResult.results
        .map((item, index) => {
          // Use getReadableLabel to get the formatted name
          let name = getReadableLabel(item, groupByField);
          
          // Get value from valueField or fallback
          let value;
          if (valueField.includes('.')) {
            value = extractNestedValue(item, valueField);
          } else if (valueField in item) {
            value = item[valueField];
          } else if (item.count !== undefined) {
            value = item.count;
          } else if (item.total_tickets_assigned !== undefined) {
            value = item.total_tickets_assigned;
          } else {
            value = 0;
          }
          
          return {
            name,
            value,
            color: colors[index % colors.length]
          };
        })
        .filter(item => item.name) // Remove items without names
        .sort((a, b) => b.value - a.value); // Sort by value, largest first
    }
    else {
      // Generic data formatting for bar charts
      chartData = queryResult.results
        .map((item, index) => {
          // Use getReadableLabel to extract and format the name
          let name = item._id !== undefined 
            ? getReadableLabel(item, '_id')
            : `Item ${index + 1}`;
          
          // Get the value (usually count, but could be other aggregation field)
          let value = item.count || item.value || 0;
          
          // If we couldn't get a name from _id, try other common fields
          if (name === "Unknown" || name === "Item " + (index + 1)) {
            // Use first string field as name
            const stringKey = Object.keys(item).find(k => typeof item[k] === 'string');
            if (stringKey) {
              name = item[stringKey];
            }
            
            // Use first number field as value if we couldn't find count/value
            if (value === 0) {
              const numberKey = Object.keys(item).find(k => typeof item[k] === 'number' && k !== '_id');
              if (numberKey) {
                value = item[numberKey];
              }
            }
          }
          
          return {
            name,
            value,
            color: colors[index % colors.length]
          };
        })
        .sort((a, b) => b.value - a.value);
    }
    
    // If we somehow couldn't extract proper data, show error
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-40">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Unable to format data for bar chart visualization
          </p>
        </div>
      );
    }
    
    // Get total for summary
    const totalValue = chartData.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0);
    
    // Use provided title or default
    const chartTitle = title || "Data Comparison";
    
    return (
      <motion.div 
        className="grid grid-cols-1 gap-3"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-2">
                <BarChart2 size={16} className="text-blue-500 dark:text-blue-400" />
                {chartTitle}
              </h2>
              <span className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-1 font-medium">
                {totalValue.toLocaleString()} total
              </span>
            </div>
          </div>
          
          <div className="p-3 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 16, right: 24, left: 16, bottom: 32 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#E5E7EB"} opacity={0.4} />
                <XAxis 
                  dataKey="name" 
                  angle={chartData.length > 3 ? -45 : 0} 
                  textAnchor={chartData.length > 3 ? "end" : "middle"} 
                  height={chartData.length > 3 ? 65 : 30} 
                  tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: 10 }}
                />
                <YAxis 
                  tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: 10 }}
                />
                <RechartsTooltip 
                  formatter={(value: any) => [formatValue(value), 'Count']}
                />
                <Bar dataKey="value" name="Count">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 flex justify-between text-xs text-gray-600 dark:text-gray-300">
            <span>Total: {totalValue.toLocaleString()}</span>
            <span>Categories: {chartData.length}</span>
          </div>
        </div>
      </motion.div>
    );
  }
  
  // PIE CHART VISUALIZATION
// PIE CHART VISUALIZATION
if (visualizationType === 'pieChart') {
  console.log("Rendering pieChart visualization");
  
  let chartData = [];
  
  // For standard group by results (most common case with _id and count)
  if (queryResult.results.some(r => r && r._id !== undefined && r.count !== undefined)) {
    chartData = queryResult.results.map((item, index) => {
      // Use _id value directly as name if it's not an object
      let name;
      if (typeof item._id === 'object') {
        if (item._id === null) {
          name = "Null";
        } else {
          // Try to extract a readable name from the _id object
          const idObj = item._id;
          if (idObj.name) name = String(idObj.name);
          else if (idObj.title) name = String(idObj.title);
          else if (idObj.status) name = String(idObj.status);
          else if (idObj.priority) name = String(idObj.priority);
          else if (idObj.severity) name = String(idObj.severity);
          else if (idObj.role) name = String(idObj.role);
          // If nothing found, use the first string/number property
          else {
            for (const [key, val] of Object.entries(idObj)) {
              if (typeof val !== 'object') {
                name = String(val);
                break;
              }
            }
          }
          
          // If still no name found, use a summary
          if (!name) {
            name = JSON.stringify(idObj);
            if (name.length > 30) name = name.substring(0, 27) + '...';
          }
        }
      } else {
        name = String(item._id || "Unknown");
      }
      
      return {
        name,
        value: item.count || 0,
        color: colors[index % colors.length]
      };
    });
  }
  // Handle percentage results (like in the priority percentage query)
  else if (queryResult.results.some(r => r && r.percentage !== undefined)) {
    chartData = queryResult.results.map((item, index) => {
      // Look for field that could be used as name (priority, status, etc.)
      let name = null;
      if (item.priority) name = String(item.priority);
      else if (item.status) name = String(item.status);
      else if (item.severity) name = String(item.severity);
      else if (item.role) name = String(item.role);
      else {
        const nameField = Object.keys(item).find(k => 
          k !== "_id" && k !== "percentage" && typeof item[k] === 'string'
        );
        
        if (nameField) name = String(item[nameField]);
        else name = "Category " + (index + 1);
      }
      
      return {
        name,
        value: item.percentage || 0,
        color: colors[index % colors.length]
      };
    });
  }
  // Handle other data formats
  else {
    chartData = queryResult.results
      .map((item, index) => {
        // Try to find a name field
        let name;
        if ('collection' in item && item.collection) {
          name = formatFieldName(item.collection.toString());
        } else if ('status' in item && item.status) {
          name = String(item.status);
        } else if ('priority' in item && item.priority) {
          name = String(item.priority);
        } else if ('severity' in item && item.severity) {
          name = String(item.severity);
        } else if ('role' in item && item.role) {
          name = String(item.role);
        } else {
          // Use the first non-numeric field as name
          for (const [key, val] of Object.entries(item)) {
            if (key !== '_id' && typeof val === 'string') {
              name = String(val);
              break;
            }
          }
          
          // If still no name found, use a generic name
          if (!name) name = "Category " + (index + 1);
        }
        
        // Try to find a value field
        let value = 0;
        if ('count' in item) value = item.count;
        else if ('value' in item) value = item.value;
        else if ('percentage' in item) value = item.percentage;
        // Look for any numeric field
        else {
          for (const [key, val] of Object.entries(item)) {
            if (typeof val === 'number') {
              value = val;
              break;
            }
          }
        }
        
        return {
          name,
          value,
          color: colors[index % colors.length]
        };
      })
      .filter(item => item.value > 0) // Only include items with positive values
      .sort((a, b) => b.value - a.value); // Sort by value, largest first
  }
  
  // If we somehow got no valid chart data, show an error
  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No data available for pie chart visualization
        </p>
      </div>
    );
  }
  
  // Use provided title or default
  const chartTitle = title || "Distribution";
  
  // Calculate total for percentages
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-2">
              <PieChartIcon size={16} className="text-blue-500 dark:text-blue-400" />
              {chartTitle}
            </h2>
            <span className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-1 font-medium">
              {total.toLocaleString()} total
            </span>
          </div>
        </div>
        
        <div className="p-3 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={chartData} 
                cx="50%" 
                cy="50%" 
                labelLine={false} 
                outerRadius={90} 
                fill="#8884d8" 
                dataKey="value"
                nameKey="name"
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                  if (percent < 0.05) return null; // Don't show tiny segments
                  
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  
                  return (
                    <text 
                      x={x} 
                      y={y} 
                      textAnchor={x > cx ? 'start' : 'end'} 
                      dominantBaseline="central"
                      fill="#FFFFFF"
                      fontSize={10}
                    >
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke={isDarkMode ? "#1F2937" : "#F9FAFB"} strokeWidth={1} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value: any, name: any, props: any) => {
                  return [formatValue(value), props.payload.name];
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconSize={10} 
                iconType="circle"
                formatter={(value, entry, index) => {
                  // Make sure we display the name from the data
                  return <span>{chartData[index]?.name || value}</span>;
                }}
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 flex justify-between text-xs text-gray-600 dark:text-gray-300">
          <span>Total: {total.toLocaleString()}</span>
          <span>Categories: {chartData.length}</span>
        </div>
      </div>
    </div>
  );
}

// Add this in paste-5.txt (VisualizationView.tsx)
// COMBO CHART VISUALIZATION (BAR + LINE)
if (visualizationType === 'comboChart') {
  console.log("Rendering comboChart visualization");
  
  let chartData = [];
  
  // Check for time series data format
  const hasTimeSeriesFormat = queryResult.results.some(r => 
    r && typeof r === 'object' && 
    ((r._id && typeof r._id === 'object' && (r._id.year || r._id.month || r._id.date)) ||
     (r.year && r.month))
  );
  
  if (hasTimeSeriesFormat) {
    // Process time series data
    chartData = queryResult.results.map(item => {
      // Create date label
      let dateLabel = "Unknown";
      
      if (item._id && typeof item._id === 'object') {
        // Handle standard MongoDB date grouping
        if (item._id.year && item._id.month) {
          const year = item._id.year;
          const month = item._id.month - 1; // JS months are 0-indexed
          const day = item._id.day || 1;
          const date = new Date(year, month, day);
          dateLabel = date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: item._id.day ? 'numeric' : undefined
          });
        } else if (item._id.date) {
          const date = new Date(item._id.date);
          dateLabel = date.toLocaleDateString();
        }
      } else if (item.year && item.month) {
        // Handle direct year/month fields
        const date = new Date(item.year, item.month - 1, 1);
        dateLabel = date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short'
        });
      }
      
      // Extract values for the combo chart
      // First find the numeric fields
      const numericFields = Object.entries(item)
        .filter(([key, value]) => 
          key !== '_id' && 
          key !== 'year' && 
          key !== 'month' && 
          key !== 'date' &&
          typeof value === 'number'
        )
        .map(([key]) => key);
      
      // Create the data point
      const dataPoint: any = { name: dateLabel };
      
      // Add all numeric fields
      numericFields.forEach(field => {
        dataPoint[field] = item[field];
      });
      
      return dataPoint;
    }).sort((a, b) => {
      // Try to sort by date if possible
      const dateA = new Date(a.name);
      const dateB = new Date(b.name);
      
      if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
        return dateA.getTime() - dateB.getTime();
      }
      
      // Fall back to string comparison
      return a.name.localeCompare(b.name);
    });
  } else {
    // Handle non-time series data
    chartData = queryResult.results.map((item, index) => {
      // Find a suitable name field
      let name = `Category ${index + 1}`;
      
      if (item.label) {
        name = String(item.label);
      } else if (item.name) {
        name = String(item.name);
      } else if (item.status) {
        name = String(item.status);
      } else if (item.priority) {
        name = String(item.priority);
      } else if (item._id && typeof item._id !== 'object') {
        name = String(item._id);
      }
      
      // Extract all numeric fields
      const dataPoint: any = { name };
      
      Object.entries(item).forEach(([key, value]) => {
        if (key !== '_id' && key !== 'name' && key !== 'label' && typeof value === 'number') {
          dataPoint[key] = value;
        }
      });
      
      return dataPoint;
    });
  }
  
  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No data available for combo chart visualization
        </p>
      </div>
    );
  }
  
  // Determine bar and line fields
  const numericFields = chartData.length > 0 
    ? Object.keys(chartData[0]).filter(key => 
        key !== 'name' && typeof chartData[0][key] === 'number'
      ) 
    : [];
  
  const barField = config.barField || numericFields[0] || '';
  const lineField = config.lineField || numericFields[1] || '';
  
  // If we don't have both a bar and line field, fall back to a bar chart
  if (!barField || !lineField) {
    console.log("Not enough numeric fields for combo chart, falling back to bar chart");
    
    // Use title provided or default
    const chartTitle = title || "Data Comparison";
    
    return (
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-2">
                <BarChart2 size={16} className="text-blue-500 dark:text-blue-400" />
                {chartTitle}
              </h2>
            </div>
          </div>
          
          <div className="p-3 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 16, right: 24, left: 16, bottom: 32 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#E5E7EB"} opacity={0.4} />
                <XAxis 
                  dataKey="name" 
                  angle={chartData.length > 3 ? -45 : 0} 
                  textAnchor={chartData.length > 3 ? "end" : "middle"} 
                  height={chartData.length > 3 ? 65 : 30} 
                  tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: 10 }}
                />
                <YAxis 
                  tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: 10 }}
                />
                <RechartsTooltip 
                  formatter={(value: any, name: any) => [formatValue(value), formatFieldName(name)]}
                />
                <Bar dataKey={barField} fill={colors[0]} name={formatFieldName(barField)} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }
  
  // Use title provided or default
  const chartTitle = title || "Trend Comparison";
  
  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-2">
              <BarChart2 size={16} className="text-blue-500 dark:text-blue-400" />
              {chartTitle}
            </h2>
            <div className="flex space-x-2">
              <span className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-1 font-medium">
                {formatFieldName(barField)}
              </span>
              <span className="text-xs px-2 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full flex items-center gap-1 font-medium">
                {formatFieldName(lineField)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-3 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 16, right: 24, left: 16, bottom: 32 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#E5E7EB"} opacity={0.4} />
              <XAxis 
                dataKey="name" 
                angle={chartData.length > 3 ? -45 : 0} 
                textAnchor={chartData.length > 3 ? "end" : "middle"} 
                height={chartData.length > 3 ? 65 : 30} 
                tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: 10 }}
              />
              <YAxis 
                tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: 10 }}
              />
              <RechartsTooltip 
                formatter={(value: any, name: any) => [formatValue(value), formatFieldName(name)]}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconSize={10} 
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
              <Bar 
                dataKey={barField} 
                fill={colors[0]} 
                name={formatFieldName(barField)} 
                barSize={20}
              />
              <Line 
                type="monotone" 
                dataKey={lineField} 
                stroke={colors[1]} 
                name={formatFieldName(lineField)} 
                strokeWidth={2}
                dot={{ stroke: colors[1], strokeWidth: 2, r: 4 }}
                activeDot={{ stroke: colors[1], strokeWidth: 2, r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 flex justify-between text-xs text-gray-600 dark:text-gray-300">
          <span>Time points: {chartData.length}</span>
          {chartData.length > 0 && (
            <span>Range: {chartData[0].name} - {chartData[chartData.length - 1].name}</span>
          )}
        </div>
      </div>
    </div>
  );
}
  
  // COUNT CHART (SINGLE METRIC) VISUALIZATION
  if (visualizationType === 'countChart' || visualizationType === 'singleMetric') {
    console.log("Rendering countChart visualization");
    
    // For count charts, we expect a single result with a count field
    let countValue = 0;
    let label = '';
    
    // Try to extract the count value
    if (queryResult.results.length === 1) {
      const result = queryResult.results[0];
      // If it has a count field directly
      if ('count' in result) {
        countValue = result.count;
        // Try to get a label if available
        if ('collection' in result) {
          label = formatFieldName(result.collection.toString());
        }
      } 
      // Check for other numeric fields if no count field
      else {
        const numberField = Object.keys(result).find(key => typeof result[key] === 'number');
        if (numberField) {
          countValue = result[numberField];
          label = formatFieldName(numberField);
        }
      }
    }
    // If it's multiple results but we want the total count
    else if (queryResult.results.length > 1) {
      // Check if results have count fields
      if (queryResult.results.every(r => 'count' in r)) {
        countValue = queryResult.results.reduce((sum, r) => sum + r.count, 0);
        label = 'Total Count';
      }
      // Otherwise, just count the number of results
      else {
        countValue = queryResult.results.length;
        label = 'Total Items';
      }
    }
    
    // Use provided title or default
    const chartTitle = title || "Count";
    
    return (
      <motion.div 
        className="grid grid-cols-1 gap-3"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-2">
                <BarChart2 size={16} className="text-blue-500 dark:text-blue-400" />
                {chartTitle}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <p className="text-6xl font-bold text-blue-600 dark:text-blue-400">{countValue.toLocaleString()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">
                {label}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
  
  // TIMELINE/AREA CHART VISUALIZATION
  if (visualizationType === 'timelineChart') {
    console.log("Rendering timelineChart visualization");
    
    // Check for date fields in the results
    const hasDateFields = queryResult.results.some(r => 
      r._id && typeof r._id === 'object' && r._id !== null && 
      ('year' in r._id || 'month' in r._id || 'date' in r._id)
    );
    
    let timelineData = [];
    
    if (hasDateFields) {
      // Format data for timeline chart with date aggregation
      timelineData = queryResult.results
        .map(item => {
          // Get the date components from the _id field
          const dateInfo = item._id;
          let dateObj;
          
          // Create date object based on available fields
          if ('year' in dateInfo && 'month' in dateInfo) {
            const year = dateInfo.year;
            const month = dateInfo.month - 1; // JS months are 0-indexed
            const day = dateInfo.day || 1;
            dateObj = new Date(year, month, day);
          } else if ('date' in dateInfo) {
            dateObj = new Date(dateInfo.date);
          } else {
            // Skip items without proper date info
            return null;
          }
          
          // Format the date
          const formattedDate = dateObj.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: dateInfo.day ? 'numeric' : undefined
          });
          
          return {
            date: dateObj,
            name: formattedDate,
            value: item.count || 0
          };
        })
        .filter(Boolean) // Remove nulls
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    } else {
      // Basic fallback - just show the results as a timeline
      timelineData = queryResult.results.map((item, index) => {
        // Try to extract a value for the timeline
        let value = 0;
        
        if ('count' in item) {
          value = item.count;
        } else {
          // Find a numeric field
          const numericKey = Object.keys(item).find(k => typeof item[k] === 'number');
          if (numericKey) {
            value = item[numericKey];
          }
        }
        
        return {
          name: `Period ${index + 1}`,
          value: value
        };
      });
    }
    
    // Use provided title or default
    const chartTitle = title || "Timeline";
    
    return (
      <motion.div 
        className="grid grid-cols-1 gap-3"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-2">
                <Calendar size={16} className="text-blue-500 dark:text-blue-400" />
                {chartTitle}
              </h2>
              <span className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-1 font-medium">
                <Clock size={10} />
                <span>Time series</span>
              </span>
            </div>
          </div>
          
          <div className="p-3 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 16, right: 24, left: 16, bottom: 32 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#E5E7EB"} opacity={0.4} />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60} 
                  tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: 10 }}
                />
                <YAxis 
                  tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: 10 }}
                />
                <RechartsTooltip 
                  formatter={(value: any) => [formatValue(value), 'Count']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Count"
                  stroke={isDarkMode ? '#60A5FA' : '#3B82F6'}
                  fill={isDarkMode ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.2)'}
                  strokeWidth={2}
                  activeDot={{ r: 5, stroke: isDarkMode ? '#3B82F6' : '#2563EB', strokeWidth: 1 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 flex justify-between text-xs text-gray-600 dark:text-gray-300">
            <span>Data points: {timelineData.length}</span>
            {timelineData.length > 0 && (
              <span>Range: {timelineData[0].name} - {timelineData[timelineData.length - 1].name}</span>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Distribution visualization (similar to bar chart but for categorical data)
  if (visualizationType === 'distribution') {
    console.log("Rendering distribution visualization");
    
    // Similar to bar chart, but specifically for categorical data
    return (
      <div className="flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Distribution visualization is similar to bar chart for this data. Please check the bar chart view.
        </p>
      </div>
    );
  }

  // Default to a message if no specific visualization type matched
  console.log("No specific visualization matched for type:", visualizationType);
  return (
    <div className="flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        No specific visualization available for this data type ({visualizationType}). Please check the Cards or Table view.
      </p>
    </div>
  );
};

export default VisualizationView;
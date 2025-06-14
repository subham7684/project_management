import React, { JSX } from 'react';
import { Field, QueryResult } from '../components/types';
import { THEME } from '../constants';

/**
 * Analyzes result data and extracts field information
 * @param data - Array of data objects to analyze
 * @returns Array of extracted field information with types
 */
export const analyzeFields = (data: Record<string, unknown>[]): Field[] => {
  if (!data || !Array.isArray(data) || data.length === 0) return [];
  
  // Check if we have nested tickets in the data
  const hasNestedTickets = data.some(item => 
    item && typeof item === 'object' && 
    'tickets' in item && 
    Array.isArray(item.tickets) && 
    (item.tickets as any[]).length > 0
  );
  
  // If we have nested tickets, analyze the first ticket in the first item
  if (hasNestedTickets) {
    for (const item of data) {
      if (item && 
          typeof item === 'object' && 
          'tickets' in item && 
          Array.isArray(item.tickets) && 
          (item.tickets as any[]).length > 0) {
        
        // Extract first ticket to analyze its fields
        const firstTicket = (item.tickets as any[])[0];
        
        // Create fields for the metadata from parent
        const metaFields: Field[] = [];
        
        // Add count field if it exists
        if ('count' in item && typeof item.count === 'number') {
          metaFields.push({
            key: '_total_count',
            displayName: 'Total Count',
            type: 'number',
            sortable: true
          });
        }
        
        // Analyze the ticket fields
        const ticketFields = analyzeObject(firstTicket);
        
        // Combine metadata fields with ticket fields
        return [...metaFields, ...ticketFields];
      }
    }
  }
  
  // For normal data, find first non-null item and analyze it
  const firstItem = data.find(item => item && typeof item === 'object') || {};
  return analyzeObject(firstItem);
};

/**
 * Helper function to analyze a single object's fields
 */
function analyzeObject(item: Record<string, unknown>): Field[] {
  const keys = Object.keys(item);
  
  return keys
    .filter(key => !key.startsWith('_')) // Filter out internal fields
    .map(key => {
      // Skip the "tickets" array itself to avoid confusion in the UI
      if (key === 'tickets' && Array.isArray(item[key])) {
        return null;
      }
      
      // Collect sample value
      const value = item[key];
      
      // Default type
      let type: Field['type'] = 'text';
      
      // Determine field type based on key name and value patterns
      if (key === 'id' || key === '_id' || key.endsWith('_id')) {
        type = 'id';
      } else if (key === 'status') {
        type = 'status';
      } else if (key === 'priority') {
        type = 'priority';
      } else if (key === 'severity') {
        type = 'severity';
      } else if (key === 'tags' || (Array.isArray(value))) {
        type = 'tag';
      } else if (key.includes('date') || key.includes('_at')) {
        type = 'date';
      } else if (key === 'email' || key.includes('email')) {
        type = 'email';
      } else if (typeof value === 'number') {
        type = 'number';
      } else if (typeof value === 'boolean') {
        type = 'boolean';
      } else if (typeof value === 'string' && isDateString(value)) {
        type = 'date';
      }
      
      return {
        key,
        displayName: formatFieldName(key),
        type,
        sortable: true
      };
    })
    .filter(Boolean) as Field[]; // Filter out null values
}

/**
 * Check if a string appears to be a date
 */
function isDateString(value: string): boolean {
  // Basic check for ISO format dates or common date formats
  return /^\d{4}-\d{2}-\d{2}|^\d{4}\/\d{2}\/\d{2}/.test(value);
}

/**
 * Formats field names for display
 * @param key - Raw field name
 * @returns Formatted field name
 */
export const formatFieldName = (key: string): string => {
  if (!key) return '';
  
  // Handle common abbreviations
  if (key === 'id') return 'ID';
  
  // Special handling for fields ending with _id
  if (key.endsWith('_id')) {
    const baseName = key.slice(0, -3);
    return formatFieldName(baseName) + ' ID';
  }
  
  // Apply standard formatting
  let formatted = key.replace(/[_-]/g, ' ');
  formatted = formatted.replace(/([a-z])([A-Z])/g, '$1 $2');
  formatted = formatted.replace(/\b\w/g, char => char.toUpperCase());
  formatted = formatted.replace(/\bId\b/g, 'ID');
  return formatted;
};

/**
 * Gets status badge class based on status value
 * @param status - Status value
 * @returns CSS class for the badge
 */
export const getStatusBadgeClass = (status: string): string => {
  const lowerStatus = status.toLowerCase();
  
  if (lowerStatus === 'open' || lowerStatus === 'active') return THEME.badge.green;
  if (lowerStatus === 'closed' || lowerStatus === 'cancelled') return THEME.badge.gray;
  if (lowerStatus === 'in progress') return THEME.badge.blue;
  if (lowerStatus === 'review') return THEME.badge.purple;
  if (lowerStatus === 'blocked' || lowerStatus === 'on hold') return THEME.badge.red;
  if (lowerStatus === 'done' || lowerStatus === 'completed') return THEME.badge.green;
  if (lowerStatus === 'planned') return THEME.badge.yellow;
  
  return THEME.badge.gray;
};

/**
 * Gets priority badge class based on priority value
 * @param priority - Priority value
 * @returns CSS class for the badge
 */
export const getPriorityBadgeClass = (priority: string): string => {
  const lowerPriority = priority.toLowerCase();
  
  if (lowerPriority === 'high' || lowerPriority === 'urgent' || lowerPriority === 'critical') return THEME.badge.red;
  if (lowerPriority === 'medium' || lowerPriority === 'normal') return THEME.badge.yellow;
  if (lowerPriority === 'low') return THEME.badge.green;
  
  return THEME.badge.gray;
};

/**
 * Gets severity badge class based on severity value
 * @param severity - Severity value
 * @returns CSS class for the badge
 */
export const getSeverityBadgeClass = (severity: string): string => {
  const lowerSeverity = severity.toLowerCase();
  
  if (lowerSeverity === 'critical') return THEME.badge.red;
  if (lowerSeverity === 'major') return THEME.badge.yellow;
  if (lowerSeverity === 'minor') return THEME.badge.blue;
  
  return THEME.badge.gray;
};

/**
 * Formats a field value for display based on its type
 * @param value - Field value
 * @param fieldType - Type of field
 * @returns Formatted value as React component
 */
export const formatFieldValue = (value: unknown, fieldType: Field['type']): JSX.Element => {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">—</span>;
  }
  
  // Handle nested objects first, regardless of field type
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    // Special case for date objects in aggregation results
    if ('year' in value && 'month' in value) {
      const year = value.year as number;
      const month = (value.month as number) - 1;
      const day = ('day' in value ? value.day as number : 1);
      const date = new Date(year, month, day);
      return <span>{date.toLocaleDateString()}</span>;
    }
    
    // For other objects, display key-value pairs
    return (
      <div className="text-xs">
        {Object.entries(value).map(([key, val], i) => (
          <div key={i} className="flex justify-between py-0.5">
            <span className="text-gray-500 dark:text-gray-400 mr-1">{formatFieldName(key)}:</span>
            <span className="text-gray-700 dark:text-gray-300">
              {typeof val === 'object' ? (val === null ? '—' : JSON.stringify(val)) : String(val)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  
  // Now handle regular values based on field type
  switch (fieldType) {
    case 'tag':
      if (Array.isArray(value)) {
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((tag, i) => (
              <span key={i} className={`${THEME.badge.base} ${THEME.badge.blue}`}>
                {typeof tag === 'object' ? (tag === null ? '—' : JSON.stringify(tag)) : String(tag)}
              </span>
            ))}
          </div>
        );
      }
      return (
        <span className={`${THEME.badge.base} ${THEME.badge.blue}`}>
          {String(value)}
        </span>
      );
    
    case 'status':
      return (
        <span className={`${THEME.badge.base} ${getStatusBadgeClass(value.toString())}`}>
          {value.toString()}
        </span>
      );
    
    case 'priority':
      return (
        <span className={`${THEME.badge.base} ${getPriorityBadgeClass(value.toString())}`}>
          {value.toString()}
        </span>
      );
    
    case 'severity':
      return (
        <span className={`${THEME.badge.base} ${getSeverityBadgeClass(value.toString())}`}>
          {value.toString()}
        </span>
      );
    
    case 'date':
      try {
        if (typeof value === 'string') {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return <span>{date.toLocaleString()}</span>;
          }
        }
        return <span>{value.toString()}</span>;
      } catch (e) {
        console.log(e);
        return <span>{value.toString()}</span>;
      }
    
    case 'id':
      return <span className="font-mono text-xs">{value.toString()}</span>;
    
    case 'email':
      return <span className="text-blue-600 dark:text-blue-400">{value.toString()}</span>;
    
    case 'boolean':
      return <span>{value ? 'Yes' : 'No'}</span>;
    
    case 'number':
      return <span>{typeof value === 'number' ? value.toLocaleString() : value.toString()}</span>;
    
    default:
      return <span>{typeof value === 'object' ? JSON.stringify(value) : value.toString()}</span>;
  }
};

/**
 * Format a value for plain text display (non-component version)
 */
export function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return '-';
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  
  if (value instanceof Date) {
    return value.toLocaleString();
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) return '-';
    if (value.length <= 3) {
      return value.map(v => formatValue(v)).join(', ');
    }
    return `${value.length} items`;
  }
  
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  return String(value);
}

/**
 * Attempt to extract the collection name from a query result
 * @param queryResult - The result from the NLP query
 * @returns Collection name or null
 */
export const getCollectionFromQuery = (queryResult: QueryResult | null): string | null => {
  if (!queryResult) return null;
  
  // Check if we have metadata with collection info
  if (queryResult.metadata?.collection) {
    return queryResult.metadata.collection;
  }
  
  // Check the query itself
  if (queryResult.query) {
    // If query is an array (multi-collection query), get the first one
    if (Array.isArray(queryResult.query)) {
      const collection = queryResult.query[0]?.collection;
      return typeof collection === 'string' ? collection : null;
    }
    // Single query object
    else if (typeof queryResult.query === 'object' && queryResult.query !== null) {
      const collection = (queryResult.query as any).collection;
      return typeof collection === 'string' ? collection : null;
    }
  }
  
  // If we have results with collection field, use the first one
  if (Array.isArray(queryResult.results) && 
      queryResult.results.length > 0 && 
      typeof queryResult.results[0] === 'object' &&
      queryResult.results[0] !== null) {
    const collection = (queryResult.results[0] as any).collection;
    return typeof collection === 'string' ? collection : null;
  }
  
  return null;
};
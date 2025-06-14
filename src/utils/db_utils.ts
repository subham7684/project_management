import {
  FieldMetadata,
  FieldType,
  ResultMetadata,
  VisualizationOptions,
  VisualizationType
} from "../types/db_query_types";

/**
 * Analyzes data to extract metadata about the fields
 */
export function analyzeResultData(results: Record<string, any>[]): ResultMetadata {
  if (!results || results.length === 0) {
    return {
      fields: [],
      totalCount: 0,
      hasMultipleCollections: false
    };
  }

  // Extract unique field names from all results
  const allFields = new Set<string>();
  results.forEach(item => {
    Object.keys(item).forEach(key => allFields.add(key));
  });

  // Analyze each field to determine its type and other metadata
  const fields: FieldMetadata[] = Array.from(allFields).map(key => {
    // Sample values from the data to determine type
    const sampleValues = results
      .filter(item => key in item)
      .map(item => item[key])
      .filter(val => val !== null && val !== undefined);

    return {
      key,
      displayName: formatFieldName(key),
      type: determineFieldType(key, sampleValues),
      sortable: isSortable(key, sampleValues),
      filterable: isFilterable(key, sampleValues),
      isVisualizable: isVisualizable(key, sampleValues)
    };
  });

  // Sort fields by importance/priority
  const sortedFields = sortFieldsByPriority(fields);

  // Check if data might be from multiple collections
  const hasMultipleCollections = detectMultipleCollections(results);

  // Get collection name if consistent
  let collectionName = undefined;
  if (!hasMultipleCollections) {
    // Try to determine collection name from fields or data patterns
    collectionName = inferCollectionName(results, fields);
  }

  return {
    fields: sortedFields,
    totalCount: results.length,
    collectionName,
    hasMultipleCollections
  };
}

/**
 * Formats a field name for display (e.g. 'user_id' → 'User ID')
 */
export function formatFieldName(key: string): string {
  // Replace underscores and hyphens with spaces
  let formatted = key.replace(/[_-]/g, ' ');
  
  // Convert camelCase to Title Case
  formatted = formatted.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  // Capitalize first letter of each word
  formatted = formatted.replace(/\b\w/g, char => char.toUpperCase());
  
  // Special case for ID/Id at the end of strings
  formatted = formatted.replace(/\bId\b/g, 'ID');
  
  return formatted;
}

/**
 * Determines the data type of a field
 */
function determineFieldType(key: string, values: any[]): FieldType {
  if (values.length === 0) return FieldType.Unknown;

  // Check by field name patterns
  const lowerKey = key.toLowerCase();
  
  // ID fields
  if (lowerKey === 'id' || lowerKey === '_id' || lowerKey.endsWith('_id') || lowerKey.endsWith('id')) {
    return FieldType.Id;
  }
  
  // Status fields
  if (lowerKey === 'status' || lowerKey.endsWith('_status') || lowerKey.includes('state')) {
    return FieldType.Status;
  }
  
  // Priority fields
  if (lowerKey === 'priority' || lowerKey.endsWith('_priority')) {
    return FieldType.Priority;
  }
  
  // Severity fields
  if (lowerKey === 'severity' || lowerKey.endsWith('_severity')) {
    return FieldType.Severity;
  }
  
  // Tag fields
  if (lowerKey === 'tags' || lowerKey === 'tag' || lowerKey.endsWith('_tags')) {
    return FieldType.Tag;
  }
  
  // Date fields
  if (
    lowerKey.includes('date') || 
    lowerKey.includes('time') || 
    lowerKey === 'created_at' || 
    lowerKey === 'updated_at' ||
    lowerKey.endsWith('_at')
  ) {
    return FieldType.Date;
  }

  // Check by value type
  const firstNonNull = values.find(val => val !== null && val !== undefined);
  if (firstNonNull === undefined) return FieldType.Unknown;

  // Array check
  if (Array.isArray(firstNonNull)) {
    return FieldType.Array;
  }
  
  // Type checks
  const type = typeof firstNonNull;
  
  if (type === 'boolean') return FieldType.Boolean;
  if (type === 'number') return FieldType.Number;
  if (type === 'object') return FieldType.Object;
  
  // String check - see if it's a date string
  if (type === 'string') {
    // Check if it's a date string
    if (isDateString(firstNonNull)) {
      return FieldType.Date;
    }
    
    return FieldType.Text;
  }
  
  return FieldType.Unknown;
}

/**
 * Checks if a string is a date format
 */
function isDateString(value: string): boolean {
  // Common date patterns
  if (/^\d{4}-\d{2}-\d{2}(T|\s)/.test(value)) return true;
  
  // Try to parse as date
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Determines if a field can be sorted
 */
function isSortable(key: string, values: any[]): boolean {
  if (values.length === 0) return false;
  
  const firstNonNull = values.find(val => val !== null && val !== undefined);
  if (firstNonNull === undefined) return false;
  
  // Most types can be sorted except for complex objects
  if (typeof firstNonNull === 'object' && !Array.isArray(firstNonNull) && !(firstNonNull instanceof Date)) {
    return false;
  }
  
  return true;
}

/**
 * Determines if a field can be filtered
 */
function isFilterable(key: string, values: any[]): boolean {
  // Most fields can be filtered
  return true;
}

/**
 * Determines if a field can be used for visualization
 */
function isVisualizable(key: string, values: any[]): boolean {
  if (values.length === 0) return false;
  
  // Numeric fields are visualizable
  if (values.some(val => typeof val === 'number')) {
    return true;
  }
  
  // Date fields are visualizable
  const type = determineFieldType(key, values);
  if (type === FieldType.Date) {
    return true;
  }
  
  // Count-based fields (often with numbers in them)
  if (
    key.includes('count') || 
    key.includes('total') || 
    key.includes('sum') || 
    key.includes('number')
  ) {
    return true;
  }
  
  return false;
}

/**
 * Sort fields by importance/priority for display
 */
function sortFieldsByPriority(fields: FieldMetadata[]): FieldMetadata[] {
  // Define priority order for field types
  const typePriority: { [key in FieldType]?: number } = {
    [FieldType.Id]: 5,
    [FieldType.Text]: 10,
    [FieldType.Status]: 15,
    [FieldType.Priority]: 20,
    [FieldType.Severity]: 25,
    [FieldType.Tag]: 30,
    [FieldType.Date]: 35,
    [FieldType.Number]: 40,
    [FieldType.Boolean]: 45,
    [FieldType.Array]: 50,
    [FieldType.Object]: 55,
    [FieldType.Unknown]: 60
  };

  // Define priority order for common field names
  const fieldNamePriority: Record<string, number> = {
    'id': 1,
    '_id': 2,
    'name': 3,
    'title': 4,
    'description': 5,
    'status': 6,
    'priority': 7,
    'severity': 8,
    'tags': 9,
    'created_at': 90,
    'updated_at': 91,
    'created_by': 92,
    'updated_by': 93
  };

  return [...fields].sort((a, b) => {
    // First sort by field name priority if it's a known field
    const aNamePriority = fieldNamePriority[a.key.toLowerCase()] || 50;
    const bNamePriority = fieldNamePriority[b.key.toLowerCase()] || 50;
    
    if (aNamePriority !== bNamePriority) {
      return aNamePriority - bNamePriority;
    }
    
    // Then sort by field type priority
    const aTypePriority = typePriority[a.type] || 100;
    const bTypePriority = typePriority[b.type] || 100;
    
    if (aTypePriority !== bTypePriority) {
      return aTypePriority - bTypePriority;
    }
    
    // Fall back to alphabetical sorting
    return a.key.localeCompare(b.key);
  });
}

/**
 * Detect if results might come from multiple collections
 */
function detectMultipleCollections(results: Record<string, any>[]): boolean {
  if (results.length < 2) return false;
  
  // Check for inconsistent schema across results
  const fieldsInFirst = new Set(Object.keys(results[0]));
  
  // If more than 50% of results have very different fields than the first,
  // this might indicate multiple collections
  let mismatchCount = 0;
  
  for (let i = 1; i < results.length; i++) {
    const currentFields = new Set(Object.keys(results[i]));
    
    // Count fields in first that don't exist in current
    let differentFields = 0;
    for (const field of fieldsInFirst) {
      if (!currentFields.has(field)) {
        differentFields++;
      }
    }
    
    // If more than half the fields are different, count as a mismatch
    if (differentFields > fieldsInFirst.size / 2) {
      mismatchCount++;
    }
  }
  
  // If more than 25% of results have mismatches, likely multiple collections
  return mismatchCount > results.length * 0.25;
}

/**
 * Try to infer the collection name from results
 */
function inferCollectionName(
  results: Record<string, any>[],
  fields: FieldMetadata[]
): string | undefined {
  // Common fields that hint at collection types
  if (fields.some(f => f.key === 'ticket_id')) return 'tickets';
  if (fields.some(f => f.key === 'project_id')) return 'projects';
  if (fields.some(f => f.key === 'sprint_id')) return 'sprints';
  if (fields.some(f => f.key === 'epic_id')) return 'epics';
  if (fields.some(f => f.key === 'user_id')) return 'users';
  if (fields.some(f => f.key === 'comment_id')) return 'comments';
  
  // Try to infer from the presence of defining fields
  if (fields.some(f => f.key === 'tags' || f.key === 'severity')) return 'tickets';
  if (fields.some(f => f.key === 'status' && f.key === 'goal')) return 'sprints';
  
  return undefined;
}

/**
 * Determine if data can be visualized and the best visualization type
 */
export function determineVisualizationOptions(
  results: Record<string, any>[],
  metadata: ResultMetadata
): VisualizationOptions {
  if (!results || results.length === 0) {
    return { canVisualize: false };
  }

  // Check if we have at least one visualizable field
  const visualizableFields = metadata.fields.filter(f => f.isVisualizable);
  if (visualizableFields.length === 0) {
    return { canVisualize: false };
  }

  // Find the best candidate for a value field (numeric)
  const valueField = metadata.fields.find(
    f => f.type === FieldType.Number || 
    f.key.includes('count') || 
    f.key.includes('total')
  );

  if (!valueField) {
    return { canVisualize: false };
  }

  // Find a good dimension field
  // Preference: Status > Category fields > Date > Text (with reasonable cardinality)
  const dimensionField = findBestDimensionField(results, metadata);
  
  if (!dimensionField) {
    return { canVisualize: false };
  }

  // Choose visualization type based on field types and data characteristics
  const vizType = determineVisualizationType(dimensionField, valueField, results);

  return {
    canVisualize: true,
    recommendedType: vizType,
    xKey: dimensionField.key,
    yKey: valueField.key,
    nameKey: dimensionField.key,
    valueKey: valueField.key
  };
}

/**
 * Find the best field to use as a dimension (x-axis/grouping)
 */
function findBestDimensionField(
  results: Record<string, any>[],
  metadata: ResultMetadata
): FieldMetadata | undefined {
  // Get candidate fields
  const candidates = metadata.fields.filter(f => 
    f.type !== FieldType.Number && 
    f.type !== FieldType.Object &&
    f.type !== FieldType.Array &&
    f.type !== FieldType.Id
  );

  if (candidates.length === 0) return undefined;

  // Status or category fields are ideal
  const statusField = candidates.find(f => 
    f.type === FieldType.Status || 
    f.key.toLowerCase().includes('status') ||
    f.key.toLowerCase().includes('category') ||
    f.key.toLowerCase().includes('type')
  );
  
  if (statusField) return statusField;
  
  // Next preference: date fields for trend analysis
  const dateField = candidates.find(f => f.type === FieldType.Date);
  if (dateField) return dateField;
  
  // Next: string fields with reasonable cardinality (not too many unique values)
  const textFields = candidates.filter(f => f.type === FieldType.Text);
  
  for (const field of textFields) {
    // Count distinct values
    const uniqueValues = new Set(results.map(r => r[field.key])).size;
    
    // Ideal if we have between 2 and 10 unique values for visualization
    if (uniqueValues >= 2 && uniqueValues <= 10) {
      return field;
    }
  }
  
  // Fall back to the first text field if nothing better is found
  return textFields[0];
}

/**
 * Determine the best visualization type based on data characteristics
 */
function determineVisualizationType(
  dimensionField: FieldMetadata,
  valueField: FieldMetadata,
  results: Record<string, any>[]
): VisualizationType {
  // Count distinct values in dimension field
  const uniqueValues = new Set(results.map(r => r[dimensionField.key])).size;
  
  // Pie charts are good for categorical data with few categories
  if (
    dimensionField.type === FieldType.Status || 
    dimensionField.type === FieldType.Priority ||
    dimensionField.type === FieldType.Severity ||
    (dimensionField.type === FieldType.Text && uniqueValues <= 7)
  ) {
    return 'pie';
  }
  
  // Line charts are good for time series data
  if (dimensionField.type === FieldType.Date) {
    return 'line';
  }
  
  // Bar charts are good for comparing categories
  return 'bar';
}

/**
 * Format data for visualization based on the selected fields
 */
export function formatDataForVisualization(
  results: Record<string, any>[],
  xKey: string,
  yKey: string
): Record<string, any>[] {
  // Copy the results to avoid mutations
  const formattedData = [...results];
  
  // Format date values if the x-key is a date
  const sampleValue = results[0]?.[xKey];
  if (sampleValue && typeof sampleValue === 'string' && isDateString(sampleValue)) {
    formattedData.forEach(item => {
      // Format dates to be more readable on charts
      const date = new Date(item[xKey]);
      item[xKey] = date.toLocaleDateString();
    });
  }
  
  // Group and aggregate data if needed
  if (formattedData.length > 15) {
    // Implement grouping logic here if needed for large datasets
    // This will depend on the specific requirement
  }
  
  return formattedData;
}
// Define the structure of a MongoDB query result
export interface MongoDBQuery {
  collection: string;
  filter?: Record<string, unknown>;
  aggregation?: Array<Record<string, unknown>>;
  projection?: Record<string, number>;
  sort?: Record<string, number>;
  limit?: number;
}

// Define the structure of the query result returned from the API
export interface QueryResult {
  query: MongoDBQuery | Record<string, unknown>;
  results: Record<string, unknown>[];
  error?: string;
}

// Define visualization types
export type VisualizationType = 'bar' | 'pie' | 'line';

export interface VisualizationOptions {
  canVisualize: boolean;
  recommendedType?: VisualizationType;
  xKey?: string;
  yKey?: string;
  nameKey?: string;
  valueKey?: string;
}

// Define result field types for better rendering
export enum FieldType {
  Text = 'text',
  Number = 'number',
  Date = 'date',
  Boolean = 'boolean',
  Array = 'array',
  Object = 'object',
  Id = 'id',
  Status = 'status',
  Priority = 'priority',
  Severity = 'severity',
  Tag = 'tag',
  Unknown = 'unknown'
}

export interface FieldMetadata {
  key: string;
  displayName: string;
  type: FieldType;
  sortable: boolean;
  filterable: boolean;
  isVisualizable: boolean;
}

export interface ResultMetadata {
  fields: FieldMetadata[];
  totalCount: number;
  collectionName?: string;
  hasMultipleCollections: boolean;
}
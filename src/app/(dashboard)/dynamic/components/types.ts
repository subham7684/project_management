// types.ts
export interface Field {
  key: string;
  displayName: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'id' | 'email' | 'status' | 'priority' | 'severity' | 'tag';
  sortable?: boolean;
}

export interface QueryResult {
  query: any;
  results: Record<string, any>[];
  metadata?: {
    executionTime?: number;
    timestamp?: string;
  };
}

export interface DataTableProps {
  currentItems: Record<string, any>[];
  processedData: Record<string, any>[];
  fields: Field[];
  sortField: string;
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  itemsPerPage: number;
  onSort: (fieldKey: string) => void;
  onPageChange: (newPage: number) => void;
}

export interface CardViewProps {
  currentItems: Record<string, any>[];
  fields: Field[];
}

export interface ExampleQueriesProps {
  examples: string[];
  onExampleClick: (example: string) => void;
}

export interface JsonViewProps {
  queryResult: QueryResult | null;
}

export interface SummaryMetricsProps {
  queryResult: QueryResult | null;
  getCollectionFromQuery: () => string | null;
}

export interface QueryInfoProps {
  queryResult: QueryResult | null;
}

export interface VisualizationViewProps {
  queryResult: QueryResult | null;
  visualizationType: string;
  fields: Field[];
  config?: Record<string, any>;
  title?: string; 
  question?: string;            
}

export interface KeyValueCount {
  [key: string]: number;
}

export interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

export interface ViewOption {
  id: string;
  name: string;
  icon: React.ReactNode;
}
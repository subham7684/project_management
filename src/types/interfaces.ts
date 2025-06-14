export interface User {
  _id: string;
  email: string;
  full_name?: string;
  role: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  online?: boolean;
  last_active?: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: string;
  severity: string;
  tags: string[];
  reporter_id: string;
  assignee_id?: string | null;
  status: "Open" | "In Progress" | "Review" | "Done"; // Strict type for status
  due_date?: string;
  sprint_id?: string | null; // Explicitly allow null for assignment/unassignment
  attachments: string[];
  time_estimate?: number;
  related_tickets: string[];
  epic_id?: string | null; // Explicitly allow null for assignment/unassignment
  story_points?: number;
  watchers: string[];
  environment?: string;
  steps_to_reproduce?: string;
  acceptance_criteria?: string;
  release_version?: string;
  created_at: string;
  updated_at: string;
  project_id?: string; // Added for direct project association
}

export interface TicketHistory {
  ticket_id: string;
  assigned_by: string;
  epic_id: string | null; // Allow explicit null for unassignment
  sprint_id: string | null; // Allow explicit null for unassignment
  timestamp: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  progress: number;
  deadline?: string;
  members: string[];
  admin_users?: string[];
  created_at: string;
  updated_at: string;
}

export interface Sprint {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  project_id: string;
  status: "Active" | "Completed" | "Planned" | "On Hold";
  progress: number;
  members: string[];
  created_at: string;
  updated_at: string;
  ticket_ids?: string[];
  epic_ids?: string[];
}

export interface Epic {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  deadline: string | null;
  assigned_to: string | null;
  project_id: string | null;
  sprint_ids?: string[]; // Changed from sprint_id to match your backend
  ticket_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  ticket_id: string;
  content: string;
  author_id: string;
  created_at: string;
}

// For API responses that include different types of related data
export interface ProjectDetailsResponse {
  project: Project;
  sprints: Sprint[];
  epics: Epic[];
  tickets: Ticket[];
}

export interface Board {
  [status: string]: Ticket[];
}

export interface ReorderResponse {
  detail: string;
}

// Request interfaces for the new assignment endpoints
export interface AssignTicketRequest {
  ticketId: string;
  epicId: string | null;
  sprintId: string | null;
}

export interface BulkAssignRequest {
  ticketIds: string[];
  epicId: string | null;
  sprintId: string | null;
}

// ---------- NEW TYPES FOR VISUALIZATION FEATURE ----------

// Field type for data representation
export interface Field {
  key: string;
  displayName: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'id' | 'email' | 'status' | 'priority' | 'severity' | 'tag';
  sortable?: boolean;
}

// NLP Query result structure
export interface QueryResult {
  query: any;
  results: Record<string, any>[];
  metadata?: {
    executionTime?: number;
    timestamp?: string;
  };
  error?: string;
}

// Configuration options for visualizations
export interface VisualizationConfig {
  groupBy?: string;
  aggregateField?: string;
  aggregateFunction?: string;
  colorBy?: string;
  dateField?: string;
  xAxis?: string;
  yAxis?: string;
  showLegend?: boolean;
  showLabels?: boolean;
  showLine?: boolean;
  showArea?: boolean;
  showValue?: boolean;
  categoryField?: string;
  [key: string]: any;
}

// Response from the visualization API
export interface VisualizationResponse {
  visualizationType: string;
  title: string;
  reason: string;
  config: VisualizationConfig;
}

// Props for DataTable component
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

// Props for CardView component
export interface CardViewProps {
  currentItems: Record<string, any>[];
  fields: Field[];
}

// Props for ExampleQueries component
export interface ExampleQueriesProps {
  examples: string[];
  onExampleClick: (example: string) => void;
}

// Props for JsonView component
export interface JsonViewProps {
  queryResult: QueryResult | null;
}

// Props for SummaryMetrics component
export interface SummaryMetricsProps {
  queryResult: QueryResult | null;
  getCollectionFromQuery: () => string | null;
}

// Props for QueryInfo component
export interface QueryInfoProps {
  queryResult: QueryResult | null;
}

// Props for VisualizationView component
export interface VisualizationViewProps {
  queryResult: QueryResult | null;
  question?: string;
  visualizationType: string;
  fields: Field[];
  config?: VisualizationConfig;
  title?: string;
}

// Helper types for charting
export interface KeyValueCount {
  [key: string]: number;
}

export interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

// View options for UI controls
export interface ViewOption {
  id: string;
  name: string;
  icon: React.ReactNode;
}
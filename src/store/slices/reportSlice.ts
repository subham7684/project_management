import { createSlice, createAsyncThunk, isPending, isFulfilled, isRejected, Action, PayloadAction, AnyAction } from '@reduxjs/toolkit';
import ReportService from '../../services/report';

// Define your API response types based on the actual data structure
export interface FullReport {
  totalTickets: number;
  completedTickets: number;
  openTickets: number;
  inProgressTickets: number;
  blockedTickets: number;
  ticketsThisMonth: number;
  completionRate: number;
  averageResolutionTime: string;
  activeUsers: number;
  totalSprints: number;
  completedSprints: number;
  averageVelocity: number;
  sprintCompletionRate: number;
  teamMembers: number;
  activeDevelopers: number;
  averageTicketsPerDev: number;
  topPerformer: string;
  velocityData: VelocityData[];
  burndownData: BurndownData[];
  ticket_counts: TicketCounts;
  summary_insights: SummaryInsights;
  trends: Trends;
}

interface VelocityData {
  name: string;
  points: number;
}

interface BurndownData {
  day: string;
  ideal: number;
  actual: number;
}

interface TicketCounts {
  total: number;
  open: number;
  in_progress: number;
  review: number;
  done: number;
  blocked: number;
  this_month: number;
}

interface SummaryInsights {
  improved_completion_rate: {
    percentage: number;
    most_improved_area: string;
  };
  resolution_time_alert: {
    average_resolution_time_seconds: number;
    slowest_area: string;
    slowest_area_average_seconds: number;
  };
  team_activity: {
    active_users_count: number;
    top_contributors: string[];
  };
}

interface Trends {
  totalTicketsDelta: string;
  completionRateDelta: string;
  averageResolutionDelta: string;
  activeUsersDelta: string;
  openTicketsDelta: string;
  completedTicketsDelta: string;
  inProgressTicketsDelta: string;
  blockedTicketsDelta: string;
  currentSprintName: string;
  sprintCompletionDelta: string;
  velocityDelta: string;
  completedSprintsContext: string;
  teamMembersDelta: string;
  activeDevsContext: string;
  avgTicketsPerDevDelta: string;
  topPerformerTickets: string;
}

export interface TicketsByType {
  name: string;
  value: number;
  color: string;
}

export interface TicketPriorityTrend {
  name: string;
  high: number;
  medium: number;
  low: number;
}

export interface WeeklyTicketTrend {
  name: string;
  created: number;
  resolved: number;
}

export interface DeveloperProductivity {
  name: string;
  tickets: number;
  commits: number;
}

export interface WorkloadDistribution {
  name: string;
  value: number;
  color: string;
}

// Define the state type
export interface ReportState {
  fullReport: FullReport | null;
  weeklyTicketTrend: WeeklyTicketTrend[];
  ticketsByType: TicketsByType[];
  ticketPriorityTrend: TicketPriorityTrend[];
  developerProductivity: DeveloperProductivity[];
  workloadDistribution: WorkloadDistribution[];
  loading: boolean;
  error: string | null;
}

// Create thunks with proper typing
export const fetchFullReport = createAsyncThunk<FullReport>(
  'reports/fetchFullReport', 
  async () => {
    return await ReportService.getFullReport();
  }
);

export const fetchWeeklyTicketTrend = createAsyncThunk<WeeklyTicketTrend[]>(
  'reports/fetchWeeklyTicketTrend', 
  async () => {
    return await ReportService.getWeeklyTicketTrend();
  }
);

export const fetchTicketsByType = createAsyncThunk<TicketsByType[]>(
  'reports/fetchTicketsByType', 
  async () => {
    return await ReportService.getTicketsByType();
  }
);

export const fetchTicketPriorityTrend = createAsyncThunk<TicketPriorityTrend[]>(
  'reports/fetchTicketPriorityTrend', 
  async () => {
    return await ReportService.getTicketPriorityTrend();
  }
);

export const fetchDeveloperProductivity = createAsyncThunk<DeveloperProductivity[]>(
  'reports/fetchDeveloperProductivity', 
  async () => {
    return await ReportService.getDeveloperProductivity();
  }
);

export const fetchWorkloadDistribution = createAsyncThunk<WorkloadDistribution[]>(
  'reports/fetchWorkloadDistribution', 
  async () => {
    return await ReportService.getWorkloadDistribution();
  }
);

const initialState: ReportState = {
  fullReport: null,
  weeklyTicketTrend: [],
  ticketsByType: [],
  ticketPriorityTrend: [],
  developerProductivity: [],
  workloadDistribution: [],
  loading: false,
  error: null,
};

// Create a type-safe way to check if an action is one of your thunks
type ReportThunkAction = 
  | ReturnType<typeof fetchFullReport>
  | ReturnType<typeof fetchWeeklyTicketTrend>
  | ReturnType<typeof fetchTicketsByType>
  | ReturnType<typeof fetchTicketPriorityTrend>
  | ReturnType<typeof fetchDeveloperProductivity>
  | ReturnType<typeof fetchWorkloadDistribution>;

// Helper functions to type-check actions
const isReportAction = (action: AnyAction): action is ReportThunkAction => 
  action.type.startsWith('reports/');

// Map action types to state properties
const actionToStateMap: Record<string, keyof ReportState> = {
  'fetchFullReport': 'fullReport',
  'fetchWeeklyTicketTrend': 'weeklyTicketTrend',
  'fetchTicketsByType': 'ticketsByType',
  'fetchTicketPriorityTrend': 'ticketPriorityTrend',
  'fetchDeveloperProductivity': 'developerProductivity',
  'fetchWorkloadDistribution': 'workloadDistribution'
};

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action): action is AnyAction => 
          isReportAction(action) && isPending(action),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action): action is PayloadAction<any> => 
          isReportAction(action) && isFulfilled(action),
        (state, action) => {
          state.loading = false;
          
          // Extract the action name (e.g., fetchFullReport)
          const actionType = action.type;
          const actionName = actionType.split('/')[1].split('/')[0];
          
          // Map to the corresponding state property
          const stateProperty = actionToStateMap[actionName];
          
          if (stateProperty) {
            state[stateProperty] = action.payload;
          }
        }
      )
      .addMatcher(
        (action): action is AnyAction => 
          isReportAction(action) && isRejected(action),
        (state, action) => {
          state.loading = false;
          state.error = action.error?.message || 'Something went wrong';
        }
      );
  },
});

// Type-safe selectors
export const selectReports = (state: { report: ReportState }) => state.report;
export const selectFullReport = (state: { report: ReportState }) => state.report.fullReport;
export const selectLoading = (state: { report: ReportState }) => state.report.loading;
export const selectError = (state: { report: ReportState }) => state.report.error;

export default reportSlice.reducer;
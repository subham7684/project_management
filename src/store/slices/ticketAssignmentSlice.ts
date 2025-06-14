import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Ticket, TicketHistory } from "../../types/interfaces";
import ticketAssignmentService, { 
  AssignTicketParams, 
  BulkAssignTicketsParams 
} from "../../services/ticketAssignment";

interface TicketAssignmentState {
  loading: boolean;
  error: string | null;
  ticketHistory: TicketHistory[];
  historyLoading: boolean;
  historyError: string | null;
}

const initialState: TicketAssignmentState = {
  loading: false,
  error: null,
  ticketHistory: [],
  historyLoading: false,
  historyError: null
};

export const assignTicket = createAsyncThunk<
  Ticket,
  AssignTicketParams,
  { rejectValue: string }
>(
  "ticketAssignment/assignTicket",
  async (params, { rejectWithValue }) => {
    try {
      return await ticketAssignmentService.assignTicket(params);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to assign ticket");
    }
  }
);

export const bulkAssignTickets = createAsyncThunk<
  Ticket[],
  BulkAssignTicketsParams,
  { rejectValue: string }
>(
  "ticketAssignment/bulkAssignTickets",
  async (params, { rejectWithValue }) => {
    try {
      return await ticketAssignmentService.bulkAssignTickets(params);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to bulk assign tickets");
    }
  }
);

export const fetchTicketHistory = createAsyncThunk<
  TicketHistory[],
  string,
  { rejectValue: string }
>(
  "ticketAssignment/fetchTicketHistory",
  async (ticketId, { rejectWithValue }) => {
    try {
      return await ticketAssignmentService.getTicketHistory(ticketId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to fetch ticket history");
    }
  }
);

const ticketAssignmentSlice = createSlice({
  name: "ticketAssignment",
  initialState,
  reducers: {
    clearTicketHistory: (state) => {
      state.ticketHistory = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(assignTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignTicket.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(assignTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error assigning ticket";
      })
      .addCase(bulkAssignTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkAssignTickets.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(bulkAssignTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error bulk assigning tickets";
      })
      .addCase(fetchTicketHistory.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchTicketHistory.fulfilled, (state, action: PayloadAction<TicketHistory[]>) => {
        state.historyLoading = false;
        state.ticketHistory = action.payload;
      })
      .addCase(fetchTicketHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload || "Error fetching ticket history";
      });
  }
});

export const { clearTicketHistory } = ticketAssignmentSlice.actions;
export default ticketAssignmentSlice.reducer;
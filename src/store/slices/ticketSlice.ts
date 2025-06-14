// ticketSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Ticket } from "../../types/interfaces";
import ticketService from "../../services/ticket";

interface TicketState {
  tickets: Ticket[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
  loading: boolean;
  error: string | null;
}

interface TicketsResponse {
  tickets: Ticket[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
}

const initialState: TicketState = {
  tickets: [],
  pagination: {
    total: 0,
    page: 1,
    pageSize: 10,
    pageCount: 1
  },
  loading: false,
  error: null
};

export const fetchTickets = createAsyncThunk<
  TicketsResponse, 
  { 
    skip: number; 
    limit: number; 
    query?: string; 
    sort_field?: string; 
    sort_order?: number; 
    status?: string; 
    priority?: string 
  }, 
  { rejectValue: string }
>(
  "ticket/fetchTickets",
  async ({ skip, limit, query, sort_field, sort_order, status, priority }, { rejectWithValue }) => {
    try {
      return await ticketService.fetchTickets(skip, limit, query, sort_field, sort_order, status, priority);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to get Tickets");
    }
  }
);

export const createTicket = createAsyncThunk<Ticket, Partial<Ticket>, { rejectValue: string }>(
  "ticket/createTicket",
  async (ticketData, { rejectWithValue }) => {
    try {
      return await ticketService.createTicket(ticketData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to create Ticket");
    }
  }
);

export const deleteTicket = createAsyncThunk<string, string, { rejectValue: string }>(
  "ticket/deleteTicket",
  async (ticketId, { rejectWithValue }) => {
    try {
      await ticketService.deleteTicket(ticketId);
      return ticketId;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to delete Ticket");
    }
  }
);

const ticketSlice = createSlice({
  name: "ticket",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action: PayloadAction<TicketsResponse>) => {
        state.loading = false;
        state.tickets = action.payload.tickets;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching tickets";
      })
      .addCase(createTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTicket.fulfilled, (state, action: PayloadAction<Ticket>) => {
        state.loading = false;
        state.tickets.push(action.payload);
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error creating ticket";
      })
      .addCase(deleteTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTicket.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.tickets = state.tickets.filter(ticket => ticket.id !== action.payload);
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error deleting ticket";
      });
  }
});

export default ticketSlice.reducer;
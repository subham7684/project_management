import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Ticket } from "../../types/interfaces";
import epicSprintTicketsService from "../../services/epicSprint";

interface EpicSprintTicketsState {
  epicTickets: {
    [epicId: string]: Ticket[];
  };
  sprintTickets: {
    [sprintId: string]: Ticket[];
  };
  loading: boolean;
  error: string | null;
}

const initialState: EpicSprintTicketsState = {
  epicTickets: {},
  sprintTickets: {},
  loading: false,
  error: null
};

export const fetchEpicTickets = createAsyncThunk<
  { epicId: string; tickets: Ticket[] },
  string,
  { rejectValue: string }
>(
  "epicSprintTickets/fetchEpicTickets",
  async (epicId, { rejectWithValue }) => {
    try {
      const tickets = await epicSprintTicketsService.getEpicTickets(epicId);
      return { epicId, tickets };
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to fetch epic tickets");
    }
  }
);

export const fetchSprintTickets = createAsyncThunk<
  { sprintId: string; tickets: Ticket[] },
  string,
  { rejectValue: string }
>(
  "epicSprintTickets/fetchSprintTickets",
  async (sprintId, { rejectWithValue }) => {
    try {
      const tickets = await epicSprintTicketsService.getSprintTickets(sprintId);
      return { sprintId, tickets };
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to fetch sprint tickets");
    }
  }
);

const epicSprintTicketsSlice = createSlice({
  name: "epicSprintTickets",
  initialState,
  reducers: {
    clearEpicTickets: (state, action: PayloadAction<string>) => {
      delete state.epicTickets[action.payload];
    },
    clearSprintTickets: (state, action: PayloadAction<string>) => {
      delete state.sprintTickets[action.payload];
    },
    clearAllEpicTickets: (state) => {
      state.epicTickets = {};
    },
    clearAllSprintTickets: (state) => {
      state.sprintTickets = {};
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEpicTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEpicTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.epicTickets[action.payload.epicId] = action.payload.tickets;
      })
      .addCase(fetchEpicTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching epic tickets";
      })
      .addCase(fetchSprintTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSprintTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.sprintTickets[action.payload.sprintId] = action.payload.tickets;
      })
      .addCase(fetchSprintTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching sprint tickets";
      });
  }
});

export const {
  clearEpicTickets,
  clearSprintTickets,
  clearAllEpicTickets,
  clearAllSprintTickets
} = epicSprintTicketsSlice.actions;

export default epicSprintTicketsSlice.reducer;
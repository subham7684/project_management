import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Sprint } from "../../types/interfaces";
import sprintService from "../../services/sprint";

interface SprintState {
  sprints: Sprint[];
  loading: boolean;
  error: string | null;
}

const initialState: SprintState = {
  sprints: [],
  loading: false,
  error: null
};

export const fetchSprints = createAsyncThunk<Sprint[], { skip: number; limit: number }, { rejectValue: string }>(
  "sprint/fetchSprints",
  async ({ skip, limit }, { rejectWithValue }) => {
    try {
      return await sprintService.fetchSprints(skip, limit);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to get Sprints");
    }
  }
);

export const createSprint = createAsyncThunk<Sprint, Partial<Sprint>, { rejectValue: string }>(
  "sprint/createSprint",
  async (data, { rejectWithValue }) => {
    try {
      return await sprintService.createSprint(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to create Sprints");
    }
  }
);

const sprintSlice = createSlice({
  name: "sprint",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSprints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSprints.fulfilled, (state, action: PayloadAction<Sprint[]>) => {
        state.loading = false;
        state.sprints = action.payload;
      })
      .addCase(fetchSprints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching sprints";
      })
      .addCase(createSprint.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSprint.fulfilled, (state, action: PayloadAction<Sprint>) => {
        state.loading = false;
        state.sprints.push(action.payload);
      })
      .addCase(createSprint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error creating sprint";
      });
  }
});

export default sprintSlice.reducer

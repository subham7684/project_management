import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Epic } from "../../types/interfaces";
import epicService from "../../services/epic";

interface EpicState {
  epics: Epic[];
  loading: boolean;
  error: string | null;
}

const initialState: EpicState = {
  epics: [],
  loading: false,
  error: null
};

export const fetchEpics = createAsyncThunk<Epic[], { skip: number; limit: number }, { rejectValue: string }>(
  "epic/fetchEpics",
  async ({ skip, limit }, { rejectWithValue }) => {
    try {
      return await epicService.fetchEpics(skip, limit);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to get Epics");
    }
  }
);

export const createEpic = createAsyncThunk<Epic, Partial<Epic>, { rejectValue: string }>(
  "epic/createEpic",
  async (data, { rejectWithValue }) => {
    try {
      return await epicService.createEpic(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to Create Epics");
    }
  }
);

const epicSlice = createSlice({
  name: "epic",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEpics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEpics.fulfilled, (state, action: PayloadAction<Epic[]>) => {
        state.loading = false;
        state.epics = action.payload;
      })
      .addCase(fetchEpics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching epics";
      })
      .addCase(createEpic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEpic.fulfilled, (state, action: PayloadAction<Epic>) => {
        state.loading = false;
        state.epics.push(action.payload);
      })
      .addCase(createEpic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error creating epic";
      });
  }
});

export default epicSlice.reducer

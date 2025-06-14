import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { QueryResult, VisualizationResponse } from "../../types/interfaces";
import visualizationService from "../../services/openai";

interface VisualizationState {
  visualizationData: VisualizationResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: VisualizationState = {
  visualizationData: null,
  loading: false,
  error: null
};

export const fetchVisualizationRecommendation = createAsyncThunk<
  VisualizationResponse, 
  { queryResult: QueryResult; question: string }, 
  { rejectValue: string }
>(
  "visualization/fetchRecommendation",
  async ({ queryResult, question }, { rejectWithValue }) => {
    try {
      return await visualizationService.getVisualizationType(queryResult, question);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to get visualization recommendation");
    }
  }
);

const visualizationSlice = createSlice({
  name: "visualization",
  initialState,
  reducers: {
    clearVisualizationData: (state) => {
      state.visualizationData = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVisualizationRecommendation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchVisualizationRecommendation.fulfilled, 
        (state, action: PayloadAction<VisualizationResponse>) => {
          state.loading = false;
          state.visualizationData = action.payload;
        }
      )
      .addCase(fetchVisualizationRecommendation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching visualization recommendation";
      });
  }
});

export const { clearVisualizationData } = visualizationSlice.actions;
export default visualizationSlice.reducer;
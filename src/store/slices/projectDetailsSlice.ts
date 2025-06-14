import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Project, Sprint, Epic, Ticket } from "@/types/interfaces";
import ProjectService, { ProjectDetailsResponse } from "@/services/project";

interface ProjectDetailsState {
  currentProject: Project | null;
  projectSprints: Sprint[];
  projectEpics: Epic[];
  projectTickets: Ticket[];
  loading: boolean;
  error: string | null;
}

const initialState: ProjectDetailsState = {
  currentProject: null,
  projectSprints: [],
  projectEpics: [],
  projectTickets: [],
  loading: false,
  error: null
};

export const fetchProjectDetails = createAsyncThunk<
  ProjectDetailsResponse,
  string,
  { rejectValue: string }
>(
  "projectDetails/fetchProjectDetails",
  async (projectId, { rejectWithValue }) => {
    try {
      console.log("Fetching project details in thunk for ID:", projectId);
      return await ProjectService.getProjectDetails(projectId);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch project details";
      console.error("Error in fetchProjectDetails thunk:", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const projectDetailsSlice = createSlice({
  name: "projectDetails",
  initialState,
  reducers: {
    clearProjectDetails: (state) => {
      state.currentProject = null;
      state.projectSprints = [];
      state.projectEpics = [];
      state.projectTickets = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectDetails.fulfilled, (state, action: PayloadAction<ProjectDetailsResponse>) => {
        state.loading = false;
        state.currentProject = action.payload.project;
        // Ensure arrays are always defined, even if backend returns null
        state.projectSprints = action.payload.sprints || [];
        state.projectEpics = action.payload.epics || [];
        state.projectTickets = action.payload.tickets || [];
      })
      .addCase(fetchProjectDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unknown error fetching project details";
        console.error("Project details fetch rejected:", action.payload);
      });
  }
});

export const { clearProjectDetails } = projectDetailsSlice.actions;
export default projectDetailsSlice.reducer;
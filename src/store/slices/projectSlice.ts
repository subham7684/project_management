import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Project } from "../../types/interfaces";
import projectService from "../../services/project";

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  totalProjects: number;
  pagination: {
    skip: number;
    limit: number;
  };
}

const initialState: ProjectState = {
  projects: [],
  loading: false,
  error: null,
  totalProjects: 0,
  pagination: {
    skip: 0,
    limit: 10
  }
};

export const fetchProjects = createAsyncThunk<
  Project[],
  { 
    skip: number; 
    limit: number; 
    query?: string; 
    sort_field?: string; 
    sort_order?: number; 
    status?: string 
  },
  { rejectValue: string }
>(
  "project/fetchProjects",
  async ({ skip, limit, query, sort_field, sort_order, status }, { rejectWithValue }) => {
    try {
      return await projectService.fetchProjects(skip, limit, query, sort_field, sort_order, status);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to get Projects");
    }
  }
);

export const createProject = createAsyncThunk<
  Project,
  Partial<Project>,
  { rejectValue: string }
>(
  "project/createProject",
  async (data, { rejectWithValue }) => {
    try {
      return await projectService.createProject(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to Create Project");
    }
  }
);

export const updateProject = createAsyncThunk<
  Project,
  { projectId: string; projectData: Partial<Project> },
  { rejectValue: string }
>(
  "project/updateProject",
  async ({ projectId, projectData }, { rejectWithValue }) => {
    try {
      return await projectService.updateProject(projectId, projectData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to update project");
    }
  }
);

export const deleteProject = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "project/deleteProject",
  async (projectId, { rejectWithValue }) => {
    try {
      await projectService.deleteProject(projectId);
      return projectId;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to delete project");
    }
  }
);

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setPagination: (state, action: PayloadAction<{ skip: number; limit: number }>) => {
      state.pagination = action.payload;
    },
    clearProjectErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.loading = false;
        state.projects = action.payload;
        state.totalProjects = action.payload.length;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching projects";
      })
      
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.loading = false;
        state.projects.unshift(action.payload); // Add to beginning of array
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error creating project";
      })
      
      // Update Project
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.loading = false;
        state.projects = state.projects.map(project => 
          project.id === action.payload.id ? action.payload : project
        );
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error updating project";
      })
      
      // Delete Project
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.projects = state.projects.filter((project) => project.id !== action.payload);
        state.totalProjects -= 1;
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error deleting project";
      });
  }
});

export const { setPagination, clearProjectErrors } = projectSlice.actions;
export default projectSlice.reducer;
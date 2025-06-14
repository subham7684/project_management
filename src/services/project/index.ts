// src/services/project.ts

import api from "../axiosInstance";
import { ENDPOINTS } from "../network/endpoints";
import { getHeaders } from "../network/getHeaders";
import { Epic, Project, Sprint, Ticket } from "../../types/interfaces";

interface StandardResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
  meta?: Record<string, any>;
}

export interface ProjectDetailsResponse {
  project: Project;
  sprints: Sprint[];
  epics: Epic[];
  tickets: Ticket[];
}

const ProjectService = {
  async searchProjects(
    query?: string,
    skip: number = 0,
    limit: number = 10,
    sort_field?: string,
    sort_order?: number,
    status?: string
  ): Promise<Project[]> {
    const headers = getHeaders();
    const params: any = { query, skip, limit };
    if (sort_field) params.sort_field = sort_field;
    if (sort_order !== undefined) params.sort_order = sort_order;
    if (status) params.status = status;
    
    const response = await api.get<StandardResponse<Project[]>>(`${ENDPOINTS.PROJECT_SEARCH}/`, {
      headers,
      params,
    });
    
    return response.data.data || [];
  },
  
  async fetchProjects(
    skip: number = 0,
    limit: number = 10,
    query?: string,
    sort_field?: string,
    sort_order?: number,
    status?: string
  ): Promise<Project[]> {
    const headers = getHeaders();
    const params: any = { skip, limit };
    if (query) params.query = query;
    if (sort_field) params.sort_field = sort_field;
    if (sort_order !== undefined) params.sort_order = sort_order;
    if (status) params.status = status;
    
    const response = await api.get<StandardResponse<Project[]>>(`${ENDPOINTS.PROJECTS}/`, {
      headers,
      params,
    });
    return response.data.data || [];
  },

  async fetchMyProjects(
    skip: number = 0,
    limit: number = 10,
    query?: string,
    sort_field?: string,
    sort_order?: number,
    status?: string
  ): Promise<Project[]> {
    const headers = getHeaders();
    const params: any = { skip, limit };
    if (query) params.query = query;
    if (sort_field) params.sort_field = sort_field;
    if (sort_order !== undefined) params.sort_order = sort_order;
    if (status) params.status = status;
    
    const response = await api.get<StandardResponse<Project[]>>(`${ENDPOINTS.PROJECTS}/my-projects`, {
      headers,
      params,
    });
    return response.data.data || [];
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    const headers = getHeaders();
    const response = await api.post<StandardResponse<Project>>(
      ENDPOINTS.PROJECTS, 
      data, 
      { headers }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to create project");
    }
    
    return response.data.data;
  },

  async updateProject(projectId: string, data: Partial<Project>): Promise<Project> {
    const headers = getHeaders();
    const response = await api.put<StandardResponse<Project>>(
      `${ENDPOINTS.PROJECTS}/${projectId}`, 
      data, 
      { headers }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update project");
    }
    
    return response.data.data;
  },

  async deleteProject(projectId: string): Promise<void> {
    const headers = getHeaders();
    const response = await api.delete<StandardResponse<null>>(
      `${ENDPOINTS.PROJECTS}/${projectId}`, 
      { headers }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete project");
    }
  },

async getProjectDetails(projectId: string): Promise<ProjectDetailsResponse> {
  const headers = getHeaders();
  
  console.log("Getting project details for ID:", projectId);
  
  try {
    const response = await api.get<StandardResponse<ProjectDetailsResponse>>(
      `${ENDPOINTS.PROJECTS}/${projectId}/full-details`, 
      { headers }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to get project details");
    }
    
    if (!response.data.data || !response.data.data.project) {
      console.error("Invalid response structure:", response.data);
      throw new Error("Invalid project data received from the server");
    }
    
    const result = response.data.data;
    return {
      project: result.project,
      sprints: result.sprints || [],
      epics: result.epics || [],
      tickets: result.tickets || []
    };
  } catch (error) {
    console.error("Error fetching project details:", error);
    throw error;
  }
},
  
  async addUserToProject(projectId: string, userId: string, isAdmin: boolean = false): Promise<Project> {
    const headers = getHeaders();
    const response = await api.post<StandardResponse<Project>>(
      `${ENDPOINTS.PROJECTS}/${projectId}/users/${userId}?is_admin=${isAdmin}`,
      {},
      { headers }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to add user to project");
    }
    
    return response.data.data;
  },
  
  async removeUserFromProject(projectId: string, userId: string): Promise<Project> {
    const headers = getHeaders();
    const response = await api.delete<StandardResponse<Project>>(
      `${ENDPOINTS.PROJECTS}/${projectId}/users/${userId}`,
      { headers }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to remove user from project");
    }
    
    return response.data.data;
  }
};

export default ProjectService;
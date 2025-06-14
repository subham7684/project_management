import api from "../axiosInstance";
import { ENDPOINTS } from "../network/endpoints";
import { getHeaders } from "../network/getHeaders";
import { Sprint } from "../../types/interfaces";

const SprintService = {

  async searchSprints(query?: string, skip: number = 0, limit: number = 10): Promise<Sprint[]> {
    const headers = getHeaders();
    const response = await api.get(`${ENDPOINTS.SPRINT_SEARCH}/`, {
      headers,
      params: { query, skip, limit }
    });
    return response.data;
  },

  async fetchSprints(skip: number = 0, limit: number = 10): Promise<Sprint[]> {
    const headers = getHeaders();
    const response = await api.get<Sprint[]>(`${ENDPOINTS.SPRINTS}/?skip=${skip}&limit=${limit}`, { headers });
    return response.data;
  },

  async createSprint(data: Partial<Sprint>): Promise<Sprint> {
    const headers = getHeaders();
    const response = await api.post<Sprint>(ENDPOINTS.SPRINTS, data, { headers });
    return response.data;
  },

  async updateSprint(sprintId: string, data: Partial<Sprint>): Promise<Sprint> {
    const headers = getHeaders();
    const response = await api.put<Sprint>(`${ENDPOINTS.SPRINTS}/${sprintId}`, data, { headers });
    return response.data;
  },

  async deleteSprint(sprintId: string): Promise<void> {
    const headers = getHeaders();
    await api.delete(`${ENDPOINTS.SPRINTS}/${sprintId}`, { headers });
  }
};

export default SprintService;

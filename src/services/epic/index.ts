import api from "../axiosInstance";
import { ENDPOINTS } from "../network/endpoints";
import { getHeaders } from "../network/getHeaders";
import { Epic } from "../../types/interfaces";

const EpicService = {
  async fetchEpics(skip: number = 0, limit: number = 10): Promise<Epic[]> {
    const headers = getHeaders();
    const response = await api.get<Epic[]>(`${ENDPOINTS.EPICS}/?skip=${skip}&limit=${limit}`, { headers });
    return response.data;
  },

  async createEpic(data: Partial<Epic>): Promise<Epic> {
    const headers = getHeaders();
    const response = await api.post<Epic>(`${ENDPOINTS.EPICS}/`, data, { headers });
    return response.data;
  },

  async updateEpic(epicId: string, data: Partial<Epic>): Promise<Epic> {
    const headers = getHeaders();
    const response = await api.put<Epic>(`${ENDPOINTS.EPICS}/${epicId}`, data, { headers });
    return response.data;
  },

  async deleteEpic(epicId: string): Promise<void> {
    const headers = getHeaders();
    await api.delete(`${ENDPOINTS.EPICS}/${epicId}`, { headers });
  }
};

export default EpicService;

import api from "../axiosInstance";
import { ENDPOINTS } from "../network/endpoints";
import { getHeaders } from "../network/getHeaders";
import { Ticket } from "../../types/interfaces";

const EpicSprintTicketsService = {
  async getEpicTickets(epicId: string): Promise<Ticket[]> {
    const headers = getHeaders();
    const response = await api.get(`${ENDPOINTS.EPICS}/${epicId}/tickets`, { headers });
    return response.data;
  },

  async getSprintTickets(sprintId: string): Promise<Ticket[]> {
    const headers = getHeaders();
    const response = await api.get(`${ENDPOINTS.SPRINTS}/${sprintId}/tickets`, { headers });
    return response.data;
  }
};

export default EpicSprintTicketsService;
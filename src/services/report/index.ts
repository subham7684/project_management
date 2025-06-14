import api from "../axiosInstance";
import { ENDPOINTS } from "../network/endpoints";
import { getHeaders } from "../network/getHeaders";

const ReportService = {
  async getFullReport() {
    const headers = getHeaders();
    const response = await api.get(`${ENDPOINTS.REPORT}/full`, { headers });
    return response.data;
  },

  async getWeeklyTicketTrend() {
    const headers = getHeaders();
    const response = await api.get(`${ENDPOINTS.REPORT}/weekly-ticket-trend`, { headers });
    return response.data;
  },

  async getTicketsByType() {
    const headers = getHeaders();
    const response = await api.get(`${ENDPOINTS.REPORT}/tickets-by-type`, { headers });
    return response.data;
  },

  async getTicketPriorityTrend() {
    const headers = getHeaders();
    const response = await api.get(`${ENDPOINTS.REPORT}/ticket-priority-trend`, { headers });
    return response.data;
  },

  async getDeveloperProductivity() {
    const headers = getHeaders();
    const response = await api.get(`${ENDPOINTS.REPORT}/developer-productivity`, { headers });
    return response.data;
  },

  async getWorkloadDistribution() {
    const headers = getHeaders();
    const response = await api.get(`${ENDPOINTS.REPORT}/workload-distribution`, { headers });
    return response.data;
  },
};

export default ReportService;

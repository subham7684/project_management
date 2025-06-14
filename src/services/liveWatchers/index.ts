import api from "../axiosInstance";
import { ENDPOINTS } from "../network/endpoints";
import { getHeaders } from "../network/getHeaders";

interface LiveWatchersResponse {
  entity_type: string;
  entity_id: string;
  connections: number;
  users: number;
}

const LiveWatchersService = {
  // Get live watchers for specific entity
  async getLiveWatchers(entityType: string, entityId: string): Promise<LiveWatchersResponse> {
    const headers = getHeaders();
    const response = await api.get<LiveWatchersResponse>(
      `${ENDPOINTS.LIVE_WATCHERS}/${entityType}/${entityId}`, 
      { headers }
    );
    return response.data;
  },

  // Alternative endpoint for tickets (backward compatibility)
  async getTicketLiveWatchers(ticketId: string): Promise<LiveWatchersResponse> {
    const headers = getHeaders();
    const response = await api.get<LiveWatchersResponse>(
      `${ENDPOINTS.TICKETS}/${ticketId}/live-watchers`, 
      { headers }
    );
    return response.data;
  }
};

export default LiveWatchersService;
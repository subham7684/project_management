import api from "../axiosInstance";
import { ENDPOINTS } from "../network/endpoints";
import { getHeaders } from "../network/getHeaders";
import { Ticket, TicketHistory, AssignTicketRequest, BulkAssignRequest } from "../../types/interfaces";

const TicketAssignmentService = {
  // Assign a single ticket to an epic or sprint
  async assignTicket({ ticketId, epicId, sprintId }: AssignTicketRequest): Promise<Ticket> {
    const headers = getHeaders();
    
    // Build query parameters
    const params = new URLSearchParams();
    if (epicId !== null) params.append('epic_id', epicId);
    if (sprintId !== null) params.append('sprint_id', sprintId);
    
    const response = await api.put(
      `${ENDPOINTS.TICKETS}/${ticketId}/assign?${params.toString()}`,
      null,
      { headers }
    );
    
    return response.data;
  },
  
  // Bulk assign multiple tickets to an epic or sprint
  async bulkAssignTickets({ ticketIds, epicId, sprintId }: BulkAssignRequest): Promise<Ticket[]> {
    const headers = getHeaders();
    
    // Build query parameters
    const params = new URLSearchParams();
    if (epicId !== null) params.append('epic_id', epicId);
    if (sprintId !== null) params.append('sprint_id', sprintId);
    
    const response = await api.post(
      `${ENDPOINTS.TICKETS}/bulk-assign?${params.toString()}`,
      ticketIds,
      { headers }
    );
    
    return response.data;
  },
  
  // Get ticket assignment history
  async getTicketHistory(ticketId: string): Promise<TicketHistory[]> {
    const headers = getHeaders();
    const response = await api.get(
      `${ENDPOINTS.TICKETS}/${ticketId}/history`,
      { headers }
    );
    
    return response.data;
  }
};

export default TicketAssignmentService;
import api from "../axiosInstance";
import { ENDPOINTS } from "../network/endpoints";
import { getHeaders } from "../network/getHeaders";
import { Ticket } from "../../types/interfaces";

export interface Board {
  [status: string]: Ticket[];
}

// Define the standardized API response interfaces
interface StandardResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
  meta?: unknown;
}

export interface ReorderResponse {
  reordered: boolean;
  ticket_count: number;
}

const BoardService = {
  async getBoard(): Promise<Board> {
    const headers = getHeaders();
    const response = await api.get<StandardResponse<Board>>(`${ENDPOINTS.BOARD}/`, { headers });
    console.log("Board data", JSON.stringify(response?.data));
    
    // Extract the actual board data from the standardized response
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    
    // If the response doesn't match the expected format, return an empty board
    return {
      'Open': [],
      'In Progress': [],
      'Review': [],
      'Done': []
    };
  },

  async moveTicket(ticketId: string, newStatus: string): Promise<Ticket> {
    const headers = getHeaders();
    const response = await api.put<StandardResponse<Ticket>>(
      `${ENDPOINTS.BOARD}/move?ticket_id=${ticketId}&new_status=${newStatus}`,
      null,
      { headers }
    );
    
    // Extract the ticket data from the standardized response
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data?.message || 'Failed to move ticket');
  },

  async reorderTickets(ticketIds: string[]): Promise<ReorderResponse> {
    const headers = getHeaders();
    const response = await api.put<StandardResponse<ReorderResponse>>(
      `${ENDPOINTS.BOARD}/reorder`, 
      { ticket_ids: ticketIds }, // Make sure you're sending the correct format
      { headers }
    );
    
    // Extract the reorder data from the standardized response
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data?.message || 'Failed to reorder tickets');
  }
};

export default BoardService;
import api from "../axiosInstance";
import { ENDPOINTS } from "../network/endpoints";
import { getHeaders } from "../network/getHeaders";
import { Ticket, Comment, TicketHistory, User } from "../../types/interfaces";

interface TicketParams {
  skip: number;
  limit: number;
  query?: string;
  sort_field?: string;
  sort_order?: number;
  status?: string;
  priority?: string;
  project_id?: string;
  sprint_id?: string;
  epic_id?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
  meta?: {
    pagination?: {
      total: number;
      page: number;
      pageSize: number;
      pageCount: number;
    }
  };
}

// New interface for ticket details
interface TicketDetails {
  ticket: Ticket;
  comments: Comment[];
  history: TicketHistory[];
  watchers: User[];
  relatedTickets: Ticket[];
}

const TicketService = {
  async searchTickets(query?: string, status?: string, priority?: string, skip: number = 0, limit: number = 10): Promise<{tickets: Ticket[], pagination: any}> {
    const headers = getHeaders();
    const response = await api.get<ApiResponse<Ticket[]>>(`${ENDPOINTS.TICKET_SEARCH}/`, {
      headers,
      params: { query, status, priority, skip, limit }
    });
    
    return {
      tickets: response.data.data || [],
      pagination: response.data.meta?.pagination || {
        total: 0,
        page: 1,
        pageSize: limit,
        pageCount: 1
      }
    };
  },

  async fetchTickets(skip: number = 0, limit: number = 10, query?: string, sort_field?: string, sort_order?: number, status?: string, priority?: string, project_id?: string, sprint_id?: string, epic_id?: string): Promise<{tickets: Ticket[], pagination: any}> {
    const headers = getHeaders();
    const params: TicketParams = { skip, limit };
    if (query) params.query = query;
    if (sort_field) params.sort_field = sort_field;
    if (sort_order !== undefined) params.sort_order = sort_order;
    if (status) params.status = status;
    if (priority) params.priority = priority;
    if (project_id) params.project_id = project_id;
    if (sprint_id) params.sprint_id = sprint_id;
    if (epic_id) params.epic_id = epic_id;

    const response = await api.get<ApiResponse<Ticket[]>>(`${ENDPOINTS.TICKETS}/`, { headers, params });
    
    return {
      tickets: response.data.data || [],
      pagination: response.data.meta?.pagination || {
        total: 0,
        page: 1,
        pageSize: limit,
        pageCount: 1
      }
    };
  },

  async getTicket(ticketId: string): Promise<Ticket> {
    const headers = getHeaders();
    const response = await api.get<ApiResponse<Ticket>>(`${ENDPOINTS.TICKETS}/${ticketId}`, { headers });
    return response.data.data;
  },

  // New function to get detailed ticket information
  async getTicketDetails(ticketId: string): Promise<TicketDetails> {
    const headers = getHeaders();
    const response = await api.get<ApiResponse<TicketDetails>>(`${ENDPOINTS.TICKETS}/${ticketId}/details`, { headers });
    return response.data.data;
  },

  async createTicket(data: Partial<Ticket>): Promise<Ticket> {
    const headers = getHeaders();
    const response = await api.post<ApiResponse<Ticket>>(ENDPOINTS.TICKETS, data, { headers });
    return response.data.data;
  },

  async updateTicket(ticketId: string, data: Partial<Ticket>): Promise<Ticket> {
    const headers = getHeaders();
    const response = await api.put<ApiResponse<Ticket>>(`${ENDPOINTS.TICKETS}/${ticketId}`, data, { headers });
    return response.data.data;
  },

  async deleteTicket(ticketId: string): Promise<void> {
    const headers = getHeaders();
    await api.delete(`${ENDPOINTS.TICKETS}/${ticketId}`, { headers });
  },
  
  // Add watcher to ticket
  async addWatcher(ticketId: string, userId: string): Promise<Ticket> {
    const headers = getHeaders();
    const response = await api.post<ApiResponse<Ticket>>(
      `${ENDPOINTS.TICKETS}/${ticketId}/watchers/${userId}`, 
      {}, 
      { headers }
    );
    return response.data.data;
  },
  
  // Remove watcher from ticket
  async removeWatcher(ticketId: string, userId: string): Promise<Ticket> {
    const headers = getHeaders();
    const response = await api.delete<ApiResponse<Ticket>>(
      `${ENDPOINTS.TICKETS}/${ticketId}/watchers/${userId}`, 
      { headers }
    );
    return response.data.data;
  }
};

export default TicketService;
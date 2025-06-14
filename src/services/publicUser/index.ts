import api from "../axiosInstance";
import { ENDPOINTS } from "../network/endpoints";
import { getHeaders } from "../network/getHeaders";
import { User } from "../../types/interfaces";

interface StandardResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
  meta?: Record<string, any>;
}

const PublicUserService = {
  async fetchPublicUsers(): Promise<User[]> {
    try {
      const headers = getHeaders();
      const response = await api.get<StandardResponse<User[]>>(ENDPOINTS.PUBLIC_USERS + "/", { headers });
      if (!response.data) {
        throw new Error('Invalid response format');
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to fetch public users');
      }
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching public users:', error);
      throw new Error('Failed to fetch public users');
    }
  }
};

export default PublicUserService;
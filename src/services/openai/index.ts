import api from "../axiosInstance";
import { getHeaders } from "../network/getHeaders";
import { QueryResult, VisualizationResponse } from "../../types/interfaces";

/**
 * Service for handling visualization recommendations API
 */
const VisualizationService = {
  /**
   * Fetches the recommended visualization type for query results
   * 
   * @param queryResult - The result from a previous NLP query
   * @param question - The original question asked by the user
   * @returns Visualization recommendation data
   */
  async getVisualizationType(
    queryResult: QueryResult, 
    question: string
  ): Promise<VisualizationResponse> {
    try {
      const headers = getHeaders();
      const response = await api.post(
       "http://127.0.0.1:8000/api/nlp_query/visualization-type",
        { 
          query_result: queryResult,
          question
        },
        { headers }
      );
      
      if (!response.data) {
        throw new Error('Empty response from visualization service');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error getting visualization type:', error);
      // Return a default visualization type in case of error
      return {
        visualizationType: "table",
        title: "Query Results",
        reason: "Error fetching visualization recommendation",
        config: {}
      };
    }
  }
};

export default VisualizationService;
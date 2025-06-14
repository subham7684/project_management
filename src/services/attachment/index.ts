import api from "../axiosInstance";
import { ENDPOINTS } from "../network/endpoints";
import { getHeaders } from "../network/getHeaders";

const AttachmentService = {
  async uploadAttachment(entityType: string, entityId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(`${ENDPOINTS.ATTACHMENTS}/upload/${entityType}/${entityId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data.file_id;
  },

  async downloadAttachment(entityType: string, entityId: string, fileId: string): Promise<Blob> {
    const headers = getHeaders();
    const response = await api.get(`${ENDPOINTS.ATTACHMENTS}/download/${entityType}/${entityId}/${fileId}`, {
      headers,
      responseType: "blob"
    });
    return response.data;
  }
};

export default AttachmentService;

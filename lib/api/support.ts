import api from '../axios';
import { SERVICE_ENDPOINTS } from '../endpoints';

export interface SupportConversation {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface CreateConversationData {
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ConversationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    status: boolean;
    message: string;
    data: SupportConversation[];
  };
}

export interface CreateConversationResponse {
  status: boolean;
  message: string;
  data: SupportConversation;
}

export const supportAPI = {
  /**
   * Retrieves a list of support conversations for the current user.
   */
  getConversations: async (status?: string): Promise<ConversationsResponse> => {
    const url = status 
      ? `${SERVICE_ENDPOINTS.SUPPORT_CONVERSATIONS}?status=${status}` 
      : SERVICE_ENDPOINTS.SUPPORT_CONVERSATIONS;
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Retrieves messages for a specific support conversation.
   */
  getMessages: async (id: string): Promise<any> => {
    const response = await api.get(`${SERVICE_ENDPOINTS.SUPPORT_CONVERSATIONS}${id}/messages/`);
    return response.data;
  },

  /**
   * Sends a message within a support conversation.
   */
  sendMessage: async (id: string, content: string, messageType: string = 'text', fileUrl?: string): Promise<any> => {
    const payload: any = {
      content,
      message_type: messageType,
    };
    if (fileUrl) {
      payload.file_url = fileUrl;
    }
    const response = await api.post(`${SERVICE_ENDPOINTS.SUPPORT_CONVERSATIONS}${id}/messages/`, payload);
    return response.data;
  },

  /**
   * Uploads a file for support attachment.
   */
  uploadFile: async (file: any): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(SERVICE_ENDPOINTS.SUPPORT_UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Initiates a new support ticket/conversation.
   */
  createConversation: async (data: CreateConversationData): Promise<CreateConversationResponse> => {
    const response = await api.post(SERVICE_ENDPOINTS.SUPPORT_CONVERSATIONS, data);
    return response.data;
  },
};

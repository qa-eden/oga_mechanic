import api from '../axios';
import { SERVICE_ENDPOINTS } from '../endpoints';

export interface ChatParticipant {
  id: string;
  email: string;
  first_name: string;
  last_name?: string;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  created_at: string;
  message_type: 'text' | 'image' | 'file';
}

export interface ChatRoom {
  id: string;
  other_participant: ChatParticipant;
  unread_count: number;
  last_message: ChatMessage | null;
  created_at: string;
  updated_at: string;
}

export interface ChatRoomsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    status: boolean;
    message: string;
    data: ChatRoom[];
  };
}

export const communicationsAPI = {
  /**
   * Retrieves all chat rooms for the authenticated user.
   */
  getChatRooms: async (): Promise<ChatRoomsResponse> => {
    const response = await api.get(SERVICE_ENDPOINTS.COMMUNICATIONS_CHAT_ROOMS);
    return response.data;
  },

  /**
   * Retrieves messages for a specific chat room.
   */
  getRoomMessages: async (roomId: string): Promise<any> => {
    const response = await api.get(`${SERVICE_ENDPOINTS.COMMUNICATIONS_CHAT_ROOMS}${roomId}/messages/`);
    return response.data;
  },

  /**
   * Initializes a conversation with another user. 
   * Returns existing room if one already exists.
   */
  createChatRoom: async (participantIds: string[]): Promise<any> => {
    const response = await api.post(SERVICE_ENDPOINTS.COMMUNICATIONS_CHAT_ROOMS, {
      participant_ids: participantIds
    });
    return response.data;
  },

  /**
   * Sends a message via REST (Fallback method).
   */
  sendMessage: async (roomId: string, content: string, messageType: string = 'text'): Promise<any> => {
    const response = await api.post(`${SERVICE_ENDPOINTS.COMMUNICATIONS_CHAT_ROOMS}${roomId}/messages/`, {
      content,
      message_type: messageType
    });
    return response.data;
  },

  /**
   * Marks specific messages as read.
   */
  markMessagesAsRead: async (roomId: string, messageIds: string[]): Promise<any> => {
    const response = await api.post(`${SERVICE_ENDPOINTS.COMMUNICATIONS_CHAT_ROOMS}${roomId}/mark-read/`, {
      message_ids: messageIds
    });
    return response.data;
  },
};

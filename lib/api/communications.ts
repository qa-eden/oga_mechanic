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
  status: boolean;
  message: string;
  data: {
    count: number;
    results: ChatRoom[];
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
};

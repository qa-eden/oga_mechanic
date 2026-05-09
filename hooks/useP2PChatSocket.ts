import { useState, useCallback, useMemo, useEffect } from 'react';
import useWebSocket, { WebSocketMessage } from './useWebSocket';
import { communicationsAPI } from '@/lib/api/communications';
import { usePrimaryUserProfile } from './useUserProfile';

/**
 * Specialized WebSocket hook for the Peer-to-Peer (Buyer/Seller) Chat system.
 * Handles history fetching via REST and real-time updates via WebSockets.
 */
export const useP2PChatSocket = (roomId: string, enabled: boolean = true) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { data: profileResponse } = usePrimaryUserProfile();

  // Path matches the documentation: /ws/chat/{chat_room_id}/
  const urlPath = useMemo(() => 
    `chat/${roomId ? roomId : ''}`,
    [roomId]
  );

  /**
   * Fetch historical messages from the REST API.
   */
  const fetchHistory = useCallback(async () => {
    if (!roomId || !enabled || !profileResponse?.data) return;
    
    try {
      setIsLoadingHistory(true);
      console.log(`📜 [P2P Chat History] Fetching messages for room: ${roomId}`);
      const response = await communicationsAPI.getRoomMessages(roomId);
      
      // Handle the data structure from docs: { data: { results: [...] } } or flat
      // Handle different API response structures robustly
      const rawData = response?.results?.data || response?.data?.results || response?.results || response?.data;
      const historicalData = Array.isArray(rawData) ? rawData : [];

      const mappedHistory = historicalData.map((m: any) => {
        const senderObj = typeof m.sender === 'object' ? m.sender : null;
        const senderEmail = senderObj ? senderObj?.email : (m.sender_email || m.sender);
        const senderRole = senderObj ? senderObj?.active_role : m.active_role;
        
        // Match both email AND role to support self-chat with different roles
        const isSentByMe = 
          senderEmail === profileResponse?.data?.email && 
          senderRole === profileResponse?.data?.current_role;

        return {
          ...m,
          text: m.content || "", 
          sender: senderEmail,
          senderRole: senderRole,
          isSent: isSentByMe,
          status: 'sent',
          is_read: m.is_read || false,
          timestamp: m.created_at || new Date().toISOString(),
          type: 'chat_message',
          messageType: m.message_type || 'text',
        };
      });

      setMessages((prev) => {
        const existingIds = new Set(prev.map(m => m.id?.toString()));
        const filteredHistory = mappedHistory.filter((m: any) => !existingIds.has(m.id?.toString()));
        
        return [...filteredHistory, ...prev].sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });
    } catch (err) {
      console.error(`❌ [P2P Chat History] Failed:`, err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [roomId, enabled]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const eventHandlers = useMemo(() => ({
    chat_message: (data: WebSocketMessage) => {
      console.log('💬 [P2P Chat WS] Message received:', data);
      
      setMessages((prev) => {
        // Skip duplicate IDs
        if (prev.some(m => m.id && m.id?.toString() === data.id?.toString())) return prev;

        const mappedMessage = {
          ...data,
          id: data.id || Date.now().toString(),
          timestamp: data.created_at || new Date().toISOString(),
          text: data.content || "",
          status: 'sent',
          messageType: data.message_type || 'text',
        };

        // Optimistic UI Update check
        if (mappedMessage.text) {
            const localIndex = prev.findIndex(m => 
                m.status === 'sending' && m.text === mappedMessage.text
            );
            if (localIndex !== -1) {
                const updated = [...prev];
                updated[localIndex] = { ...mappedMessage };
                return updated;
            }
        }

        return [...prev, mappedMessage].sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });
    },
    typing: (data: WebSocketMessage) => {
      setIsTyping(!!data.is_typing);
    },
    messages_read: (data: any) => {
      const readIds = data.message_ids || [];
      setMessages((prev) => 
        prev.map(m => readIds.includes(m.id?.toString()) ? { ...m, is_read: true } : m)
      );
    }
  }), [roomId]);

  const { isConnected, sendMessage: baseSendMessage, reconnect } = useWebSocket({
    urlPath,
    eventHandlers,
    enabled: enabled && !!roomId,
  });

  const sendMessage = useCallback(async (content: string, messageType: string = 'text') => {
    if (!roomId) return;

    const localId = `local-${Date.now()}`;
    const localMessage = {
      content,
      message_type: messageType,
      text: content,
      sender: 'me', // Temporary marker
      created_at: new Date().toISOString(),
      id: localId,
      status: 'sending'
    };
    
    setMessages((prev) => [...prev, localMessage]);

    try {
      // Per docs: REST fallback or WS. We'll use REST for guaranteed delivery + WS for speed
      const response = await communicationsAPI.sendMessage(roomId, content, messageType);
      
      const serverId = response?.data?.id || response?.id;
      if (serverId) {
        setMessages((prev) => 
          prev.map((m) => m.id === localId ? { ...m, id: serverId, status: 'sent' } : m)
        );
      }
    } catch (err) {
      console.error(`❌ [P2P Chat Send] Failed:`, err);
      setMessages((prev) => 
        prev.map((m) => m.id === localId ? { ...m, status: 'failed' as any } : m)
      );
    }
  }, [roomId]);

  const sendTypingStatus = useCallback((isTypingStatus: boolean) => {
    baseSendMessage('typing', { is_typing: isTypingStatus });
  }, [baseSendMessage]);

  return {
    messages,
    isTyping,
    isLoadingHistory,
    isConnected,
    sendMessage,
    sendTypingStatus,
    reconnect,
  };
};

import { useState, useCallback, useMemo, useEffect } from 'react';
import useWebSocket, { WebSocketMessage } from './useWebSocket';
import { supportAPI } from '@/lib/api/support';

/**
 * Specialized WebSocket hook for the Specialist Chat system.
 * Built on top of the production-ready useWebSocket foundation.
 */
export const useChatWebSocket = (roomId: string, enabled: boolean = true) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Socket-First Construction: Matches the /ws/support/chat/{id}/ channel exactly
  const urlPath = useMemo(() => 
    `support/chat/${roomId ? roomId : ''}`,
    [roomId]
  );

  /**
   * Fetch historical messages from the REST API.
   * Runs whenever the roomId becomes valid and enabled is true.
   */
  const fetchHistory = useCallback(async () => {
    if (!roomId || !enabled) return;
    
    try {
      setIsLoadingHistory(true);
      console.log(`📜 [Chat History] Fetching messages for room: ${roomId}`);
      const response = await supportAPI.getMessages(roomId);
      
      // Correct Path: response.results.data based on provided JSON
      const historicalData = response?.results?.data || response?.data || [];

      const mappedHistory = historicalData.map((m: any) => {
        // Handle nested sender object or flat property
        let isStaff = false;
        if (typeof m.sender === 'object' && m.sender !== null) {
          isStaff = !!m.sender?.is_staff;
        } else if (typeof m.sender === 'string') {
          isStaff = m.sender === 'staff' || !!m.sender_is_staff;
        } else {
          isStaff = !!m.sender_is_staff;
        }

        return {
          ...m,
          text: m.content || m.message || "", 
          sender: isStaff ? 'staff' : 'me',
          isSent: !isStaff,
          status: 'sent',
          is_read: m.is_read || false,
          timestamp: m.created_at || new Date().toISOString(),
          type: 'chat_message',
          messageType: m.message_type || 'text',
          fileUrl: m.file_url || undefined,
        };
      });

      setMessages((prev) => {
        const existingIds = new Set(prev.map(m => m.id?.toString()));
        const filteredHistory = mappedHistory.filter((m: any) => !existingIds.has(m.id?.toString()));
        
        if (filteredHistory.length > 0) {
          console.log(`📜 [Chat History] Added ${filteredHistory.length} new messages from history.`);
        }
        
        return [...filteredHistory, ...prev].sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });
    } catch (err) {
      console.error(`❌ [Chat History] Failed to load history:`, err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [roomId, enabled]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  /**
   * Event handlers for chat-specific messages.
   * Memoized to prevent hook instability.
   */
  const eventHandlers = useMemo(() => ({
    connection_established: (data: any) => {
      console.log(`📡 [WebSocket] Connection established for room: ${roomId}`);
    },
    chat_message: (data: WebSocketMessage) => {
      console.log('💬 [Chat WS] Received chat_message:', JSON.stringify(data));
      
      const msgData = data.message && typeof data.message === 'object' ? data.message : data;
      const textContent = msgData.content || msgData.message || "";

      setMessages((prev) => {
        // 1. Strict ID Check
        const existsById = prev.some(m => m.id && m.id?.toString() === msgData.id?.toString());
        if (existsById) {
          console.log('💬 [Chat WS] Skip: Duplicate ID', msgData.id);
          return prev;
        }

        // 2. Resolve sender status (staff vs me)
        let isStaff = false;
        if (typeof msgData.sender === 'object' && msgData.sender !== null) {
          isStaff = !!msgData.sender?.is_staff;
        } else if (typeof msgData.sender === 'string') {
          isStaff = msgData.sender === 'staff' || !!msgData.sender_is_staff;
        } else {
          isStaff = !!msgData.sender_is_staff;
        }

        const mappedMessage = {
          ...msgData,
          id: msgData.id || Date.now().toString(),
          timestamp: msgData.created_at || new Date().toISOString(),
          text: textContent,
          sender: isStaff ? 'staff' : 'me',
          isSent: !isStaff,
          status: 'sent',
          is_read: msgData.is_read || false,
          messageType: msgData.message_type || 'text',
          fileUrl: msgData.file_url || undefined,
        };

        // 3. Optimistic Content Check (for user's own echoes)
        if (mappedMessage.isSent) {
          // Check if we have a local optimistic message with same content sent recently
          const alreadyExistsIndex = prev.findIndex(m => 
            m.isSent && 
            m.text === textContent &&
            m.id?.toString().startsWith('local-')
          );

          if (alreadyExistsIndex !== -1) {
            console.log('💬 [Chat WS] Updating optimistic message with real ID');
            const newMessages = [...prev];
            newMessages[alreadyExistsIndex] = {
              ...newMessages[alreadyExistsIndex],
              id: mappedMessage.id,
              status: 'sent',
              timestamp: mappedMessage.timestamp
            };
            return newMessages;
          }
        }
        
        console.log('💬 [Chat WS] Adding to state. Sender:', mappedMessage.sender, '| Content:', textContent);
        return [...prev, mappedMessage].sort((a, b) => 
          new Date(a.timestamp || a.created_at).getTime() - new Date(b.timestamp || b.created_at).getTime()
        );
      });
    },
    typing: (data: WebSocketMessage) => {
      setIsTyping(!!data.is_typing);
    },
    user_typing: (data: WebSocketMessage) => {
      setIsTyping(!!data.is_typing);
    },
    messages_read: (data: any) => {
      console.log('👁️ [Chat WS] Received messages_read:', JSON.stringify(data));
      const readIds = data.message_ids || [];
      if (readIds.length === 0) return;
      setMessages((prev) => 
        prev.map(m => {
          if (readIds.includes(m.id?.toString())) {
            return { ...m, is_read: true };
          }
          return m;
        })
      );
    }
  }), [roomId]);

  // Initialize the production-ready core logic
  const { 
    isConnected, 
    sendMessage: baseSendMessage, 
    reconnect 
  } = useWebSocket({
    urlPath,
    eventHandlers,
    enabled: enabled && !!roomId,
  });

  // Connection Status Logging
  useEffect(() => {
    if (enabled && roomId) {
      console.log(`🔌 [WebSocket Status] ${roomId}: ${isConnected ? '✅ CONNECTED' : '⏳ CONNECTING...'}`);
    }
  }, [isConnected, roomId, enabled]);

  /**
   * Sends a message with an optimistic UI update.
   * Uses REST for transmission to ensure reliability.
   */
  const sendMessage = useCallback(async (content: string, messageType: string = 'text', fileUrl?: string) => {
    if (!roomId) return;

    const timestamp = new Date().toISOString();
    const localId = `local-${Date.now()}`;
    
    // 1. Optimistic Update: Add to UI immediately
    const localMessage = {
      type: 'chat_message',
      content,
      message_type: messageType,
      file_url: fileUrl,
      messageType,
      fileUrl,
      sender: 'me',
      created_at: timestamp,
      id: localId,
      status: 'sending'
    };
    setMessages((prev) => [...prev, localMessage]);

    try {
      // 2. Transmit via REST
      console.log(`📤 [Chat REST Send] Sending message to room: ${roomId}`);
      const response = await supportAPI.sendMessage(roomId, content, messageType, fileUrl);

      // 3. Update optimistic message with real server data
      const serverId = response?.data?.id || response?.id;
      const serverCreatedAt = response?.data?.created_at || response?.created_at;

      if (serverId) {
        setMessages((prev) => 
          prev.map((m) => 
            m.id === localId 
              ? { ...m, id: serverId, created_at: serverCreatedAt || m.created_at, status: 'sent' } 
              : m
          )
        );
        
        // 4. Trigger a full history sync to ensure perfect match
        console.log(`🔄 [Chat Sync] Post-send history refresh for room: ${roomId}`);
        await fetchHistory();
      } else {
        // Fallback: If POST worked but structure is weird, still refresh
        console.warn(`⚠️ [Chat Sync] POST successful but ID not found in response structure:`, response);
        await fetchHistory();
      }
    } catch (err) {
      console.error(`❌ [Chat REST Send] Failed:`, err);
      // Mark as failed so user knows it didn't go through
      setMessages((prev) => 
        prev.map((m) => m.id === localId ? { ...m, status: 'failed' as any } : m)
      );
    }
  }, [roomId, fetchHistory]);

  /**
   * Reports typing status to the participant.
   */
  const sendTypingStatus = useCallback((isTypingStatus: boolean) => {
    baseSendMessage('typing', { is_typing: isTypingStatus });
  }, [baseSendMessage]);

  /**
   * Marks a batch of messages as read.
   */
  const markAsRead = useCallback((messageIds: string[]) => {
    baseSendMessage('read_messages', { message_ids: messageIds });
  }, [baseSendMessage]);

  return {
    messages,
    isTyping,
    isLoadingHistory,
    isConnected,
    sendMessage,
    sendTypingStatus,
    markAsRead,
    reconnect,
  };
};

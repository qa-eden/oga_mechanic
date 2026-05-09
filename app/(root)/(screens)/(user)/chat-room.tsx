import React, { useCallback, useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import ChatScreen from '@/components/templates/ChatScreen';
import { useP2PChatSocket } from '@/hooks/useP2PChatSocket';
import { useUserStore } from '@/stores/userStore';
import { usePrimaryUserProfile } from '@/hooks/useUserProfile';

const ChatRoomScreen = () => {
  const params = useLocalSearchParams();
  const roomId = params.roomId as string;
  const participantName = params.participantName as string;
  const participantAvatar = params.participantAvatar as string;
  
  const userEmail = useUserStore(state => state.user?.email);

  const { data: profileResponse } = usePrimaryUserProfile();
  const currentRole = profileResponse?.data?.current_role;

  // Initialize the real-time socket hook
  const {
    messages,
    isTyping,
    isLoadingHistory,
    sendMessage,
    sendTypingStatus,
  } = useP2PChatSocket(roomId);

  // Map backend messages to UI format
  const mappedMessages = useMemo(() => {
    return messages.map(m => {
      // Get the role from the message (history uses senderRole, real-time might use active_role)
      const msgRole = m.senderRole || m.active_role;
      const msgEmail = m.sender_email || m.sender;

      // Robustly check if message was sent by current user (Account + Role match)
      const isSent = m.isSent || 
                    m.sender === 'me' || 
                    (msgEmail === userEmail && (!msgRole || msgRole === currentRole));
      
      return {
        ...m,
        isSent,
        text: m.text || m.content,
      };
    });
  }, [messages, userEmail, currentRole]);

  const participant = {
    name: participantName || "User",
    avatar: participantAvatar || undefined,
    phone: "", // Will be filled if available in participant data
    isOnline: true, // We could track this via WS if backend supports it
  };

  const handleSendMessage = useCallback((text: string) => {
    sendMessage(text);
  }, [sendMessage]);

  const handleTyping = useCallback((typing: boolean) => {
    sendTypingStatus(typing);
  }, [sendTypingStatus]);

  return (
    <ChatScreen
      participant={participant}
      messages={mappedMessages}
      onSendMessage={handleSendMessage}
      onTyping={handleTyping}
      isTyping={isTyping}
      isLoadingHistory={isLoadingHistory}
      headerSubtitle="Marketplace Chat"
    />
  );
};

export default ChatRoomScreen;

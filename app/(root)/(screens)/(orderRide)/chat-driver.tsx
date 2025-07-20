import React from "react";
import { useLocalSearchParams } from "expo-router";
import ChatScreen from "@/components/templates/ChatScreen";
import { images } from "@/constants";
import { Message } from "@/utils/chatUtils";

const ChatDriver = () => {
  const params = useLocalSearchParams();

  const participant = {
    name: (params.mechanicName as string) || "Driver Name",
    phone: (params.mechanicPhone as string) || "08056432765",
    avatar: params.mechanicImage || images.mechanic1,
    isOnline: true,
    lastSeen: "just now",
  };

  const initialMessages: Message[] = [
    {
      id: 1,
      text: "Hi! I'm waiting at the pickup location.",
      isSent: true,
      timestamp: "4:06am",
      status: 'read',
    },
    {
      id: 2,
      text: "Okay, I'll be there in 2 minutes!",
      isSent: false,
      timestamp: "4:06am",
      status: 'read',
    },
  ];

  return (
    <ChatScreen
      participant={participant}
      initialMessages={initialMessages}
      headerSubtitle="Chat with driver"
    />
  );
};

export default ChatDriver;

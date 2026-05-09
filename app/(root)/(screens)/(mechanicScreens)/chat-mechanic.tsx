"use client";

import React from "react";
import { useLocalSearchParams } from "expo-router";
import ChatScreen from "@/components/templates/ChatScreen";
import { Message } from "@/utils/chatUtils";

const ChatMechanic = () => {
  const params = useLocalSearchParams();
  const participant = {
    name: (params.mechanicName as string) || "Fatai Sule",
    phone: "08056432765",
    avatar: params.mechanicImage,
    isOnline: true,
    lastSeen: "just now",
  };

  const initialMessages: Message[] = [
    {
      id: 1,
      text: "A text of what you tell the driver shows here",
      isSent: true,
      timestamp: "4:06am",
      status: "read",
    },
    {
      id: 2,
      text: "A text on what the driver says shows here",
      isSent: false,
      timestamp: "4:06am",
      status: "read",
    },
  ];

  return (
    <ChatScreen
      participant={participant as any}
      messages={initialMessages}
      onSendMessage={(text) => console.log("Sending message:", text)}
      headerSubtitle="Chat mechanic"
    />
  );
};

export default ChatMechanic;

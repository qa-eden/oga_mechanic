"use client";

import React from "react";
import ChatScreen from "@/components/templates/ChatScreen";
import { images } from "@/constants";
import { Message } from "@/utils/chatUtils";

const ChatSeller = () => {
  const participant = {
    name: "Micheal Adenuga",
    phone: "08056432765",
    avatar: images.dummyProfile,
    isOnline: true,
    lastSeen: "2 minutes ago",
  };

  const initialMessages: Message[] = [
    {
      id: 1,
      text: "Hi! I'm interested in your car. Is it still available?",
      isSent: false,
      timestamp: "4:06am",
      status: 'read',
    },
    {
      id: 2,
      text: "Yes, it's still available! Would you like to see it?",
      isSent: true,
      timestamp: "4:06am",
      status: 'read',
    },
    {
      id: 3,
      text: "Perfect! Can we arrange a meeting?",
      isSent: false,
      timestamp: "4:07am",
      status: 'read',
    },
  ];

  return (
    <ChatScreen
      participant={participant}
      initialMessages={initialMessages}
      headerSubtitle="Chat with seller"
    />
  );
};

export default ChatSeller;

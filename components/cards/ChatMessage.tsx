import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { CheckIcon, CheckCircleIcon } from "react-native-heroicons/outline";

interface Message {
  id: number;
  text: string;
  isSent: boolean;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isTyping?: boolean;
  isVoiceMessage?: boolean;
  voiceDuration?: number;
  voiceUri?: string;
}

interface ChatMessageProps {
  item: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = React.memo(({ item }) => (
  <View className={`mb-4 ${item.isSent ? "items-end" : "items-start"}`}>
    <View
      className={`max-w-[80%] px-4 py-3 rounded-2xl ${
        item.isSent ? "bg-primary-500" : "bg-gray-200"
      }`}
    >
      <Text
        className={`text-base leading-6 font-NunitoMedium ${
          item.isSent ? "text-white" : "text-gray-800"
        }`}
      >
        {item.text}
      </Text>
    </View>
    <View className={`flex-row items-center mt-1 px-2 ${item.isSent ? "justify-end" : "justify-start"}`}>
      <Text className="text-xs text-gray-500 mr-1">{item.timestamp}</Text>
      {item.isSent && (
        <View className="flex-row items-center">
          {item.status === 'sending' && (
            <View className="w-3 h-3 border border-gray-400 rounded-full" />
          )}
          {item.status === 'sent' && <CheckIcon size={12} color="#6B7280" />}
          {item.status === 'delivered' && (
            <View className="flex-row">
              <CheckIcon size={12} color="#6B7280" />
              <CheckIcon size={12} color="#6B7280" style={{ marginLeft: -8 }} />
            </View>
          )}
          {item.status === 'read' && (
            <View className="flex-row">
              <CheckCircleIcon size={12} color="#3B82F6" />
              <CheckCircleIcon size={12} color="#3B82F6" style={{ marginLeft: -8 }} />
            </View>
          )}
        </View>
      )}
    </View>
  </View>
));

export default ChatMessage; 
"use client";

import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  FlatList,
  Alert,
  Linking,
} from "react-native";
import { useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import BackArrowBtn from "@/components/BackArrowBtn";
import Rating from "@/components/Rating";
import {
  PaperAirplaneIcon,
  PhoneIcon,
  VideoCameraIcon,
  CheckIcon,
  CheckCircleIcon,
} from "react-native-heroicons/outline";
import { routes } from "@/constants/routes";

interface Message {
  id: number;
  text: string;
  isSent: boolean;
  timestamp: string;
  status: "sending" | "sent" | "delivered" | "read";
}

const ChatMechanic = () => {
  const params = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([
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
  ]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // Mock mechanic data - in real app this would come from params or API
  const mechanicData = {
    id: Number.parseInt(params.mechanicId as string) || 1,
    name: (params.mechanicName as string) || "Fatai Sule",
    rating: Number.parseFloat(params.mechanicRating as string) || 4.5,
    reviewCount: 30,
    image:
      (params.mechanicImage as string) || "/placeholder.svg?height=60&width=60",
    phone: "08056432765",
    isOnline: true,
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: inputText.trim(),
        isSent: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "sending",
      };
      setMessages((prev) => [...prev, newMessage]);
      setInputText("");

      // Simulate message delivery
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: "sent" } : msg
          )
        );
      }, 1000);

      // Simulate message read
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: "read" } : msg
          )
        );
      }, 3000);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleVideoCall = () => {
    router.push({
      pathname: routes?.videoCall,
      params: {
        mechanicId: mechanicData.id,
        mechanicName: mechanicData.name,
        mechanicImage: mechanicData.image,
      },
    });
  };

  const handleVoiceCall = () => {
    router.push({
      pathname: routes?.voiceCall,
      params: {
        mechanicId: mechanicData.id,
        mechanicName: mechanicData.name,
        mechanicImage: mechanicData.image,
      },
    });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View className={`mb-4 ${item.isSent ? "items-end" : "items-start"}`}>
      <View
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          item.isSent
            ? "bg-primary-500 rounded-br-md"
            : "bg-gray-200 rounded-bl-md"
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
      <View
        className={`flex-row items-center mt-1 px-2 ${
          item.isSent ? "justify-end" : "justify-start"
        }`}
      >
        <Text className="text-xs text-gray-500 mr-1 font-NunitoMedium">
          {item.timestamp}
        </Text>
        {item.isSent && (
          <View className="flex-row items-center">
            {item.status === "sending" && (
              <View className="w-3 h-3 border border-gray-400 rounded-full" />
            )}
            {item.status === "sent" && <CheckIcon size={12} color="#6B7280" />}
            {item.status === "delivered" && (
              <View className="flex-row">
                <CheckIcon size={12} color="#6B7280" />
                <CheckIcon
                  size={12}
                  color="#6B7280"
                  style={{ marginLeft: -8 }}
                />
              </View>
            )}
            {item.status === "read" && (
              <View className="flex-row">
                <CheckCircleIcon size={12} color="#3B82F6" />
                <CheckCircleIcon
                  size={12}
                  color="#3B82F6"
                  style={{ marginLeft: -8 }}
                />
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100 shadow-sm">
            <BackArrowBtn />
            <Text className="text-lg font-NunitoBold text-gray-900">
              Chat mechanic
            </Text>
            <View className="w-10" />
          </View>

          {/* Mechanic Info */}
          <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
            <View className="flex-row items-center flex-1">
              <View className="relative mr-3">
                <Image
                  source={
                    typeof mechanicData.image === "string"
                      ? { uri: mechanicData.image }
                      : mechanicData.image
                  }
                  style={{ width: 60, height: 60, resizeMode: "cover" }}
                />
                {mechanicData.isOnline && (
                  <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                )}
              </View>

              <View className="flex-1">
                <Text className="text-base font-NunitoBold text-gray-900">
                  {mechanicData.name}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Rating rating={mechanicData.rating} size={12} />
                  <Text className="text-sm text-gray-600 ml-1 font-NunitoMedium">
                    {mechanicData.rating.toFixed(1)} ({mechanicData.reviewCount}
                    )
                  </Text>
                </View>
              </View>
            </View>

            {/* Call Actions */}
            <View className="flex-row items-center space-x-3">
              <TouchableOpacity
                onPress={handleVideoCall}
                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              >
                <VideoCameraIcon size={20} color="#6B7280" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleVoiceCall}
                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              >
                <PhoneIcon size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Messages and Input */}
          <View style={{ flex: 1 }}>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{
                padding: 20,
                paddingBottom: 100,
              }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              initialNumToRender={8}
              maxToRenderPerBatch={8}
              windowSize={7}
              removeClippedSubviews={true}
            />

            {/* Message Input */}
            <View className="px-5 pt-4 pb-8 bg-white border-t border-gray-100">
              <View className="flex-row items-center space-x-6">
                {/* Input Field */}
                <View className="flex-1 bg-gray-100 rounded-full px-4 py-3 min-h-[44px] max-h-[110px]">
                  <TextInput
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type a message..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    maxLength={1000}
                    textAlignVertical="center"
                    style={{
                      color: "#000",
                      fontSize: 16,
                      paddingVertical: 0,
                      minHeight: 35,
                      // iOS-specific tweak:
                      paddingTop: Platform.OS === "ios" ? 6 : 0,
                    }}
                  />
                </View>

                {/* Send Button */}
                <TouchableOpacity
                  onPress={handleSendMessage}
                  className={`w-12 h-12 rounded-full items-center justify-center ${
                    inputText.trim() ? "bg-primary-500" : "bg-gray-200"
                  }`}
                  disabled={!inputText.trim()}
                >
                  <PaperAirplaneIcon
                    size={20}
                    color={inputText.trim() ? "#FFFFFF" : "#9CA3AF"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatMechanic;

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  FlatList,
  Animated,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackArrowBtn from "@/components/BackArrowBtn";
import { PaperAirplaneIcon, PhoneIcon, PaperClipIcon, UserIcon } from "react-native-heroicons/outline";
import ChatMessage from "@/components/cards/ChatMessage";
import { Message } from "@/utils/chatUtils";

interface Participant {
  name: string;
  phone: string;
  avatar?: any;
  isOnline?: boolean;
  lastSeen?: string;
}

interface ChatScreenProps {
  participant: Participant;
  initialMessages?: Message[];
  headerSubtitle?: string;
  onCall?: () => void;
  showAttachmentButton?: boolean;
}

const ChatScreen: React.FC<ChatScreenProps> = ({
  participant,
  initialMessages = [],
  headerSubtitle = "Chat",
  onCall,
  showAttachmentButton = true,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingAnimation.setValue(0);
    }
  }, [isTyping]);

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
        status: 'sending',
      };
      setMessages((prev) => [...prev, newMessage]);
      setInputText("");

      // Simulate message delivery
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
          )
        );
      }, 1000);

      // Simulate message read
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
          )
        );
      }, 3000);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleCall = () => {
    if (onCall) return onCall();
    Alert.alert(
      "Call",
      `Call ${participant.name} at ${participant.phone}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call",
          onPress: () => {
            const phoneNumber = participant.phone.replace(/\s/g, '');
            const url = `tel:${phoneNumber}`;
            Linking.canOpenURL(url)
              .then((supported) => {
                if (supported) {
                  return Linking.openURL(url);
                } else {
                  Alert.alert("Error", "Phone calls are not supported on this device");
                }
              })
              .catch((err) => {
                console.error('An error occurred', err);
                Alert.alert("Error", "Failed to initiate call");
              });
          }
        },
      ]
    );
  };

  const handleAttachment = () => {
    Alert.alert("Attachment", "Choose attachment type", [
      { text: "Photo", onPress: () => console.log("Photo selected") },
      { text: "Document", onPress: () => console.log("Document selected") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const renderTypingIndicator = () => (
    <View className="mb-4 items-start">
      <View className="bg-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
        <View className="flex-row items-center space-x-1">
          <Animated.View
            style={{
              opacity: typingAnimation,
              transform: [{ scale: typingAnimation }],
            }}
            className="w-2 h-2 bg-gray-600 rounded-full"
          />
          <Animated.View
            style={{
              opacity: typingAnimation,
              transform: [{ scale: typingAnimation }],
            }}
            className="w-2 h-2 bg-gray-600 rounded-full"
          />
          <Animated.View
            style={{
              opacity: typingAnimation,
              transform: [{ scale: typingAnimation }],
            }}
            className="w-2 h-2 bg-gray-600 rounded-full"
          />
        </View>
      </View>
    </View>
  );

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => <ChatMessage item={item} />, []
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
            <View className="flex-1 items-center">
              <Text className="text-lg font-NunitoBold text-gray-900">Message</Text>
              <Text className="text-xs text-gray-500 font-NunitoMedium">{headerSubtitle}</Text>
            </View>
            <TouchableOpacity
              onPress={handleCall}
              className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center"
            >
              <PhoneIcon size={20} color="#D30309" />
            </TouchableOpacity>
          </View>

          {/* Participant Info */}
          <View className="flex-row items-center px-5 py-4 bg-white border-b border-gray-100">
            <View className="relative mr-4">
              <View className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100">
                {typeof participant.avatar === "string" ? (
                  <Image
                    source={{ uri: participant.avatar }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : typeof participant.avatar === "function" ? (
                  React.createElement(participant.avatar, { width: 64, height: 64 })
                ) : (
                  <UserIcon width={64} height={64} color="#9CA3AF" />
                )}
              </View>
              {participant.isOnline && (
                <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white items-center justify-center">
                  <View className="w-2 h-2 bg-white rounded-full" />
                </View>
              )}
            </View>

            <View className="flex-1">
              <Text className="text-lg font-NunitoBold text-gray-900">
                {participant.name}
              </Text>
              <View className="flex-row items-center">
                <PhoneIcon size={14} color="#6B7280" />
                <Text className="text-sm text-gray-600 ml-1 font-NunitoMedium">
                  {participant.phone}
                </Text>
              </View>
              <Text className="text-xs text-green-600 font-NunitoMedium mt-1">
                {participant.isOnline ? "Online" : `Last seen ${participant.lastSeen}`}
              </Text>
            </View>
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id.toString()}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={7}
            removeClippedSubviews={true}
            contentContainerStyle={{
              padding: 20,
              paddingBottom: 100,
            }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            ListFooterComponent={isTyping ? renderTypingIndicator : null}
            keyboardShouldPersistTaps="handled"
          />

          {/* Message Input */}
          <View className="px-5 pt-4 pb-[2rem] bg-white border-t border-gray-100">
            <View className="flex-row items-center gap-1 space-x-3">
              {/* Attachment Button */}
              {showAttachmentButton && (
                <TouchableOpacity
                  onPress={handleAttachment}
                  className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                >
                  <PaperClipIcon size={20} color="#6B7280" />
                </TouchableOpacity>
              )}

              {/* Input Field */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: '#f3f4f6',
                  borderRadius: 9999,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  minHeight: 44,
                  maxHeight: 100,
                  justifyContent: 'center',
                }}
              >
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Type a message..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  maxLength={1000}
                  textAlignVertical="center"
                  style={{
                    color: '#000',
                    fontSize: 16,
                    paddingVertical: 0,
                    minHeight: 40,
                    // iOS-specific tweak:
                    paddingTop: Platform.OS === 'ios' ? 6 : 0,
                  }}
                />
              </View>

              {/* Send Button */}
              <TouchableOpacity
                onPress={handleSendMessage}
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  inputText.trim() ? "bg-primary-500" : "bg-gray-200"
                }`}
                disabled={!inputText.trim()}
              >
                <PaperAirplaneIcon
                  size={18}
                  color={inputText.trim() ? "#FFFFFF" : "#9CA3AF"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen; 
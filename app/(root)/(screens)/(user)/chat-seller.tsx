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
  Animated,
  Alert,
  Linking,
} from "react-native";
import { useState, useRef, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "@/constants";
import BackArrowBtn from "@/components/BackArrowBtn";
import { Audio } from 'expo-av';
import { 
  PaperAirplaneIcon, 
  PhoneIcon, 
  PaperClipIcon,
} from "react-native-heroicons/outline";
import ChatMessage from "@/components/cards/ChatMessage";

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

const ChatSeller = () => {
  const [messages, setMessages] = useState<Message[]>([
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
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const playingTimer = useRef<NodeJS.Timeout | null>(null);
  const recording = useRef<Audio.Recording | null>(null);
  const sound = useRef<Audio.Sound | null>(null);

  // Mock seller data - in real app this would come from params or API
  const sellerData = {
    name: "Micheal Adenuga",
    phone: "08056432765",
    avatar: images.dummyProfile,
    isOnline: true,
    lastSeen: "2 minutes ago",
  };

  // Typing animation effect
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
    Alert.alert(
      "Call Seller",
      `Call ${sellerData.name} at ${sellerData.phone}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Call", 
          onPress: () => {
            const phoneNumber = sellerData.phone.replace(/\s/g, '');
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



  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup audio resources when component unmounts
  useEffect(() => {
    return () => {
      if (recording.current) {
        recording.current.stopAndUnloadAsync();
      }
      if (sound.current) {
        sound.current.unloadAsync();
      }
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      if (playingTimer.current) {
        clearInterval(playingTimer.current);
      }
    };
  }, []);

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
    ({ item }: { item: Message }) => <ChatMessage item={item} />,
    []
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={{ flex: 1 }}>
          {/* Enhanced Header */}
          <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100 shadow-sm">
            <BackArrowBtn />
            <View className="flex-1 items-center">
              <Text className="text-lg font-NunitoBold text-gray-900">Message</Text>
              <Text className="text-xs text-gray-500 font-NunitoMedium">Chat with seller</Text>
            </View>
            <TouchableOpacity
              onPress={handleCall}
              className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center"
            >
              <PhoneIcon size={20} color="#D30309" />
            </TouchableOpacity>
          </View>

          {/* Enhanced Seller Info */}
          <View className="flex-row items-center px-5 py-4 bg-white border-b border-gray-100">
            <View className="relative mr-4">
              <View className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100">
                <Image
                  source={sellerData.avatar}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              {sellerData.isOnline && (
                <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white items-center justify-center">
                  <View className="w-2 h-2 bg-white rounded-full" />
                </View>
              )}
            </View>

            <View className="flex-1">
              <Text className="text-lg font-NunitoBold text-gray-900">
                {sellerData.name}
              </Text>
              <View className="flex-row items-center">
                <PhoneIcon size={14} color="#6B7280" />
                <Text className="text-sm text-gray-600 ml-1 font-NunitoMedium">
                  {sellerData.phone}
                </Text>
              </View>
              <Text className="text-xs text-green-600 font-NunitoMedium mt-1">
                {sellerData.isOnline ? "Online" : `Last seen ${sellerData.lastSeen}`}
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

          {/* Enhanced Message Input */}
          <View className="px-5 pt-4 pb-[2rem] bg-white border-t border-gray-100">
          
            <View className="flex-row items-center gap-1 space-x-3">
              {/* Attachment Button */}
              <TouchableOpacity
                onPress={handleAttachment}
                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              >
                <PaperClipIcon size={20} color="#6B7280" />
              </TouchableOpacity>

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

export default ChatSeller;

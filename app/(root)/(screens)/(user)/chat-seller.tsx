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
  PermissionsAndroid,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { images } from "@/constants";
import BackArrowBtn from "@/components/BackArrowBtn";
import { Audio } from 'expo-av';
import { 
  PaperAirplaneIcon, 
  PhoneIcon, 
  PaperClipIcon,
  MicrophoneIcon,
  FaceSmileIcon,
  CheckIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
} from "react-native-heroicons/outline";

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
  const params = useLocalSearchParams();
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState<number | null>(null);
  const [playingTime, setPlayingTime] = useState(0);
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

  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: "Microphone Permission",
            message: "This app needs access to your microphone to record voice messages.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS handles permissions differently
  };

  const startRecording = async () => {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Microphone permission is required to record voice messages.");
      return;
    }

    try {
      // Request audio permissions
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recording.current = newRecording;
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start recording timer
      recordingTimer.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      console.log("Recording started...");
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }

    setIsRecording(false);
    
    if (!recording.current) return;

    try {
      // Stop recording
      await recording.current.stopAndUnloadAsync();
      const uri = recording.current.getURI();
      recording.current = null;

      if (uri && recordingTime > 0) {
        // Create voice message
        const newVoiceMessage: Message = {
          id: messages.length + 1,
          text: `Voice message (${recordingTime}s)`,
          isSent: true,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: 'sending',
          isVoiceMessage: true,
          voiceDuration: recordingTime,
          voiceUri: uri,
        };

        setMessages(prev => [...prev, newVoiceMessage]);
        setRecordingTime(0);

        // Simulate message delivery
        setTimeout(() => {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === newVoiceMessage.id ? { ...msg, status: 'sent' } : msg
            )
          );
        }, 1000);

        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert("Error", "Failed to stop recording. Please try again.");
    }
  };

  const handleVoiceMessage = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const playVoiceMessage = async (messageId: number, duration: number, uri: string) => {
    if (isPlaying === messageId) {
      // Stop playing
      try {
        if (sound.current) {
          await sound.current.stopAsync();
          await sound.current.unloadAsync();
          sound.current = null;
        }
      } catch (err) {
        console.error('Failed to stop sound', err);
      }
      
      setIsPlaying(null);
      setPlayingTime(0);
      if (playingTimer.current) {
        clearInterval(playingTimer.current);
        playingTimer.current = null;
      }
    } else {
      try {
        // Stop any currently playing sound
        if (sound.current) {
          await sound.current.stopAsync();
          await sound.current.unloadAsync();
        }

        // Load and play the new sound
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded) {
              setPlayingTime(Math.floor(status.positionMillis / 1000));
              if (status.didJustFinish) {
                setIsPlaying(null);
                setPlayingTime(0);
                if (playingTimer.current) {
                  clearInterval(playingTimer.current);
                  playingTimer.current = null;
                }
              }
            }
          }
        );

        sound.current = newSound;
        setIsPlaying(messageId);
        setPlayingTime(0);

        console.log(`Playing voice message ${messageId}...`);
      } catch (err) {
        console.error('Failed to play voice message', err);
        Alert.alert("Error", "Failed to play voice message. Please try again.");
      }
    }
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

  const renderMessage = ({ item }: { item: Message }) => (
    <View className={`mb-4 ${item.isSent ? "items-end" : "items-start"}`}>
      <View
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          item.isSent
            ? "bg-primary-500 rounded-br-md"
            : "bg-gray-100 rounded-bl-md border border-gray-200"
        }`}
      >
        {item.isVoiceMessage ? (
          <TouchableOpacity
            onPress={() => item.voiceDuration && item.voiceUri && playVoiceMessage(item.id, item.voiceDuration, item.voiceUri)}
            className="flex-row items-center space-x-3"
          >
            <View className={`w-8 h-8 rounded-full items-center justify-center ${
              item.isSent ? "bg-white/20" : "bg-primary-500/20"
            }`}>
              {isPlaying === item.id ? (
                <PauseIcon size={16} color={item.isSent ? "#FFFFFF" : "#D30309"} />
              ) : (
                <PlayIcon size={16} color={item.isSent ? "#FFFFFF" : "#D30309"} />
              )}
            </View>
            <View className="flex-1">
              <View className="w-full h-1 bg-gray-300 rounded-full overflow-hidden">
                <View 
                  className={`h-full rounded-full ${
                    item.isSent ? "bg-white/60" : "bg-primary-500/60"
                  }`}
                  style={{
                    width: item.voiceDuration ? `${(playingTime / item.voiceDuration) * 100}%` : '0%'
                  }}
                />
              </View>
              <Text className={`text-sm font-NunitoMedium mt-1 ${
                item.isSent ? "text-white/80" : "text-gray-600"
              }`}>
                {formatTime(isPlaying === item.id ? playingTime : (item.voiceDuration || 0))} / {formatTime(item.voiceDuration || 0)}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <Text
            className={`text-base leading-6 font-NunitoMedium ${
              item.isSent ? "text-white" : "text-gray-800"
            }`}
          >
            {item.text}
          </Text>
        )}
      </View>
      <View className={`flex-row items-center mt-1 px-2 ${item.isSent ? "justify-end" : "justify-start"}`}>
        <Text className="text-xs text-gray-500 mr-1">
          {item.timestamp}
        </Text>
        {item.isSent && (
          <View className="flex-row items-center">
            {item.status === 'sending' && (
              <View className="w-3 h-3 border border-gray-400 rounded-full" />
            )}
            {item.status === 'sent' && (
              <CheckIcon size={12} color="#6B7280" />
            )}
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
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
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
          ListFooterComponent={isTyping ? renderTypingIndicator : null}
        />

        {/* Enhanced Message Input */}
        <View className="px-5 pt-4 pb-[2rem] bg-white border-t border-gray-100">
          {isRecording && (
            <View className="flex-row items-center justify-center mb-3 bg-red-50 rounded-full py-2 px-4">
              <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
              <Text className="text-red-600 font-NunitoMedium">
                Recording... {formatTime(recordingTime)}
              </Text>
            </View>
          )}
          <View className="flex-row items-center gap-1 space-x-3">
            {/* Attachment Button */}
            <TouchableOpacity
              onPress={handleAttachment}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            >
              <PaperClipIcon size={20} color="#6B7280" />
            </TouchableOpacity>

            {/* Input Field */}
            <View className="flex-1 bg-gray-100 rounded-full px-4 py-3 min-h-[44px] max-h-[120px]">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type a message..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 text-base font-NunitoMedium text-gray-900"
                multiline
                maxLength={1000}
                textAlignVertical="center"
              />
            </View>

            {/* Voice Message Button */}
            <TouchableOpacity
              onPress={handleVoiceMessage}
              className={`w-10 h-10 rounded-full items-center justify-center ${
                isRecording ? "bg-red-500" : "bg-gray-100"
              }`}
            >
              {isRecording ? (
                <StopIcon size={20} color="#FFFFFF" />
              ) : (
                <MicrophoneIcon size={20} color="#6B7280" />
              )}
            </TouchableOpacity>

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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatSeller;

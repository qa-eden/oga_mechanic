import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  XMarkIcon, 
  ChatBubbleLeftRightIcon, 
  VideoCameraIcon, 
  SpeakerWaveIcon,
  MicrophoneIcon,
  PhoneIcon 
} from 'react-native-heroicons/solid';
import { router } from 'expo-router';
import callService, { CallState } from '@/services/CallService';
import CallTestIndicator from '@/components/CallTestIndicator';

const OngoingCallScreen = () => {
  const [callDuration, setCallDuration] = useState(0);
  const [callState, setCallState] = useState<CallState>({
    isConnected: false,
    isIncoming: false,
    isOutgoing: false,
    isMuted: false,
    isSpeakerOn: false,
    remoteStream: null,
    localStream: null,
  });
  const [isBluetoothActive, setIsBluetoothActive] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Customer data
  const customerData = {
    name: "Big Suzz",
    phoneNumber: "+234 9076543211",
    profileImage: require('@/assets/images/user.png'), // Using existing user image
  };

  // Initialize call service
  useEffect(() => {
    const initializeCall = async () => {
      try {
        console.log('🚀 Initializing call service...');
        
        // Set up call state callback
        callService.setCallStateCallback((state: CallState) => {
          console.log('📞 Call state updated:', state);
          setCallState(state);
        });

        // Initialize the call (you would get roomId from navigation params)
        const roomId = 'call-' + Date.now(); // Generate unique room ID
        console.log('📱 Creating call room:', roomId);
        await callService.initializeCall(roomId, true); // true = initiator
        
        console.log('✅ Call initialized successfully');
        setIsInitializing(false);
      } catch (error) {
        console.error('❌ Failed to initialize call:', error);
        Alert.alert('Error', 'Failed to initialize call. Please try again.');
        router.back();
      }
    };

    initializeCall();

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up call service...');
      callService.cleanup();
    };
  }, []);

  // Timer for call duration
  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    console.log('Call ended');
    callService.endCall();
    router.back();
  };

  const handleToggleMute = () => {
    callService.toggleMute();
    console.log('Mute toggled');
  };

  const handleToggleBluetooth = () => {
    setIsBluetoothActive(!isBluetoothActive);
    console.log('Bluetooth toggled:', !isBluetoothActive);
  };

  const handleToggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    console.log('Video toggled:', !isVideoEnabled);
  };

  const handleMessage = () => {
    console.log('Open message');
    // Navigate to chat screen
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Test Indicator - Remove this in production */}
      {/* <CallTestIndicator 
        callState={callState}
        isInitializing={isInitializing}
        callDuration={callDuration}
      /> */}
      
      {/* Header */}
      <SafeAreaView className="bg-white">
        <View className="flex-row items-center justify-between px-5 py-3">
          <TouchableOpacity 
            onPress={handleClose}
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
          >
            <XMarkIcon size={20} color="#374151" />
          </TouchableOpacity>
          
          <View className="items-center">
            <Text className="text-xl font-bold text-gray-900">
              {isInitializing ? 'Connecting...' : callState.isConnected ? 'Ongoing call' : 'Connecting...'}
            </Text>
            <Text className="text-base text-gray-600">{formatDuration(callDuration)}</Text>
            {callState.isConnected && (
              <View className="mt-2 px-3 py-1 bg-green-100 rounded-full">
                <Text className="text-xs text-green-700 font-medium">Connected</Text>
              </View>
            )}
          </View>
          
          <View className="w-10" />
        </View>
      </SafeAreaView>

      {/* Main Content - Profile Picture */}
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-48 h-48 rounded-full overflow-hidden mb-8">
          <Image 
            source={customerData.profileImage}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          {customerData.name}
        </Text>
        <Text className="text-lg text-gray-600">
          {customerData.phoneNumber}
        </Text>
      </View>

      {/* Call Control Bar */}
      <View className="bg-gray-800 rounded-t-3xl px-6 py-8">
        <View className="flex-row items-center justify-between">
          {/* Message Button */}
          <TouchableOpacity 
            onPress={handleMessage}
            className="w-12 h-12 bg-gray-700 rounded-full items-center justify-center"
          >
            <ChatBubbleLeftRightIcon size={24} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Video Button */}
          {/* <TouchableOpacity 
            onPress={handleToggleVideo}
            className="w-12 h-12 bg-gray-700 rounded-full items-center justify-center"
          >
            <VideoCameraIcon size={24} color="#9CA3AF" />
          </TouchableOpacity> */}

          {/* Bluetooth Button */}
          <TouchableOpacity 
            onPress={handleToggleBluetooth}
            className={`w-12 h-12 rounded-full items-center justify-center ${
              isBluetoothActive ? 'bg-white' : 'bg-gray-700'
            }`}
          >
            <SpeakerWaveIcon 
              size={24} 
              color={isBluetoothActive ? '#374151' : '#9CA3AF'} 
            />
          </TouchableOpacity>

          {/* Mute Button */}
          <TouchableOpacity 
            onPress={handleToggleMute}
            className={`w-12 h-12 rounded-full items-center justify-center ${
              callState.isMuted ? 'bg-red-500' : 'bg-gray-700'
            }`}
          >
            <MicrophoneIcon 
              size={24} 
              color={callState.isMuted ? 'white' : '#9CA3AF'} 
            />
          </TouchableOpacity>

          {/* End Call Button */}
          <TouchableOpacity 
            onPress={handleEndCall}
            className="w-12 h-12 bg-red-500 rounded-full items-center justify-center"
          >
            <PhoneIcon size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default OngoingCallScreen;

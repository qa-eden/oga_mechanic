import React from 'react';
import { View, Text } from 'react-native';
import { CallState } from '@/services/CallService';

interface CallTestIndicatorProps {
  callState: CallState;
  isInitializing: boolean;
  callDuration: number;
}

const CallTestIndicator: React.FC<CallTestIndicatorProps> = ({
  callState,
  isInitializing,
  callDuration,
}) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className="absolute top-20 right-4 bg-black/80 rounded-lg p-3 z-50">
      <Text className="text-white text-xs font-bold mb-1">Call Test Status</Text>
      <Text className="text-white text-xs">
        Status: {isInitializing ? 'Initializing' : callState.isConnected ? 'Connected' : 'Connecting'}
      </Text>
      <Text className="text-white text-xs">
        Muted: {callState.isMuted ? 'Yes' : 'No'}
      </Text>
      <Text className="text-white text-xs">
        Duration: {formatDuration(callDuration)}
      </Text>
      <Text className="text-white text-xs">
        Room: {callState.isConnected ? 'Active' : 'Setting up'}
      </Text>
    </View>
  );
};

export default CallTestIndicator;

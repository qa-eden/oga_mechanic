import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, withSpring, withTiming, useAnimatedStyle } from 'react-native-reanimated';

interface LoadingOverlayProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  color?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  title = "Loading...",
  subtitle = "Please wait a moment",
  color = "#D30309"
}) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const backgroundOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 300 });
      backgroundOpacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withSpring(0.8, { damping: 15, stiffness: 100 });
      opacity.value = withTiming(0, { duration: 200 });
      backgroundOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View 
      style={backgroundStyle}
      className="absolute inset-0 bg-white/80 backdrop-blur-sm items-center justify-center z-50"
    >
      <Animated.View 
        style={modalStyle}
        className="bg-white rounded-3xl p-8 items-center shadow-2xl border border-gray-100 mx-6"
      >
        <ActivityIndicator size="large" color={color} />
        <Text className="text-gray-800 font-NunitoSemiBold mt-4 text-base text-center">
          {title}
        </Text>
        <Text className="text-gray-500 font-NunitoMedium mt-2 text-sm text-center max-w-xs">
          {subtitle}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

export default LoadingOverlay;

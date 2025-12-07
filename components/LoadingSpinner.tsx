import React, { useRef, useEffect } from 'react'
import { View, Text, Animated, Easing } from 'react-native'
import { icons } from '@/constants'

interface LoadingSpinnerProps {
  message?: string
  subMessage?: string
  size?: 'small' | 'medium' | 'large'
  showLogo?: boolean
  variant?: 'default' | 'overlay' | 'inline'
  color?: 'primary' | 'white' | 'gray'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  subMessage,
  size = 'medium',
  showLogo = true,
  variant = 'default',
  color = 'primary',
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Smooth rotation animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Subtle pulse animation for the container
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.05,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [spinValue, pulseValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Size configurations
  const sizeConfig = {
    small: { logo: 32, container: 48, text: 'text-sm', subText: 'text-xs' },
    medium: { logo: 48, container: 72, text: 'text-base', subText: 'text-sm' },
    large: { logo: 64, container: 96, text: 'text-lg', subText: 'text-base' },
  };

  const colorConfig = {
    primary: { bg: 'bg-primary-50', ring: 'border-primary-200', text: 'text-gray-900', subText: 'text-gray-500' },
    white: { bg: 'bg-white/10', ring: 'border-white/30', text: 'text-white', subText: 'text-white/70' },
    gray: { bg: 'bg-gray-100', ring: 'border-gray-200', text: 'text-gray-700', subText: 'text-gray-500' },
  };

  const config = sizeConfig[size];
  const colors = colorConfig[color];

  // Variant styles
  const containerStyles = {
    default: 'flex-1 items-center justify-center',
    overlay: 'absolute inset-0 items-center justify-center bg-black/40 z-50',
    inline: 'items-center justify-center py-8',
  };

  return (
    <View className={containerStyles[variant]}>
      <View className="items-center">
        {/* Spinner Container with Ring */}
        <Animated.View
          style={{ transform: [{ scale: pulseValue }] }}
          className={`rounded-full items-center justify-center mb-4 ${colors.bg} border-2 ${colors.ring}`}
        >
          <View
            style={{ width: config.container, height: config.container }}
            className="items-center justify-center"
          >
            {showLogo ? (
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <icons.logo width={config.logo} height={config.logo} />
              </Animated.View>
            ) : (
              // Fallback spinner dots when logo is hidden
              <Animated.View
                style={{ transform: [{ rotate: spin }] }}
                className="flex-row items-center justify-center"
              >
                <View className="w-2 h-2 rounded-full bg-primary-500 mr-1" />
                <View className="w-2 h-2 rounded-full bg-primary-300 mr-1" />
                <View className="w-2 h-2 rounded-full bg-primary-200" />
              </Animated.View>
            )}
          </View>
        </Animated.View>

        {/* Message */}
        {message && (
          <Text className={`${config.text} font-NunitoBold ${colors.text} mb-1 text-center`}>
            {message}
          </Text>
        )}

        {/* Sub Message */}
        {subMessage && (
          <Text className={`${config.subText} font-NunitoMedium ${colors.subText} text-center px-8`}>
            {subMessage}
          </Text>
        )}
      </View>
    </View>
  );
};

export default LoadingSpinner;

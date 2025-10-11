import React, { useRef, useEffect } from 'react'
import { View, Text, Animated } from 'react-native'
import { icons } from '@/constants'

interface LoadingSpinnerProps {
  message?: string
  subMessage?: string
  size?: 'small' | 'medium' | 'large'
  showLogo?: boolean
  logoSize?: number
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  subMessage = '',
  size = 'medium',
  showLogo = true,
  logoSize = 100
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  // Animation effect
  useEffect(() => {
    // Start rotation animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Size configurations
  const sizeConfig = {
    small: {
      container: 'w-12 h-12',
      text: 'text-sm',
      subText: 'text-xs',
      spacing: 'mb-2'
    },
    medium: {
      container: 'w-16 h-16',
      text: 'text-lg',
      subText: 'text-sm',
      spacing: 'mb-4'
    },
    large: {
      container: 'w-20 h-20',
      text: 'text-xl',
      subText: 'text-base',
      spacing: 'mb-6'
    }
  };

  const config = sizeConfig[size];

  return (
    <View className="flex-1 items-center justify-center py-20">
      <View className="items-center">
        <View className={`${config.container} bg-primary-100 rounded-full items-center justify-center ${config.spacing}`}>
          {showLogo && (
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <icons.logo width={logoSize} height={logoSize} />
            </Animated.View>
          )}
        </View>
        <Text className={`${config.text} font-NunitoSemiBold text-gray-900 mb-2`}>
          {message}
        </Text>
        {subMessage && (
          <Text className={`${config.subText} text-gray-500 text-center px-8`}>
            {subMessage}
          </Text>
        )}
      </View>
    </View>
  );
};

export default LoadingSpinner;

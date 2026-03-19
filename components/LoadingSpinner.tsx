import React, { useRef, useEffect } from 'react'
import { View, Text, Animated, Easing } from 'react-native'
import { icons } from '@/constants'

interface LoadingSpinnerProps {
  message?: string
  subMessage?: string
  size?: 'small' | 'medium' | 'large'
  showLogo?: boolean
  logoSize?: number
  variant?: 'default' | 'overlay' | 'inline'
  color?: 'primary' | 'white' | 'gray'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  subMessage,
  size = 'medium',
  showLogo = true,
  logoSize,
  variant = 'default',
  color = 'primary',
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Rotating Ring Animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      })
    ).start();

    // Breathing Animation (Scale + Opacity)
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.08,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
            Animated.timing(opacityValue, {
              toValue: 1,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacityValue, {
              toValue: 0.6,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
      ])
    ).start();
  }, [spinValue, pulseValue, opacityValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Size configurations
  const sizeConfig = {
    small: { logo: 30, container: 56, text: 'text-sm', subText: 'text-[10px]' },
    medium: { logo: 44, container: 80, text: 'text-lg', subText: 'text-sm' },
    large: { logo: 60, container: 110, text: 'text-xl', subText: 'text-base' },
  };

  const colorConfig = {
    primary: { bg: 'bg-primary-50', ring: 'border-primary-100', text: 'text-gray-900', subText: 'text-gray-400', spinner: '#D30309' },
    white: { bg: 'bg-white/10', ring: 'border-white/20', text: 'text-white', subText: 'text-white/60', spinner: '#FFFFFF' },
    gray: { bg: 'bg-gray-50', ring: 'border-gray-100', text: 'text-gray-800', subText: 'text-gray-500', spinner: '#6B7280' },
  };

  const config = sizeConfig[size];
  const colors = colorConfig[color];

  // Variant styles
  const containerStyles = {
    default: 'flex-1 items-center justify-center bg-white',
    overlay: 'absolute inset-0 items-center justify-center bg-white/90 z-50',
    inline: 'items-center justify-center py-10',
  };

  return (
    <View className={containerStyles[variant]}>
      <View className="items-center">
        {/* Main Spinner Core */}
        <View className="relative items-center justify-center mb-6">
            {/* Animated Outer Ring */}
            <Animated.View 
                style={{ 
                    transform: [{ rotate: spin }],
                    width: config.container + 8,
                    height: config.container + 8,
                }}
                className="absolute border-2 border-transparent border-t-primary-500 rounded-full"
            />
            
            {/* Pulsing Center Container */}
            <Animated.View
                style={{ 
                    transform: [{ scale: pulseValue }],
                    width: config.container,
                    height: config.container,
                }}
                className={`rounded-full items-center justify-center ${colors.bg} border border-gray-100 shadow-sm`}
            >
                {showLogo && (
                    <Animated.View style={{ opacity: opacityValue }}>
                        <icons.logo width={logoSize || config.logo} height={logoSize || config.logo} />
                    </Animated.View>
                )}
            </Animated.View>
        </View>

        {/* Message Group */}
        <Animated.View style={{ opacity: opacityValue }} className="items-center px-6">
            {message && (
                <Text className={`${config.text} font-NunitoExtraBold ${colors.text} mb-2 text-center tracking-tight`}>
                    {message}
                </Text>
            )}

            {subMessage && (
                <Text className={`${config.subText} font-NunitoMedium ${colors.subText} text-center leading-5 max-w-[280px]`}>
                    {subMessage}
                </Text>
            )}
        </Animated.View>

        {/* Fancy Progress Dots */}
        <View className="flex-row mt-8 space-x-1.5 gap-1.5">
            {[0, 1, 2].map((i) => (
                <Animated.View 
                    key={i}
                    style={{ 
                        opacity: opacityValue,
                        transform: [{ scale: pulseValue }]
                    }}
                    className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-primary-500' : 'bg-gray-200'}`}
                />
            ))}
        </View>
      </View>
    </View>
  );
};

export default LoadingSpinner;

import React, { useRef, useEffect, memo } from 'react';
import { View, Text, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedErrorCardProps {
  emoji: string;
  title: string;
  message: string;
  gradientColors: string[];
  textColor: string;
  actionButton?: {
    text: string;
    onPress: () => void;
    backgroundColor?: string;
  };
  className?: string;
}

const AnimatedErrorCard = memo(({ 
  emoji, 
  title, 
  message, 
  gradientColors, 
  textColor,
  actionButton,
  className = "mx-4 mb-4"
}: AnimatedErrorCardProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for emoji
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
      className={`${className} overflow-hidden rounded-2xl mt-2`}
    >
      <LinearGradient
        colors={gradientColors as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className=""
      >
        <View className="items-center p-4">
          <Animated.Text
            style={{
              transform: [{ scale: pulseAnim }],
            }}
            className="text-4xl"
          >
            {emoji}
          </Animated.Text>
          
          <Text className={`${textColor} font-NunitoBold text-lg mb-2 text-center`}>
            {title}
          </Text>
          
          <Text className={`${textColor} text-sm text-center leading-5 opacity-90`}>
            {message}
          </Text>

          {actionButton && (
            <View className="mt-4">
              <View 
                className={`px-6 py-2 rounded-lg ${actionButton.backgroundColor || 'bg-primary-600'}`}
                style={{ backgroundColor: actionButton.backgroundColor }}
              >
                <Text 
                  className="text-white font-NunitoBold text-center"
                  onPress={actionButton.onPress}
                >
                  {actionButton.text}
                </Text>
              </View>
            </View>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
});

AnimatedErrorCard.displayName = 'AnimatedErrorCard';

export default AnimatedErrorCard;

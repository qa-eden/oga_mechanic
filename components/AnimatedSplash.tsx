"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { View, Text, Animated, Dimensions, StatusBar, Easing } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

interface AnimatedSplashProps {
  onAnimationComplete?: () => void
}

const { width, height } = Dimensions.get("window")

const AnimatedSplash: React.FC<AnimatedSplashProps> = ({ onAnimationComplete }) => {
  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current
  const logoOpacity = useRef(new Animated.Value(0)).current
  const logoRotation = useRef(new Animated.Value(0)).current
  const textOpacity = useRef(new Animated.Value(0)).current
  const textTranslateY = useRef(new Animated.Value(50)).current
  const loadingOpacity = useRef(new Animated.Value(0)).current
  const loadingScale = useRef(new Animated.Value(0.8)).current
  const backgroundOpacity = useRef(new Animated.Value(0)).current

  // Loading dots animation
  const dot1 = useRef(new Animated.Value(0)).current
  const dot2 = useRef(new Animated.Value(0)).current
  const dot3 = useRef(new Animated.Value(0)).current

  useEffect(() => {
    startAnimation()
  }, [])

  const startAnimation = () => {
    // Background fade in
    Animated.timing(backgroundOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start()

    // Logo entrance animation
    Animated.sequence([
      // Initial delay
      Animated.delay(300),

      // Logo scale and fade in with rotation
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.elastic(1.2),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(logoRotation, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]),

      // Text animation
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
      ]),

      // Loading indicator
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(loadingOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(loadingScale, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Start loading dots animation
      startLoadingAnimation()

      // Complete animation after total duration
      setTimeout(() => {
        onAnimationComplete?.()
      }, 2000)
    })
  }

  const startLoadingAnimation = () => {
    const createDotAnimation = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      )
    }

    // Start staggered dot animations
    Animated.parallel([
      createDotAnimation(dot1, 0),
      createDotAnimation(dot2, 200),
      createDotAnimation(dot3, 400),
    ]).start()
  }

  const logoRotationInterpolate = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <View className="flex-1">
      <StatusBar barStyle="light-content" backgroundColor="#D30309" />

      {/* Animated Background */}
      <Animated.View
        style={{
          flex: 1,
          opacity: backgroundOpacity,
        }}
      >
        <LinearGradient
          colors={["#D30309", "#B91C1C", "#991B1B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1"
        >
          {/* Decorative Elements */}
          <View className="absolute inset-0">
            {/* Top decorative circle */}
            <Animated.View
              style={{
                position: "absolute",
                top: -100,
                right: -100,
                width: 300,
                height: 300,
                borderRadius: 150,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                transform: [
                  {
                    scale: logoScale.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1.2],
                    }),
                  },
                ],
              }}
            />

            {/* Bottom decorative circle */}
            <Animated.View
              style={{
                position: "absolute",
                bottom: -150,
                left: -150,
                width: 400,
                height: 400,
                borderRadius: 200,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                transform: [
                  {
                    scale: logoScale.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ],
              }}
            />
          </View>

          {/* Main Content */}
          <View className="flex-1 items-center justify-center px-8">
            {/* Logo Container */}
            <Animated.View
              style={{
                transform: [{ scale: logoScale }, { rotate: logoRotationInterpolate }],
                opacity: logoOpacity,
              }}
              className="items-center justify-center mb-8"
            >
              {/* Logo Background Circle */}
              <View className="w-32 h-32 bg-white rounded-full items-center justify-center shadow-2xl">
                {/* Car Icon */}
                <View className="items-center justify-center">
                  <Text className="text-4xl">🚗</Text>
                </View>
              </View>
            </Animated.View>

            {/* App Name */}
            <Animated.View
              style={{
                opacity: textOpacity,
                transform: [{ translateY: textTranslateY }],
              }}
              className="items-center mb-4"
            >
              <Text className="text-4xl font-NunitoExtraBold text-white mb-2">OGA MECHANIC</Text>
              <Text className="text-lg font-NunitoMedium text-white/90 text-center">
                Your Trusted Car Service Partner
              </Text>
            </Animated.View>

            {/* Tagline */}
            <Animated.View
              style={{
                opacity: textOpacity,
                transform: [{ translateY: textTranslateY }],
              }}
              className="items-center mb-12"
            >
              <Text className="text-sm font-NunitoMedium text-white/80 text-center">
                Professional • Reliable • Affordable
              </Text>
            </Animated.View>

            {/* Loading Indicator */}
            <Animated.View
              style={{
                opacity: loadingOpacity,
                transform: [{ scale: loadingScale }],
              }}
              className="items-center"
            >
              <Text className="text-white/90 font-NunitoMedium mb-4">Loading your experience...</Text>

              {/* Animated Dots */}
              <View className="flex-row items-center space-x-2">
                {[dot1, dot2, dot3].map((dot, index) => (
                  <Animated.View
                    key={index}
                    style={{
                      opacity: dot,
                      transform: [
                        {
                          scale: dot.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1.2],
                          }),
                        },
                      ],
                    }}
                    className="w-3 h-3 bg-white rounded-full mx-1"
                  />
                ))}
              </View>
            </Animated.View>
          </View>

          {/* Bottom Branding */}
          <Animated.View style={{ opacity: textOpacity }} className="items-center pb-12">
            <Text className="text-white/60 font-NunitoMedium text-xs">Powered by Innovation</Text>
          </Animated.View>
        </LinearGradient>
      </Animated.View>
    </View>
  )
}

export default AnimatedSplash

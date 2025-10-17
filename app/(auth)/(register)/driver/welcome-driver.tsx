"use client";

import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
import { StatusBar as ExpoStatusBar } from 'expo-status-bar'
import { useRouter, useLocalSearchParams } from 'expo-router'
import Animated, { useSharedValue, withSpring, withTiming } from 'react-native-reanimated'
import { routes, mechanicRoutes, driverRoutes } from '@/constants/routes'
import { icons } from '@/constants'
import CustomButton from '@/components/CustomButton'
import BackArrowBtn from '@/components/BackArrowBtn'

const WelcomeDriver = () => {
  const router = useRouter()
  const params = useLocalSearchParams()
  const type = params.type as string
  const [isSignUpLoading, setIsSignUpLoading] = useState(false)
  const [isSignInLoading, setIsSignInLoading] = useState(false)

  // Animation values
  const logoScale = useSharedValue(0.8)
  const logoOpacity = useSharedValue(0)

  useEffect(() => {
    // Animate logo on mount
    logoScale.value = withSpring(1, { damping: 15, stiffness: 100 })
    logoOpacity.value = withTiming(1, { duration: 1000 })
  }, [])

  const getSubtitle = () => {
    return type === 'driver' 
      ? 'Drive with us, Earn money as you drive'
      : 'Ride with us, Get where you need to go'
  }

  const handleSignUp = async () => {
    if (router && driverRoutes.step1) {
      setIsSignUpLoading(true)
      try {
        await router.push(driverRoutes.step1)
      } catch (error) {
      } finally {
        setIsSignUpLoading(false)
      }
    }
  }

  const handleSignIn = async () => {
    if (router && routes.signIn) {
      setIsSignInLoading(true)
      try {
        await router.push(routes.signIn)
      } catch (error) {
      } finally {
        setIsSignInLoading(false)
      }
    }
  }

  return (
    <RNSafeAreaView className="flex-1 h-screen bg-white" edges={["top"]}>
      <ExpoStatusBar style="dark" />

      <BackArrowBtn text="Go back" className="ml-4 mt-4" />

      <View className="flex-1 px-6">
        {/* Logo Section - Centered */}
        <View className="flex-1 justify-center items-center">
          <Animated.View
            style={{
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            }}
            className="items-center"
          >
            <icons.splash width={180} height={90} />

            <Text className="text-2xl font-bold text-gray-900 mt-6 text-center">
              Welcome to OGA MECHANIC
            </Text>

            <Text className="text-lg text-gray-600 mt-4 text-center px-4">
              {getSubtitle()}
            </Text>
          </Animated.View>
        </View>

        {/* Action Buttons */}
        <View className="mt-auto pb-[5rem]">
          <CustomButton
            title="Sign up"
            className="py-5 mb-3 mt-2 shadow-lg"
            onPress={handleSignUp}
            loading={isSignUpLoading}
          />
          <CustomButton
            title="Sign in"
            bgVariant="dangerborder"
            textVariant="dangerborder"
            className="py-5 mb-3 shadow-lg"
            onPress={handleSignIn}
            loading={isSignInLoading}
          />
        </View>
      </View>
    </RNSafeAreaView>
  );
}

export default WelcomeDriver
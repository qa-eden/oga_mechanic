"use client";

import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useRouter, useLocalSearchParams } from 'expo-router'
import Animated, { useSharedValue, withSpring, withTiming } from 'react-native-reanimated'
import { routes, mechanicRoutes, driverRoutes } from '@/constants/routes'
import { icons } from '@/constants'
import CustomButton from '@/components/CustomButton';
import BackArrowBtn from '@/components/BackArrowBtn';

const WelcomeDriver = () => {
  const router = useRouter()
  const params = useLocalSearchParams()
  const type = params.type as string

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

  return (
    <SafeAreaView className="flex-1 h-screen bg-white" edges={["top"]}>
      <StatusBar style="dark" />

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

            {/* Subtitle */}
            <Text className="text-lg text-gray-500 font-NunitoMedium text-center leading-relaxed mt-6">
              {getSubtitle()}
            </Text>
          </Animated.View>
        </View>

        {/* Action Buttons */}
        <View className="mt-auto pb-[5rem]">
        

          <CustomButton
              title="Sign up"
              className="py-5 mb-3 mt-2 shadow-lg"
              onPress={() => {
                router?.push(driverRoutes?.step1 as any)
              }}
            />
            <CustomButton
              onPress={() => router?.push(routes?.signIn as any)}
              title="Sign in"
              bgVariant="dangerborder"
              textVariant="dangerborder"
              className="py-5 my-2 shadow-sm"
            />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default WelcomeDriver
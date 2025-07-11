"use client"

import { View, Text, ScrollView, TouchableOpacity, Animated } from "react-native"
import { useEffect, useRef } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { CheckCircleIcon } from "react-native-heroicons/solid"

const OrderConfirmation = () => {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        {/* Success Animation */}
        <View className="flex-1 justify-center items-center px-6">
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            }}
            className="items-center mb-8"
          >
            <View className="w-32 h-32 bg-green-100 rounded-full items-center justify-center mb-6">
              <CheckCircleIcon size={80} color="#10B981" />
            </View>

            <Text className="text-3xl font-NunitoExtraBold text-gray-900 text-center mb-4">Order Confirmed!</Text>

            <Text className="text-lg text-gray-600 text-center leading-6">
              Your order has been successfully placed. You'll receive a confirmation shortly.
            </Text>
          </Animated.View>

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="w-full"
          >
            {/* Order Details */}
            <View className="bg-gray-50 rounded-2xl p-6 mb-6">
              <Text className="text-lg font-NunitoBold text-gray-900 mb-4">Order Details</Text>

              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600">Order ID</Text>
                <Text className="font-NunitoBold text-gray-900">#OGA2024001</Text>
              </View>

              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600">Payment Method</Text>
                <Text className="font-NunitoBold text-gray-900">Cash on Delivery</Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">Estimated Delivery</Text>
                <Text className="font-NunitoBold text-gray-900">2-3 days</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              onPress={() => router.push("/(root)/(tabs)/home")}
              className="overflow-hidden rounded-2xl mb-4"
            >
              <LinearGradient
                colors={["#D30309", "#B91C1C"]}
                className="py-4 px-6 items-center justify-center"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text className="text-white font-NunitoBold text-lg">Continue Shopping</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
            //   onPress={() => router.push("/(root)/(screens)/order-tracking")}
              className="py-4 px-6 bg-gray-100 rounded-2xl items-center justify-center"
            >
              <Text className="text-gray-700 font-NunitoBold text-lg">Track Order</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default OrderConfirmation

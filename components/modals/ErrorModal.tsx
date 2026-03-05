"use client"

import { View, Text, TouchableOpacity, Modal, Animated } from "react-native"
import { useRef, useEffect } from "react"
import { XCircleIcon } from "react-native-heroicons/solid"
import AndroidNavBarSpacer from "../AndroidNavBarSpacer"

interface ErrorModalProps {
  isVisible: boolean
  onClose: () => void
  title: string
  message: string
  buttonText?: string
}

const ErrorModal = ({ isVisible, onClose, title, message, buttonText = "Try Again" }: ErrorModalProps) => {
  // Sanitize the message so we don't show raw server errors (like "Error 500" or HTML)
  const lowerMsg = message?.toLowerCase() || "";
  const isServerError = 
    lowerMsg.includes("500") || 
    lowerMsg.includes("502") || 
    lowerMsg.includes("503") || 
    lowerMsg.includes("504") || 
    lowerMsg.includes("internal server error") || 
    lowerMsg.includes("bad gateway") || 
    lowerMsg.includes("service unavailable") || 
    lowerMsg.includes("gateway timeout") || 
    lowerMsg.includes("html") || 
    lowerMsg.includes("<!doctype");
    
  const displayMessage = isServerError 
    ? "There was an issue connecting to our servers. Please try again later."
    : message;
  const scaleAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Start pulsing animation after modal appears
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ).start()
      })
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [isVisible])

  return (
    <Modal visible={isVisible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
          opacity: fadeAnim,
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
          }}
          className="bg-white rounded-3xl p-8 w-full max-w-sm"
        >
          {/* Top indicator */}
          <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-8" />

          {/* Error Icon with pulse animation */}
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
            }}
            className="w-20 h-20 bg-red-100 rounded-full items-center justify-center self-center mb-6"
          >
            <XCircleIcon size={40} color="#EF4444" />
          </Animated.View>

          {/* Title */}
          <Text className="text-2xl font-NunitoBold text-gray-900 text-center mb-4">{title}</Text>

          {/* Message */}
          <Text className="text-base text-gray-600 text-center mb-8 leading-6">{displayMessage}</Text>

          {/* Button */}
          <TouchableOpacity onPress={onClose} className="bg-red-500 py-4 px-6 rounded-full" activeOpacity={0.8}>
            <Text className="text-white font-NunitoBold text-lg text-center">{buttonText}</Text>
          </TouchableOpacity>

          {/* Android Navigation Bar Spacer */}
          <AndroidNavBarSpacer />
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

export default ErrorModal
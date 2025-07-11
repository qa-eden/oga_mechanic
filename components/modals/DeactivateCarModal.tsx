"use client"

import { View, Text, TouchableOpacity, Modal, Animated } from "react-native"
import { useRef, useEffect } from "react"
import { CalendarIcon } from "react-native-heroicons/outline"

interface DeactivateCarModalProps {
  isVisible: boolean
  onClose: () => void
  onConfirm: () => void
  carName: string
  isActive: boolean
}

const DeactivateCarModal = ({ isVisible, onClose, onConfirm, carName, isActive }: DeactivateCarModalProps) => {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

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
      ]).start()
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

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const actionText = isActive ? "deactivate" : "activate"
  const actionTitle = isActive ? "Deactivate" : "Activate"
  const iconColor = isActive ? "#F59E0B" : "#10B981"
  const buttonColor = isActive ? "bg-yellow-500" : "bg-green-500"

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

          {/* Action Icon */}
          <View
            className="w-20 h-20 rounded-full items-center justify-center self-center mb-6"
            style={{ backgroundColor: isActive ? "#FEF3C7" : "#D1FAE5" }}
          >
            <CalendarIcon size={32} color={iconColor} />
          </View>

          {/* Title */}
          <Text className="text-2xl font-NunitoBold text-gray-900 text-center mb-4">{actionTitle}</Text>

          {/* Message */}
          <Text className="text-base text-gray-600 text-center mb-8 leading-6">
            Are you sure you want to {actionText} {carName}?
          </Text>

          {/* Additional Info */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-6">
            <Text className="text-sm text-gray-700 text-center leading-5">
              {isActive
                ? "Deactivating will pause all services and notifications for this vehicle. You can reactivate it anytime."
                : "Activating will restore all services and notifications for this vehicle."}
            </Text>
          </View>

          {/* Buttons */}
          <View className="space-y-4">
            {/* Action Button */}
            <TouchableOpacity
              onPress={handleConfirm}
              className={`${buttonColor} py-4 px-6 mb-4 rounded-full`}
              activeOpacity={0.8}
            >
              <Text className="text-white font-NunitoBold text-lg text-center">{actionTitle}</Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity onPress={onClose} className="bg-gray-200 py-4 px-6 rounded-full" activeOpacity={0.8}>
              <Text className="text-gray-700 font-NunitoBold text-lg text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

export default DeactivateCarModal

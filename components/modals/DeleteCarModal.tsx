"use client"

import { View, Text, TouchableOpacity, Modal, Animated } from "react-native"
import { useRef, useEffect } from "react"
import { TrashIcon } from "react-native-heroicons/outline"
import AndroidNavBarSpacer from "../AndroidNavBarSpacer"

interface DeleteCarModalProps {
  isVisible: boolean
  onClose: () => void
  onConfirm: () => void
  carName: string
}

const DeleteCarModal = ({ isVisible, onClose, onConfirm, carName }: DeleteCarModalProps) => {
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

          {/* Delete Icon */}
          <View className="w-20 h-20 bg-primary-500 rounded-full items-center justify-center self-center mb-6">
            <TrashIcon size={32} color="#FFFFFF" />
          </View>

          {/* Title */}
          <Text className="text-2xl font-NunitoBold text-gray-900 text-center mb-4">Delete</Text>

          {/* Message */}
          <Text className="text-base text-gray-600 text-center mb-8 leading-6">
            Are you sure you want to delete this car information?
          </Text>

          {/* Buttons */}
          <View className="space-y-4">
            {/* Delete Button */}
            <TouchableOpacity
              onPress={handleConfirm}
              className="bg-primary-500 py-4 mb-4 px-6 rounded-full"
              activeOpacity={0.8}
            >
              <Text className="text-white font-NunitoBold text-lg text-center">Delete</Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity onPress={onClose} className="bg-gray-200 py-4 px-6 rounded-full" activeOpacity={0.8}>
              <Text className="text-gray-700 font-NunitoBold text-lg text-center">Cancel</Text>
            </TouchableOpacity>

            {/* Android Navigation Bar Spacer */}
            <AndroidNavBarSpacer />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

export default DeleteCarModal

import React from 'react'
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native'
import { XMarkIcon } from 'react-native-heroicons/outline'
import CustomButton from '../CustomButton'
import AndroidNavBarSpacer from '../AndroidNavBarSpacer'

interface DeleteConfirmationModalProps {
  visible: boolean
  onClose: () => void
  onConfirm: () => void
  itemType: 'car' | 'sparePart' | 'rentedCar'
  itemName: string
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  itemType,
  itemName
}) => {
  const getItemTypeText = () => {
    switch (itemType) {
      case 'car':
        return 'car'
      case 'sparePart':
        return 'spare part'
      case 'rentedCar':
        return 'rented car'
      default:
        return 'item'
    }
  }

  const getIcon = () => {
    switch (itemType) {
      case 'car':
        return '🚗'
      case 'sparePart':
        return '🔧'
      case 'rentedCar':
        return '🚙'
      default:
        return '📦'
    }
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable 
        className="flex-1 bg-black/50 justify-end"
        onPress={onClose}
      >
        <Pressable 
          className="bg-white rounded-t-3xl overflow-hidden"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <View className="w-12 h-1 bg-gray-300 rounded-full self-center mt-3 mb-4" />
          
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-4 right-4 w-8 h-8 items-center justify-center rounded-full bg-gray-100"
          >
            <XMarkIcon size={20} color="#6B7280" />
          </TouchableOpacity>

          {/* Content */}
          <View className="px-6 pb-8">
            {/* Icon */}
            <View className="items-center mb-4">
              <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-4">
                <Text className="text-4xl">{getIcon()}</Text>
                <View className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full items-center justify-center">
                  <Text className="text-white text-xs font-bold">-</Text>
                </View>
              </View>
            </View>

            {/* Title */}
            <Text className="text-xl font-NunitoBold text-gray-900 text-center mb-3">
              Delete
            </Text>

            {/* Message */}
            <Text className="text-gray-600 text-center leading-6 mb-8">
              Are you sure you want to delete this {getItemTypeText()} from your list of uploaded 
              {itemType === 'car' ? 'cars' : itemType === 'rentedCar' ? 'rented cars' : 'spare parts'}?
            </Text>

            {/* Buttons */}
            <View className="space-y-3">
              <CustomButton title="Delete" onPress={onConfirm} textVariant="default" />

              <CustomButton title="Cancel" onPress={onClose} bgVariant="outline" textVariant="outline" className="mt-4" />

              {/* Android Navigation Bar Spacer */}
              <AndroidNavBarSpacer />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

export default DeleteConfirmationModal

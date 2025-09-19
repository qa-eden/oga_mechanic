import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native'
import { CameraIcon, XMarkIcon } from 'react-native-heroicons/outline'
import * as ImagePicker from 'expo-image-picker'

interface ImageUploadSectionProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  layout?: 'large-small' | 'grid' | 'single'
  title?: string
  showTitle?: boolean
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  images,
  onImagesChange,
  maxImages = 3,
  layout = 'large-small',
  title = 'Upload image',
  showTitle = true
}) => {
  const handleImageUpload = async (slotIndex?: number) => {
    if (images.length >= maxImages) {
      Alert.alert('Maximum images reached', `You can only upload up to ${maxImages} images`)
      return
    }

    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission required', 'Permission to access camera roll is required!')
        return
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      })

      if (!result.canceled && result.assets[0]) {
        const newImage = result.assets[0].uri
        
        if (slotIndex !== undefined) {
          // Add to specific slot
          const newImages = [...images]
          newImages[slotIndex] = newImage
          onImagesChange(newImages)
        } else {
          // Add to next available slot
          const newImages = [...images]
          const nextIndex = newImages.findIndex(img => !img)
          if (nextIndex !== -1) {
            newImages[nextIndex] = newImage
          } else {
            newImages.push(newImage)
          }
          onImagesChange(newImages)
        }
      }
    } catch (error) {
      console.error('Error picking image:', error)
      Alert.alert('Error', 'Failed to pick image. Please try again.')
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const renderUploadSlot = (index: number, isLarge: boolean = false) => {
    const hasImage = images[index]
    
    return (
      <View key={index} className={isLarge ? "mb-3" : "flex-1"}>
        {hasImage ? (
          <View className="relative">
            <Image 
              source={{ uri: images[index] }} 
              className={`w-full ${isLarge ? 'h-48' : 'h-24'} rounded-xl border-2 border-gray-300`}
              resizeMode="cover"
            />
            <TouchableOpacity 
              onPress={() => handleRemoveImage(index)}
              className={`absolute ${isLarge ? 'top-2 right-2 w-6 h-6' : 'top-1 right-1 w-5 h-5'} bg-white rounded-full items-center justify-center shadow-sm`}
            >
              <XMarkIcon size={isLarge ? 16 : 12} color="#000" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            onPress={() => handleImageUpload(index)}
            className={`border-2 border-dashed border-primary-500 rounded-xl ${isLarge ? 'p-8' : 'p-4'} items-center justify-center ${isLarge ? 'h-48' : 'h-24'}`}
          >
            <View className={`${isLarge ? 'w-12 h-12' : 'w-8 h-8'} bg-red-100 rounded-full items-center justify-center ${isLarge ? 'mb-4' : 'mb-2'}`}>
              <CameraIcon size={isLarge ? 24 : 16} color="#D30309" />
            </View>
            {isLarge ? (
              <>
                <Text className="text-red-600 font-NunitoMedium mb-2">Maximum of three Images</Text>
                <Text className="text-gray-500 text-sm">(Max. File size: 15 MB)</Text>
              </>
            ) : (
              <>
                <Text className="text-gray-500 text-xs text-center">Upload image {index + 1}</Text>
                <Text className="text-gray-400 text-xs text-center">(Max. File size: 15 MB)</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    )
  }

  const renderLayout = () => {
    switch (layout) {
      case 'single':
        return renderUploadSlot(0, true)
      
      case 'large-small':
        return (
          <View className="space-y-4">
            {renderUploadSlot(0, true)}
            <View className="flex-row gap-2">
              {[1, 2].map(index => renderUploadSlot(index))}
            </View>
          </View>
        )
      
      case 'grid':
        return (
          <View className="flex-row flex-wrap gap-2">
            {[0, 1, 2].map(index => (
              <View key={index} className="w-[48%]">
                {renderUploadSlot(index)}
              </View>
            ))}
          </View>
        )
      
      default:
        return renderUploadSlot(0, true)
    }
  }

  return (
    <View className="bg-white rounded-2xl py-4 mb-6 mt-4">
      {showTitle && (
        <Text className="text-lg font-NunitoBold text-gray-900 mb-4 px-4">{title}</Text>
      )}
      
      <View className="px-4">
        {renderLayout()}
      </View>
    </View>
  )
}

export default ImageUploadSection

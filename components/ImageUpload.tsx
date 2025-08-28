import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { CameraIcon, PencilIcon } from 'react-native-heroicons/outline'
import { images } from '@/constants'

interface ImageUploadProps {
  label: string
  isUploaded: boolean
  onPress: () => void
  uploadedText?: string
  maxFileSize?: string
  required?: boolean
  imageUri?: string
  carSide?: 'front' | 'back' | 'right' | 'left'
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  isUploaded,
  onPress,
  uploadedText = "Uploaded",
  maxFileSize = "15 MB",
  required = false,
  imageUri,
  carSide
}) => {
  // Get the appropriate car placeholder image based on carSide
  const getCarPlaceholder = () => {
    if (!carSide) return null;
    
    const carImages = {
      front: images.carFront,
      back: images.carBack,
      right: images.carRight,
      left: images.carLeft
    };
    
    return (
      <Image 
        source={carImages[carSide]} 
        className="w-full h-32 rounded-lg"
        resizeMode="cover"
      />
    );
  };

  // If imageUri is provided, show just the image
  if (imageUri && isUploaded) {
    return (
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-3">
          {label} {required && <Text className="text-red-500 text-lg">*</Text>}
        </Text>
        <TouchableOpacity
          onPress={onPress}
          className="border-2 border-dashed border-gray-300 rounded-xl p-4 items-center justify-center bg-gray-50"
        >
          <View className="items-center">
            <View className="relative mb-2">
              <Image 
                source={{ uri: imageUri }} 
                className="w-24 h-24 rounded-lg"
                resizeMode="cover"
              />
              <View className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full items-center justify-center">
                <PencilIcon size={12} color="white" />
              </View>
            </View>
            <Text className="text-green-600 font-medium">{uploadedText}</Text>
            <Text className="text-gray-500 text-xs mt-1">Tap to change</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  // If no imageUri, show the car placeholder or default placeholder
  return (
    <View>
      <Text className="text-sm font-medium text-gray-700 mb-3">
        {label} {required && <Text className="text-red-500 text-lg">*</Text>}
      </Text>
      <TouchableOpacity
        onPress={onPress}
        className="border-2 border-dashed border-gray-300 rounded-xl p-4 items-center justify-center bg-gray-50"
      >
        <View className="items-center w-full">
          {carSide ? getCarPlaceholder() : (
            // Default placeholder when no carSide is provided
            <View className="w-16 h-16 bg-primary-500/20 rounded-full items-center justify-center mb-2">
              <CameraIcon size={24} color="#EF4444" />
              <Text className="text-white text-lg absolute bottom-0 right-0 bg-primary-500 py-0 px-2 rounded-full">+</Text>
            </View>
          )}
          <Text className="text-gray-600 text-sm mt-2 text-center">
            {carSide ? `Tap to upload ${label}` : `Click to Upload ${label}`}
          </Text>
          {!carSide && (
            <Text className="text-gray-500 text-xs mt-1">(Max. File size: {maxFileSize})</Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default ImageUpload

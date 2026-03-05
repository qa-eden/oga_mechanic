import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { UserIcon } from 'react-native-heroicons/outline';

interface SelfieUploadProps {
  imageUri?: string | null;
  onPress: () => void;
}

const SelfieUpload: React.FC<SelfieUploadProps> = ({ imageUri, onPress }) => {
  return (
    <View className="mb-4 items-center">
      <Text className="text-xs text-gray-500 mb-2 font-NunitoBold uppercase tracking-wider">
        Photo Verification
      </Text>

      <TouchableOpacity
        onPress={onPress}
        className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 items-center justify-center"
        activeOpacity={0.7}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            className="w-full h-full rounded-full"
            resizeMode="cover"
          />
        ) : (
          <View className="items-center">
            <UserIcon size={32} color="#9CA3AF" />
            <Text className="text-xs text-gray-500 mt-1 font-NunitoBold">Take Selfie</Text>
          </View>
        )}
      </TouchableOpacity>

      {imageUri && (
        <TouchableOpacity onPress={onPress} className="mt-2" activeOpacity={0.7}>
          <Text className="text-primary-500 text-sm font-NunitoBold">Retake Photo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SelfieUpload;

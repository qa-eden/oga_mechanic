import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { TrashIcon } from 'react-native-heroicons/outline'
import { images } from '@/constants'

interface RentedCarCardProps {
  car: {
    id: string;
    name: string;
    transmission: string;
    image: any;
    price: number;
  };
  onPress: () => void;
  onDelete: (car: any) => void;
}

const RentedCarCard: React.FC<RentedCarCardProps> = ({ car, onPress, onDelete }) => {
  const ImageComponent = car.image;
  
  return (
    <TouchableOpacity 
      className="bg-white rounded-2xl p-4 mb-4 shadow-sm flex-row"
      onPress={onPress}
    >
      <View className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden mr-4">
        {typeof ImageComponent === 'function' ? (
          <View className="w-full h-full items-center justify-center">
            <ImageComponent width={60} height={60} />
          </View>
        ) : (
          <Image 
            source={{ uri: car.image }} 
            className="w-full h-full"
            resizeMode="cover"
          />
        )}
      </View>
      
      <View className="flex-1 justify-between">
        <View>
          <Text className="font-NunitoBold text-gray-900 mb-1" numberOfLines={1}>
            {car.name}
          </Text>
          <Text className="text-gray-600 text-sm mb-2">{car.transmission}</Text>
        </View>
        
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-NunitoBold text-gray-900">
              NGN {car.price.toLocaleString()}/day
            </Text>
          </View>
          <TouchableOpacity 
            className="w-6 h-6 items-center justify-center"
            onPress={(e) => {
              e.stopPropagation(); // Prevent triggering the card press
              onDelete(car);
            }}
          >
            <TrashIcon size={16} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default RentedCarCard

import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { TrashIcon } from 'react-native-heroicons/outline'
import { images } from '@/constants'

interface RentedCarCardProps {
  car: {
    id: string;
    name: string;
    transmission: string;
    images?: Array<{
      id: number;
      image: string;
      ordering: number;
      created_at: string;
    }>;
    price: string;
    currency: string;
    make: number;
    model: number;
    year: number;
    condition: string;
    body_type: string;
    fuel_type: string;
    exterior_color: string;
    number_of_seats: number;
  };
  onPress: () => void;
  onDelete: (car: any) => void;
}

const RentedCarCard: React.FC<RentedCarCardProps> = ({ car, onPress, onDelete }) => {
  // Get the first image from the images array, or use a fallback
  const carImage = car.images && car.images.length > 0 ? car.images[0].image : null;

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-4 shadow-sm flex-row"
      onPress={onPress}
    >
      <View className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden mr-4">
        {carImage ? (
          <Image
            source={{ uri: carImage }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Text className="text-gray-400 text-xs text-center">No Image</Text>
          </View>
        )}
      </View>
      
      <View className="flex-1 justify-between">
        <View>
          <Text className="font-NunitoBold text-gray-900 mb-1" numberOfLines={1}>
            {car.name}
          </Text>
          <Text className="text-gray-600 text-sm mb-1">
            {car.year} • {car.transmission} • {car.fuel_type}
          </Text>
          <Text className="text-gray-500 text-xs mb-2">
            {car.condition} • {car.body_type} • {car.number_of_seats} seats
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-NunitoBold text-gray-900">
              {car.currency === 'NGN' ? '₦' : '$'}{parseFloat(car.price).toLocaleString()}/day
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

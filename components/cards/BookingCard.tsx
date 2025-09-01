import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPinIcon } from 'react-native-heroicons/solid';
import { icons } from '@/constants';
import { router } from 'expo-router';
import { driverRoutes } from '@/constants/routes';

interface BookingCardProps {
  id: number;
  type: string;
  dateTime: string;
  estimateUsage: string;
  totalDistance: string;
  pickup: {
    address: string;
    color: string;
  };
  dropoff: {
    address: string;
    color: string;
  };
  price: string;
}

const BookingCard: React.FC<BookingCardProps> = ({
  type,
  dateTime,
  estimateUsage,
  totalDistance,
  pickup,
  dropoff,
  price
}) => {
  const handleCardPress = () => {
    router.push(driverRoutes.takebookings);
  };

  return (
    <TouchableOpacity 
      className="bg-white rounded-xl overflow-hidden border border-gray-300"
      onPress={handleCardPress}
      activeOpacity={0.7}
    >
      {/* Booking Header */}
      <View className="flex-row items-center gap-2 w-full border-b border-gray-300 p-3">
        <icons.round width={50} height={50} />
        <View className="flex-1">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-semibold text-gray-900">{type}</Text>
            <Text className="text-green-500 text-sm font-medium bg-green-700 text-white px-2 py-1 rounded-full">{dateTime}</Text>
          </View>
          {/* Trip Details */}
          <View className="flex-row items-center space-x-2 mb-2">
            <Text className="text-sm text-gray-500">Estimate Usage: <Text className="text-gray-900 font-medium">{estimateUsage}</Text></Text>
            <Text className="text-sm text-gray-500 border-l border-gray-300 pl-1 ml-1">Total Dist.: <Text className="text-gray-900 font-medium">{totalDistance}</Text></Text>
          </View>
        </View>
      </View>

      {/* Route Information */}
      <View className="mb-4 p-3">
        {/* Pickup */}
        <View className="flex-row items-center mb-2">
          <View className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-1" >
            <MapPinIcon size={30} color={pickup.color} />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-gray-700 leading-5">
              {pickup.address}
            </Text>
          </View>
        </View>

        {/* Route Line */}
        <View className="ml-3 mb-1">
          <View className="w-px h-6 bg-gray-300 border-l-2 border-dashed border-gray-300" />
        </View>

        {/* Drop-off */}
        <View className="flex-row items-center">
          <View className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-1" >
            <MapPinIcon size={30} color={dropoff.color} />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-gray-700 leading-5">
              {dropoff.address}
            </Text>
          </View>
        </View>
      </View>

      {/* Price */}
      <View className="border-t border-gray-100 bg-red-100 py-3">
        <Text className="text-2xl font-bold text-primary-500 text-center">{price}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default BookingCard;

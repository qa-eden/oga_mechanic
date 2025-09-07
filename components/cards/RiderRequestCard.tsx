import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface RiderRequest {
  id: string | number;
  customerName: string;
  orderId: string;
  pickup: string;
  delivery: string;
  isSelected?: boolean;
  onPress?: () => void;
}

interface RiderRequestCardProps {
  request: RiderRequest;
  onPress?: () => void;
  showSelection?: boolean;
  pickupColor?: string;
  deliveryColor?: string;
  borderColor?: string;
  selectedBorderColor?: string;
}

const RiderRequestCard: React.FC<RiderRequestCardProps> = ({
  request,
  onPress,
  showSelection = true,
  pickupColor = '#3B82F6', // blue-500
  deliveryColor = '#10B981', // green-500
  borderColor = 'border-gray-200',
  selectedBorderColor = 'border-red-500',
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!onPress}
      className={`bg-white flex-row flex-1 rounded-xl p-4 border ${
        showSelection && request.isSelected ? selectedBorderColor : borderColor
      }`}
    >
      <View className="flex-col mb-2 w-1/2">
        <Text className="font-bold text-gray-900">{request.customerName}</Text>
        <Text className="text-sm text-gray-600 mt-3">{request.orderId}</Text>
      </View>

      <View className="w-1/2">
        <View className="flex-row items-start">
          <View 
            className="w-4 h-4 rounded-full mt-1 mr-3" 
            style={{ backgroundColor: pickupColor }}
          />
          <Text className="text-sm text-gray-700 flex-1">{request.pickup}</Text>
        </View>

        <View className="ml-2 my-1">
          <View className="w-px h-4 bg-gray-300" />
        </View>

        <View className="flex-row items-start">
          <View 
            className="w-4 h-4 rounded-full mt-1 mr-3" 
            style={{ backgroundColor: deliveryColor }}
          />
          <Text className="text-sm text-gray-700 flex-1">{request.delivery}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RiderRequestCard;

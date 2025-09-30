import React from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";
import Rating from "@/components/Rating";

interface Mechanic {
  id: number;
  name: string;
  rating: number;
  reviewCount: number;
  image: any;
  isVip?: boolean;
  specialization?: string;
  location?: string;
  isOnline?: boolean;
}

interface MechanicCardProps {
  item: Mechanic;
  onPress: (item: Mechanic) => void;
  cardWidth: number;
}

const MechanicCard: React.FC<MechanicCardProps> = React.memo(({ item, onPress, cardWidth }) => (
  <TouchableOpacity
    onPress={() => onPress(item)}
    className="bg-white rounded-2xl overflow-hidden border border-gray-200 mb-4"
    style={{
      width: cardWidth,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    }}
    activeOpacity={0.8}
  >
    {/* Image Container */}
    <View className="relative">
      <View className="w-full h-32 bg-gray-100 overflow-hidden flex items-center justify-center">
        {typeof item.image === "function" ? (
          <item.image width={160} height={150} />
        ) : (
          <Image
            source={typeof item.image === "string" ? { uri: item.image } : item.image}
            style={{ width: 160, height: 150, resizeMode: "cover" }}
          />
        )}
      </View>
      {item.isOnline && (
        <View className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      )}
    </View>
    {/* Content */}
    <View className="p-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-NunitoBold text-gray-900 flex-1" numberOfLines={1}>
          {item.name}
        </Text>
        {item.isVip && (
          <View className="ml-2">
            <Text className="text-xs font-NunitoBold text-primary-500">(VIP)</Text>
          </View>
        )}
      </View>
      <View className="flex-row items-center mb-1">
        <Rating rating={item.rating} size={12} />
        <Text className="text-sm font-NunitoMedium text-gray-700 ml-2">
          {item.rating.toFixed(1)} ({item.reviewCount})
        </Text>
      </View>
      {item.specialization && (
        <Text className="text-xs text-gray-500 font-NunitoMedium mb-1" numberOfLines={1}>
          {item.specialization}
        </Text>
      )}
      {item.location && (
        <View className="flex-row items-center bg-gray-50 rounded-lg px-2 py-1.5">
          <View className="w-4 h-4 bg-primary-100 rounded-full items-center justify-center mr-2">
            <Text className="text-xs text-primary-600">📍</Text>
          </View>
          <Text className="text-xs text-gray-600 font-NunitoMedium flex-1" numberOfLines={1}>
            {item.location}
          </Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
));

export default MechanicCard; 
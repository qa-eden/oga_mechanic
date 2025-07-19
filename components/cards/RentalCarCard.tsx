import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { NairaCurrency } from "@/utils/useCurrencyFormatter";

interface RentalCarCardProps {
  item: any;
  onPress: (item: any) => void;
}

const RentalCarCard: React.FC<RentalCarCardProps> = React.memo(({ item, onPress }) => (
  <TouchableOpacity
    onPress={() => onPress(item)}
    className="bg-gray-50 rounded-2xl p-4 mb-4 flex-row items-center"
    activeOpacity={0.7}
  >
    {/* Car Image */}
    <View className="w-32 h-24 bg-white rounded-xl mr-4 overflow-hidden items-center justify-center">
      <item.image width={120} height={100} />
    </View>

    {/* Car Details */}
    <View className="flex-1">
      <Text className="text-xl font-NunitoExtraBold text-gray-900 mb-1">{item.name}</Text>
      <Text className="text-base font-NunitoMedium text-gray-600 mb-3">{item.transmission}</Text>
      <View className="flex-row items-center">
        <NairaCurrency value={item.pricePerDay} className="text-lg font-NunitoBold text-gray-900" />
        <Text className="text-base font-NunitoMedium text-gray-600 ml-1">/day</Text>
      </View>
    </View>
  </TouchableOpacity>
));

export default RentalCarCard; 
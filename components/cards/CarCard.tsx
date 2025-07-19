import React from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";

interface CarCardProps {
  item: any;
  onPress: (item: any) => void;
}

const CarCard: React.FC<CarCardProps> = React.memo(({ item, onPress }) => (
  <TouchableOpacity
    className="w-[48%] bg-white rounded-2xl p-2 mb-4 border border-gray-100"
    style={{
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    }}
    activeOpacity={0.7}
    onPress={() => onPress(item)}
  >
    {/* Car Image */}
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

    {/* Car Details */}
    <View>
      <Text className="text-base font-NunitoBold text-gray-900 mb-1">
        {item.name} {item.year}
      </Text>

      <Text className="text-sm text-gray-600 mb-2">VIN: {item.vin}</Text>

      <View className="flex-row items-center">
        <Text className="text-sm text-gray-600 mr-1">Status:</Text>
        <Text
          className={`text-sm font-NunitoBold ${
            item.status === "Active" ? "text-green-600" : "text-red-600"
          }`}
        >
          {item.status}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
));

export default CarCard; 
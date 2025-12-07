import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { routes } from "@/constants/routes";

interface ProductSellerCardProps {
  merchantId: string;
  merchantEmail?: string;
  merchantRating?: number;
  purchasedCount?: number;
}

const ProductSellerCard: React.FC<ProductSellerCardProps> = ({
  merchantId,
  merchantEmail,
  merchantRating,
  purchasedCount,
}) => {
  const handlePress = () => {
    router.push({
      pathname: routes.merchantProfile as any,
      params: { merchantId },
    });
  };

  return (
    <View
      className="bg-white rounded-2xl p-4 mx-4 mb-3 border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm font-NunitoBold text-gray-700">Sold by</Text>
        <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-full">
          <View className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1" />
          <Text className="text-xs text-green-700 font-NunitoMedium">
            Verified
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={handlePress}
        className="flex-row items-center"
        activeOpacity={0.7}
      >
        <View className="w-12 h-12 rounded-xl bg-primary-50 items-center justify-center mr-3">
          <Text className="text-lg font-NunitoBold text-primary-600">
            {merchantEmail?.charAt(0)?.toUpperCase() || "M"}
          </Text>
        </View>

        <View className="flex-1">
          <Text
            className="text-base font-NunitoBold text-gray-900 mb-0.5"
            numberOfLines={1}
          >
            {merchantEmail || "Merchant Store"}
          </Text>

          <View className="flex-row items-center space-x-3">
            <View className="flex-row items-center">
              <Text className="text-xs text-gray-500">⭐</Text>
              <Text className="text-xs font-NunitoMedium text-gray-700 ml-1">
                {merchantRating ? merchantRating.toFixed(1) : "N/A"}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-xs text-gray-500 ml-2">Sales:</Text>
              <Text className="text-xs font-NunitoBold text-gray-700 ml-1">
                {purchasedCount || 0}
              </Text>
            </View>
          </View>
        </View>

        <Text className="text-gray-400 text-lg">›</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProductSellerCard;


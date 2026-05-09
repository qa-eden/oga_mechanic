import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { routes } from "@/constants/routes";
import { MerchantProfile } from "@/lib/api/user";
import { StarIcon } from "react-native-heroicons/solid";

interface ProductSellerCardProps {
  merchantId: string;
  merchantEmail?: string;
  merchantRating?: number;
  purchasedCount?: number;
  merchantProfile?: MerchantProfile;
}

const ProductSellerCard: React.FC<ProductSellerCardProps> = ({
  merchantId,
  merchantEmail,
  merchantRating,
  purchasedCount,
  merchantProfile,
}) => {
  const handlePress = () => {
    router.push({
      pathname: routes.merchantProfile as any,
      params: { merchantId },
    });
  };

  const storeName = merchantProfile?.store_name || merchantEmail || "Merchant Store";
  // The API JSON shows 'selfie' is often used when profile_picture is null
  const profilePicture = merchantProfile?.profile_picture || merchantProfile?.selfie;
  const location = merchantProfile?.location;

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
        {(merchantRating && merchantRating > 4.5) && (
          <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-full">
            <View className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1" />
            <Text className="text-xs text-green-700 font-NunitoMedium">
              Verified
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={handlePress}
        className="flex-row items-center"
        activeOpacity={0.7}
      >
        <View className="w-12 h-12 rounded-xl bg-primary-50 items-center justify-center mr-3 overflow-hidden">
          {profilePicture ? (
            <Image
              source={{ uri: profilePicture }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-lg font-NunitoBold text-primary-600">
              {storeName?.charAt(0)?.toUpperCase() || "M"}
            </Text>
          )}
        </View>

        <View className="flex-1">
          <Text
            className="text-base font-NunitoBold text-gray-900 mb-0.5"
            numberOfLines={1}
          >
            {storeName}
          </Text>

          <View className="flex-row items-center flex-wrap">
            <View className="flex-row items-center mr-3">
              <StarIcon size={12} color="#FBBF24" fill="#FBBF24" />
              <Text className="text-xs font-NunitoMedium text-gray-700 ml-1">
                {merchantRating ? merchantRating.toFixed(1) : "N/A"}
              </Text>
            </View>
            
            {location && (
              <View className="flex-row items-center mr-3">
                <Text className="text-[10px] text-gray-300 mr-2">•</Text>
                <Text className="text-xs font-NunitoMedium text-gray-500 max-w-[120px]" numberOfLines={1}>
                   {location.split(',')[0]}
                </Text>
              </View>
            )}

            <View className="flex-row items-center">
              <Text className="text-xs text-gray-500">Sales:</Text>
              <Text className="text-xs font-NunitoBold text-gray-700 ml-1">
                {purchasedCount || 0}
              </Text>
            </View>
          </View>
        </View>

        <Text className="text-gray-400 text-lg ml-2">›</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProductSellerCard;

